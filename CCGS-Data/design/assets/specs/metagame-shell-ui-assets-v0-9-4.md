# Asset Specs - System: Metagame Shell UI

> Source: `CCGS-Data/design/ux/metagame-shell-product-ui.md`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Generated: 2026-05-25  
> Status: 10 assets specced / 10 approved / 10 done

## Shared Direction

全部资产遵循“轻赛博废土地牢战备终端”：旧金属、暗青灯、琥珀操作光、少量暗红泄光，避免纯白、高饱和霓虹和现代商城感。来源使用 imagegen 绿底资产表 `metagame-ui-shell-iter01.png`，经 `scripts/art/extract-metagame-ui-assets.ps1` 裁切并扣除绿底。

## ASSET-166 - ui-shell-hero-bg

| Field | Value |
|---|---|
| Category | UI Background |
| Dimensions | 1280x448 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-shell-hero-bg.png` |
| Source | `CCGS-Data/design/art/source/metagame-ui/metagame-ui-shell-iter01.png` |
| Status | Done |

主页战备终端背景。用于承载游戏名、目标摘要和进入战备的主入口。

## ASSET-167 - ui-tab-active

| Field | Value |
|---|---|
| Category | UI Chrome |
| Dimensions | 360x96 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-tab-active.png` |
| Status | Done |

当前页面标签底板。琥珀/暗青边缘需要明显强于普通标签。

## ASSET-168 - ui-tab-idle

| Field | Value |
|---|---|
| Category | UI Chrome |
| Dimensions | 360x96 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-tab-idle.png` |
| Status | Done |

非当前页面标签底板。保持可点击但低亮度。

## ASSET-169 - ui-shop-header

| Field | Value |
|---|---|
| Category | UI Header |
| Dimensions | 640x112 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-shop-header.png` |
| Status | Done |

商店页面标题装饰，用来强化“交易终端/补给柜台”的页面身份。

## ASSET-170 - ui-loadout-crate

| Field | Value |
|---|---|
| Category | UI Header |
| Dimensions | 512x224 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-loadout-crate.png` |
| Status | Done |

战备页面装备箱装饰，用来强化“准备进场”的空间感。

## ASSET-171 - ui-stash-locker

| Field | Value |
|---|---|
| Category | UI Header |
| Dimensions | 560x176 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-stash-locker.png` |
| Status | Done |

仓库页面储物柜装饰，用于库存页面的顶部识别。

## ASSET-172 - ui-panel-frame-wide

| Field | Value |
|---|---|
| Category | UI Chrome |
| Dimensions | 560x192 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-panel-frame-wide.png` |
| Status | Done |

通用宽面板装饰。用于账号页和地图页的低频装饰，不承载核心文本。

## ASSET-173 - ui-brand-mark

| Field | Value |
|---|---|
| Category | UI Mark |
| Dimensions | 96x96 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-brand-mark.png` |
| Status | Done |

游戏外壳小型品牌标记底板，不包含文字 logo，后续可替换为正式图标。

## ASSET-174 - ui-divider-strip

| Field | Value |
|---|---|
| Category | UI Chrome |
| Dimensions | 640x28 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-divider-strip.png` |
| Status | Done |

终端分隔条。用于主页和局外页面分隔信息层。

## ASSET-175 - ui-button-plate

| Field | Value |
|---|---|
| Category | UI Chrome |
| Dimensions | 320x96 PNG |
| Runtime Path | `public/assets/grid-dungeon/ui/ui-button-plate.png` |
| Status | Done |

强调按钮底板。用于开始行动、进入战备等关键 CTA 的视觉增强。
