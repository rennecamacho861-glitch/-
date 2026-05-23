---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "ai-programmer"
type: "Integration"
estimate: "1天"
dependencies: ["story-005-vision-intel", "story-006-encounter-combat", "story-007-items-v0-4"]
layer: "Feature"
manifest_version: "2026-05-08"
---
# Story 008: 敌人 AI MVP 行为

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-AI-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 普通敌人属性总点为 15，单项 1-5，至少 1 强项和 1 弱项。
- [x] 敌人至少支持快攻、防守、猎手、谈判、重击中的倾向。
- [x] 非战斗中支持巡逻、搜索、追击、撤退四类基础行为。
- [x] 战斗中 AI 只能使用自己可见/已知的信息、属性倾向和携带道具。
- [x] AI 第一版不主动拾取搜索点道具，不共享玩家精确位置。

## Implementation Notes

- AI 行为应接收可见状态和已知信息作为输入。
- 不要让 AI 读取玩家隐藏道具或隐藏属性。

## QA Test Cases

- Given 生成普通敌人  
  When 检查属性  
  Then 总点为 15，且存在至少一个最高倾向和一个弱项。
- Given 猎手型敌人 visible 玩家且有手枪  
  When 决策行动  
  Then 可选择远程攻击。
- Given AI 只处于 aware  
  When 决策行动  
  Then 可向最后位置搜索，但不能直接远程攻击。

## Out of Scope

- 不实现敌人协作围捕。
- 不实现复杂行为树。
