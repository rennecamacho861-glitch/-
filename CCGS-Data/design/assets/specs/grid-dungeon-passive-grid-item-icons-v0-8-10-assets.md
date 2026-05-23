# Grid Dungeon Passive Grid Item Icons v0.8.10 Asset Spec

> Generated: 2026-05-18  
> Source: `CCGS-Data/design/quick-specs/passive-item-grid-expansion-2026-05-18.md`, `CCGS-Data/design/gdd/rulebook.md`, `src/sim/items.ts`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Scope: 为 v0.8.10 新增 50 件网状被动装备补齐独立美术图标。  
> Status: 50 assets done / 50 approved for prototype use

## Shared Standard

- Category: UI Icon.
- Runtime format: transparent PNG.
- Runtime size: `72px x 72px`，在 HUD、拾取三选一、背包、情报悬浮和战斗日志中缩放到 `24px-36px`。
- Style: top-down slight orthographic, light cyberpunk wasteland dungeon, old metal, dirty cloth, improvised low-weapon equipment, low saturation.
- Palette: near-black metal, dark teal utility glow, dirty tan cloth, amber sparks, muted red leakage, blue-gray frost, dark violet toxin. 绿色只允许作为源图抠图背景，不进入图标主体。
- Chroma workflow: source sheets use pure green `#00ff00`; final PNG corners and background must be alpha transparent after despill.
- Runtime boundary: this pass only changes presentation assets and render-layer mappings. It does not change passive trigger rules, rarity, item effects, pickup weights or balance.

## Source Sheets

| Sheet | Layout | Source Size | Covered Items |
|---|---:|---:|---|
| `item-icons-passive-grid-a-iter01.png` | `5 x 2` | `1983px x 793px` | 持续生效、首回合、次回合前段 |
| `item-icons-passive-grid-b-iter01.png` | `5 x 2` | `1983px x 793px` | 次回合后段、三回合后、闪避成功 |
| `item-icons-passive-grid-c-iter01.png` | `5 x 2` | `1983px x 793px` | 防御成功、造成重伤、燃烧触发 |
| `item-icons-passive-grid-d-iter01.png` | `5 x 2` | `1983px x 793px` | 中毒、冻结、暴击、受伤前段 |
| `item-icons-passive-grid-e-iter01.png` | `5 x 2` | `1983px x 793px` | 受伤后段、高伤、重伤受击、低血、情报 |

- Extraction script: `scripts/art/extract-grid-item-icons.ps1`
- Runtime output: `public/assets/grid-dungeon/items/`
- Manifest: `public/assets/grid-dungeon/manifest.json`
- QA contact sheet: `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-passive-grid-v0-8-10-contact-sheet.png`

## Assets

