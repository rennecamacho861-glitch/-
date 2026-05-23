# Changelog — v0.8.4 Healing Item Icons

> Date: 2026-05-14  
> Scope: 新增 v0.8.4 治疗续航道具独立图标资产  
> Rule Source: `CCGS-Data/design/gdd/rulebook.md`

## Summary

为 v0.8.4 新增的 8 个治疗、续航、止损道具补齐独立图标：`salve-tin`、`field-ration`、`charcoal-tablet`、`pressure-bandage`、`heat-pad`、`blood-sponge`、`mercy-thread`、`emergency-syringe`。此前这些道具在渲染层复用旧图标，本轮已替换为独立 `item-*` 资源。

## Changes

- Image Gen: 新增绿底源图 `CCGS-Data/design/art/source/grid-dungeon/item-icons-healing-iter01.png`。
- Assets: 新增 8 个透明 PNG 到 `public/assets/grid-dungeon/items/`：
  - `item-salve-tin.png`
  - `item-field-ration.png`
  - `item-charcoal-tablet.png`
  - `item-pressure-bandage.png`
  - `item-heat-pad.png`
  - `item-blood-sponge.png`
  - `item-mercy-thread.png`
  - `item-emergency-syringe.png`
- Manifest: `public/assets/grid-dungeon/manifest.json` 追加 8 个资源条目，总 grid-dungeon 资产数更新为 89。
- Runtime: `src/render/gridDungeonAssets.ts` 追加 8 个 asset id，并将对应 `ItemId` 映射改为独立图标。
- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-healing-item-icons-v0-8-4-assets.md`。
- Asset Manifest: `CCGS-Data/design/assets/asset-manifest.md` 更新到 ASSET-089，总资产数 89。
- Evidence: 新增 `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-healing-v0-8-4-contact-sheet.png`。

## Verification

- `powershell -ExecutionPolicy Bypass -File scripts/art/validate-grid-assets.ps1`：通过，Validated 89 grid-dungeon assets.
- `npm test`：通过，67 tests passed.
- `npm run build`：通过；保留既有 Phaser vendor chunk size warning.

## Notes

- 本轮只做资产与表现映射，不修改 `src/sim` 治疗规则。
- 该批图标强调“废土医疗/续航”，避免现代医院洁净风格，以保持 Art Bible 的旧金属、脏布和低饱和暗光方向。
