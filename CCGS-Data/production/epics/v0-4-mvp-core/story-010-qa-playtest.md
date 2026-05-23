---
epic: "v0-4-mvp-core"
status: "Blocked"
phase: "P1"
owner: "qa-lead"
type: "Integration"
estimate: "1天"
dependencies: ["story-001-test-setup", "story-002-actor-stats", "story-003-run-state", "story-004-map-exploration", "story-005-vision-intel", "story-006-encounter-combat", "story-007-items-v0-4", "story-008-enemy-ai-mvp", "story-009-hud-combat-ui"]
layer: "Production"
manifest_version: "2026-05-08"
---
# Story 010: QA 冒烟与 Playtest 记录

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-RUN-001`, `TR-UI-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] `npm run build` 通过。
- [x] `npm test` 通过。
- [ ] 记录至少一份手动 playtest，覆盖进入迷宫、搜索、遭遇、战斗、撤离或失败。
- [ ] 若有 UI 改动，保存截图或手动证据到 `CCGS-Data/production/qa/evidence/`。
- [x] 若发现 Bug，登记到 `bug-tracker.md`。
- [x] 若有测试缺口，登记到 `tech-debt.md`。

## Implementation Notes

- 本 Story 是 Epic 收口，不写玩法代码。
- QA 报告放入 `CCGS-Data/production/qa/reports/`。

## QA Test Cases

- Given 完成前 9 个 Story  
  When 执行构建、测试和一局手动 playtest  
  Then 产出 QA 报告，列出通过项、问题和剩余风险。

## Out of Scope

- 不补新功能。
- 不临时改规则绕过失败测试。
