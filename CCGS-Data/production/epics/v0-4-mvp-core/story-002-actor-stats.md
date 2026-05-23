---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Logic"
estimate: "1天"
dependencies: ["story-001-test-setup"]
layer: "Foundation/Core"
manifest_version: "2026-05-08"
---
# Story 002: 统一角色属性与派生值

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-STATS-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 玩家和敌人共用 `StatBlock` 与派生值计算。
- [x] 玩家 MVP 初始属性为 3/3/3/3/3。
- [x] 最大生命、视野半径、近战伤害、重伤阈值、基础说服值符合规则书第 19 章。
- [x] 派生值测试覆盖最低值、普通值和高值。

## Implementation Notes

- 在 `src/sim/types.ts` 扩展五项属性类型。
- 派生值优先做纯函数，便于测试。
- 旧 `hp: 3` 需要迁移为基于体质的生命。

## QA Test Cases

- Given 体质 3  
  When 计算最大生命  
  Then 结果为 12。
- Given 精神 3  
  When 计算视野半径  
  Then 结果为 3。
- Given 力量 3 且无武器  
  When 计算基础近战伤害  
  Then 结果为 3。

## Out of Scope

- 不实现战斗状态机。
- 不实现敌人 AI 决策。
