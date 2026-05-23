---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "gameplay-programmer"
type: "Logic"
estimate: "1天"
points: ""
dependencies: ["story-001-combat-matrix-effective-defense"]
group: ""
sprint: ""
layer: "Core"
manifest_version: "2026-05-09"
---
# Story 003: 优势窗口、逃跑与说服公式

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-007` and Advantage Window formulas  
**Related TR**: `TR-COMBAT-003`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: MEDIUM

本 Story 调整优势窗口的兑现方式，避免“继续战斗”同时给予力量和速度，并同步逃跑/说服公式。

## Acceptance Criteria

- [x] 优势窗口继续战斗只能选择力量或节奏之一，不能同时给力量和速度。
- [x] `pressPower` 只使下一动作回合近战伤害 +1。
- [x] `pressTempo` 只使下一动作回合速度 +1。
- [x] 同场照面同类继续战斗修正最多触发 1 次。
- [x] 逃跑成功率使用 `55% + clamp(速度差, -3, 3) x 8% + 道具修正`，下限 25%，上限 90%。
- [x] 说服值使用 `智力 + min(相关有效情报, 3) + min(支付修正, 2) + min(道具修正, 2) + 局势修正 - 敌意修正`，普通目标值默认 8。

## Implementation Notes

- 需要明确 UI 输入如何选择 `pressPower` 或 `pressTempo`；若 UI 暂未拆分，必须先保持规则 API 可表达二选一。
- 支付道具最多 2 件。
- 逃跑失败后失去优势，并可给予追击方短期追击修正。
- 不得重新引入独立压力值 UI。
- Control Manifest：优势窗口、逃跑和说服必须由 `src/sim` 结算；HUD 只能通过模拟层命令表达选择，不能直接决定结果或修改 `GameState`。
- 性能预算：公式计算只在优势窗口选择、逃跑判定、说服判定和下一动作回合结算时运行，不进入 Phaser `update()` 高频循环。

## Out of Scope

- 不设计新说服奖励。
- 不加入临时同盟。
- 不改敌人战术包评分。

## QA Test Cases

- **AC-1**: 继续战斗二选一。
  - Given: 玩家拥有优势窗口。
  - When: 玩家选择 `pressPower`。
  - Then: 下一动作回合只获得近战伤害 +1，不获得速度 +1。
  - Edge cases: 再次选择同类修正；选择 `pressTempo`。

- **AC-2**: 逃跑公式封顶。
  - Given: 速度差从 -5 到 +5。
  - When: 计算逃跑成功率。
  - Then: 结果夹在 25% 到 90% 之间。
  - Edge cases: 道具修正为正；道具修正为负。

- **AC-3**: 说服公式限制情报和支付叠加。
  - Given: 玩家有 5 条相关情报、3 件支付物和多个说服道具。
  - When: 计算说服值。
  - Then: 情报最多计 3，支付最多计 2，道具最多计 2。
  - Edge cases: 重伤敌人目标值；无情报说服。

## Test Evidence

**Story Type**: Logic  
**Required evidence**:
- `tests/unit/combat_advantage_flee_persuasion_test.mjs` 或现有战斗测试文件中的同名用例必须存在并通过。

**Status**: [x] `tests/unit/combat_advantage_flee_persuasion_test.mjs` 已创建并通过；`npm test` 98/98 通过；`npm run build` 通过。

## Dependencies

- Code Dependencies: `story-001-combat-matrix-effective-defense`
- Asset Dependencies: None
- Unlocks: Story 006

## Completion Notes

**Completed**: 2026-05-19  
**Criteria**: 6/6 passing。  
**Deviations**: None blocking。备注：具体“支付道具”选择 UI 未纳入本 Story；当前按既有抽象战利筹码支付执行公式上限，后续如需道具支付选择可在 UI/支付 Story 扩展。  
**Test Evidence**: Logic 自动化测试已创建并通过：`tests/unit/combat_advantage_flee_persuasion_test.mjs`；完整回归 `npm test` 98/98 通过；`npm run build` 通过。  
**Code Review**: Complete。审查结论为无阻塞问题；测试脚本漏扫 `*_test.mjs` 的问题已一并修正。  
