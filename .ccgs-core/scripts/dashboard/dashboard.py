#!/usr/bin/env python3
import os
import json
import glob
import re
import http.server
import socketserver
import webbrowser
import subprocess
from threading import Timer
import time
from datetime import datetime

PORT = 8080
CACHE_TTL = 5
_last_data_update = 0
_cached_data = None
_shockwave_cache = {
    'mtimes': {},
    'active': [],
    'last_head': None
}
_git_date_cache = {}
DIRECTORY = os.path.dirname(os.path.abspath(__file__))
CWD = os.getcwd()
if os.path.exists(os.path.join(CWD, "CCGS-Data")):
    PROJECT_ROOT = CWD
else:
    PROJECT_ROOT = os.path.abspath(os.path.join(DIRECTORY, "../../../"))

# Load persistent cache
_cache_file = os.path.join(PROJECT_ROOT, "CCGS-Data", "production", "tracking", ".git_date_cache.json")
try:
    if os.path.exists(_cache_file):
        with open(_cache_file, 'r', encoding='utf-8') as f:
            _git_date_cache = json.load(f)
except Exception:
    _git_date_cache = {}

def parse_ccgs_env(project_root):
    """解析 ccgs.env 文件，返回 {key: value} 字典
    
    按优先级依次查找:
    1. {project_root}/.ccgs-core/ccgs.env
    2. {project_root}/ccgs.env
    找到第一个即停止。支持 # 注释行和引号值。
    """
    env = {}
    for candidate in [
        os.path.join(project_root, '.ccgs-core', 'ccgs.env'),
        os.path.join(project_root, 'ccgs.env'),
    ]:
        if os.path.exists(candidate):
            try:
                with open(candidate, 'r', encoding='utf-8') as f:
                    for line in f:
                        line = line.strip()
                        if line and not line.startswith('#') and '=' in line:
                            k, v = line.split('=', 1)
                            env[k.strip()] = v.strip().strip('"').strip("'")
            except (IOError, UnicodeDecodeError) as e:
                print(f"Warning: 无法读取 {candidate}: {e}")
            break
    return env

# 从 ccgs.env 读取 DATA_DIR，回退到硬编码 "CCGS-Data"
_ccgs_env = parse_ccgs_env(PROJECT_ROOT)
DATA_DIR = os.path.join(PROJECT_ROOT, _ccgs_env.get('DATA_DIR', 'CCGS-Data'))

def extract_markdown_fields(filepath):
    """从 Markdown 文件中提取结构化字段
    
    支持的标题格式（按优先级）:
    1. '# Story XXX: Title' — CCGS Story 标准格式
    2. '# Bug Report: Title' — CCGS Bug 标准格式
    3. '# 任意前缀: Title' — 冒号分割兜底
    4. '# Title' — 纯标题兜底（仅在无冒号时触发）
    支持的字段格式: '**Key**: Value' 或 '> **Key**: Value'
    """
    result = {}
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
            # YAML Frontmatter parsing
            if lines and lines[0].strip() == '---':
                end_idx = -1
                for i in range(1, len(lines)):
                    if lines[i].strip() == '---':
                        end_idx = i
                        break
                if end_idx != -1:
                    frontmatter = {}
                    for i in range(1, end_idx):
                        fm_line = lines[i].strip()
                        if fm_line and ':' in fm_line:
                            match_plain = re.match(r'^([a-zA-Z0-9_-]+):\s*(.*)', fm_line)
                            if match_plain:
                                k = match_plain.group(1).lower()
                                v = match_plain.group(2).strip().strip('"\'')
                                if k == 'dependencies' and v.startswith('['):
                                    import ast
                                    try:
                                        frontmatter[k] = ast.literal_eval(v)
                                    except:
                                        frontmatter[k] = []
                                else:
                                    frontmatter[k] = v
                    result.update(frontmatter)
            
            for line in lines:
                # 标题解析: 多级兜底
                if line.startswith('# ') and 'title' not in result:
                    heading = line[2:].strip()
                    if ':' in heading:
                        # '# Story XXX: Title' / '# Bug Report: Title' / '# 任意: Title'
                        result['title'] = heading.split(':', 1)[1].strip()
                    else:
                        # 纯 '# Title'（无冒号）
                        result['title'] = heading
                # 解析 '**Key**: Value' 或 '> **Key**: Value'
                match = re.search(r'\*\*(.*?)\*\*\s*:\s*(.*)', line)
                if match:
                    key = match.group(1).strip().lower()
                    val = match.group(2).strip().strip('"\'')
                    if key not in result:
                        result[key] = val
                
                # Fallback non-bold 'key: value' matching if not in frontmatter
                # But to avoid false positives, only parse simple ones like dependencies: ["D-010"]
                match_plain = re.match(r'^([a-zA-Z0-9_-]+):\s*(.*)', line.strip())
                if match_plain:
                    k = match_plain.group(1).lower()
                    v = match_plain.group(2).strip().strip('"\'')
                    if k not in result:
                        if k == 'dependencies' and v.startswith('['):
                            import ast
                            try:
                                result[k] = ast.literal_eval(v)
                            except:
                                pass
                        else:
                            result[k] = v

    except (IOError, UnicodeDecodeError) as e:
        print(f"Warning: 无法解析 {filepath}: {e}")
    return result

