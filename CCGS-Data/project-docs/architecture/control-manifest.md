# Control Manifest

Manifest Version：2026-05-09  
Project：照面之时  
Scope：v0.5 MVP 原型与模块端口

## Foundation Layer

Required:

- `RunState`、`GameState`、`ActorState` 必须由 `src/sim` 定义。
- 模块端口必须以 `CCGS-Data/project-docs/architecture/module-ports.md` 为真源。
- `GameSimulation` 对外只暴露 `SimulationPort`，渲染层只能依赖 `SimulationReadPort`。
- 所有随机或生成结果必须能通过固定 seed 复现。
- Logic Story 必须有单元测试。

Forbidden:

- 禁止在 `src/render` 或 `src/main.ts` 中直接写规则结算。
- 禁止 `src/sim` 依赖 DOM、Phaser、CSS 或浏览器事件。
- 禁止将生命、伤害、视野、成功率等核心数值硬编码为无来源魔法数。

Guardrail:

- 测试应能在无浏览器环境下验证核心公式与状态转移。

## Core Layer

Required:

- Actor Stats、Vision & Intel、Encounter Combat 必须优先走模拟层 API。
- 战斗动作必须使用结构化类型，不能继续依赖旧 `Attack / Guard / Trick`。
- 视野领先、信息获取、优势窗口必须能被测试单独触发。
- HUD/输入层改变游戏状态时必须调用 `SimulationCommandPort`，不得直接写 `GameState` 字段。

Forbidden:

- 禁止让 HUD 直接决定战斗胜负、逃跑或说服结果。
- 禁止让敌人 AI 读取玩家隐藏信息，除非信息系统已揭示。
- 禁止渲染层调用 `move`、`useItem`、`playCombatAction` 等命令端口。

Guardrail:

- 单次照面默认 2-4 个动作回合内必须给出出口。

## Feature Layer

Required:

- 道具效果必须通过统一 Item Definition / Item Instance 表达。
- 玩家和敌人都应能持有道具。
- 道具节点、拾取、掉落和敌人成长必须由 `src/sim` 结算。

Forbidden:

- 禁止只为玩家写一套道具逻辑、只为敌人写另一套重复逻辑。
- 禁止 UI 根据道具名称自行推断效果；新增效果必须登记到规则书和模拟层。

Guardrail:

- 远程先手每次遭遇默认最多触发 1 次。

## Presentation Layer

Required:

- HUD 必须展示生命、时间、战利、背包、最近记录；不得显示已删除的全局危险数值。
- 战斗面板必须展示可见状态、优势归属、可选动作、已知/未知信息。
- 未见来源造成损失时，必须显示方向或来源提示。
- `GameScene` 只能读取 `SimulationReadPort.snapshot()`，不能持有或修改局内状态。

Forbidden:

- 禁止 UI 遮挡主要 playfield 后不做浏览器截图验证。
- 禁止在 CSS 或 DOM 字符串中隐藏玩法规则分支。

Guardrail:

- 桌面与移动尺寸都必须保留可操作地图区域。
