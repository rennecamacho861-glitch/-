# v0.9.4 游戏外壳 UI 资产审计报告

日期：2026-05-25  
范围：`public/assets/grid-dungeon/ui/`、`public/assets/grid-dungeon/manifest.json`、局外大厅 UI  
结论：PASS WITH NOTES

## Summary

- Total UI assets scanned: 13
- New UI assets: 10
- Naming violations: 0
- Missing referenced files: 0
- Format violations: 0
- Alpha channel check: 13/13 PNG 有 alpha 通道
- Overall health: MINOR ISSUES

## New Assets

| File | Size | Alpha | Purpose |
|---|---:|---|---|
| `ui-shell-hero-bg.png` | 1280x448 | Yes | 主页 hero 背景 |
| `ui-tab-active.png` | 360x96 | Yes | 当前页标签 |
| `ui-tab-idle.png` | 360x96 | Yes | 非当前页标签 |
| `ui-shop-header.png` | 640x112 | Yes | 商店页面装饰 |
| `ui-loadout-crate.png` | 512x224 | Yes | 战备页面装饰 |
| `ui-stash-locker.png` | 560x176 | Yes | 仓库页面装饰 |
| `ui-panel-frame-wide.png` | 560x192 | Yes | 通用页面装饰 |
| `ui-brand-mark.png` | 96x96 | Yes | 主页小型品牌底板 |
| `ui-divider-strip.png` | 640x28 | Yes | 页面分隔条 |
| `ui-button-plate.png` | 320x96 | Yes | 强调按钮底板 |

## Checks

- `scripts/art/validate-grid-assets.ps1`：通过，验证 172 个 grid-dungeon 运行时资产。
- UI PNG 尺寸检查：通过。
- UI PNG alpha 检查：通过。
- 代码引用检查：CSS 已引用 `/assets/grid-dungeon/ui/` 下新增资产。
- `public/assets/grid-dungeon/manifest.json`：已记录新增 10 个 UI 资产。
- `CCGS-Data/design/assets/asset-manifest.md`：已记录 ASSET-166 到 ASSET-175。

## Minor Issues

- 部分 imagegen 资产边缘存在极轻微绿幕残边；当前作为暗色 UI 背景/低透明装饰使用，风险可接受。
- 主页 hero 背景为 1280x448，体积约 1.2MB；当前可接受，后续公开发布前可再压缩。
- 本轮没有自动保存浏览器截图；需要发布前补桌面和移动端截图证据。

## Validation

- `npm run build`：通过。
- `npm test`：通过，132/132。
- `http://127.0.0.1:5188/`：返回 200。

## Verdict

PASS WITH NOTES。资产已可被当前 UI 使用，后续建议进行一次发布前压缩和截图验收。
