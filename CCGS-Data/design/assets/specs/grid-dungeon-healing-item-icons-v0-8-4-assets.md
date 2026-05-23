# Grid Dungeon Healing Item Icons v0.8.4 Asset Spec

> Generated: 2026-05-14  
> Source: `CCGS-Data/design/quick-specs/healing-sustain-active-reuse-enemy-pathing-2026-05-14.md`, `CCGS-Data/design/gdd/rulebook.md`, `src/sim/items.ts`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Scope: 为 v0.8.4 新增的治疗、续航、止损道具补齐独立美术图标。  
> Status: 8 assets done / 8 approved for prototype use

## Shared Standard

- Category: UI Icon.
- Runtime format: transparent PNG.
- Runtime size: `72px x 72px`, displayed around `24px-36px` in HUD, pickup cards, and tooltip contexts.
- Style: top-down slight orthographic, light cyberpunk wasteland dungeon, improvised medical survival gear, old metal, dirty cloth, low saturation.
- Palette: near-black metal, dirty tan cloth, amber healing paste/heat seams, dim red emergency accents, dark teal worn paint; avoid pure white and modern hospital cleanliness.
- Chroma workflow: source sheet uses pure green `#00ff00`; final PNG corners must be alpha transparent.
- Runtime boundary: these are presentation assets only; no `src/sim` healing rules are changed in this pass.

## Source Sheet

- Image gen source: `CCGS-Data/design/art/source/grid-dungeon/item-icons-healing-iter01.png`
- Layout: `4 x 2`.
- Source size: `1774px x 887px`.
- Extraction script: `scripts/art/extract-grid-item-icons.ps1`
- Runtime output: `public/assets/grid-dungeon/items/`
- Manifest: `public/assets/grid-dungeon/manifest.json`

## Assets

| Asset ID | Runtime ID | Item ID | Visual Brief | Acceptance |
|---|---|---|---|---|
| ASSET-082 | item-salve-tin | salve-tin | 打开的旧金属药膏罐，内有暗琥珀色膏体和刮花盖子。 | 与 `coagulation-powder` 区分，能读成小回复药膏。 |
| ASSET-083 | item-field-ration | field-ration | 脏布带捆住的压缩口粮包，带旧金属箔和扣带。 | 在 72px 下仍像食物/补给，不误读为地图或绷带。 |
| ASSET-084 | item-charcoal-tablet | charcoal-tablet | 小药瓶和裂开的泡罩板，黑色炭片清晰可见。 | 能读成解毒/药片，不变成纯黑块。 |
| ASSET-085 | item-pressure-bandage | pressure-bandage | 厚重压迫绷带卷，带金属夹扣和暗红污痕。 | 与普通 `bandage` 区分为更重、更强的止血道具。 |
| ASSET-086 | item-heat-pad | heat-pad | 脏布热垫袋，边缘有暗橙发热线缝。 | 能读成保温/减伤垫，不像普通布片。 |
| ASSET-087 | item-blood-sponge | blood-sponge | 金属浅盘中的深红医用海绵，克制血色表现，不做血腥。 | 吸收/回血语义清楚，小尺寸可读。 |
| ASSET-088 | item-mercy-thread | mercy-thread | 红棕色缝线环、细针和小护符结。 | 与 `lens-thread` 区分为医疗线/慈悲线。 |
| ASSET-089 | item-emergency-syringe | emergency-syringe | 废土自动注射器，红色急救帽与旧金属针筒。 | 与 `adrenaline-shot` 区分为濒危急救装置。 |

## Image Gen Prompt Record

```
Create a clean 4 by 2 icon asset sheet on a pure chroma green background (#00ff00), no text, no letters, no arrows, no white background. Eight separate square item icons for a top-down browser dungeon game, light cyberpunk wasteland dungeon style, old metal, dirty cloth, improvised medical survival gear, subtle dark teal lamp glow, amber utility highlights, dim red leak light, readable silhouettes at 24-36px UI size, not neon-overloaded. Slot order: salve tin, field ration, charcoal tablet, pressure bandage, heat pad, blood sponge, mercy thread, emergency syringe.
```

## QA Notes

- The first generated sheet was accepted for prototype use after 72px contact-sheet review.
- The icons intentionally use dirtier survival-medical silhouettes rather than clean hospital graphics, matching the Art Bible's wasteland dungeon language.
