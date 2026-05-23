# Asset Specs - system: grid-dungeon-map

> Source: `CCGS-Data/design/gdd/rulebook.md`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Generated: 2026-05-12  
> Status: 35 assets specced / 35 approved / 35 done

## Scope

本规格覆盖当前已经生产并准备接入运行时的 `grid-dungeon` 地图组件资产：地格、格边墙体、场景装饰、角色、HUD 框和核心道具图标。当前目标是 MVP 可读性和可复用拼装，不追求最终商业切片精度。

## Shared Technical Rules

- 运行时从 `/assets/grid-dungeon/` 读取资源。
- 所有资源必须登记在 `public/assets/grid-dungeon/manifest.json`。
- 72px 原画按 0.5 缩放到 36px 逻辑格。
- `src/render` 可读取资产 manifest/配置；`src/sim` 不得依赖任何图片路径。
- 普通非整格资源必须透明背景；地格和整格光效允许满帧。

## Asset List

| Asset ID | Runtime ID | Category | Dimensions | File | Status |
|---|---|---|---:|---|---|
| ASSET-001 | floor-normal | Environment | 72x72 | `tiles/floor-normal.png` | Done |
| ASSET-002 | floor-lit | Environment | 72x72 | `tiles/floor-lit.png` | Done |
| ASSET-003 | floor-memory | Environment | 72x72 | `tiles/floor-memory.png` | Done |
| ASSET-004 | floor-fog | Environment | 72x72 | `tiles/floor-fog.png` | Done |
| ASSET-005 | floor-exit | Environment | 72x72 | `tiles/floor-exit.png` | Done |
| ASSET-006 | wall-horizontal | Environment | 216x72 | `walls/wall-horizontal.png` | Done |
| ASSET-007 | wall-vertical | Environment | 72x216 | `walls/wall-vertical.png` | Done |
| ASSET-008 | wall-corner-ne | Environment | 144x144 | `walls/wall-corner-ne.png` | Done |
| ASSET-009 | wall-corner-se | Environment | 144x144 | `walls/wall-corner-se.png` | Done |
| ASSET-010 | wall-corner-sw | Environment | 144x144 | `walls/wall-corner-sw.png` | Done |
| ASSET-011 | wall-corner-nw | Environment | 144x144 | `walls/wall-corner-nw.png` | Done |
| ASSET-012 | wall-t-south | Environment | 216x144 | `walls/wall-t-south.png` | Done |
| ASSET-013 | wall-t-north | Environment | 216x144 | `walls/wall-t-north.png` | Done |
| ASSET-014 | wall-cross | Environment | 144x144 | `walls/wall-cross.png` | Done |
| ASSET-015 | wall-endcap | Environment | 72x72 | `walls/wall-endcap.png` | Done |
| ASSET-016 | wall-door-blocked | Environment | 216x72 | `walls/wall-door-blocked.png` | Done |
| ASSET-017 | prop-wall-lamp | Environment | 144x72 | `props/prop-wall-lamp.png` | Done |
| ASSET-018 | prop-broken-neon | Environment | 144x72 | `props/prop-broken-neon.png` | Done |
| ASSET-019 | prop-cable-bundle | Environment | 144x72 | `props/prop-cable-bundle.png` | Done |
| ASSET-020 | prop-cache-box | Environment | 72x72 | `props/prop-cache-box.png` | Done |
| ASSET-021 | prop-debris | Environment | 144x72 | `props/prop-debris.png` | Done |
| ASSET-022 | prop-red-leak | VFX | 72x72 | `props/prop-red-leak.png` | Done |
| ASSET-023 | actor-player | Sprite | 72x144 | `actors/actor-player.png` | Done |
| ASSET-024 | actor-enemy | Sprite | 72x144 | `actors/actor-enemy.png` | Done |
| ASSET-025 | actor-enemy-hint | VFX | 72x72 | `actors/actor-enemy-hint.png` | Done |
| ASSET-026 | ui-top-hud-frame | UI | 360x72 | `ui/ui-top-hud-frame.png` | Done |
| ASSET-027 | ui-inventory-strip | UI | 72x504 | `ui/ui-inventory-strip.png` | Done |
| ASSET-028 | ui-log-panel | UI | 288x216 | `ui/ui-log-panel.png` | Done |
| ASSET-029 | item-pistol | UI Icon | 72x72 | `items/item-pistol.png` | Done |
| ASSET-030 | item-bandage | UI Icon | 72x72 | `items/item-bandage.png` | Done |
| ASSET-031 | item-long-knife | UI Icon | 72x72 | `items/item-long-knife.png` | Done |
| ASSET-032 | item-trap | UI Icon | 72x72 | `items/item-trap.png` | Done |
| ASSET-033 | item-glasses | UI Icon | 72x72 | `items/item-glasses.png` | Done |
| ASSET-034 | item-glow-stick | UI Icon | 72x72 | `items/item-glow-stick.png` | Done |
| ASSET-035 | item-echo-needle | UI Icon | 72x72 | `items/item-echo-needle.png` | Done |

