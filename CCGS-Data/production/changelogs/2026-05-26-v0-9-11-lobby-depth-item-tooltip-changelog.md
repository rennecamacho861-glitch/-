# Changelog: v0.9.11 Lobby Depth & Item Tooltip Unification

**Date**: 2026-05-26  
**Mode**: Lean / UI Tweak  
**Scope**: 主页面层次感、战斗 tooltip 层级、道具说明统一

## Changed

- 在不恢复杂乱高亮的前提下，提高局外主页面亮度：增加顶部环境光、地图主舞台暖光/冷光、当前地图卡抬升阴影和入场检查面板层次。
- 右侧携带物面板层级提高，携带物 tooltip 在战斗中不再被战斗面板压住。
- 战斗面板允许内部情报 tooltip 溢出显示，不再被面板自身裁切。
- 战斗情报里的道具 tooltip 移除“应对：……”行，改为和背包/商城一致的“效果说明 + 使用限制”。
- 更新交互模式库，明确 Intel Tooltip 读取玩家文案端口，不展示 raw counterplay。

## Files Changed

- `CCGS-Data/design/quick-specs/lobby-depth-and-item-tooltip-unification-2026-05-26.md`
- `CCGS-Data/design/ux/interaction-patterns.md`
- `src/main.ts`
- `src/styles.css`
- `tests/unit/item_text.test.mjs`
- `CCGS-Data/production/qa/reports/2026-05-26-v0-9-11-lobby-depth-item-tooltip-qa-report.md`

## Notes

- 本轮不修改 `src/sim` 道具效果、战斗结算或局外经济。
- `itemEnemyCounter` 文案端口暂保留，供未来百科或敌方情报扩展使用；当前 HUD 不再把它混入道具基础说明。
