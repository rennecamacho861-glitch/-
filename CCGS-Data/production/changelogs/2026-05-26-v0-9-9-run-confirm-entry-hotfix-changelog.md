# Changelog: v0.9.9 Run Confirm Entry Hotfix

**Date**: 2026-05-26
**Mode**: Hotfix
**Scope**: 局外地图进入关卡确认

## Fixed

- 修复玩家点击当前地图卡时只切换/停留在地图轮播、没有明确进入关卡反馈的问题。
- 点击当前地图卡或“开始行动”现在会弹出“确认进入地图”窗口。
- 确认窗口展示当前地图、入场费、战备、敌人数值区间和携带物；点击“确认进入”后调用现有 `startRun` 端口进入局内。
- 若金币不足或战备超限，确认窗口会显示原因并禁用确认按钮。

## Files Changed

- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/production/qa/reports/2026-05-26-v0-9-9-run-confirm-entry-hotfix-qa-report.md`

## Notes

- 本轮不修改 `src/sim`，只在 DOM HUD 层增加进入确认交互。
