# QA Report: v0.9.10 Metagame Lobby Visual Priority

**Date**: 2026-05-26  
**Feature**: 局外大厅视觉优先级降权  
**Verdict**: PASS WITH NOTES

## Automated Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS，132/132 |
| `http://127.0.0.1:5188/` | PASS，本地预览服务器返回 200 |

## Structural Checks

- 行动主页仍保留原有结构：顶部资源、地图轮播、入场检查、右侧导航、底部摘要。
- `src/main.ts` 只调整局外 DOM 标记与展示密度；没有修改 `src/sim`。
- 入场检查仍展示入场费、敌人区间、掉落档、携带数量、战备值和失败风险。
- 完整携带管理仍通过“调整背包”进入仓库页，符合现有 `MetagamePort` 边界。
- 紧凑携带预览使用 `profileSlotTooltipMarkup`，继续读取同一套道具玩家文案。
- 触屏长按 tooltip 选择器包含 `.meta-loadout-chip`，不会为移动端单独写一套规则文本。

## Manual / Visual Review Notes

- 预期桌面端第一视觉焦点为当前地图卡，其次为“开始行动”；右侧普通入口和底部摘要不应再像主卡片一样抢眼。
- 相邻地图卡只保留层级与切换暗示，降低玩家误读为三个并列主选项的概率。
- 顶部资源条用于确认状态，不再使用强边框和强琥珀权重。

## Notes / Gaps

- 本轮在当前工具环境中未补浏览器截图证据；后续发布前建议用桌面与移动尺寸各截一张，确认视觉降权后的层级是否符合玩家预期。