| Asset ID | Runtime ID | Item ID | Trigger Group | Visual Brief |
|---|---|---|---|---|
| ASSET-116 | item-servo-heel | servo-heel | combatStart | 旧靴跟与伺服活塞，强调速度常驻。 |
| ASSET-117 | item-mnemonic-plate | mnemonic-plate | combatStart | 刻痕记忆钢片，无文字，强调智力/情报。 |
| ASSET-118 | item-knuckle-core | knuckle-core | combatStart | 重型指节铁芯，强调力量常驻。 |
| ASSET-119 | item-exit-charm | exit-charm | combatStart | 逃生符牌与红线，强调撤离修正。 |
| ASSET-120 | item-opener-gear | opener-gear | firstRound | 带弹簧的开局齿轮，强调首回合速度。 |
| ASSET-121 | item-first-glint | first-glint | firstRound | 破金属反光片，强调首回合情报。 |
| ASSET-122 | item-pilot-flame | pilot-flame | firstRound | 小型引燃喷头，强调燃烧准备。 |
| ASSET-123 | item-rawhide-guard | rawhide-guard | firstRound | 生皮护边与铆钉，强调首回合闪避保护。 |
| ASSET-124 | item-second-gear | second-gear | secondRound | 双齿轮与棘轮，强调次回合力量。 |
| ASSET-125 | item-coolant-breath | coolant-breath | secondRound | 冷却气囊/呼吸罐，强调次回合回血。 |
| ASSET-126 | item-second-sight | second-sight | secondRound | 双镜片校准器，强调次回合智力。 |
| ASSET-127 | item-venom-timer | venom-timer | secondRound | 暗紫毒液计时器，强调延时中毒。 |
| ASSET-128 | item-long-fuse | long-fuse | thirdRoundPlus | 长引线线圈，强调拖长后的燃烧准备。 |
| ASSET-129 | item-fatigue-tax | fatigue-tax | thirdRoundPlus | 疲劳刻痕板，强调重伤阈值压低。 |
| ASSET-130 | item-bunker-prayer | bunker-prayer | thirdRoundPlus | 地堡祈牌与布包，强调拖局回血。 |
| ASSET-131 | item-escape-count | escape-count | thirdRoundPlus | 逃生计数绳，强调后段逃跑修正。 |
| ASSET-132 | item-spring-step | spring-step | onDodgeSuccess | 弹簧步带，强调闪避后速度。 |
| ASSET-133 | item-dust-kicker | dust-kicker | onDodgeSuccess | 扬尘踢板，强调闪避反伤。 |
| ASSET-134 | item-slip-venom | slip-venom | onDodgeSuccess | 滑毒线轴，强调闪避后中毒。 |
| ASSET-135 | item-dodge-reader | dodge-reader | onDodgeSuccess | 侧闪读片，强调闪避后情报。 |
| ASSET-136 | item-guard-lens | guard-lens | onDefendSuccess | 防御镜片与腕护，强调防御情报。 |
| ASSET-137 | item-brace-piston | brace-piston | onDefendSuccess | 护架活塞，强调防御后力量。 |
| ASSET-138 | item-shield-spark | shield-spark | onDefendSuccess | 盾火碎片，强调防御反烧。 |
| ASSET-139 | item-calm-mouthpiece | calm-mouthpiece | onDefendSuccess | 稳声咬嘴，强调防御后说服。 |
| ASSET-140 | item-wound-motor | wound-motor | onHeavyWoundDealt | 伤口马达，强调重伤后速度。 |
| ASSET-141 | item-crack-reader | crack-reader | onHeavyWoundDealt | 裂纹读片，强调重伤后情报。 |
| ASSET-142 | item-crush-salt | crush-salt | onHeavyWoundDealt | 压碎盐包，强调重伤后冻结。 |
| ASSET-143 | item-ember-step | ember-step | onStatusApplied:burn | 余烬踏板，强调燃烧后速度。 |
| ASSET-144 | item-heat-read | heat-read | onStatusApplied:burn | 热读镜条，强调燃烧后情报。 |
| ASSET-145 | item-ash-threshold | ash-threshold | onStatusApplied:burn | 灰线刻尺，强调燃烧后重伤阈值。 |
| ASSET-146 | item-toxic-focus | toxic-focus | onStatusApplied:poison | 毒焦环，强调中毒后暴击。 |
| ASSET-147 | item-bitter-mouth | bitter-mouth | onStatusApplied:poison | 苦味咬嘴，强调中毒后说服。 |
| ASSET-148 | item-green-pulse | green-pulse | onStatusApplied:poison | 蓝氰脉冲管，强调中毒后回血。 |
| ASSET-149 | item-ice-step | ice-step | onStatusApplied:freeze | 冰步扣，强调冻结后闪避。 |
| ASSET-150 | item-cold-reader | cold-reader | onStatusApplied:freeze | 冷读针，强调冻结后情报。 |
| ASSET-151 | item-shatter-pin | shatter-pin | onStatusApplied:freeze | 碎冰针，强调冻结后伤害。 |
| ASSET-152 | item-crit-lens | crit-lens | onCrit | 暴击镜片，强调暴击后情报。 |
| ASSET-153 | item-white-spark | white-spark | onCrit | 暖白火星塞，强调暴击后燃烧。 |
| ASSET-154 | item-snap-sinew | snap-sinew | onCrit | 响筋线，强调暴击后速度。 |
| ASSET-155 | item-pain-wheel | pain-wheel | onDamageTaken | 痛轮，强调受伤后力量。 |
| ASSET-156 | item-blood-map | blood-map | onDamageTaken | 血迹地图，强调受伤后情报。 |
| ASSET-157 | item-recoil-plate | recoil-plate | onDamageTaken | 反冲铁片，强调受伤反击。 |
| ASSET-158 | item-overrun-chain | overrun-chain | onHighDamageDealt | 越线链，强调高伤后优势。 |
| ASSET-159 | item-hard-receipt | hard-receipt | onHighDamageDealt | 硬账票，强调高伤后说服。 |
| ASSET-160 | item-marrow-coin | marrow-coin | onHighDamageDealt | 髓币，强调高伤后回血。 |
| ASSET-161 | item-breakwater-splint | breakwater-splint | onHeavyWoundTaken | 防波夹板，强调重伤受击后回血。 |
| ASSET-162 | item-trauma-scan | trauma-scan | onHeavyWoundTaken | 创伤扫描片，强调重伤受击后情报。 |
| ASSET-163 | item-last-ice | last-ice | onHeavyWoundTaken | 最后冰针，强调重伤受击后冻结。 |
| ASSET-164 | item-last-match | last-match | onOneHp | 最后火柴，强调 1 血反烧。 |
| ASSET-165 | item-data-spur | data-spur | onIntelGain | 数据马刺，强调情报后暴击。 |

## Image Gen Prompt Pattern

```text
Create a single green-screen icon asset sheet for a 2D top-down browser game. Exact layout: 5 columns by 2 rows, ten separate equipment item icons, each icon centered in its own equal cell on a solid pure chroma green background #00ff00. No text, no labels, no numbers, no arrows, no UI frames, no white background, avoid pure white highlights, avoid any green pixels inside objects. Style: light cyberpunk wasteland dungeon, old metal, dirty cloth, improvised low-weapon equipment, dark teal utility glow, amber sparks, muted red leakage, readable silhouettes at 24-36px.
```

## QA Notes

- Five generated sheets were accepted for prototype use after transparent extraction and contact-sheet review.
- The source rects use an 8px inset to avoid generated cell-divider lines and reduce green/white border contamination.
- `green-pulse` is visually represented with blue/cyan and amber rather than chroma green, so it can survive the green-screen pipeline.
