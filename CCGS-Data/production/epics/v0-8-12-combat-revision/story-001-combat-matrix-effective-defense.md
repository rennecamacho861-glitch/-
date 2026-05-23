---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "gameplay-programmer"
type: "Logic"
estimate: "1天"
points: ""
dependencies: []
group: ""
sprint: ""
layer: "Core"
manifest_version: "2026-05-09"
---
# Story 001: Combat Matrix 与有效防御

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-003`, `AC-CMB-004`, `AC-CMB-006`  
**Related TR**: `TR-COMBAT-001`, `TR-COMBAT-002`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: MEDIUM

本 Story 修正基础动作矩阵，让防御和躲闪真正克制无脑进攻，并调整第 3 回合后的软收束优先级。

## Acceptance Criteria

- [x] 基础动作仍只包含进攻、防御、左躲闪、右躲闪；远程、治疗、压制必须来自道具。
- [x] 进攻打防御时，防御必须减伤并可触发有效防御。
- [x] 攻击方不得因为被防御压低的小额伤害自动压过有效防御。
- [x] 有效防御必须满足：承受敌方攻击、远程、投掷或压制动作，且至少减少 2 点伤害、防止重伤，或触发防御型道具/情报效果。
- [x] 防御无人攻击时不形成有效防御，不获得优势窗口。
- [x] 第 3 动作回合起软收束优先级为：有效防御、成功躲闪、显著伤害、生命、速度、双方后退脱战。

## Implementation Notes

- 主要修改范围应在 `src/sim/**`，优先靠 `combatSystem` 或 `GameSimulation.resolveActionRound()` 当前边界落地。
- 防御重伤修正默认 +2，仅作用于本次受击重伤判定。
- 显著伤害应排除被有效防御压低的小额伤害。
- 不在 `src/render` 或 `src/main.ts` 中写任何胜负、优势或防御判定。
- 性能预算：只在动作回合结算时运行，不进入 Phaser `update()` 高频循环；单次照面仍以 2-4 个动作回合内出现出口为默认目标。

## Out of Scope

- 不改 AI 战术包评分。
- 不改道具有效构筑预算。
- 不改 HUD 文案。
- 不新增战斗动作。

## QA Test Cases

- **AC-1**: 进攻打防御不应自动压过有效防御。
  - Given: 玩家防御，敌人进攻，防御至少减少 2 点伤害。
  - When: 结算第 3 回合后的软收束。
  - Then: 玩家获得优势窗口，敌人不因小额伤害获得优势。
  - Edge cases: 防御只减少 1 点伤害；防御防止重伤但减少伤害不足 2 点。

- **AC-2**: 防御无人攻击不触发有效防御。
  - Given: 玩家防御，敌人防御或躲闪。
  - When: 结算回合。
  - Then: 玩家不因防御动作直接获得优势窗口。
  - Edge cases: 防御型被动触发；双方都无伤害进入软收束。

- **AC-3**: 软收束优先级正确。
  - Given: 第 3 回合结束，同时存在有效防御和小额伤害。
  - When: 执行收束检查。
  - Then: 有效防御优先于显著伤害。
  - Edge cases: 只有成功躲闪；只有显著伤害；生命和速度都相同。

## Test Evidence

**Story Type**: Logic  
**Required evidence**:
- `tests/unit/combat_system_effective_defense_test.mjs` 或现有战斗测试文件中的同名用例必须存在并通过。

**Status**: [x] `tests/unit/combat_system_effective_defense_test.mjs` 已创建并通过；`npm test` 83/83 通过；`npm run build` 通过。

## Dependencies

- Code Dependencies: None
- Asset Dependencies: None
- Unlocks: Story 002、Story 003

## Completion Notes

**Completed**: 2026-05-19  
**Criteria**: 6/6 passing。  
**Deviations**: None blocking。备注：投掷道具与压制动作的有效防御细分尚未独立测试，留给后续道具/压制 Story。  
**Test Evidence**: Logic 自动化测试已创建并通过：`tests/unit/combat_system_effective_defense_test.mjs`；完整回归 `npm test` 83/83 通过；`npm run build` 通过。  
**Code Review**: Complete。审查后已修正显著伤害阈值与软收束优势来源标记。
