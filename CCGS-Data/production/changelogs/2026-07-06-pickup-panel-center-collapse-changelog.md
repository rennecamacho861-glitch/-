# 拾取三选一面板居中与收起 Changelog

日期：2026-07-06

## Summary

根据 UI 反馈，将道具节点 / 开局装备的拾取选择面板从底部小面板调整为屏幕中央主面板，并新增收起 / 展开按钮。展开态用于强化三选一构筑决策，收起态用于减少遮挡，方便玩家阅读迷宫地图。

## Changed

- `src/main.ts`
  - 新增 `pickupPanelCollapsed` 与 `lastPickupOfferKey` 状态。
  - 新增 `data-pickup-toggle` 交互，支持拾取面板收起与展开。
  - 新道具 offer 出现时自动恢复展开，避免玩家错过选择。
  - 选择道具或跳过时自动清理收起状态。

- `src/styles.css`
  - 展开态 `.pickup-panel` 改为屏幕中央大面板，占据主要视觉面积。
  - 拾取卡片增大，三张候选在桌面端横向并列。
  - 收起态 `.pickup-panel.is-collapsed` 改为小型浮窗，只保留标题和展开按钮。
  - 补充移动端布局：窄屏下候选卡纵向滚动，避免文本和按钮溢出。

## Architecture Notes

- 未修改 `src/sim`，拾取规则、暂停逻辑、三选一结果与跳过逻辑保持不变。
- UI 状态只存在于 `src/main.ts` 的 HUD 层，不写入 `GameState`。

## Verification

- `npm test`：141/141 通过。
- `npm run build`：通过。
- Playwright 当前未安装，`node -e "require('playwright')"` 返回 `playwright-missing`；本轮未生成浏览器截图证据。

