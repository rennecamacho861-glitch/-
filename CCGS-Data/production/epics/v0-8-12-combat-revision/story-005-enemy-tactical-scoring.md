---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "ai-programmer"
type: "Integration"
estimate: "2天"
points: ""
dependencies: ["story-002-attack-direction-intel", "story-004-item-limits-build-budget"]
group: ""
sprint: ""
layer: "Feature"
manifest_version: "2026-05-09"
---
# Story 005: 敌人战术包评分与隐藏信息边界

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-060`, `AC-CMB-061`, `AC-CMB-062`  
**Related TR**: `TR-AI-001`, `TR-AI-002`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: HIGH

本 Story 将敌人 AI 从硬编码 item id 连携推进到能力/战术包评分，并禁止读取玩家隐藏真值。

## Acceptance Criteria

- [x] AI 战斗动作只能基于自身状态、可见状态和已知/推测信息，不得读取玩家隐藏真值。
- [x] AI 道具组合必须通过能力/战术包评分驱动，不得继续只靠新增 item id 特例。
- [x] 敌人拾取目标必须按价值、距离、风险和构筑缺口评分，不得永远选择最近节点。
- [x] AI 只产出 CombatAction 或移动目标，不直接改规则状态。
- [x] AI 与玩家共用 usage、charges、manual lock、被动触发链上限。

## Implementation Notes

- 推荐新增 `ItemCapability`、`TacticalPackage`、`ScoreBreakdown` 纯逻辑 helper。
- 首批战术包可覆盖：`BurnCrit`、`PoisonTempo`、`DodgeCounter`、`GuardIntel`、`AdvantagePress`、`RangedReload`、`RecoverEscape`、`LootHunter`。
- `Intent` 是 AI 内部字段，不进入玩家情报。
- 未知玩家属性使用保守默认或已知推测，不读真实隐藏字段。
- Control Manifest：AI 行为、拾取评分和隐藏信息边界必须由 `src/sim` 结算；HUD、渲染层和玩家情报面板不得反向决定 AI 选择。
- 性能预算：战术评分只在敌人选择移动目标、拾取目标或战斗动作时运行，不进入 Phaser `update()` 高频循环；单次评分只扫描当前可达候选与当前背包，不做全图反复深搜。

## Out of Scope

- 不做敌人协作。
- 不做共享情报网络。
- 不做临时同盟。
- 不新增敌人种类。

## QA Test Cases

- **AC-1**: AI 不读取玩家隐藏速度。
  - Given: 玩家真实速度高，但敌人没有速度情报。
  - When: 敌人选择行动或反制道具。
  - Then: 敌人不应精准基于真实速度选择石灰粉、钩绳等反制。
  - Edge cases: 敌人获得速度情报后；玩家速度被公开状态影响。

- **AC-2**: 战术包提高对应主动道具权重。
  - Given: 敌人持有燃烧收益被动和燃烧来源主动道具。
  - When: 敌人评分本回合行动。
  - Then: 燃烧来源行动分数高于无关主动道具。
  - Edge cases: 道具无次数；敌人低血；玩家不可见。

- **AC-3**: 拾取目标使用价值/距离/风险评分。
  - Given: 多个可达 LootNode，最近节点低价值，远处节点补全战术包。
  - When: 敌人选择寻物目标。
  - Then: 选择结果由评分决定，不固定最近点。
  - Edge cases: 毒圈风险；空投红点；节点被玩家清空。

## Test Evidence

**Story Type**: Integration  
**Required evidence**:
- `tests/integration/enemy_tactical_scoring_test.mjs` 或现有 AI 集成测试中的同名用例必须存在并通过。

**Status**: [x] Created and passing

## Completion Notes

- 新增 `src/sim/systems/enemyTacticalScoringSystem.ts`，集中承载敌人战斗道具评分、拾取目标评分和移动意图选择。
- 隐藏玩家属性边界已收紧：AI 评分默认把未知玩家属性视为保守值 `3`，只叠加公开的 active round effect；`enemySystem`、`enemyTacticalScoringSystem`、`lootSystem` 的 AI 评分路径不读取 `state.player.stats`。
- 战斗道具选择改为能力与战术包驱动，首批覆盖 `BurnCrit`、`PoisonTempo`、`DodgeCounter`、`GuardIntel`、`AdvantagePress`、`RangedReload`、`RecoverEscape`、`LootHunter`。
- 敌人拾取目标按候选道具价值、构筑缺口、距离惩罚和风险惩罚评分，支持为了补齐构筑而选择非最近 LootNode。
- `chooseEnemyAction` 和移动选择只返回 `CombatAction` / target / aiState，不直接修改 HP、效果、背包手动锁或地图节点。
- 验证：`npm test` 110/110 通过；`npm run build` 通过。

## Dependencies

- Code Dependencies: `story-002-attack-direction-intel`, `story-004-item-limits-build-budget`
- Asset Dependencies: None
- Unlocks: None
