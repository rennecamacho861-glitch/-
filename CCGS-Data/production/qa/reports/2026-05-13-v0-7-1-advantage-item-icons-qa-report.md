# QA Report — v0.7.1 Advantage Item Icons

> Date: 2026-05-13  
> Scope: 新增 6 个道具图标资产接入验证  
> Verdict: PASS

## Tested Scope

- 6 个新增道具均拥有独立透明 PNG：
  - rib-hook
  - ankle-line
  - chase-spur
  - counter-plate
  - panic-nail
  - focus-thread
- `public/assets/grid-dungeon/manifest.json` 对应条目存在，尺寸输出为 72px。
- `src/render/gridDungeonAssets.ts` 的 `ITEM_ICON_ASSETS` 指向独立图标资源。
- `tests/unit/item_icons.test.mjs` 覆盖所有 `ITEM_DEFINITIONS` 的图标资源可解析。

## Evidence

- Source image: `CCGS-Data/design/art/source/grid-dungeon/item-icons-advantage-iter01.png`
- Contact sheet: `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-advantage-v0-7-1-contact-sheet.png`

## Automated Checks

| Check | Result | Notes |
|---|---|---|
| `validate-grid-assets.ps1` | PASS | Validated 71 grid-dungeon assets. |
| `npm test` | PASS | 35 tests passed. |
| `npm run build` | PASS | Vite build completed; existing Phaser vendor size warning remains. |

## Visual Review

- 图标背景已透明化，未见明显绿边进入对照图。
- 6 个道具在 72px 证据图中轮廓可读，风格与既有废土地牢图标一致。
- `counter-plate` 与 `wood-shield`、`rib-hook` 与 `hook-rope`、`chase-spur` 与 `adrenaline-shot` 已通过独立剪影降低混淆。

## Residual Risk

- 本轮没有启动浏览器截图，因为修改只涉及图标资产和映射；后续若继续调整 HUD 卡片尺寸，应在拾取三选一和背包栏中做一次桌面/移动视觉复核。
