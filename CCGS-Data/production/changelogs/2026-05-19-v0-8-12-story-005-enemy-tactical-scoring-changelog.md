# Changelog - v0.8.12 Story 005 敌人战术包评分与隐藏信息边界

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`  
类型：Integration / AI Logic  
状态：Complete

## Summary

本次将敌人 AI 的战斗道具选择、拾取目标选择和移动意图从零散规则推进为纯模拟层评分系统。AI 现在通过道具能力、战术包、可见状态、公开效果和自身资源做决策，同时避免读取玩家隐藏属性真值。

## Changed Files

- `src/sim/systems/enemyTacticalScoringSystem.ts`
- `src/sim/systems/enemySystem.ts`
- `src/sim/systems/lootSystem.ts`
- `tests/integration/enemy_tactical_scoring_test.mjs`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`
- `CCGS-Data/production/session-state/active.md`

## Gameplay / AI Changes

- 新增 `enemyTacticalScoringSystem`，提供敌人战斗道具评分、拾取评分、拾取目标选择和移动目标选择。
- AI 未知玩家属性时使用保守默认值 `3`，只叠加公开的 active round effect；敌人评分路径不读取 `state.player.stats`。
- 道具选择改为能力与战术包驱动，首批覆盖 `BurnCrit`、`PoisonTempo`、`DodgeCounter`、`GuardIntel`、`AdvantagePress`、`RangedReload`、`RecoverEscape`、`LootHunter`。
- 敌人拾取目标现在综合候选道具价值、构筑缺口、距离惩罚和风险惩罚，允许为了补齐构筑而放弃最近低价值节点。
- `enemySystem` 只接收评分系统返回的 `CombatAction` 或移动目标，不在 AI 评分 helper 内直接修改战斗状态。
- `lootSystem` 的敌人拾取评分复用同一套能力评分，并保留低血治疗、手枪弹夹兼容修正。

## Scope Notes

- 未改动 `src/render`、Phaser Scene 或 DOM HUD。
- 未新增敌人种类、共享情报、敌人协作或临时同盟。
- 未新增道具内容；本次只让既有道具更可解释地被 AI 使用。

## Verification

- `npm test`：110/110 passed。
- `npm run build`：通过。
- 重点覆盖：隐藏信息边界、战术包评分、拾取目标评分、AI 决策纯度、charges/manual lock/usage 限制。

