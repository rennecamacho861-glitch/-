# Changelog: v0.8.10 被动装备独立图标补齐

日期：2026-05-18  
范围：资产规格、imagegen 源图、透明 PNG 切片、运行时图标映射、QA 证据。  
模式：Lean / Asset-only。

## 摘要

本轮为 v0.8.10 新增的 50 件网状被动装备补齐独立美术图标。此前这些装备已经进入 `src/sim/items.ts` 与 `passiveItemSystem.ts`，但在 `src/render/gridDungeonAssets.ts` 中复用旧图标；现在全部改为独立 `item-*` 资产端口。

本轮不修改玩法规则、触发端口、数值、稀有度、拾取池或敌人 AI。

## 新增资产

- 新增 imagegen 源图：
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-passive-grid-a-iter01.png`
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-passive-grid-b-iter01.png`
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-passive-grid-c-iter01.png`
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-passive-grid-d-iter01.png`
  - `CCGS-Data/design/art/source/grid-dungeon/item-icons-passive-grid-e-iter01.png`
- 新增 50 个运行时透明 PNG，覆盖 `servo-heel` 到 `data-spur` 的 v0.8.10 被动装备。

## 代码与配置

- 更新 `public/assets/grid-dungeon/manifest.json`：
  - 新增 50 个 item asset 条目。
  - 每张 5x2 源图使用 8px 内缩 source rect，避免生成图分隔线进入透明 PNG。
- 更新 `src/render/gridDungeonAssets.ts`：
  - `GRID_DUNGEON_ASSETS` 增加 50 个新资产。
  - `ITEM_ICON_ASSETS` 中 v0.8.10 的 50 个装备全部改为独立图标。
- 未改动 `src/sim/**`。

## 文档

- 新增资产规格：`CCGS-Data/design/assets/specs/grid-dungeon-passive-grid-item-icons-v0-8-10-assets.md`
- 更新主资产清单：`CCGS-Data/design/assets/asset-manifest.md`
  - 总资产数从 115 更新为 165。

## QA 证据

- 新增对照图：`CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-passive-grid-v0-8-10-contact-sheet.png`
- `scripts/art/extract-grid-item-icons.ps1` 成功输出 127 个 item icon，其中包含本轮新增 50 个。
- `scripts/art/validate-grid-assets.ps1` 通过：Validated 162 grid-dungeon assets。
- `npm test` 通过：83 tests passed。
- `npm run build` 通过：Vite build succeeded。

## 风险与备注

- 这批图标是原型可用级别，目标是让拾取、背包、情报和日志中不再出现 50 件装备复用旧图标的问题。
- `green-pulse` 采用蓝氰/琥珀语义而非绿色主体，避免被绿幕流程误扣。
