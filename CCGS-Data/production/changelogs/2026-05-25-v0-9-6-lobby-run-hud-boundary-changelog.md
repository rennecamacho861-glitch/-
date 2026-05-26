# v0.9.6 局外大厅与局内 HUD 边界 Changelog

## Summary

根据浏览器标注反馈，局外大厅不再显示局内顶栏、背包/记录侧栏和重开条。局外产品化页面扩展到完整视图；只有点击进入关卡并进入 active run 后，才显示局内 HUD 外框与真实局内数值。

## Files Changed

- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/production/changelogs/2026-05-25-v0-9-6-lobby-run-hud-boundary-changelog.md`
- `CCGS-Data/production/qa/reports/2026-05-25-v0-9-6-lobby-run-hud-boundary-qa-report.md`
- `CCGS-Data/production/session-state/active.md`

## Runtime Changes

- 新增 `showRunHud = !meta || meta.activeRun` 渲染边界。
- 局外状态隐藏：
  - 顶栏生命/时间/战利/属性 HUD。
  - 右侧携带物与记录面板。
  - 底部重开按钮条。
  - 局内拾取/战斗/结算浮层。
- 局外 `metagame-panel.is-lobby` 扩展为接近全屏终端，占用主视图空间。
- 进入关卡后仍显示原局内 HUD，并把标题从“游戏外壳 / 战备终端”改为“迷宫行动”。

## Validation

- `npm run build`：通过。
- `npm test`：132/132 通过。
- `http://127.0.0.1:5188/`：返回 200。

## Scope Check

- 计划内：UI/HUD 显示边界和局外布局。
- 计划外：无。
- 未修改：`src/sim` 规则、战斗、经济和地图逻辑。
