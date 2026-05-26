# QA Report: v0.9.7 Responsive Map Carousel Lobby

**Date**: 2026-05-26
**Feature**: 局外响应式地图轮播大厅
**Verdict**: PASS WITH NOTES

## Automated Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS，132/132 |

## Manual / Structural Checks

- 局外大厅仍通过 `MetagamePort` 发出 `select-tier`、`start-run`、`set-meta-view`、购买、带入和出售指令。
- `src/sim` 未被修改，规则状态边界保持。
- 地图轮播按钮均为真实 button，可被点击/聚焦。
- 触屏长按 tooltip 会设置临时展示状态，并抑制随后的误点击。
- 新增 `npm run serve:dist` 作为构建后静态预览入口。

## Notes / Gaps

- 当前会话未暴露可用 Browser/Playwright 截图工具，因此本报告缺少桌面和手机截图证据。
- 后台持久化启动本地服务在当前 shell 包装器中会被回收；已提供 `npm run serve:dist` 作为同机预览命令。
- 建议发布前补一次真实浏览器截图：桌面 1365×768、手机 390×844，重点检查底部导航、地图卡层级和 tooltip 遮挡。
