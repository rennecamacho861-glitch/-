# v0.9.2 局外面板滚动位置保持 Changelog

日期：2026-05-25

## 变更摘要

- 修复商店购买、仓库带入、卖出、撤下等局外操作后，战备面板自动滚回顶部的问题。
- `renderHud()` 在重绘前读取 `.metagame-panel.is-lobby` 的 `scrollTop/scrollLeft`，重绘后恢复原位置。
- 保持现有局外操作与模拟端口不变。

## 主要文件

- `src/main.ts`

## 验证

- `npm run build` 通过。
- `npm test` 通过，132/132。

## 备注

- 本轮只修 UI 滚动状态，不改商店、仓库、战备或战斗规则。
