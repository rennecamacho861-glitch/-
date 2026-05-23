---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Logic"
estimate: "0.5天"
dependencies: []
layer: "Foundation"
manifest_version: "2026-05-08"
---
# Story 001: 建立 sim 测试入口

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-TEST-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 项目拥有可运行的 `npm test` 脚本。
- [x] 测试框架能直接测试 `src/sim`，不依赖 Phaser 或浏览器。
- [x] 至少存在 1 个基础测试，证明测试入口可执行。
- [x] TD-001 可在后续 Story 完成后关闭或降级。

## Implementation Notes

- 推荐引入 Vitest。
- 测试目录使用 `tests/unit/` 与 `tests/integration/`。
- 不在本 Story 改玩法规则。

## QA Test Cases

- Given 项目安装依赖  
  When 运行 `npm test`  
  Then 测试命令通过，且至少执行一个 sim 测试。

## Out of Scope

- 不实现 v0.4 规则。
- 不重构 `GameSimulation`。