def normalize_status(raw):
    """将任意 Markdown status 格式归一化为四态: todo / ready / in_progress / done
    
    覆盖的格式方言：
    - 大小写变体: complete / Complete / COMPLETE
    - Emoji 前缀: ✅ complete / ✅ Complete  
    - Checkbox 格式: [x] passed / [ ] not yet created
    - 常见同义词: closed / verified / wip / doing / blocked
    """
    if not raw:
        return 'todo'
    # 未勾选的 checkbox 直接判定为 todo（优先于关键词匹配）
    raw_str = str(raw).strip()
    if raw_str.startswith('[ ]'):
        return 'todo'
    # 清除 emoji 和 checkbox 标记
    cleaned = re.sub(r'[\u2705\u274c\u26a0\ufe0f\U0001f534\U0001f7e1\U0001f7e2]', '', raw_str)
    cleaned = re.sub(r'\[.\]\s*', '', cleaned)
    cleaned = cleaned.strip().lower()
    
    done_keywords = ['done', 'complete', 'completed', 'closed', 'verified', 'passed', 'resolved', 'created']
    wip_keywords = ['in progress', 'in_progress', 'doing', 'wip', 'review', 'in review']
    ready_keywords = ['ready', 'approved', 'assigned']
    
    if any(kw in cleaned for kw in done_keywords):
        return 'done'
    elif any(kw in cleaned for kw in wip_keywords):
        return 'in_progress'
    elif any(kw in cleaned for kw in ready_keywords):
        return 'ready'
    else:
        return 'todo'

