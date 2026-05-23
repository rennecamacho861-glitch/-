---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "1天"
dependencies: ["story-002-actor-stats", "story-003-run-state"]
layer: "Core"
manifest_version: "2026-05-08"
---
# Story 004: 地图探索、搜索与遭遇触发

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-MAP-001`, `TR-RUN-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 地图包含起点、出口、至少 5 个搜索点、至少 2 名 AI、至少 1 条绕路分支。
- [x] 移动、搜索、屏息会推进回合。
- [x] 搜索点被搜索后不会重复产出。
- [x] 双方相邻且至少一方看见或察觉时进入照面。
- [x] 双方都未见且未察觉时不进入战斗。

## Implementation Notes

- 当前地图已有起点、出口、搜索点和 2 名 AI，可在此 Story 中保留并补规则字段。
- 遭遇触发应依赖视野/察觉状态；若 story-005 未完成，可先预留接口并用默认 visible 判断。

## QA Test Cases

- Given 未搜索搜索点在玩家 1 格内  
  When 玩家搜索  
  Then 获得道具且该点标记为 searched。
- Given 已搜索搜索点  
  When 玩家再次搜索  
  Then 不重复获得道具，并给出日志。
- Given 敌人与玩家相邻且 visible  
  When 检查遭遇  
  Then 创建 EncounterState。

## Out of Scope

- 不实现复杂迷宫生成。
- 不实现敌人主动拾取道具。
