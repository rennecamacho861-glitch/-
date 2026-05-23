# Grid Dungeon Newly Added Item Icons v0.8.8 Asset Spec

> Generated: 2026-05-18  
> Source: `src/sim/items.ts`, `src/render/gridDungeonAssets.ts`, `CCGS-Data/design/gdd/rulebook.md`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Scope: 为当前已实装但仍复用旧图标的 23 个新增道具补齐独立美术资源。  
> Status: 23 assets done / 23 approved for prototype use

## Shared Standard

- Category: UI Icon.
- Runtime format: transparent PNG.
- Runtime size: `72px x 72px`, displayed around `24px-36px` in HUD, pickup cards, combat item buttons, inventory and tooltip contexts.
- Style: top-down slight orthographic, light cyberpunk wasteland dungeon, old metal, dirty cloth, improvised low-weapon gear, low saturation.
- Palette: near-black metal, dark teal utility glow, dirty tan cloth, amber sparks, muted red leakage, blue-gray frost, dark violet toxin; avoid pure white and avoid green inside the object body.
- Chroma workflow: source sheets use pure green `#00ff00`; final PNG corners and background must be alpha transparent after despill.
- Runtime boundary: this pass only changes presentation assets and render-layer icon mappings. It does not change `src/sim` item rules, effects, rarity, charges or balance.

## Source Sheets

| Sheet | Layout | Source Size | Covered Items |
|---|---:|---:|---|
| `CCGS-Data/design/art/source/grid-dungeon/item-icons-status-kit-iter01.png` | `4 x 3` | `1409px x 1117px` | 12 status/template items |
| `CCGS-Data/design/art/source/grid-dungeon/item-icons-tempo-passives-iter01.png` | `4 x 3` | `1448px x 1086px` | 11 passive tempo items, final cell unused |

- Extraction script: `scripts/art/extract-grid-item-icons.ps1`
- Runtime output: `public/assets/grid-dungeon/items/`
- Manifest: `public/assets/grid-dungeon/manifest.json`
- QA contact sheet: `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-newly-added-v0-8-5-contact-sheet.png`

## Assets

