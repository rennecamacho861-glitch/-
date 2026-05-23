# v0.8.21 Stable Defense vs Attack Changelog

**Date**: 2026-05-23  
**Mode**: CCGS Lean / Combat Tweak  
**Related Spec**: `CCGS-Data/design/quick-specs/stable-defense-vs-attack-advantage-2026-05-23.md`

## Summary

根据玩家反馈，将基础近战 `Attack` 打进 `Defense` 的优势结算改为稳定防御胜出。攻击仍可造成被防御减免后的伤害，但攻击方不再因为防御后小额伤害、显著伤害或重伤结果反抢该回合优势。

## Files Changed

- `CCGS-Data/design/quick-specs/stable-defense-vs-attack-advantage-2026-05-23.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/combat-system.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/production/tracking/bug-tracker.md`
- `src/sim/GameSimulation.ts`
- `tests/unit/combat_system_effective_defense_test.mjs`

## Implementation Notes

- `resolveMeleeAttack()` 中，防御承受基础近战攻击时直接标记 `defense.effective = true`。
- 近战重伤优势不再覆盖基础近战打进防御的有效防御优势，除非生命归零触发击败/失败。
- 远程 `Ranged` 仍保持原边界：左轮枪线不被普通防御稳定克制；只有盾类等明确减伤效果可参与远程有效防御判定。
- 敌人获得防御优势后仍沿用现有 AI：会立刻把优势压成下一次速度或尝试后撤，因此 HUD 上不一定长期显示敌方优势点。

## Validation

- `npm test`：129/129 通过。
- `npm run build`：通过。

## Known Follow-Up

- 若玩家仍难以察觉敌人防御后获得优势，可追加战斗日志/HUD 提示，明确显示“敌人防御成功，已把优势压成速度”。
