---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "1.5天"
dependencies: ["story-005-vision-intel", "story-006-encounter-combat"]
layer: "Feature"
manifest_version: "2026-05-08"
---
# Story 007: v0.4 道具效果

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-ITEM-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] 手枪提供 3 次远程攻击，要求目标 visible、4 格内、路径无遮挡，命中 3 伤害，危险 +1。
- [x] 绷带回复 3 生命，战斗中使用需要优势窗口。
- [x] 长刀在初见第一攻速度 +2，近战伤害 +1。
- [x] 陷阱可放置，敌人触发后报警、红光提示、揭示位置和 1 条信息，危险 +1。
- [x] 眼镜在躲闪成功后揭示对方 1 件道具或“无可见道具”。
- [x] 玩家和敌人都能持有道具。

## Implementation Notes

- 道具拆成定义和实例状态。
- 支付给说服的道具第一版直接移除。

## QA Test Cases

- Given 玩家有手枪且目标 visible、距离 4、无遮挡  
  When 使用手枪  
  Then 目标受到 3 伤害，手枪次数 -1，危险 +1。
- Given 玩家有眼镜且躲闪成功  
  When 结算信息  
  Then 揭示敌人 1 件道具。
- Given 敌人踩到陷阱  
  When 结算触发  
  Then 玩家获得位置提示和 1 条信息。

## Out of Scope

- 不实现敌人主动拾取地图道具。
- 不实现支付道具转移给敌人。
