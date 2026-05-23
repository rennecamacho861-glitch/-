# Proposal: v0.4 规则到 MVP 实装

- 日期：2026-05-08
- Review Mode：Full
- 阶段：Systems Design -> Implementation Planning
- 规则来源：`CCGS-Data/design/gdd/rulebook.md`
- 架构来源：`CCGS-Data/project-docs/architecture/architecture.md`
- ADR：`CCGS-Data/project-docs/architecture/ADR-0001-v0-4-simulation-boundary.md`

## 需求分析

用户要求按完整 CCGS 流程推进：先审阅并修改规则书，确认其是否符合 GDD 要求，再继续向下拆到可实装工作。现有代码仍以旧版 `Attack / Guard / Trick` 三牌战斗为核心，和 v0.4 规则中的属性、视野、信息、动作、优势窗口差异较大。

本 Proposal 只推进到“可确认的实装计划”。在用户确认规则书 v0.4 前，不进入代码实装。

## 设计方案

v0.4 MVP 采用以下落地顺序：

1. 建立测试框架，偿还 TD-001。
2. 统一玩家和敌人的属性、生命、背包、状态结构。
3. 补齐 Run State：时间、危险、撤离、失败、结算。
4. 实现格子地图探索、搜索点、出口、AI 巡逻与遭遇触发。
5. 实现视野与信息：`unseen / aware / visible`、视野领先、信息揭示。
6. 替换旧三牌战斗为动作战斗：进攻、防御、左躲闪、右躲闪、优势窗口。
7. 接入第一批道具：手枪、绷带、长刀、陷阱、眼镜。
8. 更新 HUD 与战斗面板，展示地图可读性、可见状态、优势、已知/未知信息。

## 影响评估

计划内文件区域：

- `src/sim/**`
- `src/render/**`
- `src/main.ts`
- `src/styles.css`
- `tests/**`
- `CCGS-Data/production/**`

高风险点：

- 旧战斗逻辑需要替换，不宜半新半旧长期共存。
- 视野领先必须给出清晰 UI 反馈，否则玩家会认为被系统不公平惩罚。
- 没有测试框架会阻塞 Logic / Integration Story 完成。

## 阶段合规

- Phase 0：已读取 CCGS 核心流程、技术偏好、编码标准、会话状态、Bug/债务追踪。
- Phase 1：已完成 GDD 审阅、规则书 v0.4 修订、系统索引更新、轻量架构与 ADR 补齐。
- Phase 2：本 Proposal 之后拆 Story；代码实装等待用户确认。
- Phase 3：每个 Logic / Integration Story 必须有测试证据。
- Phase 4：实现后回写 Changelog / QA，并同步 GDD 差异。

## 验收标准

- 规则书 v0.4 被用户确认或修改后确认。
- Story 能追踪到 `tr-registry.yaml` 中的 TR-ID。
- 第一轮实装完成后，`npm run build` 通过。
- Logic / Integration Story 有自动化测试或登记明确测试债务。
- 浏览器中能看到俯视角格子地图、有限视野、搜索、遭遇、动作战斗、撤离/失败闭环。

## 任务拆分

| # | 子任务 | 复杂度 | 验收标准 | 依赖 |
|---|---|---|---|---|
| 1 | 建立 Vitest 测试入口 | S | `npm test` 可运行，至少 1 个 sim 测试通过 | 无 |
| 2 | 统一 Actor Stats 与派生值 | M | 玩家/敌人共用五项属性公式，测试覆盖边界值 | 1 |
| 3 | Run State、撤离与失败闭环 | M | 时间、危险、撤离、失败由 `src/sim` 驱动 | 1,2 |
| 4 | 地图探索与遭遇触发 | M | 有限视野、搜索点、出口、AI 接近可触发遭遇 | 2,3 |
| 5 | Vision & Intel | M | `unseen/aware/visible`、视野领先、信息揭示可测 | 2,4 |
| 6 | Encounter Combat 状态机 | L | 进攻、防御、躲闪、优势窗口、逃跑、说服替代旧三牌 | 2,5 |
| 7 | Item System v0.4 | M | 手枪、绷带、长刀、陷阱、眼镜具备规则书效果 | 5,6 |
| 8 | Enemy AI MVP | M | 敌人按属性倾向巡逻、追击、撤退、选择战斗动作 | 5,6,7 |
| 9 | HUD & Combat UI 对齐 | M | UI 展示规则书第 14 章要求，桌面/移动可读 | 3-8 |
| 10 | QA / Playtest 验收 | M | 构建通过，有测试日志与手动 playtest 记录 | 1-9 |

## 用户确认点

请确认 `rulebook.md` v0.4 的 5 个 MVP 默认决策：

1. 玩家初始属性固定 3/3/3/3/3。
2. 远程攻击必须目标可见、路径无遮挡。
3. 说服第一版只做让路和交换信息。
4. 敌人第一版只在生成时携带道具，不主动拾取。
5. 躲闪第一版采用方向预判按钮。

确认后进入 Story Readiness -> Dev Story。
