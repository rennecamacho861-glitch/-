# Grid Dungeon Cross-Port Item Icons v0.8.3 Asset Spec

> Generated: 2026-05-14  
> Source: `CCGS-Data/design/gdd/rulebook.md`, `src/sim/items.ts`  
> Art Bible: `CCGS-Data/design/art/art-bible.md`  
> Scope: 为 v0.8.3 新增的状态转化、场外构筑与反制道具补齐独立美术图标。  
> Status: 10 assets done / 10 approved for prototype use

## Shared Standard

- Category: UI Icon.
- Runtime format: transparent PNG.
- Runtime size: `72px x 72px`, used at roughly `24px-36px` in HUD and pickup cards.
- Source style: top-down slight orthographic, light cyberpunk wasteland dungeon, old metal, dirty cloth, low-tech improvised gear.
- Palette: near-black metal, dark teal lamp glints, amber utility highlights, dim red leak light; avoid pure white and modern neon overload.
- Chroma workflow: source sheet uses pure green `#00ff00`; final PNG corners must be alpha transparent and should not retain visible green spill.
- Runtime boundary: these are presentation assets only; no `src/sim` rule changes are included in this asset pass.

## Source Sheet

- Image gen source: `CCGS-Data/design/art/source/grid-dungeon/item-icons-cross-port-iter01.png`
- Layout: `5 x 2`.
- Source size: `1983px x 793px`.
- Extraction script: `scripts/art/extract-grid-item-icons.ps1`
- Runtime output: `public/assets/grid-dungeon/items/`
- Manifest: `public/assets/grid-dungeon/manifest.json`

## Assets

| Asset ID | Runtime ID | Item ID | Visual Brief | Acceptance |
|---|---|---|---|---|
| ASSET-072 | item-soot-hook | soot-hook | 焦黑煤钩，旧布缠柄，钩刃有少量暗橙灼痕。 | 72px 下能与 `rib-hook` 区分，焦黑/灼烧语义清楚。 |
| ASSET-073 | item-venom-saw | venom-saw | 小型锯齿片，锈蚀金属边缘带非纯绿毒液污痕。 | 透明扣图后主体完整，毒性语义可读。 |
| ASSET-074 | item-blood-knot | blood-knot | 暗红绳结，两端带小钩和旧铜扣。 | 与 `ankle-line` 区分为更短、更血色的状态转化绳结。 |
| ASSET-075 | item-frost-latch | frost-latch | 蓝灰冷冻锁扣/夹具，边缘有冰霜缺口。 | 冻结与防护语义清楚，小尺寸不误读为箱子。 |
| ASSET-076 | item-lens-thread | lens-thread | 裂纹镜片被铜线缠住，中心有冷青反光。 | 与 `lens` 区分为“镜片 + 线”的被动闪避构筑件。 |
| ASSET-077 | item-stitch-kit | stitch-kit | 脏布卷、针、线和临时医用扣件组成的缝合包。 | 医疗/缝合语义清楚，避免像普通绷带。 |
| ASSET-078 | item-tripwire-spool | tripwire-spool | 黑色线轴与两根小钉桩，适合放置陷阱。 | 与 `bell-wire` 区分为线轴/绊线工具。 |
| ASSET-079 | item-red-compass | red-compass | 破旧罗盘，暗红指针和脏玻璃，外圈旧金属。 | 场外路线/高价值点探测语义清楚。 |
| ASSET-080 | item-smoke-needle | smoke-needle | 细长针管/注射器，针尾有灰黑烟雾。 | 与 `poison-needle` 区分为烟雾触发件。 |
| ASSET-081 | item-thorn-plate | thorn-plate | 锯齿刺片护板，破洞和尖刺围边。 | 与 `counter-plate` 区分为更尖锐、更进攻性的反伤板。 |

## Image Gen Prompt Record

```
Create a clean 5 by 2 icon asset sheet on a pure chroma green background (#00ff00), no text, no letters, no arrows, no white background. Ten separate square item icons for a top-down browser dungeon game, light cyberpunk wasteland dungeon style, old metal, dirty cloth, low-tech improvised gear, subtle dark teal lamp glow, amber utility highlights, dim red leak light, readable silhouettes at 24-36px UI size, not neon-overloaded. Slot order left to right, top row then bottom row: soot hook, venom saw, blood knot, frost latch, lens thread, stitch kit, tripwire spool, red compass, smoke needle, thorn plate.
```

## QA Notes

- The first generated sheet was accepted for prototype use after 72px contact-sheet review.
- `venom-saw` contains some toxic residue detail; contact-sheet review confirmed the icon remains readable after chroma extraction.
