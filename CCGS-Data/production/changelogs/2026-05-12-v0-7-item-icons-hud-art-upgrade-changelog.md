# Changelog — v0.7 Item Icons & HUD Art Upgrade

> **Date**: 2026-05-12  
> **Mode**: Lean / Visual + UI + Config  
> **Rule Source**: `CCGS-Data/design/gdd/rulebook.md`  
> **Architecture Source**: `CCGS-Data/project-docs/architecture/asset-presentation-port.md`

## Summary

完成 30 个扩展道具图标的 image-gen 源图入库、透明 PNG 切片、manifest 接入、渲染映射和 HUD/UI 美术升级。未修改 `src/sim` 规则与状态逻辑。

## Changed Files

- 新增 image-gen 源图：`CCGS-Data/design/art/source/grid-dungeon/item-icons-damage-iter01.png`、`item-icons-survival-iter01.png`、`item-icons-intel-iter01.png`。
- 新增 30 个透明 PNG：`public/assets/grid-dungeon/items/item-*.png`。
- 更新资产管线：`public/assets/grid-dungeon/manifest.json`、`scripts/art/extract-grid-assets.ps1`、`scripts/art/extract-grid-item-icons.ps1`。
- 更新资产追踪：`CCGS-Data/design/assets/specs/grid-dungeon-item-icons-v0-7-assets.md`、`CCGS-Data/design/assets/asset-manifest.md`。
- 更新运行时表现层：`src/render/gridDungeonAssets.ts`、`src/main.ts`、`src/styles.css`。
- 新增 UX 文档：`CCGS-Data/design/ux/interaction-patterns.md`、`CCGS-Data/design/ux/hud-v0-7-art-upgrade.md`。
- 新增回归测试：`tests/unit/item_icons.test.mjs`。

## Config / Asset Changes

- Asset manifest 总数从 35 更新到 65，新增 ASSET-036 至 ASSET-065。
- `GRID_DUNGEON_ASSETS` 增加 30 个 `item-*` 图标。
- `ITEM_ICON_ASSETS` 现在覆盖全部 37 个当前道具 ID。
- 新增快速图标切片脚本只处理 `item-icons-*` 源图，避免完整重切时逐像素处理过慢。

## UI Changes

- HUD 改为旧金属、暗青、琥珀、暗红的轻赛博废土风格。
- 背包道具按钮显示图标、名称、数量/充能，并按 `damage / survival / intel` 做类别边线。
- 拾取三选一卡片显示大图标、名称和效果描述。
- 战斗面板、toast、日志和状态栏统一为高对比金属面板。
- 移动端 stats 改为三列网格，修复窄屏横向溢出。

## Verification

- `powershell -ExecutionPolicy Bypass -File scripts/art/validate-grid-assets.ps1`：通过，65 assets validated。
- `npm test`：通过，33 tests passed。
- `npm run build`：通过；保留既有 Phaser/Vite chunk size warning。
- Edge headless 截图证据：
  - `CCGS-Data/production/qa/evidence/art/grid-dungeon/hud-v0-7-desktop.png`
  - `CCGS-Data/production/qa/evidence/art/grid-dungeon/hud-v0-7-mobile.png`
  - `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-v0-7-contact-sheet.png`

## Scope Check

- 计划内：30 个道具图标、去边透明化、asset manifest、render 映射、HUD/UI 美术升级、UX 文档、截图证据。
- 计划外但必要：新增 `tests/unit/item_icons.test.mjs`，用于固定“全部道具都有图标”的验收。
- 未改动：`src/sim` 规则、道具效果、敌人 AI、地图生成、战斗结算。

## Known Notes

- `npm run build` 仍提示主 bundle 超过 500 kB，这是既有 Phaser bundle warning，不是本轮新增错误。
- Headless Edge 截图命令会输出 Chromium task manager fallback 日志，但截图文件正常生成。
