# 《照面之时》轻量架构说明

版本：v0.2  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.5

## Overview

本架构用于把 v0.4 规则落到当前 Phaser + TypeScript + Vite 原型。核心原则是模拟层拥有玩法真源，渲染层和 DOM HUD 只展示状态并派发输入。

## Modules

| Module | Path | Owner | Responsibility |
|---|---|---|---|
| Simulation Core | `src/sim` | gameplay-programmer | Run State、Actor Stats、Vision、Intel、Encounter、Items、Enemy AI |
| Simulation Ports | `src/sim/ports.ts` | lead-programmer / gameplay-programmer | `SimulationReadPort`、`SimulationCommandPort`、`SimulationPort` |
| Render Layer | `src/render` | gameplay-programmer / technical-artist | Phaser 地图、单位、视野、提示绘制 |
| HUD Bridge | `src/main.ts` | ui-programmer | DOM HUD、按钮输入、战斗面板与模拟层 API 桥接 |
| Styling | `src/styles.css` | ui-programmer | HUD 与面板布局、桌面/移动可读性 |
| Tests | `tests` | qa-lead / gameplay-programmer | 规则公式、状态机、集成流程的自动化测试 |

## Data Flow

1. 玩家输入由 DOM 或 Phaser 捕获。
2. 输入桥接层调用 `SimulationCommandPort`。
3. `src/sim` 结算规则并产生新 `GameState`。
4. HUD 与 Phaser 通过 `SimulationReadPort.snapshot()` 读取状态，只表现状态，不直接改状态。
5. 测试直接调用模拟层 API，不依赖 Phaser。

## Boundaries

- `src/sim` 可以包含规则、随机、状态机、结算、数据定义。
- `src/render` 不允许持有规则判断，只允许依赖 `SimulationReadPort` 绘制。
- `src/main.ts` 不允许直接修改 `GameState` 内部字段，只能通过 `SimulationCommandPort` 改变游戏。
- 核心数值必须能追溯到 `rulebook.md` 或数据配置。
- 端口契约详见 `CCGS-Data/project-docs/architecture/module-ports.md`。

## Implementation Strategy

第一轮实装采用“先兼容、再拆分”：

1. 先建立测试框架和规则公式测试。
2. 扩展 `src/sim/types.ts`，引入五项属性、派生值、可见状态、信息、动作。
3. 在 `GameSimulation` 内逐步替换旧三牌战斗，不一次性拆成大量文件。
4. 当单文件复杂度超过可维护范围，再按 `system-framework.md` 拆出 `statsSystem`、`visionSystem`、`combatSystem` 等模块。

## Risks

- 旧战斗系统与 v0.4 差异大，建议以 Story 为单位替换，不做临时桥接。
- 视野与 UI 可读性风险高，必须在浏览器中截图验证。
- 没有测试框架会阻塞 Logic / Integration Story 关闭。
