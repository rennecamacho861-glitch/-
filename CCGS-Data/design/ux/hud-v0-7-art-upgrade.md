# HUD Design — v0.7 Art Upgrade

> **Status**: Approved for implementation  
> **Last Updated**: 2026-05-12  
> **Template**: HUD Design  
> **Pattern Library**: `CCGS-Data/design/ux/interaction-patterns.md`

## Purpose

Upgrade the existing DOM HUD from functional prototype panels into a readable light-cyberpunk wasteland interface while preserving the Phaser playfield as the main screen object. The HUD should feel like scavenged metal instruments over a dark maze, not a decorative landing page.

## Information Architecture

- Top bar: project identity and run stats, including turn, HP, loot, and five attributes.
- Right rail: inventory first, recent log second.
- Bottom center: encounter battle panel or pickup three-choice panel.
- Bottom left: reset command.
- Center-lower toast: critical feedback with explicit confirm.

## Visual Treatment

- Panels use dark translucent metal, brass/amber edge highlights, muted teal scan lines, and small red accents only for danger.
- Item buttons use generated PNG icons plus item names and charge/count text.
- Item category color is an edge accent, not the only signifier.
- Buttons remain compact and squared; radius stays at 8px or less.

## Layout Budget

- Desktop: HUD may occupy top bar, right rail, and bottom encounter band; core 5x5 map should remain visually dominant.
- Mobile: log panel is hidden first; inventory and active encounter/pickup choices remain available.
- Pickup cards may wrap to two columns on mobile; text may wrap but must not overflow.

## Accessibility

- Every interactive item keeps a text label even when an icon is present.
- Focus-visible styling is required for keyboard navigation.
- `prefers-reduced-motion: reduce` disables hover/feedback animation.
- Feedback tone must be readable through text and border shape, not color only.

## Implementation Notes

- `src/sim` remains unchanged.
- `src/render/gridDungeonAssets.ts` maps all produced item icons.
- `src/main.ts` may add presentational classes/data attributes but must continue using `SimulationPort` methods for actions.
- `src/styles.css` owns the art treatment.

## Acceptance Criteria

- [ ] All 37 current item IDs resolve to PNG icons through `itemIconUrl()`.
- [ ] Pickup three-choice cards display icon, name, and description.
- [ ] Inventory buttons display icon, name, and count/charge.
- [ ] Desktop screenshot shows HUD styling without hiding the central map.
- [ ] Mobile screenshot keeps inventory and active choice panels usable.
- [ ] No gameplay state mutation is introduced outside the simulation port.
