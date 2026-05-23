# Grid Dungeon Advantage Item Icons v0.7.1 Asset Spec

> Generated: 2026-05-13  
> Source: `src/sim/items.ts`, `CCGS-Data/design/gdd/rulebook.md`  
> Scope: 为 v0.7 后新增的 6 个优势窗口/反制小道具补齐独立美术图标。  
> Status: Done

## Shared Standard

- Output format: transparent PNG.
- Runtime size: `72px x 72px`.
- Style: 轻赛博朋克废土 + 地牢旧金属，暗青冷光、暗红泄光、旧布/铁件/线缆质感。
- Background handling: source sheet uses chroma green `#00ff00`; extracted runtime PNG must have alpha background and no visible green edge.
- Readability target: remains identifiable in HUD/backpack/pickup cards at `24px-36px`.
- Text policy: no letters, no UI arrows, no pure white background.
- Runtime boundary: icons are presentation assets only; no `src/sim` behavior changes in this pass.

## Source Sheet

- Image gen source: `CCGS-Data/design/art/source/grid-dungeon/item-icons-advantage-iter01.png`
- Layout: `3 x 2`, each source slot `512px x 512px`.
- Extraction script: `scripts/art/extract-grid-item-icons.ps1`
- Runtime output: `public/assets/grid-dungeon/items/`
- Manifest: `public/assets/grid-dungeon/manifest.json`

## Assets

| Asset ID | Runtime ID | Item ID | Visual Brief | Acceptance |
|---|---|---|---|---|
| ASSET-066 | item-rib-hook | rib-hook | 带倒刺的短钩，旧金属握柄，暗红磨损，用于优势窗口压制/牵制。 | 透明 PNG；轮廓与 `hook-rope` 有区分；不是普通长绳。 |
| ASSET-067 | item-ankle-line | ankle-line | 缠绕脚踝的细线圈/绊索，带小型废土扣具和暗青微光。 | 透明 PNG；能看出“缠脚/限制移动”含义。 |
| ASSET-068 | item-chase-spur | chase-spur | 粗糙金属追击刺/鞋跟刺，带红色能量裂纹，强调追击速度。 | 透明 PNG；在小尺寸下仍与肾上针、软底鞋区分。 |
| ASSET-069 | item-counter-plate | counter-plate | 弧形反击护片/挡板，刮痕明显，带暗红反光。 | 透明 PNG；与木盾片区分为更小的近战反制板。 |
| ASSET-070 | item-panic-nail | panic-nail | 锈蚀尖钉和短线捆扎，像可快速丢出的惊扰钉。 | 透明 PNG；与铁蒺藜区分为单枚/少量尖钉。 |
| ASSET-071 | item-focus-thread | focus-thread | 缠绕手指或小线轴的专注线，暗青发光线芯。 | 透明 PNG；信息/专注倾向清楚，避免像普通绳索。 |

## Image Gen Prompt Record

```
Create a clean 3 by 2 icon asset sheet on a pure chroma green background (#00ff00), no text, no arrows, no white background. Six separate square item icons for a top-down browser dungeon game, light cyberpunk wasteland dungeon style, old metal, dirty cloth, subtle teal lamp glow, dark red leak light, readable silhouettes at small UI size. Slot order: rib hook, ankle line snare, chase spur, counter plate, panic nail, focus thread. Each icon centered in its own equal square, separated with green padding, avoid using green in the objects, avoid pure white, transparent-ready edges, high contrast but not neon-overloaded.
```

## QA Notes

- 该批资产是补齐 v0.7 后新增道具的独立图标，替换此前临时复用图标。
- 合法性由 `validate-grid-assets.ps1`、`tests/unit/item_icons.test.mjs`、`npm run build` 覆盖。
