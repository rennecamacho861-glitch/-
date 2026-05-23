# Changelog — v0.7.1 Advantage Item Icons

> Date: 2026-05-13  
> Scope: 新增道具独立图标资产  
> Rule Source: `CCGS-Data/design/gdd/rulebook.md`

## Summary

为 v0.7 后新增的 6 个优势窗口/反制道具补齐独立美术图标，替换此前在渲染层临时复用旧图标的状态。此次只涉及资产、渲染映射和 CCGS 追踪文档，不修改 `src/sim` 玩法规则。

## Changes

- Image Gen: 新增源图 `CCGS-Data/design/art/source/grid-dungeon/item-icons-advantage-iter01.png`，包含 3x2 绿底图标表。
- Assets: 新增 6 个透明 PNG 到 `public/assets/grid-dungeon/items/`：
  - `item-rib-hook.png`
  - `item-ankle-line.png`
  - `item-chase-spur.png`
  - `item-counter-plate.png`
  - `item-panic-nail.png`
  - `item-focus-thread.png`
- Manifest: `public/assets/grid-dungeon/manifest.json` 纳入 6 个新资产，记录 source rect 和 72px 输出规格。
- Runtime: `src/render/gridDungeonAssets.ts` 已使用独立图标映射 6 个新增 `ItemId`，不再复用旧图标。
- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-advantage-item-icons-v0-7-1-assets.md`。
- Asset Manifest: `CCGS-Data/design/assets/asset-manifest.md` 更新到 ASSET-071，总资产数 71。
- Evidence: 新增 `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-advantage-v0-7-1-contact-sheet.png`。

## Verification

- `powershell -ExecutionPolicy Bypass -File scripts/art/validate-grid-assets.ps1`：通过，Validated 71 grid-dungeon assets.
- `npm test`：通过，35 tests passed.
- `npm run build`：通过；保留既有 Phaser vendor chunk size warning.

## Notes

- 本轮不改 `src/sim`，所以不会改变道具数值、触发时机或战斗流程。
- 6 个新增图标延续轻赛博废土地牢风格，避免纯白底和高饱和霓虹，适合 HUD/拾取卡 24px-36px 缩放显示。
