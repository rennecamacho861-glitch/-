# QA Report — v0.8.4 Healing Item Icons

> Date: 2026-05-14  
> Scope: 8 个 v0.8.4 治疗续航道具图标资产接入验证  
> Verdict: PASS

## Tested Scope

- 8 个新增道具均拥有独立透明 PNG：
  - salve-tin
  - field-ration
  - charcoal-tablet
  - pressure-bandage
  - heat-pad
  - blood-sponge
  - mercy-thread
  - emergency-syringe
- `public/assets/grid-dungeon/manifest.json` 有对应条目，输出尺寸均为 72px。
- `src/render/gridDungeonAssets.ts` 的 `ITEM_ICON_ASSETS` 指向独立图标，不再复用旧资产。
- `tests/unit/item_icons.test.mjs` 覆盖所有 `ITEM_DEFINITIONS` 的图标资源可解析。

## Evidence

- Source image: `CCGS-Data/design/art/source/grid-dungeon/item-icons-healing-iter01.png`
- Contact sheet: `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-healing-v0-8-4-contact-sheet.png`

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| `validate-grid-assets.ps1` | PASS | Validated 89 grid-dungeon assets. |
| `npm test` | PASS | 67 tests passed. |
| `npm run build` | PASS | Vite build completed; existing Phaser vendor size warning remains. |

## Visual Review

- 图标背景已透明化，接触表未见明显绿色残边。
- 8 个道具在 72px 对照图中轮廓可读，且能区分药膏、口粮、药片、绷带、热垫、海绵、缝线和急救针。
- 风格符合轻赛博废土地牢：旧金属、脏布、暗红急救点和琥珀色治疗提示。

## Residual Risk

- 本轮没有做浏览器内拾取卡/背包栏截图；后续若继续 UI 美术，应补一次桌面与移动视觉复核。