| Asset ID | Runtime ID | Item ID | Visual Brief | Acceptance |
|---|---|---|---|---|
| ASSET-093 | item-sharpening-stone | sharpening-stone | 旧皮带捆住的粗磨刀石，边缘有少量暗琥珀火花。 | 与 `sleeve-stone` 区分为工具/磨石，而不是投掷石。 |
| ASSET-094 | item-glass-spike | glass-spike | 瓶玻璃碎片嵌在废金属握把里的刺器。 | 在小尺寸下读成玻璃近战刺，不误读成长刀或飞刀。 |
| ASSET-095 | item-tinder-vial | tinder-vial | 带油芯的小玻璃瓶，内部有脏橙色余烬。 | 与 `glow-stick` 区分为可点燃/灼烧来源。 |
| ASSET-096 | item-poison-needle | poison-needle | 细长腐蚀针筒，内有暗紫毒液，不使用绿色液体。 | 与治疗针剂区分为毒性攻击道具。 |
| ASSET-097 | item-barbed-line | barbed-line | 锈蚀倒刺线圈，外轮廓呈缠绕陷害感。 | 与 `ankle-line` 区分为造成流血的攻击线材。 |
| ASSET-098 | item-frost-nail | frost-nail | 蓝灰霜面的粗冷凝钉，材质粗糙。 | 与 `ice-awl` 区分为钉状冻结媒介。 |
| ASSET-099 | item-antidote-tablet | antidote-tablet | 黑色药片板与旧封蜡，呈废土解毒药语义。 | 与 `painkiller` 区分为清毒/片剂。 |
| ASSET-100 | item-insulation-cloth | insulation-cloth | 折叠的黑色橡胶绝缘布，带铜色缝线。 | 能读成防护布料，不像普通厚布衣。 |
| ASSET-101 | item-signal-mirror | signal-mirror | 破裂手持镜面，冷青反光明确。 | 与 `lens` 区分为主动信号/反射工具。 |
| ASSET-102 | item-folded-map | folded-map | 油污折叠地图卷，无可读文字。 | 在 24-36px 下仍读成路径/地图信息道具。 |
| ASSET-103 | item-runner-knot | runner-knot | 紧凑绳结与金属拉环，带一点暗红绑线。 | 与 `hook-rope` 区分为逃跑/拉开距离的小绳结。 |
| ASSET-104 | item-signal-flare | signal-flare | 短信号火筒，红色旧帽和脏橙烟火。 | 与 `tinder-vial` 区分为视野/暴露信号。 |
| ASSET-105 | item-lead-wrap | lead-wrap | 重铅缠带包在废金属芯上，轮廓沉重。 | 能读成力量增益装备，不像普通握柄。 |
| ASSET-106 | item-ankle-spring | ankle-spring | 露出弹簧的踝部支具，旧金属和红线。 | 与 `soft-shoes` 区分为速度启动装置。 |
| ASSET-107 | item-cracked-scope | cracked-scope | 破裂小准镜，镜片中有冷青裂纹。 | 与 `lens` / `signal-mirror` 区分为攻击瞄准件。 |
| ASSET-108 | item-spark-fuse | spark-fuse | 短火星引线，黑色外壳与小琥珀火花。 | 明确是首轮灼烧准备，不像信号火。 |
| ASSET-109 | item-second-breath | second-breath | 旧呼吸带/小气囊组件，布带环状。 | 与 `breath-cord` 区分为躲闪节奏增益。 |
| ASSET-110 | item-rust-cloud | rust-cloud | 破布粉囊喷出锈色粉尘。 | 与 `lime-powder` 区分为后期压制躲闪的锈粉。 |
| ASSET-111 | item-coal-beads | coal-beads | 黑煤珠串，其中一颗有暗琥珀余烬。 | 与 `counting-beads` 区分为灼烧联动道具。 |
| ASSET-112 | item-toxin-skein | toxin-skein | 暗紫毒丝线轴，旧金属线盘。 | 与 `venom-saw` 区分为毒线/减速联动。 |
| ASSET-113 | item-cold-rivet | cold-rivet | 低矮蓝灰冷铆钉，霜边克制不过曝。 | 与 `frost-latch` 区分为冻结后加伤媒介。 |
| ASSET-114 | item-crit-hook | crit-hook | 破口钩刃，红线缠柄，边缘危险。 | 与 `hook-rope` 区分为暴击后流血的攻击钩。 |
| ASSET-115 | item-guard-breaker | guard-breaker | 旧铁楔形破防板，磨损边缘有琥珀刮痕。 | 明确是破防/撬开防御的小型器具。 |

## Image Gen Prompt Records

### Status Kit Sheet

```text
Create a single green-screen icon asset sheet for a 2D top-down browser game. Exact layout: 4 columns by 3 rows, twelve separate item icons, each icon centered in its own equal cell on a solid pure chroma green background #00ff00. No text, no labels, no numbers, no arrows, no UI frames, no white background, avoid pure white highlights, avoid any green pixels inside the objects. Style: light cyberpunk wasteland dungeon, old metal, dirty cloth, cracked glass, dim dark-teal utility light, amber sparks, muted red leakage, readable silhouettes at 24-36px, hand-painted game icon look. Icon order: sharpening stone, glass spike, tinder vial, poison needle, barbed line, frost nail, antidote tablet, insulation cloth, signal mirror, folded map, runner knot, signal flare.
```

### Tempo Passive Sheet

```text
Create a single green-screen icon asset sheet for a 2D top-down browser game. Exact layout: 4 columns by 3 rows, eleven separate item icons in the first eleven cells, last bottom-right cell empty pure green. Each icon centered in its own equal cell on a solid pure chroma green background #00ff00. No text, no labels, no numbers, no arrows, no UI frames, no white background, avoid pure white highlights, avoid any green pixels inside the objects. Style: light cyberpunk wasteland dungeon, old metal, dirty cloth, rust, dark teal utility glow, amber sparks, muted red leakage, readable silhouettes at 24-36px, hand-painted game icon look. Icon order: lead wrap, ankle spring, cracked scope, spark fuse, second breath, rust cloud, coal beads, toxin skein, cold rivet, crit hook, guard breaker.
```

## QA Notes

- Two generated sheets were accepted for prototype use after transparent extraction and contact-sheet review.
- `validate-grid-assets.ps1` validated all runtime grid-dungeon assets after this pass.
- A small amount of warm spark/smoke detail remains on `signal-flare` and `spark-fuse`; it is intentional flame/smoke coloration and does not block alpha validation.