def gather_data():
    data = {
        "project_root": PROJECT_ROOT,
        "sprint": {
            "name": "N/A",
            "progress": 0,
            "total_points": 0,
            "completed_points": 0,
            "burn_data": []
        },
        "bugs": [],
        "test_coverage": {
            "percent": 0
        },
        "gdd_coverage": {
            "percent": 0,
            "total": 0,
            "covered": 0
        },
        "health": {
            "TODOs": 0,
            "FIXMEs": 0
        },
        "suggested_action": {
            "command": "/help",
            "desc": "Initializing rules..."
        },
        "activity_timeline": []
    }
    
    print("Gathering data...")
    print("CWD:", CWD)
    print("DATA_DIR:", DATA_DIR)

    def get_suggested_action():
        def _exists(rel_path):
            return os.path.exists(os.path.join(DATA_DIR, rel_path))
            
        if not _exists("design/game-concept.md"):
            return {"command": "/brainstorm", "desc": "项目尚未启动，建议执行 /brainstorm 创建游戏概念"}
            
        if not _exists("design/gdd/systems-index.md"):
            return {"command": "/map-systems", "desc": "概念已就绪，建议执行 /map-systems 拆解子系统"}
            
        gdd_files = glob.glob(os.path.join(DATA_DIR, "design", "gdd", "*.md"))
        if len(gdd_files) <= 1:
            return {"command": "/design-system [next]", "desc": "建议执行 /design-system 设计 MVP 子系统"}
            
        if not _exists("production/qa/reports/gdd-review-report.md"):
            return {"command": "/review-all-gdds", "desc": "建议执行 /review-all-gdds 进行跨文档一致性审查"}
            
        adr_files = glob.glob(os.path.join(DATA_DIR, "project-docs", "architecture", "adr-*.md"))
        if len(adr_files) == 0:
            return {"command": "/create-architecture", "desc": "建议执行 /create-architecture 制定架构蓝图"}
            
        epic_files = glob.glob(os.path.join(DATA_DIR, "production", "epics", "*", "EPIC.md"))
        if len(epic_files) == 0:
            return {"command": "/create-epics", "desc": "建议执行 /create-epics 生成史诗任务"}
            
        story_files = glob.glob(os.path.join(DATA_DIR, "production", "epics", "**", "story-*.md"), recursive=True)
        if len(story_files) == 0:
            return {"command": "/create-stories [epic]", "desc": "建议执行 /create-stories 拆分开发票"}
            
        sprint_files = glob.glob(os.path.join(DATA_DIR, "production", "sprints", "sprint-*.md"))
        sprint_files = [f for f in sprint_files if not any(x in f for x in ['-retrospective', '-review'])]
        if len(sprint_files) == 0:
            return {"command": "/sprint-plan new", "desc": "建议执行 /sprint-plan 规划冲刺"}
            
        # 冲刺已开始，查找可以开发的 Story
        ready_stories = []
        for sf in story_files:
            try:
                fm = extract_markdown_fields(sf)
                st = normalize_status(fm.get('status', 'todo')).lower()
                if st in ['ready', 'todo']:
                    ready_stories.append((sf, st))
            except Exception:
                pass
                
        if ready_stories:
            # 优先推荐 ready 状态的
            ready_stories.sort(key=lambda x: 0 if x[1] == 'ready' else 1)
            best_story = ready_stories[0][0]
            rel_path = best_story[best_story.find('CCGS-Data'):] if 'CCGS-Data' in best_story else best_story
            return {"command": f"/dev-story {rel_path}", "desc": "当前冲刺进行中，建议优先开发就绪的 Story"}
            
        return {"command": "/gate-check [next-phase]", "desc": "当前阶段交付物推进中，可随时验证闸门"}
        
    data["suggested_action"] = get_suggested_action()

    
    # 1. Parse Sprint Name — 排除 retrospective/review 等衍生文档
    SPRINT_SUFFIX_BLACKLIST = ['-retrospective', '-review', '-retro', '-summary']
    sprint_files = glob.glob(os.path.join(DATA_DIR, "production/sprints/sprint-*.md"))
    sprint_files = [
        f for f in sprint_files
        if not any(os.path.basename(f).replace('.md', '').endswith(suffix) for suffix in SPRINT_SUFFIX_BLACKLIST)
    ]
    data["all_sprints"] = []
    if sprint_files:
        sprints_sorted = sorted(sprint_files)
        data["all_sprints"] = [os.path.basename(f).replace('.md', '') for f in sprints_sorted]
        latest = sprints_sorted[-1]
        data["sprint"]["name"] = os.path.basename(latest).replace('.md', '')
    
    # --- Read Goals (Story D-044) ---
    goals_path = os.path.join(DATA_DIR, "production", "tracking", "goals.json")
    if os.path.exists(goals_path):
        try:
            with open(goals_path, 'r', encoding='utf-8') as f:
                data["goals"] = json.load(f)
                if data["goals"].get("active_sprint") and data["goals"]["active_sprint"] in data["all_sprints"]:
                    data["sprint"]["name"] = data["goals"]["active_sprint"]
        except Exception:
            pass
    
    # 2. Parse Stories for Real Velocity and Kanban
    story_files = glob.glob(os.path.join(DATA_DIR, "production", "epics", "**", "story-*.md"), recursive=True)
    data["stories"] = []
    total_pts = 0
    completed_pts = 0
    daily_sp = {}
    monthly_sp = {}
    for sf in story_files:
        fm = extract_markdown_fields(sf)
        pts_str = str(fm.get('points', '1'))
        pts = int(pts_str) if pts_str.isdigit() else 1
        status = normalize_status(fm.get('status', 'todo'))
        
        # 从目录路径中提取 epic 名称（如 wp-5-dashboard-upgrade）
        epic_dir = os.path.basename(os.path.dirname(sf))
        epic_label = fm.get('epic', epic_dir).replace('-', ' ').title()
        
        # Append story data for Kanban board
        deps_val = fm.get('dependencies', [])
        deps = deps_val if isinstance(deps_val, list) else []
        # Extract Acceptance Criteria metrics
        ac_list = []
        try:
            with open(sf, 'r', encoding='utf-8') as f:
                content = f.read()
                # Find Acceptance Criteria section
                ac_match = re.search(r'##\s*Acceptance Criteria\s*(.*?)(?:\n##\s*[A-Za-z]|$)', content, re.DOTALL | re.IGNORECASE)
                if ac_match:
                    ac_text = ac_match.group(1)
                    for line in ac_text.split('\n'):
                        line = line.strip()
                        if line.startswith('- [ ]') or line.startswith('* [ ]'):
                            ac_list.append({"text": line[5:].strip(), "done": False})
                        elif line.startswith('- [x]') or line.startswith('* [x]') or line.startswith('- [X]') or line.startswith('* [X]'):
                            ac_list.append({"text": line[5:].strip(), "done": True})
        except Exception:
            pass

        data["stories"].append({
            "id": os.path.basename(sf).replace('.md', ''),
            "title": fm.get('title', 'Untitled Story'),
            "points": pts,
            "priority": fm.get('priority', 'Medium').capitalize(),
            "status": status,
            "epic": epic_label,
            "type": fm.get('type', 'Feature'),
            "owner": fm.get('owner', 'Unassigned'),
            "estimate": fm.get('estimate', 'N/A'),
            "phase": fm.get('phase', 'N/A'),
            "sprint": fm.get('sprint', ''),
            "dependencies": deps,
            "path": sf,
            "ac_list": ac_list,
            "ac_total": len(ac_list),
            "ac_done": sum(1 for ac in ac_list if ac["done"])
        })
        
        story_sprint = fm.get('sprint', '')
        if story_sprint == data["sprint"]["name"]:
            total_pts += pts
            if status == 'done':
                completed_pts += pts

        # History tracking (all stories)
        if status == 'done':
            # Extract completion date via git log or file mtime (cached)
            global _git_date_cache
            mtime = os.path.getmtime(sf)
            sf_rel = os.path.relpath(sf, PROJECT_ROOT)
            cached = _git_date_cache.get(sf_rel)
            
            if cached and cached[0] == mtime:
                date_str = cached[1]
            else:
                date_str = None
                try:
                    date_str = subprocess.check_output(['git', 'log', '-1', '--format=%aI', '--', sf]).decode('utf-8').strip()
                except Exception:
                    pass
                if not date_str:
                    date_str = datetime.fromtimestamp(mtime).isoformat()
                _git_date_cache[sf_rel] = [mtime, date_str]
                
                # Save cache to disk
                try:
                    os.makedirs(os.path.dirname(_cache_file), exist_ok=True)
                    with open(_cache_file, 'w', encoding='utf-8') as f:
                        json.dump(_git_date_cache, f)
                except Exception:
                    pass
            
            if date_str and len(date_str) >= 10:
                day_key = date_str[:10]  # YYYY-MM-DD
                month_key = date_str[:7] # YYYY-MM
                daily_sp[day_key] = daily_sp.get(day_key, 0) + pts
                monthly_sp[month_key] = monthly_sp.get(month_key, 0) + pts
            
    data["sprint"]["total_points"] = total_pts
    data["sprint"]["completed_points"] = completed_pts
    
    # Load goals
    data["goals"] = {"sprint": 0, "daily": 0}
    goals_path = os.path.join(DATA_DIR, "production", "tracking", "goals.json")
    if os.path.exists(goals_path):
        try:
            with open(goals_path, 'r', encoding='utf-8') as f:
                data["goals"] = json.load(f)
        except Exception:
            pass
            
    # Compile daily and monthly history
    data["daily_history"] = [{"date": k, "sp": v} for k, v in sorted(daily_sp.items())]
    data["monthly_history"] = [{"month": k, "sp": v} for k, v in sorted(monthly_sp.items())]
    
    # Sprint Progress — 诚实的完成百分比（方案 A: 替代伪燃尽图）
    # 不再生成伪历史趋势线，仅输出真实的当前完成率
    if total_pts > 0:
        data["sprint"]["progress_percent"] = round((completed_pts / total_pts) * 100)
    else:
        data["sprint"]["progress_percent"] = 0
    data["sprint"]["burn_data"] = []  # 保留字段，向后兼容
    
    # 历史冲刺数据解析 (Story D-013)
    data["sprint_history"] = []
    for sf in sorted(sprint_files):
        sprint_name = os.path.basename(sf).replace('.md', '')
        retro_file = sf.replace('.md', '-retrospective.md')
        
        # 尝试从 retrospective 中提取完成情况（简化版正则或默认0）
        c_pts, t_pts = 0, 0
        if os.path.exists(retro_file):
            try:
                with open(retro_file, 'r', encoding='utf-8') as f:
                    content = f.read()
                    # 尝试匹配 "| Sprint 1 | 6 | 5 |" 等表格行
                    match = re.search(r'\|\s*Sprint.*?\s*\|\s*(\d+)\s*\|\s*(\d+)\s*\|', content)
                    if match:
                        t_pts = int(match.group(1))
                        c_pts = int(match.group(2))
            except Exception:
                pass
                
        data["sprint_history"].append({
            "name": sprint_name.replace('-', ' ').title(),
            "total_points": t_pts,
            "completed_points": c_pts
        })
        
    # 3. Parse Real Bug Data
    bug_files = glob.glob(os.path.join(DATA_DIR, "**", "BUG-*.md"), recursive=True)
    for bf in bug_files:
        if 'triage' in bf.lower(): continue # skip bug-triage
        name = os.path.basename(bf).replace('.md', '')
        fm = extract_markdown_fields(bf)
        title = fm.get('title')
        # If title is just the ID or empty, try to find a better title in the file
        if not title or title.strip() == name:
            better_title = None
            try:
                with open(bf, 'r', encoding='utf-8') as f:
                    for line in f:
                        if line.startswith('**Title**:') or line.startswith('**Title**:'):
                            better_title = line.split(':', 1)[1].strip()
                            break
                        elif line.startswith('# ') and not better_title:
                            # Use H1 as fallback if no **Title**: found yet
                            h1_text = line.strip()[2:].strip()
                            if h1_text.lower() not in ['bug report', 'bug']:
                                better_title = h1_text
            except Exception:
                pass
            if better_title:
                title = better_title
            
        if not title:
            title = 'Untitled Bug Report'
        priority = fm.get('priority', 'Medium').capitalize()
        status = fm.get('status', 'Open')
        normalized_bug_status = normalize_status(status)
        
        if normalized_bug_status != 'done':
            data["bugs"].append({
                "id": name, 
                "title": title, 
                "priority": priority, 
                "status": status,
                "path": bf
            })
            
    # Sort bugs by priority: Critical > High > Medium > Low
    priority_map = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    data["bugs"].sort(key=lambda x: priority_map.get(x["priority"].lower(), 4))
        
    if not data["bugs"]:
        data["bugs"] = [
            {"id": "CLEAN", "title": "Zero active bugs detected!", "priority": "Low", "status": "Clean"}
        ]
        
    # 4. Count Technical Debt (TODO/FIXME) — 多引擎源码目录自动发现
    # 候选列表覆盖主流引擎: Web(src/js/app), Unity(Assets/Scripts), UE(Source), Godot(scripts/src), Python(lib)
    SRC_CANDIDATES = ["src", "Assets/Scripts", "Source", "scripts", "js", "app", "lib"]
    
    # 优先使用 ccgs.env 中的 SRC_DIR 配置
    src_override = _ccgs_env.get('SRC_DIR')
    if src_override:
        scan_dirs = [os.path.join(PROJECT_ROOT, src_override)]
    else:
        scan_dirs = [os.path.join(PROJECT_ROOT, d) for d in SRC_CANDIDATES
                     if os.path.isdir(os.path.join(PROJECT_ROOT, d))]
    
    for scan_dir in scan_dirs:
        for root, dirs, files in os.walk(scan_dir):
            for f in files:
                if f.endswith(('.cs', '.js', '.ts', '.gd', '.py', '.cpp', '.h')):
                    try:
                        with open(os.path.join(root, f), 'r', encoding='utf-8') as file:
                            content = file.read()
                            data["health"]["TODOs"] += content.count("TODO")
                            data["health"]["FIXMEs"] += content.count("FIXME")
                    except (IOError, UnicodeDecodeError) as e:
                        print(f"Warning: 无法读取 {os.path.join(root, f)}: {e}")
                        
    # 5. Parse current Stage
    stage_path = os.path.join(DATA_DIR, "production", "tracking", "stage.txt")
    if not os.path.exists(stage_path):
        stage_path = os.path.join(DATA_DIR, "production", "stage.txt")
        
    current_stage = "unknown"
    if os.path.exists(stage_path):
        try:
            with open(stage_path, 'r', encoding='utf-8') as f:
                current_stage = f.read().strip().lower()
        except Exception:
            pass
            
    data["stage"] = current_stage
    
    # 6. Parse latest gate-check report
    gate_reports_dirs = [
        os.path.join(DATA_DIR, "production", "qa", "reports"),
        os.path.join(DATA_DIR, "production", "gate-checks")
    ]
    
    gate_files = []
    for d in gate_reports_dirs:
        if os.path.exists(d):
            gate_files.extend([os.path.join(d, f) for f in os.listdir(d) if f.endswith('.md') and 'gate' in f.lower() or 'report' in f.lower()])
            
    gate_files.sort(key=lambda x: os.path.getmtime(x), reverse=True)
    
    gate_data = {
        "status": "unknown",
        "passing": [],
        "failing": []
    }
    
    if gate_files:
        latest_gate = gate_files[0]
        try:
            with open(latest_gate, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Find verdict
            verdict_match = re.search(r'### Verdict:\s*\[?(PASS|CONCERNS|FAIL)\]?', content, re.IGNORECASE)
            if verdict_match:
                gate_data["status"] = verdict_match.group(1).upper()
                
            # Find passing/failing items based on checkbox syntax
            for line in content.split('\n'):
                line = line.strip()
                if line.startswith('- [x]') or line.startswith('- [X]'):
                    item = line[5:].strip()
                    if item:
                        gate_data["passing"].append(item)
                elif line.startswith('- [ ]'):
                    item = line[5:].strip()
                    if item:
                        gate_data["failing"].append(item)
        except Exception as e:
            print(f"Warning: 无法解析 {latest_gate}: {e}")
            
    data["gate_check"] = gate_data
    # 7. Parse GDD
    gdd_dir = os.path.join(DATA_DIR, "design", "gdd")
    gdd_files = []
    total_gdds = 0
    completed_gdds = 0

    if os.path.exists(gdd_dir):
        for filename in os.listdir(gdd_dir):
            if filename.endswith(".md") and filename[0].isdigit():
                file_path = os.path.join(gdd_dir, filename)
                title = filename.replace(".md", "")
                chapters = []
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                        current_chapter = None
                        chapter_has_content = False
                        
                        for line in lines:
                            stripped = line.strip()
                            if stripped.startswith("# "):
                                title = stripped[2:]
                            elif stripped.startswith("## "):
                                if current_chapter is not None:
                                    chapters.append({"name": current_chapter, "has_content": chapter_has_content})
                                current_chapter = stripped[3:]
                                chapter_has_content = False
                            elif current_chapter is not None and stripped and not stripped.startswith("#"):
                                chapter_has_content = True
                                
                        if current_chapter is not None:
                            chapters.append({"name": current_chapter, "has_content": chapter_has_content})
                            
                except Exception as e:
                    print(f"Warning: Failed to read {filename}: {e}")
                
                total_chaps = len(chapters)
                completed_chaps = sum(1 for c in chapters if c["has_content"])
                percent = int((completed_chaps / total_chaps) * 100) if total_chaps > 0 else 0
                
                gdd_files.append({
                    "filename": filename,
                    "path": file_path,
                    "title": title,
                    "chapters": [c["name"] for c in chapters],
                    "total_chapters": total_chaps,
                    "completed_chapters": completed_chaps,
                    "percent": percent
                })
                total_gdds += 1
                if percent == 100:
                    completed_gdds += 1
                    
        # Sort files alphabetically by filename
        gdd_files.sort(key=lambda x: x["filename"])

    data["gdd_coverage"] = {
        "files": gdd_files,
        "total": total_gdds,
        "covered": completed_gdds,
        "percent": int((completed_gdds / total_gdds) * 100) if total_gdds > 0 else 0
    }
    
    # 8. Parse ADRs
    adr_dir = os.path.join(DATA_DIR, "project-docs", "architecture")
    adr_files = []
    
    if os.path.exists(adr_dir):
        for filename in os.listdir(adr_dir):
            if filename.lower().startswith("adr-") and filename.endswith(".md"):
                file_path = os.path.join(adr_dir, filename)
                title = filename.replace(".md", "")
                status = "Unknown"
                gdd_count = 0
                associated_gdds = []
                
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                        in_status_section = False
                        in_gdd_section = False
                        
                        for line in lines:
                            stripped = line.strip()
                            if stripped.startswith("# "):
                                title = stripped[2:]
                                
                            if stripped.startswith("## Status") or stripped.startswith("## 状态"):
                                in_status_section = True
                                in_gdd_section = False
                                # Handle inline status like "## 状态: Accepted"
                                lower_stripped = stripped.lower()
                                if "accepted" in lower_stripped or "已通过" in stripped:
                                    status = "Accepted"
                                elif "proposed" in lower_stripped or "提议" in stripped:
                                    status = "Proposed"
                                elif "deprecated" in lower_stripped or "已废弃" in stripped:
                                    status = "Deprecated"
                                continue
                            elif stripped.startswith("## GDD Requirements Addressed"):
                                in_gdd_section = True
                                in_status_section = False
                                continue
                            elif stripped.startswith("## "):
                                in_status_section = False
                                in_gdd_section = False
                                continue
                                
                            if in_status_section and stripped:
                                lower_stripped = stripped.lower()
                                if "accepted" in lower_stripped or "已通过" in stripped:
                                    status = "Accepted"
                                elif "proposed" in lower_stripped or "提议" in stripped:
                                    status = "Proposed"
                                elif "deprecated" in lower_stripped or "已废弃" in stripped:
                                    status = "Deprecated"
                                    
                            if in_gdd_section and stripped.startswith("|"):
                                if ".md" in stripped and not stripped.startswith("| GDD System") and not stripped.startswith("|-"):
                                    gdd_count += 1
                                    match = re.search(r'([0-9a-zA-Z-]+\.md)', stripped)
                                    if match:
                                        associated_gdds.append(match.group(1))
                                        
                except Exception as e:
                    print(f"Warning: Failed to read {filename}: {e}")
                    
                adr_files.append({
                    "filename": filename,
                    "path": file_path,
                    "title": title,
                    "status": status,
                    "gdd_count": gdd_count,
                    "associated_gdds": associated_gdds
                })
        adr_files.sort(key=lambda x: x["filename"])
        
    data["adr_coverage"] = {
        "files": adr_files,
        "total": len(adr_files)
    }
    
    # 8.1 反向索引：为每个 GDD 附加所有引用了它的 ADR 信息
    for gdd in gdd_files:
        related_adrs = []
        for adr in adr_files:
            if gdd["filename"] in adr.get("associated_gdds", []):
                related_adrs.append({
                    "filename": adr["filename"],
                    "title": adr["title"],
                    "status": adr["status"]
                })
        gdd["associated_adrs"] = related_adrs
        gdd["adr_count"] = len(related_adrs)
        
    coverage_report = os.path.join(DATA_DIR, "production", "qa", "coverage.txt")
    if os.path.exists(coverage_report):
        try:
            with open(coverage_report, 'r') as f:
                content = f.read()
                # Dummy parse: look for "Total Coverage: 85%"
                match = re.search(r'Coverage:\s*(\d+)%', content)
                if match:
                    data["test_coverage"]["percent"] = int(match.group(1))
        except:
            pass

    # 8.2 冲击波检测 (Shockwave Detection)
    def detect_shockwaves():
        global _shockwave_cache
        try:
            head_res = subprocess.run(['git', 'rev-parse', 'HEAD'], capture_output=True, text=True, cwd=PROJECT_ROOT)
            current_head = head_res.stdout.strip() if head_res.returncode == 0 else None
            
            if current_head != _shockwave_cache['last_head']:
                _shockwave_cache['mtimes'] = {}
                _shockwave_cache['last_head'] = current_head
                print(f"[Shockwave] HEAD changed to {current_head[:8]}, cleared mtime cache")
                
            gdd_dir = os.path.join(DATA_DIR, "design", "gdd")
            if not os.path.exists(gdd_dir):
                return []
                
            gdd_files_list = glob.glob(os.path.join(gdd_dir, "*.md"))
            changed_gdds = []
            
            for gdd in gdd_files_list:
                if "index" in gdd.lower() or "concept" in gdd.lower() or "pillars" in gdd.lower(): continue
                filename = os.path.basename(gdd)
                mtime = os.path.getmtime(gdd)
                if _shockwave_cache['mtimes'].get(filename) != mtime:
                    _shockwave_cache['mtimes'][filename] = mtime
                    changed_gdds.append((filename, gdd))
            
            if changed_gdds:
                diff_res = subprocess.run(
                    ['git', 'diff', '--name-only', 'HEAD'],
                    capture_output=True, text=True, cwd=PROJECT_ROOT
                )
                changed_files = [f.strip() for f in diff_res.stdout.split('\n') if f.strip()]
                print(f"[Shockwave] changed_gdds: {[f for f,_ in changed_gdds]}")
                    
            for filename, filepath in changed_gdds:
                _shockwave_cache['active'] = [sw for sw in _shockwave_cache['active'] if sw['source_gdd'] != filename]
                
                has_diff = any(filename in cf for cf in changed_files)
                print(f"[Shockwave] {filename}: has_diff={has_diff}")
                
                if has_diff:
                    affected_adrs = []
                    affected_stories = []
                    gdd_base = filename.replace('.md', '')
                    
                    for adr in adr_files:
                        if filename in adr.get("associated_gdds", []):
                            affected_adrs.append(adr["filename"].replace('.md', ''))
                            
                    story_files = glob.glob(os.path.join(DATA_DIR, "production", "epics", "**", "story-*.md"), recursive=True)
                    for story in story_files:
                        try:
                            with open(story, 'r', encoding='utf-8') as f:
                                content = f.read()
                                if filename in content or gdd_base in content:
                                    affected_stories.append(os.path.basename(story).replace('.md', ''))
                        except: pass
                        
                    if affected_adrs or affected_stories:
                        _shockwave_cache['active'].append({
                            "source_gdd": filename,
                            "affected_adrs": affected_adrs,
                            "affected_stories": affected_stories
                        })
                        
            return _shockwave_cache['active']
        except Exception as e:
            print(f"Warning: Shockwave detection failed: {e}")
            return []

    data["shockwaves"] = detect_shockwaves()

    # 8.3 活动时间线 — 通过 git log 采集最近 20 条提交记录
    def collect_activity_timeline():
        """采集项目根目录的 git 提交历史，超时 5s 并完整容错"""
        events = []
        try:
            result = subprocess.run(
                ['git', 'log', '--oneline', '--format=%h|%ai|%s', '-20'],
                capture_output=True, text=True, timeout=5,
                cwd=PROJECT_ROOT
            )
            if result.returncode == 0:
                for line in result.stdout.strip().split('\n'):
                    if not line.strip():
                        continue
                    parts = line.split('|', 2)
                    if len(parts) == 3:
                        sha, date_str, msg = parts
                        # 智能分类：根据提交信息中的关键词判定事件类型
                        etype = 'commit'
                        msg_lower = msg.lower()
                        if any(k in msg_lower for k in ['gdd', 'design', '设计']):
                            etype = 'gdd'
                        elif any(k in msg_lower for k in ['story', 'epic', 'sprint', '任务']):
                            etype = 'story'
                        elif any(k in msg_lower for k in ['bug', 'fix', 'hotfix', '修复']):
                            etype = 'bug'
                        events.append({
                            'sha': sha.strip(),
                            'date': date_str.strip()[:10],
                            'time': date_str.strip()[11:16],
                            'msg': msg.strip(),
                            'type': etype
                        })
        except subprocess.TimeoutExpired:
            print("Warning: git log 超时 (5s)")
        except FileNotFoundError:
            print("Warning: git 未安装或不在 PATH 中")
        except Exception as e:
            print(f"Warning: 采集 git log 失败: {e}")
        return events

    data["activity_timeline"] = collect_activity_timeline()

    global _last_data_update, _cached_data
    with open(os.path.join(DIRECTORY, "data.json"), "w") as f:
        json.dump(data, f)
    _cached_data = json.dumps(data)
    _last_data_update = time.time()

def search_markdown_files(query, max_results=20):
    if not query:
        return []
        
    query_lower = query.lower()
    results = []
    
    # 优先搜索的文件目录
    search_dirs = [
        os.path.join(DATA_DIR, "design"),
        os.path.join(DATA_DIR, "production"),
        os.path.join(DATA_DIR, "project-docs")
    ]
    
    for sdir in search_dirs:
        if not os.path.exists(sdir):
            continue
        for root, _, files in os.walk(sdir):
            for file in files:
                if not file.endswith('.md'):
                    continue
                    
                filepath = os.path.join(root, file)
                try:
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                        
                    # Title match
                    title_match = query_lower in file.lower()
                    content_idx = content.lower().find(query_lower)
                    
                    if title_match or content_idx != -1:
                        snippet = ""
                        if content_idx != -1:
                            start = max(0, content_idx - 30)
                            end = min(len(content), content_idx + len(query) + 30)
                            snippet = content[start:end].replace('\n', ' ').strip()
                            if start > 0: snippet = "..." + snippet
                            if end < len(content): snippet = snippet + "..."
                            
                        # Highlighting wrapper
                        # Front-end will do better highlighting, but we provide base text
                        
                        rel_path = os.path.relpath(filepath, PROJECT_ROOT)
                        results.append({
                            "title": file,
                            "path": filepath, # Return absolute path for IDE open
                            "relPath": rel_path,
                            "snippet": snippet or "Match in filename",
                            "isTitleMatch": title_match
                        })
                        
                        if len(results) >= max_results:
                            return results
                except Exception:
                    pass
                    
    # Sort results: title matches first
    results.sort(key=lambda x: not x["isTitleMatch"])
    return results

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
        
    def do_GET(self):
        if self.path == '/api/data':
            if time.time() - _last_data_update > CACHE_TTL or _cached_data is None:
                gather_data()
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(_cached_data.encode('utf-8'))
        elif self.path.startswith('/api/search'):
            from urllib.parse import urlparse, parse_qs
            query = parse_qs(urlparse(self.path).query).get('q', [''])[0]
            
            search_results = search_markdown_files(query)
            
            self.send_response(200)
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps(search_results).encode('utf-8'))
        else:
            super().do_GET()
            
    def do_POST(self):
        if self.path == '/api/save_goals':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                goals = json.loads(post_data.decode('utf-8'))
                goals_dir = os.path.join(DATA_DIR, "production", "tracking")
                os.makedirs(goals_dir, exist_ok=True)
                goals_path = os.path.join(goals_dir, "goals.json")
                with open(goals_path, 'w', encoding='utf-8') as f:
                    json.dump(goals, f, indent=4)
                
                # force data refresh next time
                global _last_data_update
                _last_data_update = 0
                
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        elif self.path == '/api/feedback':
            content_length = int(self.headers['Content-Length'])
            post_data = self.rfile.read(content_length)
            try:
                feedback = json.loads(post_data.decode('utf-8'))
                feedback_dir = os.path.join(PROJECT_ROOT, "CCGS-Data", "production", "tracking")
                os.makedirs(feedback_dir, exist_ok=True)
                feedback_path = os.path.join(feedback_dir, "ux-feedback.json")
                
                feedback_list = []
                if os.path.exists(feedback_path):
                    with open(feedback_path, 'r', encoding='utf-8') as f:
                        try:
                            feedback_list = json.load(f)
                        except json.JSONDecodeError:
                            feedback_list = []
                            
                feedback_list.append(feedback)
                
                with open(feedback_path, 'w', encoding='utf-8') as f:
                    json.dump(feedback_list, f, indent=4, ensure_ascii=False)
                    
                self.send_response(200)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"status": "success"}).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"error": str(e)}).encode('utf-8'))
        else:
            self.send_response(404)
            self.end_headers()
        
    def end_headers(self):
        self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

