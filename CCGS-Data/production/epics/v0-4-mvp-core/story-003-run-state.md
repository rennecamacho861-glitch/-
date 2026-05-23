---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "1天"
dependencies: ["story-001-test-setup", "story-002-actor-stats"]
layer: "Foundation"
manifest_version: "2026-05-08"
---
# Story 003: 局内状态、撤离与失败闭环

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-RUN-001`, `TR-RUN-002`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] `GameState` 或等价状态包含 seed、turn、danger、outcome。
- [x] 玩家站在出口格时可撤离并结算战利。
- [x] 玩家生命降到 0 时失败。
- [x] 72 回合后危险 +2，之后每 6 回合危险 +1。
- [x] 失败原因或撤离结果写入日志/结算状态。

## Implementation Notes

- 当前代码到达出口会自动撤离；v0.4 可以先保留自动撤离，也可暴露 `extract()`，但必须由 `src/sim` 决定。
- 时间上限不应直接秒杀玩家，而是升高危险。

## QA Test Cases

- Given 玩家在出口格  
  When 执行撤离  
  Then outcome 为 extracted，并保留当前战利。
- Given 玩家生命为 1  
  When 受到 1 点有效伤害  
  Then outcome 为 failed。
- Given turn 从 71 推进到 72  
  When advanceTurn 结算  
  Then danger 增加 2。

## Out of Scope

- 不实现完整敌人 AI。
- 不实现 UI 结算弹窗美化。
