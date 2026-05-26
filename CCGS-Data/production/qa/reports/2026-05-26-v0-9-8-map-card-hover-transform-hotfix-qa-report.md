# QA Report: v0.9.8 Map Card Hover Transform Hotfix

**Date**: 2026-05-26
**Feature**: 地图轮播 hover 位移修复
**Verdict**: PASS WITH NOTES

## Automated Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS，132/132 |

## Manual / Structural Checks

- `.meta-map-card.is-active:hover` 保留 `translate(-50%, -50%)`，不再被全局 button hover 覆盖。
- `.meta-map-card.is-prev:hover` 与 `.meta-map-card.is-next:hover` 保留各自露边 transform。
- 轮播箭头保留 `translateY(-50%)`，圆点 hover 不产生额外位移。

## Notes / Gaps

- 本轮未使用浏览器截图工具；修复依据为 CSS transform 覆盖链路和构建测试。
