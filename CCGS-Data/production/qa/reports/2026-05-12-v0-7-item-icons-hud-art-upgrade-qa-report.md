# QA Report — v0.7 Item Icons & HUD Art Upgrade

> **Date**: 2026-05-12  
> **Verdict**: PASS WITH NOTES  
> **Feature Type**: Visual / UI / Asset Config  
> **Tester**: Codex

## Test Matrix

| Area | Check | Result | Evidence |
|---|---|---:|---|
| Asset pipeline | 65 manifest entries resolve to PNGs with expected dimensions and transparent corners | PASS | `validate-grid-assets.ps1` |
| Icon coverage | All 37 item definitions resolve to produced icon files | PASS | `tests/unit/item_icons.test.mjs` |
| Game logic regression | Existing simulation tests remain green | PASS | `npm test` |
| Production build | TypeScript and Vite build complete | PASS | `npm run build` |
| Desktop HUD | HUD art style visible, map remains primary, right rail does not cover core view | PASS | `hud-v0-7-desktop.png` |
| Mobile HUD | Stats wrap without overflow, inventory remains visible, log collapses | PASS | `hud-v0-7-mobile.png` |
| Icon readability | 30 new icons readable on dark background at 72px source size | PASS | `item-icons-v0-7-contact-sheet.png` |

## Automated Test Log

```text
npm test
tests 33
pass 33
fail 0
```

```text
npm run build
✓ built
warning: Some chunks are larger than 500 kB after minification
```

```text
scripts/art/validate-grid-assets.ps1
Validated 65 grid-dungeon assets.
```

## Visual Evidence

- `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-v0-7-contact-sheet.png`
- `CCGS-Data/production/qa/evidence/art/grid-dungeon/hud-v0-7-desktop.png`
- `CCGS-Data/production/qa/evidence/art/grid-dungeon/hud-v0-7-mobile.png`

## Issues Found

| ID | Severity | Description | Status |
|---|---|---|---|
| QA-NOTE-001 | Low | First mobile screenshot showed stats chip overflow at the right edge. | Fixed in `src/styles.css`; replacement screenshot captured. |
| QA-NOTE-002 | Low | Full asset extraction script is slower after adding despill logic when run across every asset. | Mitigated by adding `extract-grid-item-icons.ps1` for this item-sheet workflow. |

## Residual Risk

- Visual fidelity is prototype-grade image-gen output; commercial polish would still need a later art-director pass.
- Build chunk warning remains, but it is tied to the existing Phaser bundle and not introduced by this work.
