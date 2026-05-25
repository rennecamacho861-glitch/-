# v0.9.4 游戏外壳与产品化 UI Changelog

日期：2026-05-25  
类型：UI / UX / Art Asset / CCGS System Design  
状态：完成

## 改动摘要

- 新增 `Game Shell & Product UI` 系统 GDD：`CCGS-Data/design/gdd/metagame-shell-product-ui.md`。
- 更新 `systems-index.md`，将游戏外壳与产品化 UI 纳入 v0.9.4 Presentation 系统。
- 使用 imagegen 生成局外 UI 资产表，并将源图保存到 `CCGS-Data/design/art/source/metagame-ui/metagame-ui-shell-iter01.png`。
- 新增资产裁切脚本 `scripts/art/extract-metagame-ui-assets.ps1`，从绿底资产表裁切并扣出透明 PNG。
- 新增 10 个局外 UI 运行时资产：
  - `ui-shell-hero-bg`
  - `ui-tab-active`
  - `ui-tab-idle`
  - `ui-shop-header`
  - `ui-loadout-crate`
  - `ui-stash-locker`
  - `ui-panel-frame-wide`
  - `ui-brand-mark`
  - `ui-divider-strip`
  - `ui-button-plate`
- 更新 `public/assets/grid-dungeon/manifest.json` 与 `CCGS-Data/design/assets/asset-manifest.md`，新增 ASSET-166 到 ASSET-175。
- 局外大厅新增“主页”页面，并将默认局外入口改为主页。
- 主页提供进入战备、购买补给、选择地图和训练教程入口。
- 战备、商店、仓库、账号、地图页面接入新 UI 资产作为装饰和页面识别。

## 修改文件

- `src/main.ts`
- `src/styles.css`
- `public/assets/grid-dungeon/manifest.json`
- `public/assets/grid-dungeon/ui/*.png`
- `scripts/art/extract-metagame-ui-assets.ps1`
- `CCGS-Data/design/gdd/metagame-shell-product-ui.md`
- `CCGS-Data/design/gdd/systems-index.md`
- `CCGS-Data/design/ux/metagame-page-separation.md`
- `CCGS-Data/design/ux/metagame-page-patterns-2026-05-25.md`
- `CCGS-Data/design/art/metagame-ui-art-addendum-2026-05-25.md`
- `CCGS-Data/design/assets/specs/metagame-shell-ui-assets-v0-9-4.md`
- `CCGS-Data/design/assets/asset-manifest.md`

## 验证

- `scripts/art/validate-grid-assets.ps1` 通过。
- UI 资产尺寸与 alpha 通道检查通过。
- `npm run build` 通过。
- `npm test` 通过，132/132。
- `http://127.0.0.1:5188/` 返回 200。

## 注意

- 本轮只做产品化 UI 外壳与资产接入，不修改 `src/sim` 玩法规则。
- 浏览器截图证据未自动保存；当前环境未发现可用 Browser 自动化工具。
