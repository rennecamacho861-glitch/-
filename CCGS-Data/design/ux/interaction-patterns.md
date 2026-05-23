# Interaction Pattern Library — 《照面之时》

> **Status**: Created during v0.7 HUD/UI art pass  
> **Last Updated**: 2026-05-18  
> **Applies To**: DOM HUD overlay, item pickup, battle panel, inventory, feedback toast

## Pattern: Non-Blocking HUD Overlay

- HUD reads from `SimulationPort.snapshot()` and never owns gameplay state.
- HUD actions emit existing simulation commands: move, use item, choose pickup, combat action, flee, continue, persuade, reset.
- Top status and right inventory/log panels may sit above the Phaser canvas, but must not hide the core 5x5 map area on desktop.
- On mobile, the log panel collapses first; inventory remains reachable because it contains player choices.

## Pattern: Category-Colored Item Controls

- Item controls carry `data-category="damage|survival|intel"`.
- Damage uses muted red edge treatment, survival uses muted green, intel uses dark teal.
- Color is always paired with icon silhouette and item name; color alone is not required to understand the control.
- Disabled state means the item cannot be used in the current context, not that it is absent.

## Pattern: Pickup Three-Choice Card

- Loot node pickup pauses decision flow and presents three item cards plus skip.
- Each card shows icon, item name, and a short effect description.
- Picking an item or skipping clears the offer; the player should never need to search manually.
- Cards must remain readable at mobile width; two-column wrap is preferred over shrinking text.

## Pattern: Battle Choice Panel

- Battle panel groups primary actions first: attack, defend, left dodge, right dodge.
- Secondary advantage-window actions are visually lower priority and disabled until available.
- Active effects and known intel appear inside the panel, close to the choice they can inform.
- The panel may overlap the bottom of the screen, but must not cover pickup choices or feedback confirmation.

## Pattern: Confirmed Feedback Toast

- Feedback toast presents one critical event at a time using text plus tone border.
- Because the current runtime pauses input while a feedback toast is active, the confirm button is required.
- Tone names are `danger`, `advantage`, `intel`, and `neutral`.
- Reduced-motion users receive no shake or animated movement; text feedback remains.

## Pattern: Intel Tooltip

- Intel entries can expose item description and counterplay through hover/focus tooltip.
- Tooltip content is read-only and comes from item definitions.
- Confirmed and suspected intel must retain separate labels.
- Tooltip must be keyboard focusable through the intel token.

## Pattern: Low Health Screen Feedback

- HUD reads `player.hp` and derived max HP from the simulation snapshot; it never mutates health or combat state.
- When player HP is below half of derived max HP, a non-blocking full-window blood vignette appears behind HUD controls.
- When player HP is below 3, the same overlay adds faster heartbeat pulses and a subtle breathing float to communicate critical danger.
- The effect must use `pointer-events: none` and must not obscure the central playfield or disable pickup/combat choices.
- The HP stat chip mirrors the state with a wounded/critical treatment so color is not the only cue.
- `prefers-reduced-motion: reduce` disables pulse and breathing animation while keeping a static blood/critical visual fallback.

## Pattern: Tutorial Choice Modal

- Appears only when tutorial preference is unknown.
- Offers exactly two primary choices: `需要新手教程` and `不需要`.
- Choosing `需要新手教程` calls the simulation tutorial entry port and delays the starter loadout.
- Choosing `不需要` stores the preference locally and proceeds to the starter loadout.
- The modal must be keyboard reachable and must not rely on color to distinguish choices.

## Pattern: Scripted Tutorial Step

- Presents one lesson at a time: current goal, why it matters, and what just changed.
- The step modal may pause input until acknowledged, but every step must also expose `跳过教程`.
- Text must explain the underlying mechanic, not only the required click target.
- The modal reads step data from the simulation tutorial state; it must not invent fake enemy stats, fake damage, or fake intel.
- While the scripted tutorial is active, legacy generic tutorial copy must not appear between combat lessons.
- After the final persuasion lesson, the starter loadout stays hidden until the player confirms the completion notice: `下面在整个迷宫中找到出口，带着道具逃离吧。`
- Reduced-motion users receive static highlights instead of pulsing or shaking.

## Pattern: Coached Action Highlight

- Highlights one recommended action button at a time while the tutorial is active.
- The highlight uses a dynamic outer frame, glow pulse, and a `选择此项` label; color is not the only cue.
- Disabled or blocked actions should explain why, for example `先防御读取情报`.
- If the tutorial allows a mistake demonstration, the action remains clickable and the result must be restored through simulation checkpoint rules.
