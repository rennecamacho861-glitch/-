# Changelog: v0.6.2 废土朋克文本与道具命名候选

**Date**: 2026-05-09  
**Type**: Rules / Text Direction Candidate  
**Status**: Awaiting User Confirmation  

## Summary

为《照面之时》新增废土朋克文本方向候选：背景从抽象黑暗迷宫调整为旧城废墟、封存地堡和地下回收区；道具名称改为更具材料感和拾荒感的废土朋克命名。此次没有修改运行时代码。

## Changed

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/wasteland-punk-text-and-item-renaming-2026-05-09.md`。
- 在 `CCGS-Data/design/gdd/rulebook.md` 追加第 24 章：`v0.6.2 废土朋克文本与道具命名候选`。
- 在 `CCGS-Data/design/gdd/game-concept.md` 追加废土朋克世界观候选摘要。
- 同步 `docs/rulebook.md` 的开发副本。
- 明确 `ItemId` 不变，只替换玩家可见名称、描述、反制文本、HUD 文案和日志语气。
- 列出 37 件现有道具的废土朋克显示名。

## Not Changed

- 未修改 `src/sim/items.ts`。
- 未修改战斗、地图、AI、拾取、掉落、毒圈、空投、说服或数值公式。
- 未运行自动化测试；本次仅为规则与文本候选文档。

## Next

用户确认 v0.6.2 文本方向后，进入实装：更新 `items.ts`、`GameSimulation.ts`、`src/sim/systems/**`、`src/main.ts`，再运行 `npm test` 与 `npm run build`。
