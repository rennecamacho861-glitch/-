# v0.8.19 Combat Clarity & Enchantment Display Changelog

**Date**: 2026-05-23  
**Mode**: CCGS Lean / P0 Hotfix  
**Related Spec**: `CCGS-Data/design/quick-specs/combat-clarity-enchantment-display-2026-05-23.md`

## Summary

修正玩家对防御、闪避和附魔道具的三类误解来源：低伤攻击被防御后现在能稳定形成有效防御优势；正确方向闪避失败会显示概率解释；附魔道具会在 HUD 道具介绍中显示具体附魔效果并拥有附魔边框。

## Files Changed

- `CCGS-Data/design/quick-specs/combat-clarity-enchantment-display-2026-05-23.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/combat-system.md`
- `CCGS-Data/design/ux/interaction-patterns.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/production/tracking/bug-tracker.md`
- `src/sim/GameSimulation.ts`
- `src/sim/itemText.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/integration/combat_clarity_feedback_test.mjs`
- `tests/unit/combat_system_effective_defense_test.mjs`
- `tests/unit/item_text.test.mjs`

## Implementation Notes

- 有效防御最低减伤从 2 点改为 1 点，避免低力量敌人的攻击被防御后仍不给优势。
- 玩家防御但没有拿到优势时，模拟层会弹出 `tutorial` 反馈，解释原因是未实际减免、普通防御不处理枪线，或伤害仍形成重伤。
- 玩家选择正确闪避方向但判定失败时，模拟层会弹出 `tutorial` 反馈，显示本次闪避率和判定值。
- `itemText.ts` 新增 `itemEnchantmentUiText(slot)`，由附魔承载模板生成具体玩家文案。
- HUD 背包按钮新增 `data-enchantment` 与附魔 tooltip 行；CSS 为六类附魔提供独立边框/辉光。

## Scope Check

计划内：

- 防御优势阈值与解释反馈。
- 正确方向闪避失败解释反馈。
- 附魔效果介绍和附魔边框。
- 自动化测试覆盖。

计划外：

- 未修改附魔实际战斗伤害/状态逻辑。
- 未修改拾取 offer 预生成附魔实例；当前自然附魔仍在实际加入背包时确定。
- 未新增截图证据，视觉部分通过构建和 CSS/DOM 结构测试验证。

## Validation

- `npm test`：127/127 通过。
- `npm run build`：通过。

## Known Follow-Up

- 若后续希望拾取三选一界面也提前显示自然附魔，需要把 `LootNode.offerItemIds` 扩展为实例级 offer slot，而不是只存 `ItemId`。
