---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Logic"
estimate: "1.5天"
dependencies: ["story-002-actor-stats", "story-004-map-exploration"]
layer: "Core"
manifest_version: "2026-05-08"
---
# Story 005: 视野与信息系统

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-VISION-001`, `TR-INTEL-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 支持 `unseen / aware / visible` 三档可见状态。
- [x] 视野半径使用 `2 + floor(精神 / 2)` 与曼哈顿距离。
- [x] 墙体和封闭门阻断视线。
- [x] A visible B 且 B 不 visible A 时，A 获得视野领先。
- [x] 信息获取值按智力、来源、道具修正揭示 1-3 条信息。
- [x] 已知信息和推测信息在状态中可区分。

## Implementation Notes

- 玩家看敌人、敌人看玩家必须分别计算。
- 远程先手每次遭遇最多触发 1 次。
- UI 需要的方向提示由 sim 日志或事件输出。

## QA Test Cases

- Given 精神 3 的单位与目标距离 3 且无遮挡  
  When 计算视野  
  Then 可见状态为 visible。
- Given 目标被墙阻挡  
  When 计算视野  
  Then 不为 visible。
- Given 智力 3 且防御来源 +2  
  When 获取信息  
  Then 至少获得 1 条有效信息。

## Out of Scope

- 不实现扇形视野。
- 不实现真实光照。
