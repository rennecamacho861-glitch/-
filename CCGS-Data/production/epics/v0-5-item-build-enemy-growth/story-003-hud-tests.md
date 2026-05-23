# Story 003: HUD 拾取弹窗与回归测试

状态：Done  
类型：UI / QA  
关联：`src/main.ts`、`src/render/GameScene.ts`、`tests/**`

## Acceptance Criteria

- [x] 地图渲染未清空道具节点。
- [x] HUD 移除搜索/屏息按钮。
- [x] HUD 在 `pendingPickupOffer` 存在时显示三选一弹窗和跳过按钮。
- [x] 道具按钮显示充能或数量。
- [x] `npm test` 与 `npm run build` 通过。

## Known Gap

- 浏览器截图证据仍受既有 `TD-002` 限制；本次完成自动化和构建验证。