def open_browser():
    webbrowser.open_new(f"http://localhost:{PORT}/")

def repair_metadata():
    print(f"Repairing metadata in {DATA_DIR}...")
    
    # 1. repair stage.txt
    stage_path = os.path.join(DATA_DIR, "production", "tracking", "stage.txt")
    os.makedirs(os.path.dirname(stage_path), exist_ok=True)
    if not os.path.exists(stage_path):
        with open(stage_path, "w", encoding="utf-8") as f:
            f.write("production")
        print(f"Created {stage_path}")

    # 2. repair systems-index.md
    index_path = os.path.join(DATA_DIR, "design", "systems-index.md")
    os.makedirs(os.path.dirname(index_path), exist_ok=True)
    if not os.path.exists(index_path):
        with open(index_path, "w", encoding="utf-8") as f:
            f.write("# Systems Index\n\n| System | Layer | Priority | Status | Design Doc |\n|---|---|---|---|---|\n")
        print(f"Created {index_path}")

    def inject_frontmatter(filepath, default_yaml):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            if content.startswith('---'):
                return # Already has frontmatter
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(default_yaml + "\n" + content)
            print(f"Repaired: {filepath}")
        except Exception as e:
            print(f"Failed to repair {filepath}: {e}")

    # 3. GDDs
    for f in glob.glob(os.path.join(DATA_DIR, "design", "gdd", "*.md")):
        if "index" in f.lower() or "concept" in f.lower() or "pillars" in f.lower(): continue
        name = os.path.basename(f).replace('.md', '')
        yaml = f"---\nid: \"{name}\"\nsystem: \"{name.replace('-', ' ').title()}\"\nlayer: \"Core\"\nversion: \"0.1.0\"\nstatus: \"Draft\"\n---"
        inject_frontmatter(f, yaml)

    # 4. Epics
    for f in glob.glob(os.path.join(DATA_DIR, "production", "epics", "*", "EPIC.md")):
        epic = os.path.basename(os.path.dirname(f))
        yaml = f"---\nepic: \"{epic}\"\ntitle: \"{epic}\"\nstatus: \"Todo\"\nlayer: \"Core\"\n---"
        inject_frontmatter(f, yaml)

    # 5. Stories
    for f in glob.glob(os.path.join(DATA_DIR, "production", "epics", "*", "story-*.md")):
        epic = os.path.basename(os.path.dirname(f))
        deps = []
        try:
            with open(f, 'r', encoding='utf-8') as file:
                lines = file.readlines()
                for line in lines:
                    if "Dependencies" in line or "Depends on" in line:
                        matches = re.findall(r'([D]-\d{3})', line)
                        deps.extend(matches)
        except:
            pass
        deps_str = "[" + ", ".join(f'"{d}"' for d in set(deps)) + "]"
        yaml = f"---\nepic: \"{epic}\"\nstatus: \"Todo\"\ntype: \"Logic\"\nestimate: \"1天\"\ndependencies: {deps_str}\ngroup: \"{epic}\"\n---"
        inject_frontmatter(f, yaml)

    # 6. Bugs
    for f in glob.glob(os.path.join(DATA_DIR, "production", "qa", "bugs", "*.md")):
        bug_id = os.path.basename(f).replace('.md', '')
        yaml = f"---\nid: \"{bug_id}\"\ntitle: \"{bug_id}\"\nseverity: \"Medium\"\npriority: \"P2\"\nstatus: \"Open\"\n---"
        inject_frontmatter(f, yaml)

    # 7. Sprints
    for f in glob.glob(os.path.join(DATA_DIR, "production", "sprints", "sprint-*.md")):
        sprint_id = os.path.basename(f).replace('.md', '')
        yaml = f"---\nid: \"{sprint_id}\"\nname: \"{sprint_id}\"\nstart_date: \"\"\nend_date: \"\"\nstories: []\n---"
        inject_frontmatter(f, yaml)

    print("Metadata repair completed.")

if __name__ == "__main__":
    import sys
    if "--repair" in sys.argv:
        repair_metadata()
        sys.exit(0)
        
    print("Gathering project data for Dashboard...")
    gather_data()
    print("Starting Glassmorphism Dashboard...")
    
    for current_port in range(8080, 8090):
        try:
            with socketserver.TCPServer(("", current_port), Handler) as httpd:
                print(f"Serving at http://localhost:{current_port}")
                Timer(1, lambda p=current_port: webbrowser.open_new(f"http://localhost:{p}/")).start()
                try:
                    httpd.serve_forever()
                except KeyboardInterrupt:
                    print("\nDashboard shut down.")
                break
        except OSError:
            continue
