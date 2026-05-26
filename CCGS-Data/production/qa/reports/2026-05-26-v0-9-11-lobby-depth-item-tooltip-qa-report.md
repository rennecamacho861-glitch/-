# QA Report: v0.9.11 Lobby Depth & Item Tooltip Unification

**Date**: 2026-05-26  
**Feature**: 主页面层次与道具说明统一  
**Verdict**: PASS WITH NOTES

## Automated Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS，132/132 |
| `rg -n "应对：\|itemEnemyCounter\(entry\.itemId\)" src tests` | PASS，源码中不再展示旧情报应对行；测试只保留防回归断言 |

## Structural Checks

- `src/main.ts` 不再从 HUD 引入 `itemEnemyCounter`，战斗情报道具 tooltip 改为 `itemUiDescription + itemUiLimit`。
- `tests/unit/item_text.test.mjs` 增加断言，防止 HUD 重新显示“应对：”或直接调用 `itemEnemyCounter(entry.itemId)`。
- `.side-panel` 层级高于 `.battle-panel`，右侧携带物 tooltip 可越过战斗面板显示。
- `.battle-panel` 改为允许 tooltip 溢出，日志本身仍由 `.rounds` 控制滚动。
- 主页面亮度通过背景径向光、卡片阴影、内描边和当前地图卡抬升增强，没有改动页面结构。
- `interaction-patterns.md` 已同步：Intel Tooltip 读取玩家文案端口，不展示 raw counterplay。

## Notes / Gaps

- 当前工具环境未生成浏览器截图证据；建议发布前补一次桌面截图，确认亮度提升后不会回到“全屏都很抢眼”的问题。
