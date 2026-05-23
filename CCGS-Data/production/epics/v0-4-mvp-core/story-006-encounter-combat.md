---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "2天"
dependencies: ["story-002-actor-stats", "story-005-vision-intel"]
layer: "Core"
manifest_version: "2026-05-08"
---
# Story 006: 照面战斗状态机

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-COMBAT-001`, `TR-COMBAT-002`, `TR-COMBAT-003`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 旧 `Attack / Guard / Trick` 结算被 v0.4 动作战斗替代。
- [x] 基础动作包含进攻、防御、左躲闪、右躲闪。
- [x] 进攻按速度决定先后手，同速按力量决定优先级。
- [x] 防御减免 60% 有效伤害，并在承受动作后获取信息。
- [x] 躲闪方向影响成功率，成功后避免伤害并获得优势。
- [x] 优势窗口允许逃跑、继续战斗、说服。
- [x] 第 4 回合后必须强制给出优势窗口或脱战。

## Implementation Notes

- 推荐新增结构化 `CombatAction` 类型。
- 优势是一次可消费机会，不是永久分数。
- 逃跑成功后远离对方 1 格并脱战。

## QA Test Cases

- Given 双方都进攻，玩家速度更高且造成重伤  
  When 结算回合  
  Then 敌方慢速攻击被打断。
- Given 玩家防御承受攻击  
  When 结算回合  
  Then 伤害降低 60%，玩家获得优势并触发信息获取。
- Given 玩家在优势窗口选择逃跑且判定成功  
  When 结算逃跑  
  Then 玩家后退 1 格并脱战。

## Out of Scope

- 不实现高级动作扩展。
- 不实现节奏窗口躲闪。
