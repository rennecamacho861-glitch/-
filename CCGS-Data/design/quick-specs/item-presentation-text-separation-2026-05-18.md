# Quick Design Spec: 道具展示文案与规则字段分离

**Type**: Tweak  
**System**: 道具系统 / HUD 文案  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-18

## Change Summary

道具拾取卡、背包按钮、日志和情报道具悬浮不再直接展示 `ItemDefinition.description` 的规则/实现文本，而是展示独立的玩家向功能介绍。规则真源仍由 `usage / ports / effects / counterplay / rarity` 和规则书承担。

## Motivation

玩家在三选一道具时需要快速理解“拿了能做什么”，而不是阅读“橙色稀有”“反馈事件”“不再提供文字方向”等实现说明。展示文案应服务构筑选择；精确规则仍留给系统字段、测试和 GDD。

## Design Delta

Current GDD says:

> 玩家可见 `name`、`description`、`counterplay` 需要改为废土朋克文本。

This spec changes that to:

玩家可见道具介绍分为两层：  
1. `playerIntro`：拾取卡、背包按钮 title、选择日志、情报道具悬浮的主要介绍。必须用自然中文说明具体功能，不写稀有度、代码字段、反馈事件、实现约束。  
2. `counterplay`：只在需要解释反制空间的悬浮细节中展示，不替代主介绍。  

`ItemDefinition.description` 可继续作为规则摘要兼容字段，但 HUD 不得直接读取它作为玩家介绍。

## New Rules / Values

- 新增 `src/sim/itemText.ts`，提供 `itemUiDescription(itemId)`。
- `src/main.ts` 的拾取卡、背包 title、情报道具悬浮和生效中道具条改读 `itemUiDescription`。
- `GameSimulation.choosePickup()` 的玩家日志改读 `itemUiDescription`。
- 回声针展示文案：`释放一圈声波，标出一片四格回响区；目标就在其中一格。`
- 手枪展示文案：`视野内 4 格射击，命中造成 3 伤害；默认 5 发，子弹可由弹夹补充。`
- 绷带展示文案：`战斗外包扎伤口，回复 3 点生命。`

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| GDD Rulebook | 明确玩家展示文案与规则字段分离 | 更新 UI/道具文案规则 |
| Item Text | 新增玩家向文案读取层 | 新增 `itemText.ts` |
| HUD | 不再直接读 `description` | 更新 `main.ts` |
| Simulation Log | 拾取日志使用玩家向文案 | 更新 `GameSimulation` |
| Tests | 防止 UI 回退到规则字段 | 新增/更新单元测试 |

## Acceptance Criteria

- [ ] 开局三选一中的回声针、手枪、绷带不显示“橙色稀有”。
- [ ] 玩家可见道具介绍不出现 `FeedbackEvent`、`effectKey`、`useContext`、`ports` 等实现词。
- [ ] HUD 读取 `itemUiDescription()`，不直接把 `ITEMS[itemId].description` 展示在拾取卡和背包 title。
- [ ] 道具情报悬浮仍能显示反制空间，但主介绍使用玩家向文案。
- [ ] No regression：道具规则、稀有度、拾取、战斗和构建测试继续通过。

## GDD Update Required?

Yes. 更新 `rulebook.md` 的道具 UI 文案规则，明确展示文案、规则摘要、反制文本的边界。
