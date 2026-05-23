# Asset Integration & UI Mocking Rules

This rule defines the pipeline for dealing with visual/UI assets during implementation, ensuring code development is never blocked by pending art assets.

## 1. The Whitebox/Placeholder Principle
- Programmer Agents (e.g., `gameplay-programmer`, `ui-programmer`) must **never** wait for final art assets to begin implementing a story.
- If an asset is missing, use an engine-native placeholder (e.g., Unity/Godot standard primitive, coloured UI Panel, or a text label).
- Document any placeholder used in the PR description or Story completion notes, using the tag `[PLACEHOLDER]`.

## 2. Asset Dependency Tracking
- Before claiming a story is `DONE` via `/story-done`, the agent must verify if the story has an `Asset Dependency`.
- If the asset is ready, integrate it.
- If the asset is NOT ready, the code must still be fully functional using placeholders. The story can be closed, but the `Asset Task` in the Sprint Plan must remain open.

## 3. Integration & Polish
- During a dedicated Polish Sprint, or at the end of the current sprint, `technical-artist` or `ui-programmer` will replace placeholders with final assets.
- Do NOT alter core code logic during asset integration. Only configure serializable fields, prefabs, or UI layout components.
- The Sprint cannot pass the Production → Polish gate (`/gate-check production`) unless all placeholders are replaced by the final verified assets.

## 4. Epic & Sprint Enforcement
- Producers generating Epics must explicitly list `Asset Dependencies` alongside GDD requirements.
- Sprint Plans must contain an explicit `Art Task` table tracking asset production, separately from code logic stories.
