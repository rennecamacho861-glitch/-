# Changelog: v0.8.8 新增道具独立图标补齐

日期：2026-05-18  
范围：资产规格、imagegen 源图、透明 PNG 切片、运行时图标映射、QA 证据。  
模式：Lean / Asset-only。

## 摘要

本轮为 23 个已经进入 `src/sim/items.ts`、但仍在 `src/render/gridDungeonAssets.ts` 复用旧图标的新增道具补齐独立美术资源。玩法规则、道具数值、AI 行为和掉落逻辑均未改变。

## 新增资产

- 新增 imagegen 源图：
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-status-kit-iter01.png`
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-tempo-passives-iter01.png`
- 新增 23 个运行时透明 PNG：
  - `item-sharpening-stone`、`item-glass-spike`、`item-tinder-vial`、`item-poison-needle`
  - `item-barbed-line`、`item-frost-nail`、`item-antidote-tablet`、`item-insulation-cloth`
  - `item-signal-mirror`、`item-folded-map`、`item-runner-knot`、`item-signal-flare`
  - `item-lead-wrap`、`item-ankle-spring`、`item-cracked-scope`、`item-spark-fuse`
  - `item-second-breath`、`item-rust-cloud`、`item-coal-beads`、`item-toxin-skein`
  - `item-cold-rivet`、`item-crit-hook`、`item-guard-breaker`

## 代码与配置

- 更新 `public/assets/grid-dungeon/manifest.json`，新增 23 个 item asset 条目与源图裁切区域。
- 更新 `src/render/gridDungeonAssets.ts`：
  - `GRID_DUNGEON_ASSETS` 增加 23 个新资产。
  - `ITEM_ICON_ASSETS` 中 23 个道具全部改为独立 `item-*` 图标。
  - 复用映射数量从 23 降为 0。
- 未改动 `src/sim/**`，不改变任何规则结算。

## 文档

- 新增资产规格：`CCGS-Data/design/assets/specs/grid-dungeon-newly-added-item-icons-v0-8-8-assets.md`
- 更新主资产清单：`CCGS-Data/design/assets/asset-manifest.md`
  - 总资产数从 92 更新为 115。

## QA 证据

- 新增对照图：`CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-newly-added-v0-8-5-contact-sheet.png`
- `scripts/art/extract-grid-item-icons.ps1` 成功输出 77 个 item icon，其中包含本轮新增 23 个。
- `scripts/art/validate-grid-assets.ps1` 已通过，当前验证 112 个 grid-dungeon 运行时资产。
- `npm test` 通过：82 tests passed。
- `npm run build` 通过：Vite build succeeded。

## 风险与备注

- `signal-flare`、`spark-fuse` 保留了少量火花/烟尘边缘色，这是图标语义的一部分；当前 alpha 校验通过。
- 这批资产为原型可用级别，后续若进入更高美术质量阶段，可按同一 manifest 端口替换源图与 PNG。
