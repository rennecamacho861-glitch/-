# v0.9.6 局外大厅与局内 HUD 边界 QA Report

## Verdict

PASS WITH NOTES

## Scope

验证局外大厅不显示局内 HUD，局外产品化页面占据主视图，进入关卡后再显示局内顶栏、背包、记录和重开条。

## Checks

| Check | Result | Evidence |
|---|---|---|
| Build | PASS | `npm run build` 通过 |
| Regression tests | PASS | `npm test` 132/132 通过 |
| Local server health | PASS | `Invoke-WebRequest http://127.0.0.1:5188/` 返回 200 |
| Lobby hides topbar | PASS BY CODE | `showRunHud = !meta || meta.activeRun` 控制 HUD 渲染 |
| Lobby expands panel | PASS BY CSS | `.metagame-panel.is-lobby` 使用 top/right/bottom/left 占据主视图 |
| Run HUD appears after start | PASS BY CODE | `meta.activeRun` 后恢复顶栏、侧栏和命令条 |
| Rule boundary | PASS | 未修改 `src/sim` |

## Manual Review Targets

- 进入关卡前不应看到时间、生命、战利、精神、智力、力量、速度、体质等局内 HUD。
- 进入关卡前不应看到右侧局内背包/记录栏。
- 局外行动页面应铺满主视图，不被旧顶栏压住。
- 进入关卡后局内 HUD 正常出现，并显示真实局内数值。

## Notes

- 当前会话未暴露可用的浏览器截图工具，发布前建议补桌面和移动端截图证据。
