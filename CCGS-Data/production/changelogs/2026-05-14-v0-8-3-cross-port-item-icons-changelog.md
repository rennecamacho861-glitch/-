# Changelog — v0.8.3 Cross-Port Item Icons

> Date: 2026-05-14  
> Scope: 新增 v0.8.3 道具独立图标资产  
> Rule Source: `CCGS-Data/design/gdd/rulebook.md`

## Summary

为 `soot-hook`、`venom-saw`、`blood-knot`、`frost-latch`、`lens-thread`、`stitch-kit`、`tripwire-spool`、`red-compass`、`smoke-needle`、`thorn-plate` 补齐独立美术图标。此前这些道具在 `src/render/gridDungeonAssets.ts` 中复用旧图标；本轮已替换为独立 `item-*` 资源。

## Changes

- Image Gen: 新增绿底源图 `CCGS-Data/design/art/source/grid-dungeon/item-icons-cross-port-iter01.png`。
- Assets: 新增 10 个透明 PNG 到 `public/assets/grid-dungeon/items/`：
  - `item-soot-hook.png`
  - `item-venom-saw.png`
  - `item-blood-knot.png`
  - `item-frost-latch.png`
  - `item-lens-thread.png`
  - `item-stitch-kit.png`
  - `item-tripwire-spool.png`
  - `item-red-compass.png`
  - `item-smoke-needle.png`
  - `item-thorn-plate.png`
- Manifest: `public/assets/grid-dungeon/manifest.json` 追加 10 个资源条目，总 grid-dungeon 资产数更新为 81。
- Runtime: `src/render/gridDungeonAssets.ts` 追加 10 个 asset id，并将对应 `ItemId` 映射改为独立图标。
- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-cross-port-item-icons-v0-8-3-assets.md`。
- Asset Manifest: `CCGS-Data/design/assets/asset-manifest.md` 更新到 ASSET-081，总资产数 81。
- Evidence: 新增 `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-cross-port-v0-8-3-contact-sheet.png`。

## Verification

- `powershell -ExecutionPolicy Bypass -File scripts/art/validate-grid-assets.ps1`：通过，Validated 81 grid-dungeon assets.
- `npm test`：通过，63 tests passed.
- `npm run build`：通过；保留既有 Phaser vendor chunk size warning.

## Notes

- 本轮只做资产与表现映射，不修改 `src/sim` 道具规则。
- `venom-saw` 源图有毒液细节，绿幕扣图后 72px 对照图仍可读，暂接受为原型可用资产。
