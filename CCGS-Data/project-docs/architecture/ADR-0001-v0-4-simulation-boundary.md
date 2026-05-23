# ADR-0001: v0.4 模拟层边界与测试优先

- Status: Accepted
- Date: 2026-05-08
- Domain: Simulation Core / Rule Implementation
- Related GDD: `CCGS-Data/design/gdd/rulebook.md`
- Related TR: TR-TEST-001, TR-RUN-001, TR-RUN-002, TR-STATS-001, TR-VISION-001, TR-INTEL-001, TR-COMBAT-001, TR-COMBAT-002, TR-COMBAT-003, TR-ITEM-001, TR-AI-001, TR-ARCH-001
- Engine Risk: LOW

## Context

当前原型存在可运行的 Phaser + TypeScript 游戏，但战斗仍是旧的 `Attack / Guard / Trick` 牌面猜拳。v0.4 规则要求五项属性、视野、信息、动作、优势窗口、逃跑、说服和道具共同驱动照面战斗。若直接在 Phaser Scene 或 DOM HUD 中补规则，会很快导致规则真源分裂。

## Decision

v0.4 实装必须以 `src/sim` 为唯一规则真源：

- `src/sim` 定义状态、动作、公式、随机、AI 和结算。
- `src/render` 只根据 `GameState` 绘制地图、单位、视野与提示。
- `src/main.ts` 只绑定 DOM HUD 与输入，不直接修改状态字段。
- Logic / Integration Story 必须优先建立自动化测试。

## Implementation Guidelines

- 先加测试框架，再改核心规则。
- 先扩展类型，再替换旧战斗结算。
- 玩家和敌人共用 `ActorState`、`StatBlock`、`ItemInstance` 等结构。
- 视野、信息、战斗都应能用固定输入在测试中复现。
- 当前允许先保留 `GameSimulation` 作为协调类，但不得继续把新规则写成 HUD 或 Phaser 特例。

## Engine Compatibility

- Phaser 3 只负责渲染，不影响模拟层测试。
- Vite + TypeScript 可直接接入 Vitest。
- 当前风险主要是包体大小警告，不影响 v0.4 规则实现。

## Consequences

- 好处：规则可测试、可复现，后续能逐步拆成独立系统。
- 代价：需要先偿还测试债务，短期比直接改 UI 慢。
- 风险：如果 Story 粒度过大，`GameSimulation` 会继续膨胀；需要在 Story 中控制范围。
