# 拾取面板居中与收起 QA 记录

日期：2026-07-06

## 范围

验证道具节点 / 开局装备拾取面板的 HUD 层改动：展开态居中并占据主要屏幕区域，收起态减少地图遮挡，拾取与跳过仍调用原有模拟层接口。

## 检查项

| 检查项 | 结果 | 说明 |
|---|---|---|
| 展开态居中 | PASS | `.pickup-panel` 使用 `top: 50%` 与 `transform: translate(-50%, -50%)`，不再沿用底部定位。 |
| 展开态主视觉面积 | PASS | 桌面端宽度提升到 `min(920px, calc(100vw - 72px))`，卡片最小高度提升到 260px。 |
| 收起 / 展开按钮 | PASS | `data-pickup-toggle="collapse/expand"` 已接入 HUD 点击处理。 |
| 新 offer 自动展开 | PASS | `lastPickupOfferKey` 变化时重置 `pickupPanelCollapsed = false`。 |
| 不改玩法规则 | PASS | 未修改 `src/sim`，拾取仍调用 `simulation.choosePickup(...)`。 |
| 移动端可读 | PASS | 窄屏下拾取卡改为单列滚动，收起态使用小浮窗。 |

## 自动验证

```powershell
npm test
npm run build
```

结果：

- `npm test`：141 个测试全部通过。
- `npm run build`：通过。

## 未完成证据

浏览器截图未生成。原因：当前工作区没有 Playwright 依赖，REPL 方式导入 Playwright 也受到本地权限限制。需要人工在 `http://127.0.0.1:5188/` 刷新确认最终视觉。

