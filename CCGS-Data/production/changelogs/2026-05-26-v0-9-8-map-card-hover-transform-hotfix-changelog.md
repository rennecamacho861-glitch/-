# Changelog: v0.9.8 Map Card Hover Transform Hotfix

**Date**: 2026-05-26
**Mode**: Hotfix
**Scope**: 局外地图轮播 hover 位移

## Fixed

- 修复局外地图卡悬浮时跳到右下角的问题。
- 原因是地图卡使用 `button` 元素，受到全局 `button:hover { transform: translateY(-1px) }` 影响，覆盖了地图卡用于居中和露边的 transform。
- 为当前地图、左右相邻地图、轮播箭头和圆点增加局部 hover/focus transform 覆盖，保留原本位置。

## Files Changed

- `src/styles.css`
- `CCGS-Data/production/qa/reports/2026-05-26-v0-9-8-map-card-hover-transform-hotfix-qa-report.md`

## Notes

- 本轮只修表现层 CSS，不修改 `src/sim` 和局外规则。