## Visual Descriptions And Prompts

### 地格组 ASSET-001 到 ASSET-005

冷灰旧砖和黑铁地面，格线清楚、污渍低对比，亮区有墙灯照出的冷白暗青光，记忆区压暗但仍保留格子边界。生成提示词：`top-down reusable 72px dungeon floor tile, square grid readable center, light cyberpunk wasteland, dirty concrete, old metal seams, dark teal light, amber utility glow, no labels, no arrows, no warning icon, chroma key only outside asset if sheeted`.

### 墙体组 ASSET-006 到 ASSET-016

墙体是格边阻挡的视觉表达，有厚度、顶边、破损旧金属、线缆和阴影，必须能沿 36px 逻辑格边拼接。生成提示词：`top-down slight orthographic modular wall segment, thin grid-edge blocker with real thickness, old concrete and metal, dirty cables, reusable straight corner T cross end cap, light cyberpunk wasteland dungeon, no labels, no floor arrows`.

### 场景装饰组 ASSET-017 到 ASSET-022

装饰表达地牢压迫和轻赛博废土，不替代规则提示；墙灯、破霓虹、线缆、补给箱、碎纸玻璃和红光门缝都必须服从格子可读性。生成提示词：`small reusable top-down dungeon prop, old metal, dirty cable, dim teal and amber practical light, subtle red leak where dangerous, no floating icon, no UI text`.

### 角色组 ASSET-023 到 ASSET-025

玩家和敌人都是低武装拾荒者轮廓，裹布、旧金属护具、暗青布料和少量红色传感点；敌人提示只显示墙后红光/噪声，不显示实体。生成提示词：`top-down slight orthographic wasteland dungeon raider sprite, old metal armor, dark teal cloth, subtle red warning glow, readable at 36px wide, transparent background, no floor`.

### UI 组 ASSET-026 到 ASSET-028

HUD 框用旧金属和半透明黑底，脏铜/暗青边线，服务信息承载，不做过度霓虹。生成提示词：`wasteland cyberpunk dungeon HUD frame, old black metal, dirty brass edge, transparent interior, readable game UI, no modern casino neon`.

### 道具图标组 ASSET-029 到 ASSET-035

核心道具图标为低武器械和旧补给，轮廓优先，72px 原画可缩至 HUD 24-36px。生成提示词：`top-down small item icon, low-tech wasteland gear, old metal and dirty cloth, strong silhouette, transparent background, no text, no label`.

## Known Gaps

- 30 件扩展小收益道具当前仍使用文字和类别表达，尚未逐一生产专属图标。
- `floor-danger` 文件仍可能存在于目录中，但不在 manifest 中，运行时不得加载；全局危险格已从规则中删除。
- 下一轮美术迭代建议补齐 30 件扩展道具图标，并重生更干净的墙体绿边版本。
