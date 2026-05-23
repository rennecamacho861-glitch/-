        // i18n Dictionary
        const i18n = {
            'en': {
                'nav_dashboard': 'Dashboard', 'nav_design': 'Design', 'nav_sprints': 'Sprints', 'nav_quality': 'Quality', 'nav_settings': 'Settings',
                'title_workspace': 'Workspace Overview', 'role_td': 'Technical Director',
                'side_project': 'Project Details', 'side_active': 'Active Sprint', 'side_completed': 'Completed Pts', 'side_total': 'Total Pts',
                'empty_design_title': 'Design Repository Empty', 'empty_design_desc': 'There are no Game Design Documents (GDD) or Technical Architecture diagrams found in the current workspace.',
                'empty_sprints_title': 'No Active Sprint', 'empty_sprints_desc': 'There are no active sprints running. Please create a sprint plan to track stories and velocity.',
                'empty_quality_title': 'Zero Active Bugs', 'empty_quality_desc': 'Excellent work! There are currently no active bug reports in the tracker.',
                'stage_title': 'Project Stage', 'stage_concept': 'Concept', 'stage_systems': 'Systems Design', 'stage_setup': 'Technical Setup',
                'stage_preprod': 'Pre-Production', 'stage_prod': 'Production', 'stage_polish': 'Polish', 'stage_release': 'Release',
                'gate_modal_title': 'Gate Check Details', 'gate_pass': 'Gate: PASS', 'gate_fail': 'Gate: FAIL', 'gate_concerns': 'Gate: CONCERNS',
                'chart_title': 'Sprint Progress', 'bugs_title': 'Active Bugs', 'health_title': 'Code Debt Indicators',
                'health_todo': 'Technical Debt (TODOs)', 'health_todo_desc': 'Pending architecture or code tasks.',
                'health_fixme': 'Critical Issues (FIXMEs)', 'health_fixme_desc': 'Code that requires immediate attention.',
                'qh_title': 'Quality Health', 'qh_total': 'Total Bugs', 'qh_crit': 'Critical', 'qh_med': 'Medium', 'qh_low': 'Low',
                'triage_title': 'ACTIVE BUGS TRIAGE',
                'set_lang_desc': 'Switch between English and Chinese interface. (Auto-saved)', 'set_app': 'Appearance Mode', 'set_app_desc': 'Toggle between Light and Dark visual modes. (Auto-saved)',

                'flex': 'Flexible', 'std': 'Standard', 'strict': 'Strict',
                'set_theme': 'Theme Accents', 'set_theme_desc': 'Select the global primary color accent for your project workspace. (Auto-saved)',
                'set_ide': 'IDE Preference', 'set_ide_desc': 'Choose which IDE to open files in from the Dashboard. (Auto-saved)',
                'set_default_tab': 'Default Tab', 'set_default_tab_desc': 'Select the default view shown when Dashboard loads. (Auto-saved)',
                'status_connected': 'Connected', 'status_disconnected': 'Offline', 'warn_disconnected': 'Disconnected from server. Retrying...',

                'no_data': 'No Active Sprint Data', 'empty_bugs': 'All clear! No active bugs.', 'empty_kanban': 'Empty Column',
                'clean_bugs': '✅ All clear! No active bugs.'
            },
            'zh': {
                'nav_dashboard': '大盘概览', 'nav_design': '设计中枢', 'nav_sprints': '敏捷冲刺', 'nav_quality': '质量中心', 'nav_settings': '系统设置',
                'title_workspace': '工作空间概览', 'role_td': '技术总监',
                'side_project': '项目详情', 'side_active': '当前冲刺', 'side_completed': '已完成点数', 'side_total': '总点数',
                'empty_design_title': '设计存储库为空', 'empty_design_desc': '当前工作空间中未找到任何游戏设计文档（GDD）或技术架构蓝图。',
                'empty_sprints_title': '暂无进行中的冲刺', 'empty_sprints_desc': '当前没有任何活跃的敏捷冲刺。请创建一个冲刺计划以追踪故事点与开发速率。',
                'empty_quality_title': '完美状态', 'empty_quality_desc': '干得漂亮！当前追踪系统中没有任何待处理的活跃缺陷报告。',
                'stage_title': '项目阶段', 'stage_concept': '概念孵化', 'stage_systems': '系统设计', 'stage_setup': '技术基建',
                'stage_preprod': '前期量产', 'stage_prod': '全力量产', 'stage_polish': '打磨抛光', 'stage_release': '正式发布',
                'gate_modal_title': '阶段验收明细', 'gate_pass': '验收: 通过', 'gate_fail': '验收: 失败', 'gate_concerns': '验收: 存在隐患',
                'chart_title': '冲刺进度', 'bugs_title': '活跃缺陷', 'health_title': '代码债务指标',
                'health_todo': '技术债务 (TODOs)', 'health_todo_desc': '待处理的架构或普通代码逻辑。',
                'health_fixme': '致命问题 (FIXMEs)', 'health_fixme_desc': '可能导致崩溃，需要立刻修复。',
                'qh_title': '质量监控中心', 'qh_total': '缺陷总数', 'qh_crit': '致命缺陷', 'qh_med': '一般缺陷', 'qh_low': '低级缺陷',
                'triage_title': '活跃缺陷分诊台',
                'set_lang_desc': '在英文和中文面板之间切换。（已自动保存）', 'set_app': '外观模式', 'set_app_desc': '在极客暗黑和通透白昼模式间切换。（已自动保存）',

                'flex': '宽松', 'std': '标准', 'strict': '严格',
                'set_theme': '强调色配置', 'set_theme_desc': '为当前的工作空间选择一个专属的霓虹强调色。（已自动保存）',
                'set_ide': 'IDE 偏好', 'set_ide_desc': '选择从管理面板打开文件时使用的 IDE。（已自动保存）',
                'set_default_tab': '默认页签', 'set_default_tab_desc': '选择当管理面板加载时默认展示的视图。（已自动保存）',
                'set_visual_style': '视觉风格', 'set_visual_style_desc': '在经典风格和毛玻璃风格之间切换。（已自动保存）',
                'status_connected': '已连接', 'status_disconnected': '已断开', 'warn_disconnected': '已与服务器断开连接，正在尝试重连...',

                'no_data': '当前无冲刺数据', 'empty_bugs': '完美！无任何待处理缺陷。', 'empty_kanban': '该列暂无任务',
                'clean_bugs': '✅ 完美！当前无任何活跃缺陷。'
            }
        };

        // ----------------- LOCAL STORAGE INIT -----------------
        let currentLang = localStorage.getItem('ccgs_lang') || 'en';
        let currentMode = localStorage.getItem('ccgs_mode') || 'dark';
        let currentColor = localStorage.getItem('ccgs_color') || '#06B6D4';
        let currentIDE = localStorage.getItem('ccgs_ide_preference') || 'antigravity';
        let currentDefaultTab = localStorage.getItem('ccgs_default_tab') || 'dashboard-view';

        if (currentMode === 'light') {
            document.body.classList.add('light-mode');
        }
        // 直接应用毛玻璃风格（D-030）
        document.body.classList.add('style-glass');
        document.documentElement.style.setProperty('--cyan', currentColor);
        document.documentElement.style.setProperty('--cyan-glow', currentColor + '66');
        
        // Setup initial active states in Settings UI when DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('#lang-toggle span').forEach(s => {
                s.classList.remove('active');
                if(s.dataset.lang === currentLang) s.classList.add('active');
            });
            document.querySelectorAll('#theme-toggle span').forEach(s => {
                s.classList.remove('active');
                if(s.dataset.mode === currentMode) s.classList.add('active');
            });
            document.querySelectorAll('.swatch').forEach(s => {
                s.classList.remove('active');
                if(s.dataset.color === currentColor) s.classList.add('active');
            });
            // IDE 选择器初始化
            document.querySelectorAll('#ide-toggle span').forEach(s => {
                s.classList.remove('active');
                if(s.dataset.ide === currentIDE) s.classList.add('active');
            });
            // 默认页签初始化
            document.querySelectorAll('#default-tab-toggle span').forEach(s => {
                s.classList.remove('active');
                if(s.dataset.tab === currentDefaultTab) s.classList.add('active');
            });
            // 自动跳转到默认页签
            if (currentDefaultTab && currentDefaultTab !== 'dashboard-view') {
                const targetNav = document.querySelector(`.nav-item[data-target="${currentDefaultTab}"]`);
                if (targetNav) targetNav.click();
            }
            
            // Set initial language strings
            setLang(currentLang);
        });
        // ------------------------------------------------------

        function setLang(lang) {
            currentLang = lang;
            document.querySelectorAll('[data-i18n]').forEach(el => {
                const text = i18n[lang][el.dataset.i18n];
                if(text) {
                    // Check if we need to preserve innerHTML structure (icons etc)
                    if(el.childNodes.length > 1) {
                        for(let i=0; i<el.childNodes.length; i++) {
                            if(el.childNodes[i].nodeType === 3 && el.childNodes[i].textContent.trim().length > 0) {
                                el.childNodes[i].textContent = text;
                                break;
                            }
                        }
                    } else {
                        el.textContent = text;
                    }
                }
            });
            // Update Page Title to match Nav
            const activeNav = document.querySelector('.nav-item.active');
            if(activeNav) {
                document.getElementById('page-title').textContent = i18n[lang][activeNav.dataset.i18n];
            }
        }

        // Language Toggle Logic
        const langToggle = document.getElementById('lang-toggle');
        const langBtns = langToggle.querySelectorAll('span');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem('ccgs_lang', btn.dataset.lang);
                setLang(btn.dataset.lang);
            });
        });

        // SPA Navigation Logic
        const navItems = document.querySelectorAll('.nav-item');
        const views = document.querySelectorAll('.view-section');
        const pageTitle = document.getElementById('page-title');

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                if(!item.dataset.target) return;
                
                navItems.forEach(nav => nav.classList.remove('active'));
                item.classList.add('active');
                pageTitle.textContent = i18n[currentLang][item.dataset.i18n] || item.textContent.trim();

                views.forEach(v => v.classList.remove('active'));
                document.getElementById(item.dataset.target).classList.add('active');
            });
        });

        // Global function for dashboard cards to switch views
        window.switchView = function(viewId) {
            const navItems = document.querySelectorAll('.nav-item');
            const targetNav = Array.from(navItems).find(nav => nav.dataset.target === viewId);
            if (targetNav) {
                targetNav.click();
            }
        };

        // --- Goals & Chart State ---
        window._currentGoals = { sprint: 0, daily: 0 };
        window._chartMode = 'goal'; // 'goal', 'daily', 'monthly'
        window._chartData = { daily: [], monthly: [] };
        
        window.saveGoalSprint = function(sprintName) {
            window._currentGoals.active_sprint = sprintName;
            
            fetch('/api/save_goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(window._currentGoals)
            }).then(() => {
                window.location.reload();
            });
        };
        
        window.switchChartMode = function(mode) {
            window._chartMode = mode;
            document.querySelectorAll('#history-chart-card .segment-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('btn-chart-' + mode).classList.add('active');
            window.renderHistoryChart();
        };
        
        window.renderHistoryChart = function() {
            const container = document.getElementById('history-chart-container');
            const emptyState = document.getElementById('chart-empty-state');
            
            if (window._chartMode === 'goal' && (!window._lastData || !window._lastData.sprint || window._lastData.sprint.total_points <= 0)) {
                container.style.display = 'none';
                emptyState.style.display = 'block';
                return;
            }
            container.style.display = 'block';
            emptyState.style.display = 'none';
            
            let dataset = [];
            if (window._chartMode === 'monthly') {
                dataset = window._chartData.monthly.map(item => ({ label: item.month, val: item.sp }));
            } else {
                dataset = window._chartData.daily.map(item => ({ label: item.date, val: item.sp }));
                if (window._chartMode === 'goal') {
                    dataset = dataset.slice(-14);
                }
            }
            
            if (dataset.length === 0) {
                container.innerHTML = '<div style="color:var(--text-muted); padding: 20px;">No data available.</div>';
                return;
            }
        
            let targetVal = null;
            if (window._chartMode === 'goal' && window._lastData && window._lastData.sprint) {
                targetVal = Math.ceil((window._lastData.sprint.total_points || 0) / 14);
            }
        
            const width = Math.max(container.clientWidth, dataset.length * 40);
            const height = 260;
            const padding = { top: 20, right: 30, bottom: 40, left: 40 };
            
            const maxVal = Math.max(...dataset.map(d => d.val), targetVal || 0) || 10;
            
            const scaleX = i => padding.left + (i / Math.max(1, dataset.length - 1)) * (width - padding.left - padding.right);
            const scaleY = v => height - padding.bottom - (v / maxVal) * (height - padding.top - padding.bottom);
            
            let points = dataset.map((d, i) => `${scaleX(i)},${scaleY(d.val)}`).join(' ');
            let polygonPoints = `${scaleX(0)},${height - padding.bottom} ${points} ${scaleX(dataset.length - 1)},${height - padding.bottom}`;
            
            let targetLineHtml = '';
            if (targetVal !== null) {
                const y = scaleY(targetVal);
                targetLineHtml = `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="var(--orange)" stroke-width="2" stroke-dasharray="6,4" />
                                  <text x="${width - padding.right + 5}" y="${y+4}" fill="var(--orange)" font-size="10">${targetVal}</text>`;
            }
        
            let nodesHtml = dataset.map((d, i) => {
                const cx = scaleX(i);
                const cy = scaleY(d.val);
                const reachRate = targetVal ? Math.round((d.val / targetVal) * 100) : null;
                let tooltipExtra = '';
                if (reachRate !== null) {
                    tooltipExtra = `Rate: ${reachRate}% ` + (reachRate >= 100 ? '🔥' : '💪');
                }
                return `<circle cx="${cx}" cy="${cy}" r="4" fill="var(--bg-dark)" stroke="var(--cyan)" stroke-width="2" 
                            onmouseover="window.showChartTooltip(event, '${d.label}', ${d.val}, '${tooltipExtra}')"
                            onmouseout="window.hideChartTooltip()"
                            style="cursor: pointer; transition: r 0.2s;"></circle>
                        <circle cx="${cx}" cy="${cy}" r="12" fill="transparent"
                            onmouseover="window.showChartTooltip(event, '${d.label}', ${d.val}, '${tooltipExtra}'); this.previousElementSibling.setAttribute('r', '6');"
                            onmouseout="window.hideChartTooltip(); this.previousElementSibling.setAttribute('r', '4');"
                            style="cursor: pointer;"></circle>`;
            }).join('');
        
            let labelsHtml = dataset.map((d, i) => {
                if (dataset.length > 15 && i % Math.ceil(dataset.length / 10) !== 0 && i !== dataset.length - 1) return '';
                const cx = scaleX(i);
                let displayLabel = d.label;
                if (window._chartMode !== 'monthly') {
                    displayLabel = d.label.substring(5); // MM-DD
                }
                return `<text x="${cx}" y="${height - Math.max(5, padding.bottom - 15)}" fill="var(--text-muted)" font-size="10" text-anchor="middle">${displayLabel}</text>`;
            }).join('');
        
            let yLabelsHtml = [0, maxVal/2, maxVal].map(v => {
                const cy = scaleY(v);
                return `<text x="${padding.left - 10}" y="${cy + 4}" fill="var(--text-muted)" font-size="10" text-anchor="end">${Math.round(v)}</text>
                        <line x1="${padding.left}" y1="${cy}" x2="${width - padding.right}" y2="${cy}" stroke="var(--border-color)" stroke-width="1" stroke-dasharray="2,4" />`;
            }).join('');
        
            const svg = `
                <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" style="overflow: visible;">
                    <defs>
                        <linearGradient id="areaGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" stop-color="var(--cyan)" stop-opacity="0.3" />
                            <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0" />
                        </linearGradient>
                    </defs>
                    ${yLabelsHtml}
                    ${targetLineHtml}
                    <polygon points="${polygonPoints}" fill="url(#areaGrad)" />
                    <polyline points="${points}" fill="none" stroke="var(--cyan)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
                    ${labelsHtml}
                    ${nodesHtml}
                </svg>
            `;
            
            container.innerHTML = svg;
        };
        
        window.showChartTooltip = function(e, label, val, extra) {
            const tt = document.getElementById('chart-tooltip');
            document.getElementById('chart-tooltip-title').textContent = label;
            document.getElementById('chart-tooltip-val').textContent = val;
            const extraEl = document.getElementById('chart-tooltip-extra');
            if (extra && extra !== 'null') {
                extraEl.style.display = 'block';
                extraEl.textContent = extra;
            } else {
                extraEl.style.display = 'none';
            }
            
            tt.style.display = 'block';
            
            const containerRect = document.getElementById('history-chart-card').getBoundingClientRect();
            let left = e.clientX - containerRect.left + 15;
            let top = e.clientY - containerRect.top - 40;
            
            if (left + tt.offsetWidth > containerRect.width) {
                left = e.clientX - containerRect.left - tt.offsetWidth - 15;
            }
            
            tt.style.left = left + 'px';
            tt.style.top = top + 'px';
        };
        
        window.hideChartTooltip = function() {
            document.getElementById('chart-tooltip').style.display = 'none';
        };

        // Theme Toggle Logic
        const themeToggle = document.getElementById('theme-toggle');
        const themeBtns = themeToggle.querySelectorAll('span');
        themeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                themeBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                localStorage.setItem('ccgs_mode', btn.dataset.mode);
                if(btn.dataset.mode === 'light') {
                    document.body.classList.add('light-mode');
                } else {
                    document.body.classList.remove('light-mode');
                }
            });
        });

        // Accent Color Toggle
        const swatches = document.querySelectorAll('.swatch');
        swatches.forEach(swatch => {
            swatch.addEventListener('click', () => {
                swatches.forEach(s => s.classList.remove('active'));
                swatch.classList.add('active');
                const color = swatch.dataset.color;
                localStorage.setItem('ccgs_color', color);
                document.documentElement.style.setProperty('--cyan', color);
                document.documentElement.style.setProperty('--cyan-glow', color + '66');
            });
        });

        // IDE Preference Toggle (D-029)
        const ideToggle = document.getElementById('ide-toggle');
        if (ideToggle) {
            const ideBtns = ideToggle.querySelectorAll('span');
            ideBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    ideBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentIDE = btn.dataset.ide;
                    localStorage.setItem('ccgs_ide_preference', currentIDE);
                });
            });
        }

        // Default Tab Toggle (D-029)
        const tabToggle = document.getElementById('default-tab-toggle');
        if (tabToggle) {
            const tabBtns = tabToggle.querySelectorAll('span');
            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    tabBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentDefaultTab = btn.dataset.tab;
                    localStorage.setItem('ccgs_default_tab', currentDefaultTab);
                });
            });
        }

        let failCount = 0;
        const connWarning = document.getElementById('connection-warning');
        const connDot = document.getElementById('conn-dot');
        const connText = document.getElementById('conn-text');

        function updateConnectionState(isOnline) {
            if (isOnline) {
                failCount = 0;
                if(connWarning) connWarning.style.display = 'none';
                if(connDot) {
                    connDot.style.backgroundColor = '#10b981';
                    connDot.style.boxShadow = '0 0 8px #10b981';
                }
                if(connText) connText.textContent = i18n[currentLang]['status_connected'] || 'Connected';
            } else {
                failCount++;
                if(connDot) {
                    connDot.style.backgroundColor = '#ef4444';
                    connDot.style.boxShadow = '0 0 8px #ef4444';
                }
                if(connText) connText.textContent = i18n[currentLang]['status_disconnected'] || 'Offline';
                
                if (failCount >= 2 && connWarning) {
                    connWarning.style.display = 'block';
                }
            }
        }

        // Fetch Dashboard Data (prevent cache to ensure fresh state)
        function fetchData() {
            fetch('/api/data', { cache: 'no-store' })
                .then(res => {
                    if (!res.ok) throw new Error('Network response was not ok');
                    return res.json();
                })
                .then(data => {
                    updateConnectionState(true);
                    
                    document.getElementById('sprint-name').textContent = data.sprint.name || 'N/A';
                    document.getElementById('sprint-pts').textContent = data.sprint.completed_points;
                    document.getElementById('sprint-total').textContent = data.sprint.total_points;
                    
                    const progressElem = document.getElementById('progress-bar');
                    if (progressElem) {
                        const pct = data.sprint.total_points > 0 ? (data.sprint.completed_points / data.sprint.total_points) * 100 : 0;
                        progressElem.style.width = pct + '%';
                    }
                    
                    // Story D-041: Sprint Selector Injection
                    window._lastData = data;
                    if (typeof window._selectedSprint === 'undefined') {
                        window._selectedSprint = data.sprint.name; // 默认选中当前活跃冲刺
                    }

                    const selOverview = document.getElementById('sprint-selector-overview');
                    
                    if (data.sprint_history && data.sprint_history.length > 0) {
                        // 构建选项，优先当前活跃，然后按时间倒序或原样
                        const optsHtml = data.sprint_history.map(s => 
                            `<option value="${s.name}" ${s.name === window._selectedSprint ? 'selected' : ''}>${s.name}</option>`
                        ).join('');
                        
                        if (selOverview && selOverview.innerHTML !== optsHtml) {
                            selOverview.innerHTML = optsHtml;
                            
                            selOverview.onchange = (e) => {
                                window._selectedSprint = e.target.value;
                                // 同步选择器状态（此时 Sprint 视图内可能已经有另一个）
                                const selSprints = document.getElementById('sprint-selector-sprints');
                                if (selSprints) selSprints.value = window._selectedSprint;
                                
                                // 触发全局视图重绘
                                if (typeof window._renderSprintDependentViews === 'function') {
                                    window._renderSprintDependentViews();
                                }
                                // 立即刷新看板卡片的 Sprint 过滤状态
                                if (typeof _applyEpicFilter === 'function') {
                                    _applyEpicFilter();
                                }
                            };
                        }
                    }
                    
                    // Gate Check Status Light
                    const gateLight = document.getElementById('gate-status-light');
                    if (data.gate_check && data.gate_check.status !== 'unknown') {
                        if (gateLight) {
                            gateLight.style.display = 'flex';
                            const gateDot = document.getElementById('gate-dot');
                            const gateText = document.getElementById('gate-text');
                            
                            gateDot.className = 'gate-dot';
                            if (data.gate_check.status === 'PASS') {
                                gateDot.classList.add('pass');
                                gateText.textContent = i18n[currentLang]['gate_pass'];
                            } else if (data.gate_check.status === 'FAIL') {
                                gateDot.classList.add('fail');
                                gateText.textContent = i18n[currentLang]['gate_fail'];
                            } else if (data.gate_check.status === 'CONCERNS') {
                                gateDot.classList.add('concerns');
                                gateText.textContent = i18n[currentLang]['gate_concerns'];
                            }
                            
                            // Render Modal Body
                            const modalBody = document.getElementById('gate-modal-body');
                            if (modalBody) {
                                modalBody.innerHTML = '';
                                if (data.gate_check.failing.length > 0) {
                                    const section = document.createElement('div');
                                    section.className = 'gate-section gate-section-fail';
                                    
                                    const failTitle = document.createElement('h3');
                                    failTitle.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path></svg> ` + (currentLang === 'zh' ? '阻碍项 / 未通过' : 'Blockers / Failing');
                                    section.appendChild(failTitle);
                                    
                                    data.gate_check.failing.forEach(item => {
                                        const div = document.createElement('div');
                                        div.className = 'gate-item';
                                        div.innerHTML = `<span style="color: #ef4444; flex-shrink:0;">✕</span><span>${item}</span>`;
                                        section.appendChild(div);
                                    });
                                    modalBody.appendChild(section);
                                }
                                
                                if (data.gate_check.passing.length > 0) {
                                    const section = document.createElement('div');
                                    section.className = 'gate-section gate-section-pass';
                                    
                                    const passTitle = document.createElement('h3');
                                    passTitle.innerHTML = `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> ` + (currentLang === 'zh' ? '已通过项' : 'Passing Items');
                                    section.appendChild(passTitle);
                                    
                                    data.gate_check.passing.forEach(item => {
                                        const div = document.createElement('div');
                                        div.className = 'gate-item';
                                        div.innerHTML = `<span style="color: #10b981; flex-shrink:0;">✓</span><span>${item}</span>`;
                                        section.appendChild(div);
                                    });
                                    modalBody.appendChild(section);
                                }
                            }
                        }
                    } else {
                        if (gateLight) gateLight.style.display = 'none';
                    }
                    
                    // Shockwave UI (Story D-025)
                    window._currentShockwaves = data.shockwaves || [];
                    const shockwaveBanner = document.getElementById('shockwave-global-banner');
                    if (window._currentShockwaves.length > 0) {
                        const sw = window._currentShockwaves[0];
                        const adrCount = sw.affected_adrs ? sw.affected_adrs.length : 0;
                        const storyCount = sw.affected_stories ? sw.affected_stories.length : 0;
                        const bannerText = document.getElementById('shockwave-banner-text');
                        if (bannerText) {
                            bannerText.textContent = `⚠️ 检测到 ${sw.source_gdd} 已修改 · 影响 ${adrCount} 个 ADR · ${storyCount} 个 Story`;
                        }
                        if (shockwaveBanner) shockwaveBanner.style.display = 'flex';
                    } else {
                        if (shockwaveBanner) shockwaveBanner.style.display = 'none';
                    }
                    
                    // Smart Action Banner
                    if (data.suggested_action) {
                        const banner = document.getElementById('smart-banner');
                        if(banner) {
                            banner.style.display = 'flex';
                            const inputElem = document.getElementById('smart-action-input');
                            if (inputElem) {
                                inputElem.placeholder = data.suggested_action.desc;
                                // Save default in case the input is cleared
                                window._defaultSmartCommand = data.suggested_action.command;
                            }
                            document.getElementById('smart-action-cmd').textContent = data.suggested_action.command;
                            window._currentSmartCommand = data.suggested_action.command;
                            
                            // Story D-023: Extract target story ID
                            const match = data.suggested_action.command.match(/(story-[^/.]+)\.md/i);
                            window._currentRecommendedStoryId = match ? match[1] : null;
                        }
                    }
                    
                    const percent = data.sprint.total_points > 0 ? (data.sprint.completed_points / data.sprint.total_points) * 100 : 0;
                    // Sprint Progress Ring — 诚实的完成百分比
                    const progressPercent = data.sprint.progress_percent || 0;
                    const circumference = 2 * Math.PI * 85; // r=85
                    const ring = document.getElementById('progress-ring');
                    const ringVal = document.getElementById('progress-ring-val');
                    const ringMeta = document.getElementById('progress-ring-meta');
                    if (ring) {
                        const offset = circumference - (progressPercent / 100) * circumference;
                        setTimeout(() => {
                            ring.style.strokeDashoffset = offset;
                            ringVal.textContent = progressPercent + '%';
                        }, 200);
                        ringMeta.innerHTML = `<strong>${data.sprint.completed_points}</strong> / ${data.sprint.total_points} pts`;
                    }
                    
                    // --- Goals & Charts (Story D-044 Timeline) ---
                    window._currentGoals = data.goals || {};
                    const sprintName = data.sprint.name;
                    
                    // Populate Sprint Timeline
                    const timelineContainer = document.getElementById('sprint-timeline');
                    if (timelineContainer && data.all_sprints) {
                        timelineContainer.innerHTML = '';
                        data.all_sprints.forEach(sp => {
                            const node = document.createElement('div');
                            node.className = 'timeline-node' + (sp === sprintName ? ' active' : '');
                            node.onclick = () => window.saveGoalSprint(sp);
                            
                            const dot = document.createElement('div');
                            dot.className = 'node-dot';
                            
                            const label = document.createElement('div');
                            label.className = 'node-label';
                            label.textContent = sp.replace('-', ' ');
                            
                            node.appendChild(dot);
                            node.appendChild(label);
                            timelineContainer.appendChild(node);
                        });
                    }
                    
                    // Populate Sprint Vitals
                    const velocityEl = document.getElementById('vital-velocity');
                    const statusEl = document.getElementById('vital-status');
                    if (velocityEl) {
                        const requiredVelocity = Math.ceil((data.sprint.total_points || 0) / 14);
                        velocityEl.textContent = `${requiredVelocity} SP / Day`;
                        
                        if (statusEl) {
                            if (progressPercent >= 100) {
                                statusEl.innerHTML = '✨ Completed';
                                statusEl.style.color = '#8b5cf6';
                                statusEl.style.background = 'rgba(139, 92, 246, 0.15)';
                                statusEl.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                            } else if (progressPercent < 20 && requiredVelocity > 10) {
                                statusEl.innerHTML = '🔴 At Risk';
                                statusEl.style.color = '#ef4444';
                                statusEl.style.background = 'rgba(239, 68, 68, 0.15)';
                                statusEl.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                            } else {
                                statusEl.innerHTML = '🟢 On Track';
                                statusEl.style.color = '#10b981';
                                statusEl.style.background = 'rgba(16, 185, 129, 0.15)';
                                statusEl.style.borderColor = 'rgba(16, 185, 129, 0.3)';
                            }
                        }
                    }

                    if (data.daily_history || data.monthly_history) {
                        window._chartData.daily = data.daily_history || [];
                        window._chartData.monthly = data.monthly_history || [];
                        window.renderHistoryChart();
                    }
                    
                    // Hide loading spinner and show the correct tab
                    const designLoading = document.getElementById('design-loading');
                    if (designLoading) designLoading.style.display = 'none';
                    const btnAdrView = document.getElementById('btn-adr-view');
                    if (btnAdrView && btnAdrView.classList.contains('active')) {
                        document.getElementById('adr-container').style.display = 'block';
                    } else {
                        document.getElementById('gdd-container').style.display = 'block';
                    }
                    
                    if(data.gdd_coverage) {
                        const gddOffset = circumference - (data.gdd_coverage.percent / 100) * circumference;
                        const gddRing = document.getElementById('gdd-ring');
                        const gddVal = document.getElementById('gdd-ring-val');
                        const gddMeta = document.getElementById('gdd-ring-meta');
                        if (gddRing) {
                            setTimeout(() => { 
                                gddRing.style.strokeDashoffset = gddOffset; 
                                if(gddVal) gddVal.textContent = data.gdd_coverage.percent + '%';
                            }, 300);
                        }
                        if(gddMeta) gddMeta.innerHTML = `<strong>${data.gdd_coverage.covered}</strong> / ${data.gdd_coverage.total} TRs`;

                        // Story D-014: Render Design Hub (GDD files)
                        const designGrid = document.getElementById('design-grid');
                        const emptyDesign = document.getElementById('empty-design');
                        if (data.gdd_coverage.files && data.gdd_coverage.files.length > 0) {
                            window.currentGddFiles = data.gdd_coverage.files; // Store for modal
                            if (emptyDesign) emptyDesign.style.display = 'none';
                            if (designGrid) {
                                designGrid.style.display = 'grid';
                                designGrid.innerHTML = data.gdd_coverage.files.map((f, i) => {
                                    const chaptersHtml = f.chapters && f.chapters.length > 0 
                                        ? `<div class="gdd-chapters">${f.chapters.map(c => `<div class="gdd-chapter-item"><svg width="14" height="14" fill="none" stroke="var(--cyan)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg> <span>${c}</span></div>`).join('')}</div>`
                                        : '';
                                    
                                    // D-016: ADR 关联徽章
                                    const adrBadgeHtml = f.adr_count > 0
                                        ? `<span class="adr-badge"><svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>×${f.adr_count}</span>`
                                        : '';
                                        
                                    return `
                                        <div class="gdd-card" onclick="window.openGddModal(${i})" style="cursor: pointer;">
                                            ${adrBadgeHtml}
                                            <div class="gdd-header">
                                                <div>
                                                    <h3 class="gdd-title">${f.title}</h3>
                                                    <div class="gdd-filename">${f.filename}</div>
                                                </div>
                                            </div>
                                            <div class="gdd-progress-container">
                                                <div class="gdd-progress-bar" style="width: ${f.percent}%"></div>
                                            </div>
                                            <div class="gdd-stats">
                                                <span>${f.completed_chapters} / ${f.total_chapters} Chapters Completed</span>
                                                <span style="color: var(--cyan); font-weight: bold;">${f.percent}%</span>
                                            </div>
                                            ${chaptersHtml}
                                        </div>
                                    `;
                                }).join('');
                            }
                        } else {
                            if (emptyDesign) emptyDesign.style.display = 'flex';
                            if (designGrid) designGrid.style.display = 'none';
                        }
                    }
                    
                    if(data.adr_coverage) {
                        const adrKanban = document.getElementById('adr-kanban');
                        const emptyAdr = document.getElementById('empty-adr');
                        if (data.adr_coverage.files && data.adr_coverage.files.length > 0) {
                            window.currentAdrFiles = data.adr_coverage.files;
                            if (emptyAdr) emptyAdr.style.display = 'none';
                            if (adrKanban) {
                                adrKanban.style.display = 'grid';
                                
                                const listProposed = document.getElementById('adr-list-proposed');
                                const listAccepted = document.getElementById('adr-list-accepted');
                                const listDeprecated = document.getElementById('adr-list-deprecated');
                                
                                let proposedHtml = '';
                                let acceptedHtml = '';
                                let deprecatedHtml = '';
                                

                                    data.adr_coverage.files.forEach((adr, i) => {
                                    const adrNumMatch = adr.filename.match(/adr-(\d+)/i);
                                    const adrNum = adrNumMatch ? adrNumMatch[1] : '';
                                    
                                    // Story D-025: Shockwave badge
                                    let shockwaveBadge = '';
                                    let borderStyle = '';
                                    let adrBaseName = adr.filename.replace('.md', '');
                                    if (window._currentShockwaves && window._currentShockwaves.length > 0) {
                                        const isAffected = window._currentShockwaves.some(sw => 
                                            (sw.affected_adrs && sw.affected_adrs.includes(adrBaseName))
                                        );
                                        if (isAffected) {
                                            borderStyle = 'border: 1px solid var(--orange); box-shadow: 0 0 10px rgba(245, 158, 11, 0.3);';
                                            shockwaveBadge = `
                                                <div class="sw-badge" title="上游 GDD 已变更，需重新验证" onclick="window.showShockwavePanel(event)" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; background: var(--orange); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 10;">
                                                    ⚠️
                                                </div>
                                            `;
                                        }
                                    }
                                    
                                    const cardHtml = `
                                        <div class="kanban-card" onclick="window.openAdrPanel(${i})" style="cursor: pointer; position: relative; ${borderStyle}">
                                            ${shockwaveBadge}
                                            <div style="font-size: 0.8rem; color: var(--text-muted); font-family: monospace; margin-bottom: 4px;">ADR-${adrNum}</div>
                                            <h4 style="margin: 0 0 8px 0; color: var(--text-main); font-size: 0.95rem;">${adr.title}</h4>
                                            <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 10px;">
                                                <span style="font-size: 0.75rem; color: var(--text-muted); padding: 2px 6px; background: var(--bg-hover); border-radius: 4px;">
                                                    ${adr.gdd_count} GDD${adr.gdd_count !== 1 ? 's' : ''}
                                                </span>
                                            </div>
                                        </div>
                                    `;
                                    
                                    if (adr.status === 'Accepted') acceptedHtml += cardHtml;
                                    else if (adr.status === 'Deprecated') deprecatedHtml += cardHtml;
                                    else proposedHtml += cardHtml; // Default to proposed
                                });
                                
                                if(listProposed) listProposed.innerHTML = proposedHtml;
                                if(listAccepted) listAccepted.innerHTML = acceptedHtml;
                                if(listDeprecated) listDeprecated.innerHTML = deprecatedHtml;
                            }
                        } else {
                            if (emptyAdr) emptyAdr.style.display = 'flex';
                            if (adrKanban) adrKanban.style.display = 'none';
                        }
                    }
                    
                    if(data.test_coverage) {
                        const testOffset = circumference - (data.test_coverage.percent / 100) * circumference;
                        const testRing = document.getElementById('test-ring');
                        const testVal = document.getElementById('test-ring-val');
                        if (testRing) {
                            setTimeout(() => { 
                                testRing.style.strokeDashoffset = testOffset; 
                                if(testVal) testVal.textContent = data.test_coverage.percent + '%';
                            }, 400);
                        }
                    }

                    // Bugs List (Dashboard)
                    const list = document.getElementById('bug-list');
                    if (!data.bugs || data.bugs.length === 0 || data.bugs[0].id === 'CLEAN') {
                        list.innerHTML = `<div class="empty-state" data-i18n="empty_bugs">${i18n[currentLang]['empty_bugs']}</div>`;
                    } else {
                        list.innerHTML = ''; // clear before append
                        data.bugs.forEach(bug => {
                            const li = document.createElement('div');
                            li.className = 'bug-item';
                            const p = bug.priority.toLowerCase();
                            const prioClass = (p === 'critical' || p === 'high') ? 'priority-high' : 'priority-low';
                            li.innerHTML = `
                                <div style="display:flex; flex-direction:column; gap:4px; max-width:70%;">
                                    <strong style="color: var(--text-main); font-size: 1rem;">${bug.id}</strong>
                                    <span style="font-size: 0.85rem; color: var(--text-muted); white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${bug.title}</span>
                                </div>
                                <span class="bug-priority ${prioClass}">${bug.priority}</span>
                            `;
                            list.appendChild(li);
                        });
                    }

                    // Health metrics UI has been replaced by GDD/Test coverage
                    // Stage Tracker
                    const stageTracker = document.getElementById('stage-tracker');
                    const stageContainer = document.getElementById('stage-container');
                    if (data.stage && data.stage !== 'unknown') {
                        if(stageTracker) stageTracker.style.display = 'block';
                        
                        const stages = [
                            {id: 'concept', key: 'stage_concept'},
                            {id: 'systems design', key: 'stage_systems'},
                            {id: 'technical setup', key: 'stage_setup'},
                            {id: 'pre-production', key: 'stage_preprod'},
                            {id: 'production', key: 'stage_prod'},
                            {id: 'polish', key: 'stage_polish'},
                            {id: 'release', key: 'stage_release'}
                        ];
                        
                        let fetchedStage = data.stage.toLowerCase().replace('_', ' ');
                        let currentIndex = stages.findIndex(s => s.id === fetchedStage);
                        
                        if(currentIndex === -1) {
                            if (fetchedStage.includes('pre') || fetchedStage.includes('preprod')) currentIndex = 3;
                            else if (fetchedStage.includes('prod')) currentIndex = 4;
                            else if (fetchedStage.includes('sys')) currentIndex = 1;
                            else if (fetchedStage.includes('tech')) currentIndex = 2;
                            else currentIndex = 0; // fallback
                        }
                        
                        if(stageContainer) {
                            stageContainer.innerHTML = '';
                            stages.forEach((st, idx) => {
                                const isCompleted = idx < currentIndex;
                                const isCurrent = idx === currentIndex;
                                
                                const stepDiv = document.createElement('div');
                                stepDiv.className = `stage-step ${isCompleted ? 'completed' : ''} ${isCurrent ? 'current' : ''}`;
                                
                                const iconContent = isCompleted 
                                    ? `<svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>`
                                    : (idx + 1);
                                    
                                stepDiv.innerHTML = `
                                    <div class="stage-icon">${iconContent}</div>
                                    <div class="stage-label" data-i18n="${st.key}">${i18n[currentLang][st.key]}</div>
                                `;
                                stageContainer.appendChild(stepDiv);
                            });
                        }
                    } else {
                        if(stageTracker) stageTracker.style.display = 'none';
                    }

                    // Sprints Kanban（三列模型：BACKLOG | IN PROGRESS | DONE）
                    const colBacklog = document.getElementById('col-backlog');
                    const colInProg = document.getElementById('col-inprogress');
                    const colDone = document.getElementById('col-done');
                    const kanbanBoard = document.getElementById('kanban-board');
                    const sprintsEmpty = document.getElementById('sprints-empty');
                    
                    if (data.stories && data.stories.length > 0) {
                        if(kanbanBoard) kanbanBoard.style.display = 'grid';
                        if(sprintsEmpty) sprintsEmpty.style.display = 'none';
                        colBacklog.innerHTML = ''; colInProg.innerHTML = ''; colDone.innerHTML = '';
                        
                        // --- Story D-034: Global Topological Sorting (with ID Priority) ---
                        const inDegree = new Map();
                        const graph = new Map();
                        data.stories.forEach(s => {
                            inDegree.set(s.id, 0);
                            graph.set(s.id, []);
                        });
                        data.stories.forEach(s => {
                            (s.dependencies || []).forEach(depId => {
                                if (graph.has(depId)) {
                                    graph.get(depId).push(s.id);
                                    inDegree.set(s.id, inDegree.get(s.id) + 1);
                                }
                            });
                        });
                        let queue = [];
                        inDegree.forEach((deg, id) => { if (deg === 0) queue.push(id); });
                        
                        const topoOrder = new Map();
                        let orderIndex = 0;
                        
                        while(queue.length > 0) {
                            // Sort queue by ID ascending to act as a priority queue
                            queue.sort((a, b) => {
                                const idA = parseInt((a.match(/(\d+)$/) || [0, 0])[1], 10);
                                const idB = parseInt((b.match(/(\d+)$/) || [0, 0])[1], 10);
                                return idA - idB;
                            });
                            
                            const id = queue.shift();
                            topoOrder.set(id, orderIndex++);
                            
                            graph.get(id).forEach(dependentId => {
                                let d = inDegree.get(dependentId) - 1;
                                inDegree.set(dependentId, d);
                                if (d === 0) queue.push(dependentId);
                            });
                        }
                        
                        // 兜底：处理环依赖
                        data.stories.forEach(s => {
                            if (!topoOrder.has(s.id)) topoOrder.set(s.id, 9999);
                        });

                        // 排序: Epic -> 拓扑序 -> ID 数字升序
                        data.stories.sort((a, b) => {
                            const epicA = a.epic || 'zzzz'; // 未分类放最后
                            const epicB = b.epic || 'zzzz';
                            if (epicA !== epicB) return epicA.localeCompare(epicB);
                            
                            const orderA = topoOrder.get(a.id);
                            const orderB = topoOrder.get(b.id);
                            if (orderA !== orderB) return orderA - orderB;
                            
                            const idA = parseInt((a.id.match(/(\d+)$/) || [0, 0])[1], 10);
                            const idB = parseInt((b.id.match(/(\d+)$/) || [0, 0])[1], 10);
                            return idA - idB;
                        });

                        let lastEpicBacklog = null;
                        let lastEpicInProg = null;
                        let lastEpicDone = null;
                        // --- End D-034 Sort Logic ---

                        data.stories.forEach((story, idx) => {
                            const card = document.createElement('div');
                            card.className = 'kanban-card';
                            card.draggable = true;
                            card.dataset.storyId = story.id;
                            card.dataset.sprint = story.sprint || '';
                            card.dataset.realStatus = story.status;
                            card.dataset.epic = story.epic || 'N/A';
                            card.dataset.sortWeight = idx;
                            const prioClass = (story.priority.toLowerCase() === 'high' || story.priority.toLowerCase() === 'critical') ? 'priority-high' : 'priority-low';
                            
                            // 状态色：根据分列状态设置左边框颜色
                            const status = story.status;
                            const lowerStatus = status.toLowerCase();
                            let statusColor = 'var(--cyan)';  // 默认 TODO
                            if (['done', 'completed', 'closed', 'verified'].includes(lowerStatus)) {
                                statusColor = '#10b981';
                            } else if (['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(lowerStatus)) {
                                statusColor = 'var(--purple)';
                            } else if (['ready', 'approved', 'assigned'].includes(lowerStatus)) {
                                statusColor = '#3B82F6';
                            }
                            card.style.borderLeft = `4px solid ${statusColor}`;
                            
                            // Epic 标签：截取简短名称
                            const epicShort = (story.epic || '').length > 20 
                                ? (story.epic || '').substring(0, 18) + '…' 
                                : (story.epic || 'N/A');
                            
                            // 依赖检查 (Story D-032 / UX Fix)
                            const incompleteDeps = [];
                            const isSelfDone = ['done', 'completed', 'closed', 'verified'].includes(lowerStatus);
                            const isSelfInProgress = ['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(lowerStatus);
                            const isSelfReady = ['ready', 'approved', 'assigned'].includes(lowerStatus);
                            if (!isSelfDone && story.dependencies && story.dependencies.length > 0) {
                                story.dependencies.forEach(depId => {
                                    const depStory = data.stories.find(s => s.id === depId);
                                    if (depStory && !['done', 'completed', 'closed', 'verified'].includes(depStory.status.toLowerCase())) {
                                        incompleteDeps.push({ id: depId, status: depStory.status, title: depStory.title });
                                    }
                                });
                            }
                            const hasDepLock = incompleteDeps.length > 0;
                            // TODO 状态的卡片也视为锁定（需先执行 /story-readiness）
                            const isTodoLock = !isSelfDone && !isSelfInProgress && !isSelfReady && !hasDepLock;
                            const isLocked = hasDepLock || isTodoLock;
                            
                            if (isLocked) {
                                card.classList.add('kb-locked');
                                card.draggable = false;
                                card.dataset.locked = 'true';
                                if (hasDepLock) {
                                    card.dataset.incompleteDeps = JSON.stringify(incompleteDeps);
                                    card.dataset.lockReason = 'dependency';
                                } else {
                                    card.dataset.lockReason = 'todo';
                                }
                            }
                            card.dataset.allDeps = JSON.stringify(story.dependencies || []);

                            // 锁图标：依赖锁和 TODO 锁使用相同 🔒 视觉，仅 Tooltip 不同
                            let lockHtml = '';
                            if (isLocked) {
                                const lockTooltip = hasDepLock
                                    ? '存在未完成的前置依赖'
                                    : '需要先执行 /story-readiness 通过就绪检查';
                                lockHtml = `
                                    <div class="kb-lock-icon-container" title="${lockTooltip}">
                                        <svg class="kb-lock-icon" width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path></svg>
                                    </div>
                                `;
                            }
                            
                            // Story D-023: Apply Focus State
                            if (window._currentRecommendedStoryId && story.id === window._currentRecommendedStoryId) {
                                if (!window._dismissedFocusStories) window._dismissedFocusStories = new Set();
                                if (!window._dismissedFocusStories.has(story.id)) {
                                    card.classList.add('smart-focus');
                                }
                            }
                            
                            // Story D-025: Shockwave badge
                            let shockwaveBadge = '';
                            if (window._currentShockwaves && window._currentShockwaves.length > 0) {
                                const isAffected = window._currentShockwaves.some(sw => 
                                    (sw.affected_stories && sw.affected_stories.includes(story.id))
                                );
                                if (isAffected) {
                                    card.style.border = '1px solid var(--orange)';
                                    card.style.boxShadow = '0 0 10px rgba(245, 158, 11, 0.3)';
                                    shockwaveBadge = `
                                        <div class="sw-badge" title="上游 GDD 已变更，需重新验证" onclick="window.showShockwavePanel(event)" style="position: absolute; top: -8px; right: -8px; width: 24px; height: 24px; background: var(--orange); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 14px; box-shadow: 0 2px 5px rgba(0,0,0,0.3); z-index: 10;">
                                            ⚠️
                                        </div>
                                    `;
                                }
                            }
                            
                            // Story D-035: 通过 CSS 自定义属性驱动底部边缘进度条（::after 伪元素，零额外 DOM）
                            if (story.ac_total > 0) {
                                const pct = Math.round((story.ac_done / story.ac_total) * 100);
                                card.style.setProperty('--ac-pct', pct + '%');
                                card.classList.add('has-ac');
                                card.title = (card.title ? card.title + ' | ' : '') + `AC: ${story.ac_done}/${story.ac_total}`;
                                if (story.ac_done === story.ac_total) {
                                    card.classList.add('ac-complete');
                                }
                            }
                            
                            card.innerHTML = `
                                ${shockwaveBadge}
                                <div class="kb-header">
                                    <span class="kb-id-group">
                                        ${lockHtml}
                                        <span class="kb-id">${story.id}</span>
                                    </span>
                                    <span class="kb-epic-tag">${epicShort}</span>
                                </div>
                                <div class="kb-title">${story.title}</div>
                                <div class="kb-footer">
                                    <span class="bug-priority ${prioClass}">${story.priority}</span>
                                    <span class="kb-pts">${story.points} SP</span>
                                    <button class="kb-copy-btn" title="复制 Skill 指令">
                                        <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>
                                    </button>
                                </div>
                            `;
                            
                            // 📋 复制按钮：根据 Story 当前状态智能推荐最合适的 Skill 指令
                            const copyBtn = card.querySelector('.kb-copy-btn');
                            copyBtn.addEventListener('click', function(e) {
                                e.stopPropagation();
                                const cmd = _getRecommendedCommand(story.id, story.status);
                                navigator.clipboard.writeText(cmd).then(() => {
                                    window.showToast('📋 ' + cmd, 'success');
                                    if (window._dismissSmartFocus) window._dismissSmartFocus(story.id);
                                    // 按钮微动效：短暂变为 ✅
                                    copyBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="#10B981" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>';
                                    setTimeout(() => {
                                        copyBtn.innerHTML = '<svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path></svg>';
                                    }, 1500);
                                }).catch(() => {
                                    window.showToast('剪贴板写入失败', 'info');
                                });
                            });


                            // 点击卡片主体滑出详情侧边栏 (防误触)
                            let startX = 0, startY = 0;
                            card.addEventListener('mousedown', (e) => {
                                startX = e.clientX;
                                startY = e.clientY;
                            });
                            card.addEventListener('mouseup', (e) => {
                                const dx = e.clientX - startX;
                                const dy = e.clientY - startY;
                                const dist = Math.sqrt(dx*dx + dy*dy);
                                // 如果移动距离小于 5 像素且未点到复制按钮，视为点击 (非拖拽)
                                if (dist < 5 && !e.target.closest('.kb-copy-btn')) {
                                    if (typeof window.showStoryPanel === 'function') {
                                        window.showStoryPanel(story);
                                    }
                                }
                            });

                            // 拖拽开始：记录来源卡片 ID
                            card.addEventListener('dragstart', function(e) {
                                if (card.dataset.locked === 'true') {
                                    e.preventDefault();
                                    return;
                                }
                                e.dataTransfer.setData('text/plain', story.id);
                                e.dataTransfer.effectAllowed = 'move';
                                card.classList.add('kb-dragging');
                            });
                            card.addEventListener('dragend', function() {
                                card.classList.remove('kb-dragging');
                            });
                            
                            // 检查是否处于待确认伪状态（上一次拖拽产生的）
                            const pendingKey = 'kb_pending_' + story.id;
                            const pendingInfo = sessionStorage.getItem(pendingKey);
                            let effectiveCol = null; // 如果有 pending 则覆盖真实分列
                            
                            if (pendingInfo) {
                                const pending = JSON.parse(pendingInfo);
                                const realCol = _getColumnForStatus(story.status);
                                const age = Date.now() - pending.timestamp;
                                const PENDING_TTL = 5 * 60 * 1000; // 5 分钟超时
                                
                                if (realCol === pending.targetCol) {
                                    // 真实状态已匹配目标列 → 固化（清除伪状态）
                                    sessionStorage.removeItem(pendingKey);
                                } else if (age > PENDING_TTL) {
                                    // 超时 → 弹回原列，清除伪状态
                                    sessionStorage.removeItem(pendingKey);
                                } else {
                                    // 仍在等待确认 → 保持在目标列 + 保持 pending 样式
                                    effectiveCol = pending.targetCol;
                                    card.classList.add('kb-pending');
                                    // 根据目标列覆盖 borderLeft 颜色，防止刷新后回退到原始状态色
                                    let pendingColor = 'var(--cyan)';
                                    if (pending.targetCol === 'done') pendingColor = '#10b981';
                                    else if (pending.targetCol === 'inprogress') pendingColor = 'var(--purple)';
                                    card.style.borderLeft = `4px solid ${pendingColor}`;
                                }
                            }
                            
                            // 按 effectiveCol（若有 pending）或真实 status 分列
                            const targetCol = effectiveCol || _getColumnForStatus(status);
                            const epicFull = (story.epic && story.epic.trim() !== '') ? story.epic : '未分类';
                            let targetEl = null;
                            let needsSeparator = false;

                            if (targetCol === 'done') {
                                targetEl = colDone;
                                if (lastEpicDone !== null && lastEpicDone !== epicFull) needsSeparator = true;
                                lastEpicDone = epicFull;
                            } else if (targetCol === 'inprogress') {
                                targetEl = colInProg;
                                if (lastEpicInProg !== null && lastEpicInProg !== epicFull) needsSeparator = true;
                                lastEpicInProg = epicFull;
                            } else {
                                // BACKLOG 列：合并 todo + ready
                                targetEl = colBacklog;
                                if (lastEpicBacklog !== null && lastEpicBacklog !== epicFull) needsSeparator = true;
                                lastEpicBacklog = epicFull;
                            }

                            if (needsSeparator) {
                                const sep = document.createElement('div');
                                sep.className = 'epic-separator';
                                sep.dataset.epic = epicFull;
                                const sepLabel = epicFull.length > 20 ? epicFull.substring(0, 18) + '…' : epicFull;
                                sep.innerHTML = `<span class="epic-separator-label">${sepLabel}</span>`;
                                targetEl.appendChild(sep);
                            }
                            targetEl.appendChild(card);
                        });
                        
                        // 为三列容器绑定 dragover/dragleave/drop 事件
                        _setupDropZone(colBacklog, 'backlog');
                        _setupDropZone(colInProg, 'inprogress');
                        _setupDropZone(colDone, 'done');
                        
                    } else {
                        if(kanbanBoard) kanbanBoard.style.display = 'none';
                        if(sprintsEmpty) sprintsEmpty.style.display = 'flex';
                    }
                    
                    // Story D-040: 统一生产力洞察面板渲染
                    if (typeof window._renderProductionInsights === 'function') {
                        window._renderProductionInsights(data.sprint, data.sprint_history, data.stories);
                    }
                    
                    // Active Bugs Triage
                    window._allStories = data.stories || [];
                    window._allBugs = data.bugs || [];
                    window._cachedData = data;
                    const qualityContent = document.getElementById('quality-content');
                    const qualityEmpty = document.getElementById('quality-empty');
                    
                    if (window._allBugs.length === 0 || window._allBugs[0].id === 'CLEAN') {
                        document.getElementById('qh-total').textContent = 0;
                        if(qualityContent) qualityContent.style.display = 'none';
                        if(qualityEmpty) qualityEmpty.style.display = 'flex';
                    } else {
                        if(qualityContent) qualityContent.style.display = 'contents';
                        if(qualityEmpty) qualityEmpty.style.display = 'none';
                        window._renderBugsTriage();
                    }
                    window._renderStoryMatrix();

                    // Activity Timeline 渲染
                    const timelineCard = document.getElementById('activity-timeline-card');
                    const timelineList = document.getElementById('timeline-list');
                    if (data.activity_timeline && data.activity_timeline.length > 0) {
                        if(timelineCard) timelineCard.style.display = 'block';
                        if(timelineList) {
                            timelineList.innerHTML = '';
                            data.activity_timeline.forEach(evt => {
                                const item = document.createElement('div');
                                item.className = 'timeline-item';
                                // 点击时间线条目 → 根据类型跳转到对应视图
                                item.onclick = function() {
                                    if (evt.type === 'gdd') {
                                        window.switchView('design-view');
                                    } else if (evt.type === 'story') {
                                        window.switchView('sprints-view');
                                    } else if (evt.type === 'bug') {
                                        window.switchView('quality-view');
                                    } else {
                                        // 普通 commit → 复制 SHA 到剪贴板
                                        navigator.clipboard.writeText(evt.sha).then(() => {
                                            window.showToast('SHA ' + evt.sha + ' 已复制', 'success');
                                        });
                                    }
                                };
                                item.innerHTML = `
                                    <div class="timeline-dot ${evt.type}"></div>
                                    <div class="timeline-body">
                                        <div class="timeline-msg">${evt.msg}</div>
                                        <div class="timeline-meta">
                                            <span class="timeline-sha">${evt.sha}</span>
                                            <span>${evt.date} ${evt.time}</span>
                                            <span class="timeline-type-tag ${evt.type}">${evt.type}</span>
                                        </div>
                                    </div>
                                `;
                                timelineList.appendChild(item);
                            });
                        }
                    } else {
                        if(timelineCard) timelineCard.style.display = 'none';
                    }

                }).catch(e => {
                    console.log('Data fetching failed.', e);
                    updateConnectionState(false);
                });
        }
        
        // Initial fetch and start polling
        fetchData();
        setInterval(fetchData, 30000);

        // 列归属：根据 story.status 判断卡片应归属的列（三列模型）
        function _getColumnForStatus(status) {
            const lowerStatus = status.toLowerCase();
            if (['done', 'completed', 'closed', 'verified'].includes(lowerStatus)) return 'done';
            if (['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(lowerStatus)) return 'inprogress';
            return 'backlog'; // todo + ready 合并到 BACKLOG 列
        }

        // 拖拽辅助：根据目标列生成对应的 Skill 指令
        function _getSkillCommand(storyId, targetCol) {
            const path = 'CCGS-Data/production/epics/**/' + storyId + '.md';
            if (targetCol === 'inprogress') return '/dev-story ' + path;
            if (targetCol === 'done') return '/story-done ' + path;
            return '/story-readiness ' + path;
        }

        // 智能推荐：根据 Story 当前状态推荐最合适的下一步 Skill 指令
        function _getRecommendedCommand(storyId, status) {
            const path = 'CCGS-Data/production/epics/**/' + storyId + '.md';
            const ls = status.toLowerCase();
            if (['done', 'completed', 'closed', 'verified'].includes(ls)) return '/code-review ' + path;
            if (['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(ls)) return '/story-done ' + path;
            if (['ready', 'approved', 'assigned'].includes(ls)) return '/dev-story ' + path;
            return '/story-readiness ' + path; // todo → 先做就绪检查
        }

        // 拖拽辅助：为列容器绑定 drop zone 事件
        function _setupDropZone(colBody, colName) {
            if (!colBody) return;
            
            colBody.addEventListener('dragover', function(e) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                colBody.classList.add('kb-drop-active');
            });
            
            colBody.addEventListener('dragleave', function(e) {
                // 仅当离开列容器本身时才移除高亮
                if (!colBody.contains(e.relatedTarget)) {
                    colBody.classList.remove('kb-drop-active');
                }
            });
            
            colBody.addEventListener('drop', function(e) {
                e.preventDefault();
                colBody.classList.remove('kb-drop-active');
                const storyId = e.dataTransfer.getData('text/plain');
                if (!storyId) return;
                
                // 找到被拖拽的卡片
                const card = document.querySelector(`[data-story-id="${storyId}"]`);
                if (!card) return;
                
                // 判断卡片是否已在当前列（含 pending 状态的情况）
                const alreadyInColumn = card.parentElement === colBody;
                
                // 如果卡片的真实状态就属于此列且无 pending → 纯原地放回，忽略
                const realCol = _getColumnForStatus(card.dataset.realStatus);
                if (realCol === colName && !card.classList.contains('kb-pending')) return;
                
                if (alreadyInColumn) {
                    // 同列重放：仅复制指令，单条 Toast，不改变状态
                    const command = _getSkillCommand(storyId, colName);
                    if (window._dragToastTimer) clearTimeout(window._dragToastTimer);
                    window._dragToastTimer = null;
                    navigator.clipboard.writeText(command).then(() => {
                        window.showToast('📋 ' + command, 'success');
                    }).catch(() => {
                        window.showToast('剪贴板写入失败', 'info');
                    });
                } else {
                    // 跨列拖拽：移动卡片 + 设置 pending + 复制指令 + 二段式 Toast
                    colBody.appendChild(card);
                    card.classList.add('kb-pending');
                    
                    // --- Story D-034: Immediate Frontend Re-sort upon drop ---
                    // 收集本列所有卡片并按 sortWeight 排序
                    const cardsInCol = Array.from(colBody.querySelectorAll('.kanban-card'));
                    cardsInCol.sort((a, b) => {
                        return parseInt(a.dataset.sortWeight || '0', 10) - parseInt(b.dataset.sortWeight || '0', 10);
                    });
                    
                    // 移除旧的分隔线
                    colBody.querySelectorAll('.epic-separator').forEach(el => el.remove());
                    
                    // 重新按顺序挂载卡片并插入分隔线
                    let lastEpic = null;
                    cardsInCol.forEach(c => {
                        const epicFull = (c.dataset.epic && c.dataset.epic.trim() !== '') ? c.dataset.epic : '未分类';
                        if (lastEpic !== null && lastEpic !== epicFull) {
                            const sep = document.createElement('div');
                            sep.className = 'epic-separator';
                            sep.dataset.epic = epicFull;
                            const sepLabel = epicFull.length > 20 ? epicFull.substring(0, 18) + '…' : epicFull;
                            sep.innerHTML = `<span class="epic-separator-label">${sepLabel}</span>`;
                            // 若 Epic filter 处于激活状态，则隐藏分隔线
                            if (typeof _currentEpicFilter !== 'undefined' && _currentEpicFilter) {
                                sep.style.display = 'none';
                            }
                            colBody.appendChild(sep);
                        }
                        lastEpic = epicFull;
                        colBody.appendChild(c);
                    });
                    
                    // 触发过渡动画 (0.3s 过渡动画)
                    cardsInCol.forEach(c => {
                        // 利用 transform 模拟一个短暂的下沉放入效果
                        c.style.transform = 'scale(0.98)';
                        requestAnimationFrame(() => {
                            c.style.transition = 'transform 0.3s ease';
                            c.style.transform = '';
                            setTimeout(() => { c.style.transition = ''; }, 300);
                        });
                    });
                    // --- End D-034 Re-sort ---
                    
                    // UX Fix: 即时更新状态颜色，消除格式滞后感
                    let targetColor = 'var(--cyan)';
                    if (colName === 'done') targetColor = '#10b981';
                    else if (colName === 'inprogress') targetColor = 'var(--purple)';
                    card.style.borderLeft = `4px solid ${targetColor}`;
                    
                    // UX Fix: 拖拽进入后立即移除该列的“无 Story”提示
                    const emptyMsg = colBody.querySelector('.kanban-col-empty-msg');
                    if (emptyMsg) emptyMsg.remove();
                    
                    sessionStorage.setItem('kb_pending_' + storyId, JSON.stringify({
                        targetCol: colName,
                        timestamp: Date.now()
                    }));
                    
                    const command = _getSkillCommand(storyId, colName);
                    if (window._dragToastTimer) clearTimeout(window._dragToastTimer);
                    navigator.clipboard.writeText(command).then(() => {
                        window.showToast('指令已复制: ' + command, 'success');
                        window._dragToastTimer = setTimeout(() => {
                            window.showToast('请在 Agent 终端粘贴执行', 'info');
                            window._dragToastTimer = null;
                        }, 1500);
                    }).catch(() => {
                        window.showToast('剪贴板写入失败', 'info');
                    });
                }
            });
        }

        // Toast Feedback System（限制最多同时显示 3 条，超出时移除最旧的）
        window.showToast = function(message, type = "info") {
            const container = document.getElementById('toast-container');
            if (!container) return;
            
            // 限流：超过 3 条时移除最早的 Toast
            const MAX_TOASTS = 3;
            while (container.children.length >= MAX_TOASTS) {
                container.children[0].remove();
            }
            
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            const icon = type === 'success' 
                ? `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`
                : `<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`;
            toast.innerHTML = `${icon}<span>${message}</span>`;
            container.appendChild(toast);
            
            // Trigger animation
            requestAnimationFrame(() => {
                toast.classList.add('show');
            });
            
            // Remove after delay
            setTimeout(() => {
                toast.classList.remove('show');
                toast.classList.add('hiding');
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        };

        // Story D-023: Scroll to Recommended Story
        window.scrollToRecommendedStory = function() {
            if (!window._currentRecommendedStoryId) return;
            
            // Re-enable focus if it was previously dismissed
            if (window._dismissedFocusStories && window._dismissedFocusStories.has(window._currentRecommendedStoryId)) {
                window._dismissedFocusStories.delete(window._currentRecommendedStoryId);
                const targetCard = document.querySelector(`.kanban-card[data-story-id="${window._currentRecommendedStoryId}"]`);
                if (targetCard) targetCard.classList.add('smart-focus');
            }

            window.switchView('sprints-view');
            setTimeout(() => {
                const targetCard = document.querySelector(`.kanban-card[data-story-id="${window._currentRecommendedStoryId}"]`);
                if (targetCard) {
                    targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 100);
        };

        // Story D-023/D-025: Action-Bound Dismissal Focus on Interaction
        document.addEventListener('click', (e) => {
            const card = e.target.closest('.kanban-card.smart-focus');
            if (card) {
                // Story D-025: Only dismiss if action button was clicked
                const isActionBtn = e.target.closest('button');
                if (isActionBtn) {
                    const storyId = card.dataset.storyId;
                    if (storyId) {
                        if (!window._dismissedFocusStories) window._dismissedFocusStories = new Set();
                        window._dismissedFocusStories.add(storyId);
                        card.style.transition = 'all 0.3s ease';
                        card.classList.remove('smart-focus');
                    }
                }
            }
        });

        // Smart Action Copy Interaction
        window.copySmartAction = function() {
            if (!window._currentSmartCommand) return;
            navigator.clipboard.writeText(window._currentSmartCommand).then(() => {
                // Micro-animation U2: 📋 -> ✅
                const icon = document.getElementById('smart-copy-icon');
                const btn = document.getElementById('smart-copy-btn');
                
                // Switch to checkmark
                icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>';
                icon.style.stroke = "#10B981";
                btn.style.borderColor = "#10B981";
                
                // Toast Feedback U1: 2 stages
                window.showToast("指令已复制", "success");
                setTimeout(() => {
                    window.showToast("请在终端粘贴执行", "info");
                }, 1500);
                
                // Revert after 2 seconds
                setTimeout(() => {
                    icon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"></path>';
                    icon.style.stroke = "currentColor";
                    btn.style.borderColor = "var(--glass-border)";
                }, 2000);
            }).catch(err => {
                window.showToast("复制失败", "info");
            });
        };

        // Story Side Panel Logic (Delegated to Unified Panel)
        window.showStoryPanel = function(story) {
            window.openUnifiedPanel('story', story, `Story: ${story.title}`);
        };

        // Story D-040: Unified Production Insights
        let _currentEpicFilter = null;
        
        window.toggleVelocityAccordion = function() {
            const acc = document.getElementById('pi-velocity-accordion');
            if (acc) {
                acc.classList.toggle('open');
            }
        };

        window._renderProductionInsights = function(sprintData, historyData, stories) {
            const container = document.getElementById('production-insights');
            if (!container) return;

            // Ensure live sprint data is represented if retrospective missing
            if (historyData && historyData.length > 0) {
                historyData.forEach(d => {
                    if (String(d.name).trim().toLowerCase() === String(sprintData.name).trim().toLowerCase()) {
                        if (!d.total_points) {
                            d.total_points = sprintData.total_points || 0;
                            d.completed_points = sprintData.completed_points || 0;
                        }
                    }
                });
            }

            // 1. Sprint Velocity Calculations
            const maxPts = historyData && historyData.length > 0 
                ? Math.max(...historyData.map(d => Math.max(d.total_points, d.completed_points, 1))) * 1.2
                : 1;
            
            let avgVelocity = 0;
            let trendText = "首个冲刺";
            let trendClass = "";
            let trendIcon = "—";
            let trendValue = "";
            
            if (historyData && historyData.length > 0) {
                const totalHist = historyData.reduce((acc, d) => acc + d.completed_points, 0);
                avgVelocity = Math.round(totalHist / historyData.length);
                const lastHist = historyData[historyData.length - 1].completed_points;
                const diff = sprintData.completed_points - lastHist;
                if (diff > 0) {
                    trendClass = "pi-trend-up";
                    trendIcon = "▲";
                    trendValue = `+${Math.round((diff/lastHist)*100)}%`;
                } else if (diff < 0) {
                    trendClass = "pi-trend-down";
                    trendIcon = "▼";
                    trendValue = `${Math.round((diff/lastHist)*100)}%`;
                } else {
                    trendIcon = "—";
                    trendValue = "持平";
                }
                trendText = `${trendValue}`;
            }

            const sprintPct = sprintData.total_points > 0 ? Math.round((sprintData.completed_points / sprintData.total_points) * 100) : 0;
            
            // Generate SVG Chart
            // Generate SVG Area Chart
            const pad = 20;
            const padBottom = 25; // Space for x-axis
            const padLeft = 45; // Space for y-axis
            const w = 1000;
            const h = 320;
            const pointsCount = historyData ? historyData.length : 0;
            const gap = pointsCount > 1 ? (w - padLeft - pad) / (pointsCount - 1) : 0;
            
            let svgStr = "";
            if (historyData && historyData.length >= 2) {
                svgStr = `<svg viewBox="0 0 ${w} ${h}" width="100%" height="100%" style="overflow:visible; font-family: inherit;">`;
                
                svgStr += `
                <defs>
                    <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="var(--cyan)" stop-opacity="0.6" />
                        <stop offset="100%" stop-color="var(--cyan)" stop-opacity="0.0" />
                    </linearGradient>
                </defs>`;

                [0, 0.5, 1].forEach(tick => {
                    const y = h - padBottom - tick * (h - padBottom - pad);
                    svgStr += `<line x1="${padLeft}" y1="${y}" x2="${w-pad}" y2="${y}" stroke="currentColor" stroke-dasharray="4" opacity="0.15"/>`;
                    svgStr += `<text x="${padLeft-10}" y="${y+4}" fill="var(--text-main)" font-size="10" text-anchor="end" opacity="0.7">${Math.round(maxPts * tick)} SP</text>`;
                });

                let polyPoints = [];
                let linePoints = [];
                polyPoints.push(`${padLeft},${h - padBottom}`);
                
                historyData.forEach((d, i) => {
                    const x = padLeft + gap * i;
                    const compH = maxPts > 0 ? (d.completed_points / maxPts) * (h - padBottom - pad) : 0;
                    const y = h - padBottom - compH;
                    
                    const pointStr = `${x},${y}`;
                    polyPoints.push(pointStr);
                    linePoints.push(pointStr);
                    
                    svgStr += `<circle class="svg-point-vis" id="point-vis-${i}" cx="${x}" cy="${y}" r="4" fill="var(--bg-glass)" stroke="var(--cyan)" stroke-width="2" style="pointer-events:none; transition: all 0.2s ease;" />`;
                    svgStr += `<circle class="svg-point-hit" data-index="${i}" data-name="${d.name}" data-total="${d.total_points}" data-comp="${d.completed_points}" data-cx="${x}" cx="${x}" cy="${y}" r="25" fill="transparent" style="cursor:pointer;" />`;
                    svgStr += `<text x="${x}" y="${h - padBottom + 15}" fill="var(--text-main)" font-size="10" text-anchor="middle" opacity="0.8">${d.name}</text>`;
                });
                
                const lastX = padLeft + gap * (pointsCount - 1);
                polyPoints.push(`${lastX},${h - padBottom}`);
                
                svgStr += `<polygon points="${polyPoints.join(' ')}" fill="url(#areaGradient)" style="pointer-events:none;" />`;
                svgStr += `<polyline points="${linePoints.join(' ')}" fill="none" stroke="var(--cyan)" stroke-width="2" style="pointer-events:none;" />`;
                
                svgStr += `</svg>`;
            } else {
                svgStr = `<div style="text-align:center; padding: 40px; color: var(--text-muted); font-size: 0.9rem;">需要至少 2 个历史冲刺数据才能生成速率趋势图。</div>`;
            }

            // 2. Epic Data Processing
            const epics = {};
            const currentSprintName = window._selectedSprint || sprintData.name;
            const targetNameMatcher = String(currentSprintName).replace(/[^0-9a-z]/ig, '').toLowerCase();
            
            if (stories && stories.length > 0) {
                stories.forEach(s => {
                    const eName = s.epic || 'N/A';
                    if (!epics[eName]) epics[eName] = { total: 0, done_curr: 0, done_hist: 0, wip: 0, tagColor: _getEpicColor(eName), inCurrentSprint: false };
                    epics[eName].total += s.points;
                    
                    const storySprintMatch = String(s.sprint || '').replace(/[^0-9a-z]/ig, '').toLowerCase();
                    if (storySprintMatch === targetNameMatcher) {
                        epics[eName].inCurrentSprint = true;
                    }
                    
                    const st = s.status ? s.status.toLowerCase() : 'todo';
                    const isDone = ['done', 'completed', 'closed', 'verified'].includes(st);
                    
                    if (isDone) {
                        if (storySprintMatch === targetNameMatcher) {
                            epics[eName].done_curr += s.points;
                        } else {
                            epics[eName].done_hist += s.points;
                        }
                    } else if (['in progress', 'doing', 'wip', 'review', 'in_progress'].includes(st)) {
                        epics[eName].wip += s.points;
                    }
                });
            }
            
            let epicsHtml = '';
            const epicKeys = Object.keys(epics).sort();
            epicKeys.forEach(eName => {
                if (!epics[eName].inCurrentSprint) return;
                const stats = epics[eName];
                const pctHist = stats.total > 0 ? (stats.done_hist / stats.total) * 100 : 0;
                const pctCurr = stats.total > 0 ? (stats.done_curr / stats.total) * 100 : 0;
                const isActive = _currentEpicFilter === eName ? 'active' : '';
                const color = stats.tagColor;
                
                epicsHtml += `
                    <div class="pi-epic-row ${isActive}" data-epic="${eName}" title="${eName} / 历史: ${stats.done_hist} SP / 本Sprint: ${stats.done_curr} SP / 总计: ${stats.total} SP">
                        <div class="pi-epic-name" style="${isActive ? 'color: var(--cyan); font-weight: bold;' : ''}">${eName}</div>
                        <div class="pi-epic-track">
                            <div class="pi-epic-seg-hist" style="width: ${pctHist}%;"></div>
                            <div class="pi-epic-seg-curr" style="width: ${pctCurr}%; background-color: ${color}; box-shadow: 0 0 8px ${color}80;"></div>
                        </div>
                        <div class="pi-epic-stats">
                            历史: ${stats.done_hist} 本Sprint: ${stats.done_curr}
                        </div>
                    </div>
                `;
            });

            // 3. Render HTML
            const displaySprintName = window._selectedSprint || currentSprintName || sprintData.name;
            
            container.innerHTML = `
                <div class="pi-sprint-bar">
                    <div class="pi-sprint-name">
                        ${displaySprintName}
                    </div>
                    <div class="pi-sprint-track">
                        <div class="pi-sprint-fill" style="width: ${sprintPct}%;"></div>
                    </div>
                    <div class="pi-sprint-text">
                        ${sprintPct}% <span class="pi-sprint-subtext">${sprintData.completed_points}/${sprintData.total_points} SP</span>
                    </div>
                </div>
                <div class="pi-velocity-row" onclick="window.toggleVelocityAccordion()">
                    <span class="pi-trend-icon">${trendIcon}</span> 历史均速: ${avgVelocity > 0 ? avgVelocity + ' SP/Sprint' : '—'} <span style="margin: 0 8px;">|</span> 当期趋势: <span class="${trendClass}">${trendText}</span>
                </div>
                <div id="pi-velocity-accordion">
                    <div style="position: relative; width: 100%; height: 100%;">
                        ${svgStr}
                        <div id="pi-chart-tooltip" style="position: absolute; display: none; background: rgba(15,23,42,0.95); border: 1px solid var(--cyan); padding: 8px 12px; border-radius: 6px; pointer-events: none; color: white; font-size: 0.8rem; z-index: 10; white-space: nowrap; backdrop-filter: blur(4px); box-shadow: 0 0 15px rgba(6, 182, 212, 0.4); transform: translate(-50%, -100%);"></div>
                    </div>
                </div>
                
                <div class="pi-epic-list">
                    <div class="pi-epic-header" onclick="document.getElementById('pi-epic-rows').classList.toggle('collapsed'); this.querySelector('.pi-epic-toggle').classList.toggle('collapsed')">
                        <div class="pi-epic-title">
                            <svg width="14" height="14" fill="none" stroke="var(--cyan)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                            Epic 进度与贡献度拆解
                        </div>
                        <div class="pi-epic-toggle">
                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                        </div>
                    </div>
                    <div id="pi-epic-rows">
                        ${epicsHtml}
                    </div>
                </div>
            `;
            
            // 3.5 Bind SVG Interactions
            const tooltip = document.getElementById('pi-chart-tooltip');
            const hitPoints = container.querySelectorAll('.svg-point-hit');
            const svgSvg = container.querySelector('svg');
            
            if (hitPoints.length > 0 && tooltip && svgSvg) {
                hitPoints.forEach(hit => {
                    hit.addEventListener('mouseenter', () => {
                        const name = hit.getAttribute('data-name');
                        const total = hit.getAttribute('data-total');
                        const comp = hit.getAttribute('data-comp');
                        const cx = parseFloat(hit.getAttribute('data-cx'));
                        const index = hit.getAttribute('data-index');
                        
                        // Update and show tooltip
                        tooltip.innerHTML = `<strong style="color:var(--cyan)">${name}</strong><br/>计划: ${total} SP<br/>交付: ${comp} SP`;
                        tooltip.style.display = 'block';
                        
                        const svgRect = svgSvg.getBoundingClientRect();
                        
                        const cy = parseFloat(hit.getAttribute('cy'));
                        
                        // Convert SVG coords to percentage then to pixel relative to accordion container
                        const pctX = cx / 1000; // viewBox width is 1000
                        const pctY = cy / 320;  // viewBox height is 320
                        const pixelX = pctX * svgRect.width;
                        const pixelY = pctY * svgRect.height;
                        
                        // Tooltip pos with centering (shifted slightly above the point)
                        tooltip.style.left = pixelX + 'px';
                        tooltip.style.top = (pixelY - 12) + 'px';
                        
                        // Prevent edge overflow by dynamically adjusting the anchor point
                        if (pctX > 0.8) {
                            tooltip.style.transform = 'translate(-100%, -100%)';
                        } else if (pctX < 0.2) {
                            tooltip.style.transform = 'translate(0%, -100%)';
                        } else {
                            tooltip.style.transform = 'translate(-50%, -100%)';
                        }
                        
                        // Highlight visual circle
                        const vis = document.getElementById('point-vis-' + index);
                        if (vis) {
                            vis.setAttribute('r', '7');
                            vis.setAttribute('stroke-width', '3');
                            vis.style.filter = 'drop-shadow(0 0 8px var(--cyan))';
                        }
                    });
                    
                    hit.addEventListener('mouseleave', () => {
                        tooltip.style.display = 'none';
                        
                        // Reset visual circle
                        const index = hit.getAttribute('data-index');
                        const vis = document.getElementById('point-vis-' + index);
                        if (vis) {
                            vis.setAttribute('r', '4');
                            vis.setAttribute('stroke-width', '2');
                            vis.style.filter = 'none';
                        }
                    });
                });
            }
            
            // 4. Sprint Selector logic removed in favor of global dashboard settings.
            
            // 5. Bind Epic click events
            const rows = container.querySelectorAll('.pi-epic-row');
            rows.forEach(row => {
                row.addEventListener('click', () => {
                    const eName = row.getAttribute('data-epic');
                    if (_currentEpicFilter === eName) {
                        _currentEpicFilter = null;
                    } else {
                        _currentEpicFilter = eName;
                    }
                    _applyEpicFilter();
                    window._renderProductionInsights(sprintData, historyData, stories);
                });
            });
            
            _applyEpicFilter();
        };

        function _getEpicColor(eName) {
            const eLower = eName.toLowerCase();
            if (eLower.includes('wp-1') || eLower.includes('wp1')) return 'var(--epic-color-wp1)';
            if (eLower.includes('wp-2') || eLower.includes('wp2')) return 'var(--epic-color-wp2)';
            if (eLower.includes('wp-3') || eLower.includes('wp3')) return 'var(--epic-color-wp3)';
            if (eLower.includes('wp-4') || eLower.includes('wp4')) return 'var(--epic-color-wp4)';
            if (eLower.includes('wp-5') || eLower.includes('wp5')) return 'var(--epic-color-wp5)';
            if (eLower.includes('numerical') || eLower.includes('balance')) return 'var(--epic-color-numerical)';
            return 'var(--epic-color-foundation)';
        }

        function _applyEpicFilter() {
            const cards = document.querySelectorAll('.kanban-card');
            
            // Create or update filter banner
            let banner = document.getElementById('epic-filter-banner');
            if (!banner) {
                banner = document.createElement('div');
                banner.id = 'epic-filter-banner';
                banner.className = 'epic-filter-banner';
                banner.innerHTML = `<span data-i18n="filtering_by">过滤:</span> <strong id="epic-filter-name" style="color: var(--cyan); margin: 0 8px;"></strong>
                            <button id="epic-filter-clear" class="clear-filter-btn" style="background:none; border:none; color:var(--text-muted); cursor:pointer;"><span data-i18n="clear">清除</span> ✖</button>`;
                const kb = document.getElementById('kanban-board');
                if (kb) kb.parentNode.insertBefore(banner, kb);
                
                document.getElementById('epic-filter-clear').addEventListener('click', () => {
                    _currentEpicFilter = null;
                    _applyEpicFilter();
                    const pi = document.getElementById('production-insights');
                    if(pi) {
                        const rows = pi.querySelectorAll('.pi-epic-row');
                        rows.forEach(r => r.classList.remove('active'));
                        rows.forEach(r => r.querySelector('.pi-epic-name').style.color = '');
                    }
                });
            }
            
            const filterName = document.getElementById('epic-filter-name');

            if (_currentEpicFilter) {
                if (banner) {
                    banner.style.display = 'flex';
                    banner.style.alignItems = 'center';
                    banner.style.padding = '8px 16px';
                    banner.style.marginBottom = '16px';
                    banner.style.background = 'var(--glass-bg)';
                    banner.style.borderRadius = '8px';
                    banner.style.border = '1px solid var(--glass-border)';
                }
                if (filterName) filterName.textContent = _currentEpicFilter;
            } else {
                if (banner) banner.style.display = 'none';
            }

            // Show/Hide cards and separators
            if(cards.length > 0) {
                const targetSprintMatch = String(window._selectedSprint || '').replace(/[^0-9a-z]/ig, '').toLowerCase();
                cards.forEach(card => {
                    const eName = card.dataset.epic || '';
                    const sprintMatch = String(card.dataset.sprint || '').replace(/[^0-9a-z]/ig, '').toLowerCase();
                    
                    const passesEpicFilter = !_currentEpicFilter || eName === _currentEpicFilter;
                    const passesSprintFilter = !window._selectedSprint || sprintMatch === targetSprintMatch;
                    
                    if (passesEpicFilter && passesSprintFilter) {
                        card.style.display = 'block';
                        setTimeout(() => card.style.opacity = '1', 10);
                    } else {
                        card.style.opacity = '0';
                        card.style.display = 'none';
                    }
                });
            }
            
            const separators = document.querySelectorAll('.epic-separator');
            if (separators.length > 0) {
                separators.forEach(sep => {
                    if (_currentEpicFilter) {
                        sep.style.display = 'none';
                        return;
                    }
                    let nextEl = sep.nextElementSibling;
                    let hasVisibleCards = false;
                    while (nextEl && !nextEl.classList.contains('epic-separator')) {
                        if (nextEl.classList.contains('kanban-card') && nextEl.style.display !== 'none') {
                            hasVisibleCards = true;
                            break;
                        }
                        nextEl = nextEl.nextElementSibling;
                    }
                    sep.style.display = hasVisibleCards ? 'block' : 'none';
                });
            }

            // Update columns empty state
            ['backlog', 'inprogress', 'done'].forEach(colId => {
                const colBody = document.getElementById('col-' + colId);
                if (colBody) {
                    const existingMsg = colBody.querySelector('.kanban-col-empty-msg');
                    if (existingMsg) existingMsg.remove();

                    const visibleCards = Array.from(colBody.querySelectorAll('.kanban-card')).filter(c => c.style.display !== 'none' && c.style.opacity !== '0');
                    if (visibleCards.length === 0 && (_currentEpicFilter || window._selectedSprint)) {
                        const msg = document.createElement('div');
                        msg.className = 'kanban-col-empty-msg';
                        msg.textContent = '此过滤条件下暂无 Story';
                        msg.style.padding = '20px';
                        msg.style.textAlign = 'center';
                        msg.style.color = 'var(--text-muted)';
                        colBody.appendChild(msg);
                    }
                }
            });
        }


        // （已移除 D-032 连线交互 — 依赖信息统一在侧边栏展示）

// =========================================================
// Unified Side Panel Logic (D-017)
// =========================================================

window._panelHistory = [];
window._panelJustOpened = false;
let _mouseDownClientX = 0;
let _mouseDownClientY = 0;

document.addEventListener('mousedown', (e) => {
    _mouseDownClientX = e.clientX;
    _mouseDownClientY = e.clientY;
});

document.addEventListener('click', (e) => {
    if (window._panelJustOpened) return;
    const panel = document.getElementById('unified-side-panel');
    if (!panel || !panel.classList.contains('show')) return;
    if (panel.contains(e.target)) return;
    
    const dx = Math.abs(e.clientX - _mouseDownClientX);
    const dy = Math.abs(e.clientY - _mouseDownClientY);
    if (dx > 5 || dy > 5) return; // Was a drag
    
    window.closeUnifiedPanel();
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        window.closeUnifiedPanel();
    }
});

window.closeUnifiedPanel = function() {
    window._panelHistory = [];
    const overlay = document.getElementById('unified-panel-overlay');
    const panel = document.getElementById('unified-side-panel');
    
    if (overlay) {
        overlay.classList.remove('show');
        setTimeout(() => overlay.style.display = 'none', 300);
    }
    if (panel) panel.classList.remove('show');
    document.body.classList.remove('panel-open');
};

document.addEventListener('DOMContentLoaded', () => {
    const closeBtn = document.getElementById('unified-sp-close-btn');
    if (closeBtn) closeBtn.addEventListener('click', window.closeUnifiedPanel);
});

window.openUnifiedPanel = function(type, payload, title, pushHistory = true) {
    window._panelJustOpened = true;
    setTimeout(() => { window._panelJustOpened = false; }, 0);

    if (pushHistory) {
        window._panelHistory.push({ type, payload, title });
    }
    
    // Render breadcrumbs
    const bcEl = document.getElementById('sp-breadcrumbs');
    if (bcEl) {
        bcEl.innerHTML = window._panelHistory.map((h, i) => {
            const isLast = i === window._panelHistory.length - 1;
            if (isLast) return `<span style="color: var(--cyan);">${h.title}</span>`;
            return `<span style="cursor: pointer; color: var(--text-muted); transition: color 0.2s;" onmouseover="this.style.color='var(--text-main)'" onmouseout="this.style.color='var(--text-muted)'" onclick="window.goBackPanel(${i})">${h.title}</span><span style="margin: 0 4px; color: var(--text-muted);">›</span>`;
        }).join('');
    }
    
    document.getElementById('unified-sp-title').textContent = title;
    
    // Hide all templates
    const templates = ['gdd', 'adr', 'story', 'bug', 'shockwave'];
    templates.forEach(t => {
        const el = document.getElementById(`sp-content-${t}`);
        if (el) el.style.display = 'none';
    });
    
    if (type === 'gdd') {
        document.getElementById('sp-content-gdd').style.display = 'block';
        _renderGddContent(payload);
    } else if (type === 'adr') {
        document.getElementById('sp-content-adr').style.display = 'block';
        _renderAdrContent(payload);
    } else if (type === 'story') {
        document.getElementById('sp-content-story').style.display = 'block';
        _renderStoryContent(payload);
    } else if (type === 'bug') {
        document.getElementById('sp-content-bug').style.display = 'block';
        _renderBugContent(payload);
    } else if (type === 'shockwave') {
        document.getElementById('sp-content-shockwave').style.display = 'block';
        _renderShockwaveContent(payload);
    }
    
    const overlay = document.getElementById('unified-panel-overlay');
    const panel = document.getElementById('unified-side-panel');
    
    if (overlay) {
        overlay.style.display = 'block';
        // Trigger reflow for transition
        void overlay.offsetWidth;
        overlay.classList.add('show');
    }
    if (panel) panel.classList.add('show');
    document.body.classList.add('panel-open');
};

window.goBackPanel = function(index) {
    if (index < 0 || index >= window._panelHistory.length - 1) return;
    const target = window._panelHistory[index];
    window._panelHistory = window._panelHistory.slice(0, index + 1); // Truncate history
    window.openUnifiedPanel(target.type, target.payload, target.title, false);
};

window.getIDEPreference = function() {
    return localStorage.getItem('ccgs_ide_preference') || 'antigravity';
};

window.openInIDE = function(absolutePath) {
    if (!absolutePath) return;
    const ide = window.getIDEPreference();
    const url = `${ide}://file${absolutePath}`;
    
    const a = document.createElement('a');
    a.href = url;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
};

// Content renderers
function _renderGddContent(gdd) {
    document.getElementById('gdd-sp-filename').textContent = gdd.filename;
    
    const ideBtn = document.getElementById('gdd-sp-btn-ide');
    if (gdd.path) {
        ideBtn.style.opacity = '';
        ideBtn.style.pointerEvents = 'auto';
        ideBtn.onclick = (e) => { e.stopPropagation(); window.openInIDE(gdd.path); };
    } else {
        ideBtn.style.opacity = '0.2';
        ideBtn.style.pointerEvents = 'none';
        ideBtn.onclick = null;
    }

    document.getElementById('gdd-sp-progress').textContent = gdd.percent + '%';
    document.getElementById('gdd-sp-chapters-count').textContent = gdd.completed_chapters + ' / ' + gdd.total_chapters;
    
    const chapterList = document.getElementById('gdd-sp-chapter-list');
    if (gdd.chapters && gdd.chapters.length > 0) {
        chapterList.innerHTML = gdd.chapters.map(c => `
            <div style="display: flex; align-items: center; gap: 8px;">
                <svg width="14" height="14" fill="none" stroke="var(--cyan)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                <span>${c}</span>
            </div>`).join('');
    } else {
        chapterList.innerHTML = '<span style="color: var(--text-muted);">No chapters extracted.</span>';
    }
    
    const adrListEl = document.getElementById('gdd-sp-adr-list');
    if (adrListEl) {
        if (gdd.associated_adrs && gdd.associated_adrs.length > 0) {
            adrListEl.innerHTML = gdd.associated_adrs.map(adr => {
                const adrIndex = (window.currentAdrFiles || []).findIndex(a => a.filename === adr.filename);
                const statusColor = adr.status === 'Accepted' ? '#10b981' : adr.status === 'Deprecated' ? '#ef4444' : '#fbbf24';
                const clickAttr = adrIndex >= 0 ? `onclick="window.openAdrPanel(${adrIndex})" style="cursor: pointer;"` : '';
                return `<div ${clickAttr} class="sp-link-item" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; transition: background 0.15s;">
                    <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background: ${statusColor}; flex-shrink: 0;"></span>
                    <span style="color: var(--cyan); font-size: 0.9rem;">${adr.title}</span>
                </div>`;
            }).join('');
        } else {
            adrListEl.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">此 GDD 暂无关联 ADR</span>';
        }
    }
}

function _renderAdrContent(adr) {
    document.getElementById('adr-sp-filename').textContent = adr.filename;

    const ideBtn = document.getElementById('adr-sp-btn-ide');
    if (adr.path) {
        ideBtn.style.opacity = '';
        ideBtn.style.pointerEvents = 'auto';
        ideBtn.onclick = (e) => { e.stopPropagation(); window.openInIDE(adr.path); };
    } else {
        ideBtn.style.opacity = '0.2';
        ideBtn.style.pointerEvents = 'none';
        ideBtn.onclick = null;
    }

    const statusEl = document.getElementById('adr-sp-status');
    statusEl.textContent = adr.status;
    if (adr.status === 'Accepted') statusEl.style.color = '#10b981';
    else if (adr.status === 'Proposed') statusEl.style.color = '#fbbf24';
    else if (adr.status === 'Deprecated') statusEl.style.color = '#ef4444';
    else statusEl.style.color = 'var(--text-main)';
    
    const gddList = document.getElementById('adr-sp-gdd-list');
    if (adr.associated_gdds && adr.associated_gdds.length > 0) {
        gddList.innerHTML = adr.associated_gdds.map(g => {
            const gddIndex = (window.currentGddFiles || []).findIndex(f => f.filename === g);
            const clickAttr = gddIndex >= 0 ? `onclick="window.openGddModal(${gddIndex})" style="cursor: pointer;"` : '';
            return `<div ${clickAttr} class="sp-link-item" style="display: flex; align-items: center; gap: 8px; padding: 6px 8px; border-radius: 6px; transition: background 0.15s;">
                <svg width="14" height="14" fill="none" stroke="var(--cyan)" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                <span style="color: var(--cyan); font-size: 0.9rem;">${g}</span>
            </div>`;
        }).join('');
    } else {
        gddList.innerHTML = '<span style="color: var(--text-muted);">None</span>';
    }
}

function _renderStoryContent(story) {
    document.getElementById('sp-id').innerText = story.id;
    document.getElementById('sp-epic').innerText = story.epic;
    
    // 着重显示状态
    const statusEl = document.getElementById('sp-status');
    const ls = story.status.toLowerCase();
    statusEl.innerText = story.status.toUpperCase();
    statusEl.style.padding = '2px 6px';
    statusEl.style.borderRadius = '4px';
    statusEl.style.display = 'inline-block';
    statusEl.style.fontWeight = 'bold';
    
    // 根据状态给不同颜色背景着重显示
    if (['done', 'completed', 'closed', 'verified'].includes(ls)) {
        statusEl.style.background = 'rgba(16, 185, 129, 0.1)';
        statusEl.style.color = '#10B981';
        statusEl.style.border = '1px solid rgba(16, 185, 129, 0.3)';
    } else if (['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(ls)) {
        statusEl.style.background = 'rgba(245, 158, 11, 0.1)';
        statusEl.style.color = '#F59E0B';
        statusEl.style.border = '1px solid rgba(245, 158, 11, 0.3)';
    } else if (['ready', 'approved', 'assigned'].includes(ls)) {
        statusEl.style.background = 'rgba(59, 130, 246, 0.1)';
        statusEl.style.color = '#3B82F6';
        statusEl.style.border = '1px solid rgba(59, 130, 246, 0.3)';
    } else { // todo
        statusEl.style.background = 'rgba(156, 163, 175, 0.1)';
        statusEl.style.color = 'var(--text-main)';
        statusEl.style.border = '1px solid rgba(156, 163, 175, 0.3)';
    }

    // 处理锁定原因
    const lockedReasonEl = document.getElementById('sp-locked-reason');
    if (ls === 'todo') {
        const myDeps = story.dependencies || [];
        const hasUnfinishedDeps = myDeps.some(depId => {
            const dep = (window._cachedData && window._cachedData.stories || []).find(s => s.id === depId);
            return dep && dep.status.toLowerCase() !== 'done';
        });
        
        if (hasUnfinishedDeps) {
            lockedReasonEl.style.display = 'block';
            lockedReasonEl.innerHTML = '🔒 <strong>禁止拖拽</strong>：等待前置依赖完成';
        } else {
            lockedReasonEl.style.display = 'block';
            lockedReasonEl.innerHTML = '🔒 <strong>禁止拖拽</strong>：需先执行 /story-readiness 就绪检查';
        }
    } else {
        lockedReasonEl.style.display = 'none';
    }
    
    const btnReady = document.getElementById('sp-btn-ready');
    const btnDev = document.getElementById('sp-btn-dev');
    const btnReview = document.getElementById('sp-btn-review');
    const btnBranch = document.getElementById('sp-btn-branch');
    const btnPath = document.getElementById('sp-btn-path');
    
    const setupCopyBtn = (btn, text, toastPrefix) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                window.showToast(toastPrefix + text, 'success');
                window.closeUnifiedPanel();
            }).catch(() => {
                window.showToast('剪贴板写入失败', 'info');
            });
        });
        return newBtn;
    };
    
    const path = `CCGS-Data/production/epics/**/${story.id}.md`;
    const newBtnReady = setupCopyBtn(btnReady, `/story-readiness ${path}`, '🔍 ');
    const newBtnDev = setupCopyBtn(btnDev, `/dev-story ${path}`, '▶️ ');
    const newBtnReview = setupCopyBtn(btnReview, `/story-done ${path}`, '✅ ');
    setupCopyBtn(btnBranch, `feature/${story.id}`, '🌿 ');
    setupCopyBtn(btnPath, path, '🔗 ');
    
    const ideBtn = document.getElementById('sp-btn-ide');
    if (story.path) {
        ideBtn.style.opacity = '';
        ideBtn.style.pointerEvents = 'auto';
        ideBtn.onclick = (e) => { e.stopPropagation(); window.openInIDE(story.path); };
    } else {
        ideBtn.style.opacity = '0.2';
        ideBtn.style.pointerEvents = 'none';
        ideBtn.onclick = null;
    }
    
    // 智能推荐
    newBtnReady.classList.remove('recommended');
    newBtnDev.classList.remove('recommended');
    newBtnReview.classList.remove('recommended');
    
    if (['done', 'completed', 'closed', 'verified'].includes(ls)) {
        newBtnReview.classList.add('recommended');
    } else if (['in progress', 'in_progress', 'doing', 'wip', 'review'].includes(ls)) {
        newBtnReview.classList.add('recommended');
    } else if (['ready', 'approved', 'assigned'].includes(ls)) {
        newBtnDev.classList.add('recommended');
    } else {
        newBtnReady.classList.add('recommended');
    }
}

/// 依赖钻入函数：在侧边栏中打开依赖 Story 的详情（支持面包屑导航）
window._drillIntoStory = function(storyId) {
    if (!window._cachedData || !window._cachedData.stories) return;
    const story = window._cachedData.stories.find(s => s.id === storyId);
    if (story) {
        window.openUnifiedPanel('story', story, story.title, true);
    }
};

window._currentBugFilter = 'All';

window._filterBugs = function(level) {
    if (window._currentBugFilter === level) {
        window._currentBugFilter = 'All';
    } else {
        window._currentBugFilter = level;
    }
    
    const banner = document.getElementById('bug-filter-banner');
    const nameEl = document.getElementById('bug-filter-name');
    if (window._currentBugFilter === 'All') {
        if (banner) banner.style.display = 'none';
    } else {
        if (banner) banner.style.display = 'block';
        if (nameEl) nameEl.textContent = window._currentBugFilter;
    }
    
    window._renderBugsTriage();
};

window._renderBugsTriage = function() {
    const triageRows = document.getElementById('triage-rows');
    const pieContainer = document.getElementById('bug-pie-chart-container');
    
    if (!triageRows || !window._allBugs) return;
    
    let countCrit = 0, countMed = 0, countLow = 0;
    
    window._allBugs.forEach(bug => {
        const p = bug.priority.toLowerCase();
        if (p === 'critical' || p === 'high') countCrit++;
        else if (p === 'medium') countMed++;
        else countLow++;
    });
    
    const elQhTotal = document.getElementById('qh-total');
    if(elQhTotal) elQhTotal.textContent = window._allBugs.length;
    const elQhCrit = document.getElementById('qh-critical');
    if(elQhCrit) elQhCrit.textContent = countCrit;
    const elQhMed = document.getElementById('qh-medium');
    if(elQhMed) elQhMed.textContent = countMed;
    const elQhLow = document.getElementById('qh-low');
    if(elQhLow) elQhLow.textContent = countLow;
    
    if (pieContainer) {
        pieContainer.innerHTML = _generateBugPieChart(countCrit, countMed, countLow);
    }
    
    triageRows.innerHTML = '';
    
    const filteredBugs = window._allBugs.filter(bug => {
        if (window._currentBugFilter === 'All') return true;
        const p = bug.priority.toLowerCase();
        if (window._currentBugFilter === 'Critical' && (p === 'critical' || p === 'high')) return true;
        if (window._currentBugFilter === 'Medium' && p === 'medium') return true;
        if (window._currentBugFilter === 'Low' && p !== 'critical' && p !== 'high' && p !== 'medium') return true;
        return false;
    });
    
    filteredBugs.forEach(bug => {
        let borderClass = 'border-purple';
        let prioClass = 'priority-low';
        const p = bug.priority.toLowerCase();
        
        if (p === 'critical' || p === 'high') {
            borderClass = 'border-red';
            prioClass = 'priority-high';
        } else if (p === 'medium') {
            borderClass = 'border-yellow';
            prioClass = 'priority-low';
        }

        const row = document.createElement('div');
        row.className = `triage-row ${borderClass}`;
        row.style.cursor = 'pointer';
        row.onclick = () => window.openUnifiedPanel('bug', bug, `Bug: ${bug.title}`);
        
        // Add Hotfix Button for D-021
        let hotfixHtml = '';
        if (p === 'critical' || p === 'blocker' || p === 'high' || p === 'p1' || p === 'p2' || p.includes('p1')) {
            hotfixHtml = `<button class="ghost-hotfix-btn" title="Copy Hotfix Command" onclick="event.stopPropagation(); window.copyHotfix('${bug.id}')">🚨</button>`;
        }

        row.innerHTML = `
            <div class="tr-id">${bug.id}</div>
            <div><span class="bug-priority ${prioClass}">${bug.priority}</span></div>
            <div class="tr-title">${bug.title}</div>
            <div class="tr-status" style="display:flex; align-items:center; gap:8px;">
                ${bug.status}
                ${hotfixHtml}
            </div>
            <div class="avatar" style="width:30px;height:30px;font-size:0.7rem;">QA</div>
        `;
        triageRows.appendChild(row);
    });
};

window.copyHotfix = function(bugId) {
    const cmd = `/hotfix ${bugId}`;
    navigator.clipboard.writeText(cmd).then(() => {
        if (window.showToast) {
            window.showToast(`已复制：${cmd}`);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
};

function _generateBugPieChart(crit, med, low) {
    const total = crit + med + low;
    if (total === 0) return '<svg width="140" height="140" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="transparent" stroke="var(--glass-border)" stroke-width="20" /></svg>';
    
    let currentAngle = -90;
    
    function createSlice(value, color, label, isTargetFilter) {
        if (value === 0) return '';
        if (value === total) {
            const opacity = isTargetFilter ? '1' : '0.8';
            return `<circle cx="50" cy="50" r="40" fill="transparent" stroke="${color}" stroke-width="20" cursor="pointer" onclick="window._filterBugs('${label}')" style="opacity: ${opacity}; transition: opacity 0.2s;" onmouseover="this.style.opacity=1;" onmouseout="this.style.opacity=${opacity};" />`;
        }
        
        const sliceAngle = (value / total) * 360;
        const startAngle = currentAngle;
        const endAngle = currentAngle + sliceAngle;
        
        const x1 = 50 + 40 * Math.cos(Math.PI * startAngle / 180);
        const y1 = 50 + 40 * Math.sin(Math.PI * startAngle / 180);
        
        const x2 = 50 + 40 * Math.cos(Math.PI * endAngle / 180);
        const y2 = 50 + 40 * Math.sin(Math.PI * endAngle / 180);
        
        const largeArcFlag = sliceAngle > 180 ? 1 : 0;
        
        const d = `M ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}`;
        
        currentAngle += sliceAngle;
        
        const opacity = isTargetFilter ? '1' : '0.8';
        return `<path d="${d}" fill="transparent" stroke="${color}" stroke-width="20" cursor="pointer" onclick="window._filterBugs('${label}')" class="pie-slice" style="opacity: ${opacity}; transition: opacity 0.2s;" onmouseover="this.style.opacity=1;" onmouseout="this.style.opacity=${opacity};" />`;
    }
    
    const filter = window._currentBugFilter;
    let svg = '<svg width="140" height="140" viewBox="0 0 100 100">';
    svg += createSlice(crit, '#ef4444', 'Critical', filter === 'All' || filter === 'Critical');
    svg += createSlice(med, '#eab308', 'Medium', filter === 'All' || filter === 'Medium');
    svg += createSlice(low, 'var(--purple)', 'Low', filter === 'All' || filter === 'Low');
    svg += `<text x="50" y="50" font-family="sans-serif" font-size="24" font-weight="bold" fill="var(--text-main)" text-anchor="middle" dominant-baseline="central">${total}</text>`;
    svg += '</svg>';
    return svg;
}

function _renderBugContent(bug) {
    document.getElementById('bug-sp-id').innerText = bug.id;
    document.getElementById('bug-sp-priority').innerText = bug.priority;
    document.getElementById('bug-sp-status').innerText = bug.status;
    document.getElementById('bug-sp-filename').innerText = bug.path ? bug.path.split('/').pop() : '-';

    const ideBtn = document.getElementById('bug-sp-btn-ide');
    if (bug.path) {
        ideBtn.style.opacity = '';
        ideBtn.style.pointerEvents = 'auto';
        ideBtn.onclick = (e) => { e.stopPropagation(); window.openInIDE(bug.path); };
    } else {
        ideBtn.style.opacity = '0.2';
        ideBtn.style.pointerEvents = 'none';
        ideBtn.onclick = null;
    }
}

// Re-route legacy entry points
window.openGddModal = function(index) {
    if (!window.currentGddFiles || !window.currentGddFiles[index]) return;
    const gdd = window.currentGddFiles[index];
    window.openUnifiedPanel('gdd', gdd, `GDD: ${gdd.title}`);
};

window.showShockwavePanel = function(e) {
    if(e) e.stopPropagation();
    if (!window._currentShockwaves || window._currentShockwaves.length === 0) return;
    const sw = window._currentShockwaves[0]; 
    window.openUnifiedPanel('shockwave', sw, '设计变更影响 (Shockwave)');
};

function _renderShockwaveContent(sw) {
    document.getElementById('sw-source-gdd').textContent = sw.source_gdd;
    
    const adrsContainer = document.getElementById('sw-affected-adrs');
    adrsContainer.innerHTML = '';
    if (sw.affected_adrs && sw.affected_adrs.length > 0) {
        sw.affected_adrs.forEach(adr => {
            adrsContainer.innerHTML += `<div style="background: var(--bg-hover); padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 0.85rem;">${adr}</div>`;
        });
    } else {
        adrsContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">None</span>';
    }
    
    const storiesContainer = document.getElementById('sw-affected-stories');
    storiesContainer.innerHTML = '';
    if (sw.affected_stories && sw.affected_stories.length > 0) {
        sw.affected_stories.forEach(story => {
            storiesContainer.innerHTML += `<div style="background: var(--bg-hover); padding: 6px 10px; border-radius: 4px; font-family: monospace; font-size: 0.85rem;">${story}</div>`;
        });
    } else {
        storiesContainer.innerHTML = '<span style="color: var(--text-muted); font-size: 0.85rem;">None</span>';
    }
    
    const propagateBtn = document.getElementById('sw-btn-propagate');
    const propagateText = document.getElementById('sw-propagate-text');
    if (propagateText) propagateText.textContent = `/propagate-design-change ${sw.source_gdd}`;
    
    if (propagateBtn) {
        propagateBtn.onclick = function() {
            navigator.clipboard.writeText(`/propagate-design-change ${sw.source_gdd}`).then(() => {
                window.showToast('📋 Copied!', 'success');
            });
        };
    }
}

window.openAdrPanel = function(index) {
    if (!window.currentAdrFiles || !window.currentAdrFiles[index]) return;
    const adr = window.currentAdrFiles[index];
    window.openUnifiedPanel('adr', adr, `ADR: ${adr.title}`);
};

// --- Design Hub Sub-tabs ---
document.getElementById('btn-gdd-view').addEventListener('click', (e) => {
    document.getElementById('btn-gdd-view').classList.add('active');
    document.getElementById('btn-adr-view').classList.remove('active');
    document.getElementById('gdd-container').style.display = 'block';
    document.getElementById('adr-container').style.display = 'none';
});
document.getElementById('btn-adr-view').addEventListener('click', (e) => {
    document.getElementById('btn-adr-view').classList.add('active');
    document.getElementById('btn-gdd-view').classList.remove('active');
    document.getElementById('gdd-container').style.display = 'none';
    document.getElementById('adr-container').style.display = 'block';
});

window._currentMatrixEpic = 'All';

window._renderStoryMatrix = function(forcedEpic) {
    if (forcedEpic !== undefined) {
        window._currentMatrixEpic = forcedEpic;
    } else {
        const selectEl = document.getElementById('matrix-epic-filter');
        if (selectEl) {
            window._currentMatrixEpic = selectEl.value;
        }
    }

    const grid = document.getElementById('story-matrix-grid');
    const selectEl = document.getElementById('matrix-epic-filter');
    if (!grid || !window._allStories) return;

    const stories = window._allStories;
    
    // Update Epic dropdown
    if (selectEl && selectEl.options.length <= 1) {
        const epics = new Set();
        stories.forEach(s => {
            if (s.epic) epics.add(s.epic);
        });
        const epicsArr = Array.from(epics).sort();
        epicsArr.forEach(epic => {
            const opt = document.createElement('option');
            opt.value = epic;
            opt.textContent = epic;
            selectEl.appendChild(opt);
        });
        selectEl.value = window._currentMatrixEpic;
    }

    // Filter stories
    const filteredStories = stories.filter(s => {
        if (window._currentMatrixEpic === 'All') return true;
        return s.epic === window._currentMatrixEpic;
    });

    grid.innerHTML = '';
    
    if (filteredStories.length === 0) {
        grid.innerHTML = '<div style="color: var(--text-muted); text-align: center; padding: 1rem;" data-i18n="matrix_no_stories">No stories found.</div>';
        return;
    }

    filteredStories.forEach(s => {
        const row = document.createElement('div');
        row.className = 'matrix-story-row';
        row.style.background = 'var(--bg-hover)';
        row.style.border = '1px solid var(--glass-border)';
        row.style.borderRadius = '6px';
        row.style.padding = '1rem';
        row.style.marginBottom = '0.5rem';

        let headerHtml = `<div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
            <div style="font-weight: 600; color: var(--text-main); font-size: 0.95rem;">
                <span style="color: var(--cyan); margin-right: 0.5rem;">${s.id}</span>
                ${s.title}
            </div>
            <div style="font-size: 0.8rem; color: var(--text-muted); background: var(--bg-main); padding: 0.2rem 0.5rem; border-radius: 4px;">
                ${s.epic || 'Unknown Epic'}
            </div>
        </div>`;

        let acHtml = '<div style="display: flex; flex-direction: column; gap: 0.3rem;">';
        if (s.ac_list && s.ac_list.length > 0) {
            s.ac_list.forEach(ac => {
                const icon = ac.done ? '<span style="color: #10B981; margin-right: 0.5rem;">✅</span>' : '<span style="color: #ef4444; margin-right: 0.5rem;">❌</span>';
                const textColor = ac.done ? 'var(--text-main)' : 'var(--text-muted)';
                acHtml += `<div style="font-size: 0.85rem; color: ${textColor}; display: flex; align-items: flex-start;">
                    ${icon}<span style="flex: 1;">${ac.text}</span>
                </div>`;
            });
        } else {
            acHtml += '<div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic;">No acceptance criteria found.</div>';
        }
        acHtml += '</div>';

        row.innerHTML = headerHtml + acHtml;
        grid.appendChild(row);
    });
};

// Story D-026: Global Search (Cmd+K)
(function() {
    const modal = document.getElementById('search-modal');
    if (!modal) return;
    const input = document.getElementById('search-input');
    const resultsUl = document.getElementById('search-results');
    const emptyState = document.getElementById('search-empty');
    const spinner = document.getElementById('search-spinner');
    
    let searchTimeout = null;
    let resultsData = [];
    let activeIndex = -1;

    function openModal() {
        modal.classList.add('open');
        input.value = '';
        input.focus();
        resultsUl.innerHTML = '';
        emptyState.style.display = 'none';
        resultsData = [];
        activeIndex = -1;
    }

    function closeModal() {
        modal.classList.remove('open');
        input.blur();
    }

    window.addEventListener('keydown', (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
            e.preventDefault(); // Prevent browser search
            if (modal.classList.contains('open')) closeModal();
            else openModal();
        }
        
        // Focus trap & navigation
        if (modal.classList.contains('open')) {
            if (e.key === 'Escape') {
                e.preventDefault();
                closeModal();
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (resultsData.length > 0) {
                    activeIndex = (activeIndex + 1) % resultsData.length;
                    updateActiveState();
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (resultsData.length > 0) {
                    activeIndex = (activeIndex - 1 + resultsData.length) % resultsData.length;
                    updateActiveState();
                }
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const query = input.value.trim();
                if (query.startsWith('/')) {
                    const cmdMatch = query.match(/^\/feedback\s+(.+)$/);
                    if (cmdMatch) {
                        fetch('/api/feedback', {
                            method: 'POST',
                            body: JSON.stringify({ context: 'Global Command Bar', text: cmdMatch[1].trim(), timestamp: new Date().toISOString() })
                        }).then(() => {
                            closeModal();
                            window.showToast ? window.showToast('反馈已发送，感谢！', 'success') : alert('反馈已发送，感谢！');
                        });
                    } else if (query.startsWith('/feedback')) {
                        window.showToast ? window.showToast('请在 /feedback 后加上空格和想吐槽的内容再按回车哦！') : alert('请在 /feedback 后加上空格和想吐槽的内容再按回车哦！');
                    }
                    return;
                }
                executeSearchAction(e.metaKey || e.ctrlKey);
            } else if (['1','2','3','4'].includes(e.key)) {
                // Prevent global tab switching when typing numbers in search
                e.stopPropagation();
            }
        }
    }, { capture: true }); // Use capture to intercept before global shortcuts

    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    input.addEventListener('input', (e) => {
        const query = e.target.value;
        // Feature isolation: skip commands
        if (query.trim().startsWith('/')) {
            resultsUl.innerHTML = `
                <li class="active">
                    <div class="title" style="color:var(--orange)">💡 提交体验反馈</div>
                    <div class="snippet" style="font-family: monospace; margin-top: 4px;">格式: /feedback [想吐槽的内容] 然后按回车立刻发送。当前: ${query}</div>
                </li>
            `;
            emptyState.style.display = 'none';
            spinner.style.display = 'none';
            return;
        }

        if (searchTimeout) clearTimeout(searchTimeout);
        
        if (!query.trim()) {
            resultsUl.innerHTML = '';
            emptyState.style.display = 'none';
            spinner.style.display = 'none';
            return;
        }

        spinner.style.display = 'block';
        searchTimeout = setTimeout(() => {
            fetch(`/api/search?q=${encodeURIComponent(query)}`)
                .then(r => r.json())
                .then(data => {
                    spinner.style.display = 'none';
                    resultsData = data || [];
                    activeIndex = resultsData.length > 0 ? 0 : -1;
                    renderResults();
                })
                .catch(err => {
                    spinner.style.display = 'none';
                    console.error("Search failed:", err);
                });
        }, 300);
    });

    function renderResults() {
        resultsUl.innerHTML = '';
        if (resultsData.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        emptyState.style.display = 'none';
        
        resultsData.forEach((item, index) => {
            const li = document.createElement('li');
            if (index === activeIndex) li.classList.add('active');
            
            // Highlight matching text in title and snippet
            const query = input.value.trim().toLowerCase();
            const highlightText = (text) => {
                if (!query) return text;
                const idx = text.toLowerCase().indexOf(query);
                if (idx === -1) return text;
                return text.substring(0, idx) + `<span style="color: var(--cyan); font-weight: bold;">${text.substring(idx, idx + query.length)}</span>` + text.substring(idx + query.length);
            };

            li.innerHTML = `
                <div class="title">${highlightText(item.title)}</div>
                <div class="path">${item.relPath}</div>
                <div class="snippet">${highlightText(item.snippet)}</div>
            `;
            
            li.addEventListener('click', (e) => {
                activeIndex = index;
                executeSearchAction(e.metaKey || e.ctrlKey);
            });
            
            li.addEventListener('mouseenter', () => {
                activeIndex = index;
                updateActiveState(false); // Don't scroll on mouse hover
            });
            
            resultsUl.appendChild(li);
        });
        
        scrollIntoView();
    }

    function updateActiveState(doScroll = true) {
        Array.from(resultsUl.children).forEach((li, idx) => {
            if (idx === activeIndex) li.classList.add('active');
            else li.classList.remove('active');
        });
        if (doScroll) scrollIntoView();
    }

    function scrollIntoView() {
        if (activeIndex >= 0) {
            const activeEl = resultsUl.children[activeIndex];
            if (activeEl) {
                activeEl.scrollIntoView({ block: 'nearest' });
            }
        }
    }

    function executeSearchAction(ideMode) {
        if (activeIndex < 0 || activeIndex >= resultsData.length) return;
        const item = resultsData[activeIndex];
        closeModal();
        
        if (ideMode) {
            if (window.openInIDE) window.openInIDE(item.path);
        } else {
            // Find in current data if possible
            if (window.currentData) {
                if (item.relPath.includes('/gdd/')) {
                    const gdd = window.currentData.gdds.find(g => g.filename === item.title);
                    if (gdd) { window.openUnifiedPanel('gdd', gdd, `GDD: ${gdd.title}`); return; }
                } else if (item.relPath.includes('/architecture/')) {
                    const adr = window.currentData.adrs.find(a => a.filename === item.title);
                    if (adr) { window.openUnifiedPanel('adr', adr, `ADR: ${adr.title}`); return; }
                } else if (item.relPath.includes('/epics/')) {
                    for (const epic of window.currentData.sprint.epics) {
                        const story = epic.stories.find(s => s.id === item.title.replace('.md', ''));
                        if (story) { window.openUnifiedPanel('story', story, `Story: ${story.title}`); return; }
                    }
                }
            }
            // Fallback generic display using story template to at least show the path and snippet
            const mockData = {
                title: item.title,
                id: 'Search Result',
                epic: item.relPath,
                status: 'Found',
                ac_list: [{ done: true, text: item.snippet }],
                path: item.path
            };
            window.openUnifiedPanel('story', mockData, item.title);
        }
    }

    // --- Story D-027: Keyboard Shortcuts Manager ---
    (function initKeyboardManager() {
        let focusedIndex = -1;
        let focusedElements = [];
        
        const origSwitchView = window.switchView;
        window.switchView = function(viewId) {
            origSwitchView(viewId);
            focusedIndex = -1;
            updateFocusUI();
        };

        function getCurrentViewId() {
            const activeNav = document.querySelector('.nav-item.active');
            return activeNav ? activeNav.dataset.target : null;
        }

        function getItems() {
            const currentViewId = getCurrentViewId();
            if (!currentViewId) return [];
            if (currentViewId === 'sprints-view') {
                return Array.from(document.querySelectorAll('#sprints-view .kanban-card:not([style*="display: none"])'));
            } else if (currentViewId === 'quality-view') {
                return Array.from(document.querySelectorAll('#quality-view .triage-row:not([style*="display: none"])'));
            } else if (currentViewId === 'design-view') {
                // If we want to support Design view ADR cards later
                return Array.from(document.querySelectorAll('#design-view .kanban-card:not([style*="display: none"])'));
            }
            return [];
        }

        function updateFocusUI() {
            focusedElements.forEach(el => el.classList.remove('keyboard-focus'));
            focusedElements = getItems();
            if (focusedIndex >= 0 && focusedIndex < focusedElements.length) {
                const el = focusedElements[focusedIndex];
                el.classList.add('keyboard-focus');
                el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }

        window._dismissSmartFocus = function(storyId) {
            if (!window._dismissedFocusStories) window._dismissedFocusStories = new Set();
            window._dismissedFocusStories.add(storyId);
            document.querySelectorAll('.smart-focus').forEach(el => {
                if (el.dataset.storyId === storyId) {
                    el.classList.remove('smart-focus');
                }
            });
        };

        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();

            // 放行 / 键，但不阻止默认行为 (预留给D-028)
            if (key === '/') return;

            const searchModal = document.getElementById('search-modal');
            if (searchModal && searchModal.classList.contains('open')) {
                // If search modal is open, we only want its own listener to handle Esc/Enter/Nav.
                return;
            }

            const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName);
            if (isInput) {
                if (key === 'escape') {
                    document.activeElement.blur();
                    return;
                }
                // Cmd+K is handled elsewhere
                return;
            }

            // ? Help Modal toggle
            if (key === '?') {
                const helpModal = document.getElementById('kb-help-modal');
                if (helpModal) {
                    if (helpModal.style.display === 'flex') {
                        helpModal.style.display = 'none';
                    } else {
                        helpModal.style.display = 'flex';
                    }
                }
                e.preventDefault();
                return;
            }

            // Esc
            if (key === 'escape') {
                const helpModal = document.getElementById('kb-help-modal');
                if (helpModal && helpModal.style.display === 'flex') {
                    helpModal.style.display = 'none';
                    e.preventDefault();
                    return;
                }
                if (document.body.classList.contains('panel-open')) {
                    window.closeUnifiedPanel();
                    e.preventDefault();
                    return;
                }
                return;
            }
            
            if (document.body.classList.contains('panel-open')) return;

            // 1-4 Tabs
            if (key >= '1' && key <= '4') {
                const views = ['dashboard-view', 'design-view', 'sprints-view', 'quality-view'];
                const idx = parseInt(key) - 1;
                window.switchView(views[idx]);
                e.preventDefault();
                return;
            }

            const currentViewId = getCurrentViewId();

            // J/K/H/L Navigation (2D Grid for Kanban, 1D for Lists)
            if (['j', 'k', 'h', 'l', 'arrowup', 'arrowdown', 'arrowleft', 'arrowright'].includes(key)) {
                if (currentViewId !== 'sprints-view' && currentViewId !== 'quality-view' && currentViewId !== 'design-view') return;
                
                focusedElements = getItems();
                if (focusedElements.length === 0) return;

                if (focusedIndex === -1) {
                    focusedIndex = 0;
                } else {
                    const currentEl = focusedElements[focusedIndex];
                    const currentCol = currentEl.closest('.kanban-col, .adr-column');
                    
                    const isUp = key === 'k' || key === 'arrowup';
                    const isDown = key === 'j' || key === 'arrowdown';
                    const isLeft = key === 'h' || key === 'arrowleft';
                    const isRight = key === 'l' || key === 'arrowright';

                    if (!currentCol) {
                        // 1D list (e.g. Quality view)
                        if (isDown) focusedIndex = Math.min(focusedIndex + 1, focusedElements.length - 1);
                        if (isUp) focusedIndex = Math.max(focusedIndex - 1, 0);
                        // Left/Right do nothing in 1D list
                    } else {
                        // 2D Kanban Navigation
                        const allCols = Array.from(currentCol.parentElement.querySelectorAll('.kanban-col, .adr-column'));
                        const colIndex = allCols.indexOf(currentCol);
                        const colCards = Array.from(currentCol.querySelectorAll('.kanban-card:not([style*="display: none"])'));
                        const cardIndex = colCards.indexOf(currentEl);

                        let nextCard = currentEl;

                        if (isDown) {
                            if (cardIndex < colCards.length - 1) nextCard = colCards[cardIndex + 1];
                        } else if (isUp) {
                            if (cardIndex > 0) nextCard = colCards[cardIndex - 1];
                        } else if (isLeft || isRight) {
                            let targetColIndex = colIndex;
                            let found = false;
                            while (!found) {
                                targetColIndex += isLeft ? -1 : 1;
                                if (targetColIndex < 0 || targetColIndex >= allCols.length) break;
                                
                                const targetCol = allCols[targetColIndex];
                                const targetCards = Array.from(targetCol.querySelectorAll('.kanban-card:not([style*="display: none"])'));
                                if (targetCards.length > 0) {
                                    // Try to preserve vertical position index, clamp to available cards
                                    nextCard = targetCards[Math.min(cardIndex, targetCards.length - 1)];
                                    found = true;
                                }
                            }
                        }
                        
                        const newGlobalIndex = focusedElements.indexOf(nextCard);
                        if (newGlobalIndex !== -1) {
                            focusedIndex = newGlobalIndex;
                        }
                    }
                }
                updateFocusUI();
                e.preventDefault();
                return;
            }

            // Enter, D, R
            if (key === 'enter' || key === 'd' || key === 'r') {
                if (currentViewId !== 'sprints-view' && currentViewId !== 'quality-view' && currentViewId !== 'design-view') return;

                let target = null;
                if (focusedIndex >= 0 && focusedIndex < focusedElements.length) {
                    target = focusedElements[focusedIndex];
                } else {
                    target = document.querySelector('.smart-focus');
                }

                if (!target) {
                    window.showToast("请先用 J/K 选中一张卡片", "info");
                    e.preventDefault();
                    return;
                }

                if (currentViewId === 'sprints-view') {
                    const storyId = target.dataset.storyId;
                    if (key === 'enter') {
                        const copyBtn = target.querySelector('.kb-copy-btn');
                        if (copyBtn) copyBtn.click();
                        window._dismissSmartFocus(storyId);
                    } else if (key === 'd') {
                        const cmd = `/dev-story CCGS-Data/production/epics/**/${storyId}.md`;
                        navigator.clipboard.writeText(cmd).then(() => {
                            window.showToast('📋 ' + cmd, 'success');
                            window._dismissSmartFocus(storyId);
                        });
                    } else if (key === 'r') {
                        const cmd = `/code-review CCGS-Data/production/epics/**/${storyId}.md`;
                        navigator.clipboard.writeText(cmd).then(() => {
                            window.showToast('📋 ' + cmd, 'success');
                            window._dismissSmartFocus(storyId);
                        });
                    }
                } else if (currentViewId === 'quality-view' || currentViewId === 'design-view') {
                    if (key === 'enter') {
                        target.click();
                    } else if (key === 'd' || key === 'r') {
                        window.showToast("D/R 快捷指令仅在冲刺页签有效", "info");
                    }
                }
                e.preventDefault();
            }
        });
    })();

    // --- Story D-028: Fast Triage Input ---
    (function initSmartInput() {
        const SKILL_MAP = [
            { keywords: ['bug', '缺陷', '报错', 'error'], command: '/bug-report' },
            { keywords: ['design', '设计', 'gdd', '概念'], command: '/design-system' },
            { keywords: ['brainstorm', '头脑风暴', '想法', 'idea'], command: '/brainstorm' },
            { keywords: ['arch', '架构', 'adr', '决策'], command: '/architecture-decision' },
            { keywords: ['epic', '史诗', '阶段'], command: '/create-epics' },
            { keywords: ['story', '故事', '任务', '拆分'], command: '/create-stories' },
            { keywords: ['dev', '开发', '编码', '实现'], command: '/dev-story' },
            { keywords: ['review', '审查', '代码审查', 'cr'], command: '/code-review' },
            { keywords: ['qa', '测试', '验证', '用例'], command: '/team-qa' },
            { keywords: ['help', '帮助', '求助', 'sos'], command: '/help' },
            { keywords: ['status', '状态', '进度', 'sprint'], command: '/sprint-status' }
        ];

        document.addEventListener('DOMContentLoaded', () => {
            const inputElem = document.getElementById('smart-action-input');
            const cmdElem = document.getElementById('smart-action-cmd');
            const copyBtn = document.getElementById('smart-copy-btn');
            
            if (!inputElem || !cmdElem || !copyBtn) return;

            // Handle '/' to focus
            document.addEventListener('keydown', (e) => {
                if (e.key === '/' && document.activeElement !== inputElem) {
                    if (document.activeElement && (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA')) {
                        return;
                    }
                    const banner = document.getElementById('smart-banner');
                    if (banner && banner.style.display !== 'none') {
                        inputElem.focus();
                        e.preventDefault();
                    }
                }
            });

            // Handle typing to match keywords
            inputElem.addEventListener('input', (e) => {
                const val = e.target.value.toLowerCase().trim();
                
                if (!val) {
                    // Revert to default
                    cmdElem.textContent = window._defaultSmartCommand || '/help';
                    window._currentSmartCommand = window._defaultSmartCommand || '/help';
                    return;
                }

                // Find best match
                let bestMatch = '/help'; // fallback
                for (const rule of SKILL_MAP) {
                    if (rule.keywords.some(kw => val.includes(kw))) {
                        bestMatch = rule.command;
                        break; // pick the first matched rule
                    }
                }
                
                cmdElem.textContent = bestMatch;
                window._currentSmartCommand = bestMatch;
            });

            // Handle Enter to submit (copy)
            inputElem.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    copyBtn.click();
                    inputElem.blur();
                } else if (e.key === 'Escape') {
                    inputElem.blur();
                }
            });
        });
    })();
})();
// ==========================================
// UX Feedback System
// ==========================================
window.openFeedbackModal = function(context) {
    const modal = document.getElementById('ux-feedback-modal');
    const ctxLabel = document.getElementById('ux-feedback-context');
    const input = document.getElementById('ux-feedback-input');
    if (modal && ctxLabel && input) {
        ctxLabel.textContent = context || 'Global';
        input.value = '';
        modal.style.display = 'flex';
        setTimeout(() => input.focus(), 50);
    }
};

window.closeFeedbackModal = function() {
    const modal = document.getElementById('ux-feedback-modal');
    if (modal) modal.style.display = 'none';
};

window.submitFeedbackModal = function() {
    const ctxLabel = document.getElementById('ux-feedback-context');
    const input = document.getElementById('ux-feedback-input');
    const text = input.value.trim();
    if (text) {
        fetch('/api/feedback', {
            method: 'POST',
            body: JSON.stringify({ 
                context: ctxLabel.textContent, 
                text: text, 
                timestamp: new Date().toISOString() 
            })
        }).then(() => {
            window.closeFeedbackModal();
            window.showToast('反馈已发送，感谢！', 'success');
        });
    }
};

// Cmd+Enter inside feedback textarea
document.addEventListener('DOMContentLoaded', () => {
    const fbInput = document.getElementById('ux-feedback-input');
    if (fbInput) {
        fbInput.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                e.preventDefault();
                window.submitFeedbackModal();
            } else if (e.key === 'Escape') {
                e.preventDefault();
                window.closeFeedbackModal();
            }
        });
    }
});
