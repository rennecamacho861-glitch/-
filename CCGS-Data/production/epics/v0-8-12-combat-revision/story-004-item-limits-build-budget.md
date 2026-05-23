---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "2天"
points: ""
dependencies: ["story-001-combat-matrix-effective-defense"]
group: ""
sprint: ""
layer: "Feature"
manifest_version: "2026-05-09"
---
# Story 004: 道具使用限制与有效构筑预算

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-040`, `AC-CMB-041`, `AC-CMB-042`, `AC-CMB-043`, `AC-CMB-044`  
**Related TR**: `TR-ITEM-001`, `TR-ITEM-002`, `TR-ITEM-003`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: HIGH

本 Story 控制道具滚雪球：每回合主动使用上限、同族修正上限、触发链上限、有效构筑预算和 rare 主动显式 usage。

## Acceptance Criteria

- [x] 每个战斗回合每名单位最多主动使用 1 件道具。
- [x] 同类数值修正同轮只取最高。
- [x] 同名被动不叠加。
- [x] 每战斗回合全场自动触发链最多 5 次，达到上限后写入日志。
- [x] 玩家可同时触发的被动必须受有效构筑预算限制；未装备被动不得触发。
- [x] rare 主动道具必须逐件显式声明 usage、charges 或消耗方式。

## Implementation Notes

- 推荐新增可测试的 item limit / build budget helper，而不是在 HUD 中判断。
- 有效构筑预算建议值：主动槽 4、被动预算 5；common 占 1，uncommon 占 2，rare 占 3。
- 若完整装备 UI 超出本 Story，可先在模拟层实现自动装备/预算约束，并登记 UI 后续债务。
- `counterplay` 不再作为玩家主文案，但可以保留规则字段。
- Control Manifest：道具效果、主动使用上限、被动预算和触发链必须由 `src/sim` 结算；HUD 不得按道具名称自行推断限制。
- 性能预算：预算筛选和同类修正解析只在背包变化、照面创建、手动使用道具和动作回合结算时运行，不进入 Phaser `update()` 高频循环。

## Out of Scope

- 不新增道具。
- 不重做全部背包 UI。
- 不改 AI 战术包评分，但敌人也必须遵守同一使用/触发限制。

## QA Test Cases

- **AC-1**: 每回合主动道具上限。
  - Given: 玩家同一战斗回合拥有两件可用主动道具。
  - When: 玩家使用第一件后尝试使用第二件。
  - Then: 第二件在本回合被拒绝或置灰，模拟层不结算效果。
  - Edge cases: 场外道具；敌人使用道具。

- **AC-2**: 同族修正只取最高。
  - Given: 同轮存在两个速度 +1/+2 修正。
  - When: 计算本轮速度修正。
  - Then: 只应用 +2。
  - Edge cases: 不同族修正；负向修正。

- **AC-3**: 被动预算限制。
  - Given: 玩家持有超过被动预算的多个被动道具。
  - When: 进入战斗触发被动。
  - Then: 只有预算内被动触发。
  - Edge cases: 同名被动；rare 被动；未装备被动。

- **AC-4**: 触发链上限。
  - Given: 多个被动可递归触发。
  - When: 同一战斗回合触发链超过 5 次。
  - Then: 第 6 次起停止解析并写入战斗日志。
  - Edge cases: 玩家和敌人同时触发。

## Test Evidence

**Story Type**: Integration  
**Required evidence**:
- `tests/integration/item_limits_build_budget_test.mjs` 或现有道具集成测试中的同名用例必须存在并通过。

**Status**: [x] Created and passing

## Completion Notes

- 新增 `src/sim/systems/itemLimitSystem.ts`，集中处理主动槽上限、被动预算、同名被动去重与 rare 主动道具 usage 审计。
- `src/sim/GameSimulation.ts` 已在玩家与敌人主动用道具路径执行每回合 1 件限制，并在被动触发路径按预算筛选有效被动。
- `src/sim/items.ts` 为手枪、绷带、长刀、回声针、霜凝钉、信号灯等 rare 主动道具补齐显式 usage 合约，掉落/消耗仍保留实例状态。
- `tests/integration/item_limits_build_budget_test.mjs` 覆盖本 Story 的 6 条验收；旧集成测试同步移除“一回合连开多件主动道具”的旧假设。
- 验证：`npm test` 105/105 通过；`npm run build` 通过。

## Dependencies

- Code Dependencies: `story-001-combat-matrix-effective-defense`
- Asset Dependencies: None
- Unlocks: Story 005、Story 006
