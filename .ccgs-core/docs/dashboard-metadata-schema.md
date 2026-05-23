# CCGS Dashboard Metadata Schema

> 本文档定义了 CCGS 框架中各类 Markdown 文件的 YAML frontmatter 标准数据结构。
> 所有框架层 Agent（如 `/create-stories`, `/bug-report`）生成的文档都必须严格遵循本规范。
> Dashboard 后端通过解析此 Schema 构建内存关系图。

## 1. GDD 文件 (Game Design Document)
路径：`CCGS-Data/design/gdd/*.md`

```yaml
---
id: "gdd-system-name"      # 唯一标识符，通常与文件名一致（无后缀）
system: "Combat System"    # 所属子系统名称
layer: "Core"              # 所属架构层级（Foundation/Core/Feature/Content/UI）
version: "1.0.0"           # 版本号
status: "Draft"            # 状态（Draft/Review/Approved/Deprecated）
related_adrs: []           # (可选) 关联的 ADR 编号数组，例如 ["ADR-001", "ADR-003"]
---
```

## 2. Epic 文件
路径：`CCGS-Data/production/epics/*/EPIC.md`

```yaml
---
epic: "WP-X Epic Name"     # Epic 完整名称/ID
title: "简短标题"            # 简短的展示标题
status: "Todo"             # 状态（Todo/In Progress/Done）
layer: "Core"              # 所属架构层级
owner: "Role Name"         # (可选) 负责 Agent 角色
phase: "P1"                # (可选) 所属阶段
---
```

## 3. Story 文件
路径：`CCGS-Data/production/epics/*/*.md`

```yaml
---
epic: "WP-X Epic Name"     # 所属 Epic 完整名称
status: "Todo"             # 状态（Ready/Todo/In Progress/Review/Done/Blocked）
phase: "P1"                # 所属阶段
owner: "Role Name"         # 负责 Agent 角色（如 UI Programmer）
type: "Implementation"     # 任务类型（Logic/Integration/Visual/UI/Config）
estimate: "1天"             # 预估时间
dependencies: []           # 前置依赖的 Story ID 数组，例如 ["D-001", "D-002"]
group: "模块名称"            # 用于 Kanban 分组的二级模块名
sprint: "sprint-01"        # (可选) 分配的 Sprint ID
manifest_version: "YYYY-MM-DD" # 关联的控制清单版本
---
```

## 4. Sprint 文件
路径：`CCGS-Data/production/sprints/*.md`

```yaml
---
id: "sprint-01"            # Sprint 唯一标识
name: "Alpha Phase 1"      # Sprint 名称
start_date: "YYYY-MM-DD"   # 开始日期
end_date: "YYYY-MM-DD"     # 结束日期
stories: []                # 包含的 Story ID 数组，例如 ["D-001", "D-002"]
---
```

## 5. Bug 文件
路径：`CCGS-Data/production/qa/bugs/*.md`

```yaml
---
id: "BUG-0001"             # Bug 唯一标识
title: "Bug 简短描述"        # 标题
severity: "High"           # 严重程度（Critical/High/Medium/Low）
priority: "P1"             # 优先级（P0/P1/P2/P3）
status: "Open"             # 状态（Open/In Progress/Resolved/Closed）
related_story: "D-001"     # (可选) 关联的 Story ID
reporter: "Role Name"      # 报告者
---
```
