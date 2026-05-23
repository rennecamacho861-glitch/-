# v0.8.20 Item Tooltip Font Size Changelog

**Date**: 2026-05-23  
**Mode**: CCGS Lean / UI Polish  

## Summary

根据玩家反馈，道具鼠标悬浮时的效果介绍字号偏小，本轮提升背包道具 tooltip 的可读性。

## Changes

- 道具悬浮卡片宽度从 `260px` 提升到 `320px` 上限。
- 道具效果、使用限制、附魔效果说明字号提升到 `14px`。
- 悬浮卡片 padding 和段落间距略微增加，减少长中文说明的拥挤感。
- 移动端 tooltip 同步使用新的宽度上限，并继续受视口宽度约束。

## Validation

- `git diff --check`：通过，仅有既有 Windows CRLF 提示。
- `npm run build`：通过。

## Notes

本轮只调整 HUD 表现层样式，不修改规则、道具效果或模拟状态。
