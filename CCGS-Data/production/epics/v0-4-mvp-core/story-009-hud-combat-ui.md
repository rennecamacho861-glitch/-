---
epic: "v0-4-mvp-core"
status: "Done"
phase: "P1"
owner: "ui-programmer"
type: "UI"
estimate: "1.5天"
dependencies: ["story-003-run-state", "story-006-encounter-combat", "story-007-items-v0-4"]
layer: "Presentation"
manifest_version: "2026-05-08"
---
# Story 009: HUD 与战斗面板对齐

## Context

**GDD**: `CCGS-Data/design/gdd/rulebook.md`  
**Requirement**: `TR-UI-001`, `TR-MAP-001`  
**ADR**: ADR-0001

## Acceptance Criteria

- [x] HUD 显示时间、生命、危险、战利、背包、最近记录。
- [x] 探索画面区分亮区、记忆区、未知区、墙、搜索点、出口、危险格、AI。
- [x] 战斗面板显示敌人名称、生命/状态、可见状态、优势归属、动作按钮。
- [x] 战斗面板区分已知信息、推测信息和未知道具。
- [x] 未见来源造成伤害或危险提升时，最近记录显示方向或来源提示。
- [ ] 桌面和移动尺寸下不遮挡主要 playfield。

## Implementation Notes

- DOM HUD 只调用 sim API，不直接修改状态。
- 按钮应随 `EncounterState` phase 启用/禁用。
- UI 改动需要浏览器截图或手动证据。

## QA Test Cases

- Manual check: 桌面视口进入探索  
  Setup: 运行 dev server 并打开游戏  
  Verify: 地图与 HUD 均可读，HUD 不遮挡移动方向关键区域  
  Pass condition: 玩家能识别搜索点、出口、未知区和最近记录。
- Manual check: 进入战斗  
  Verify: 可见状态、优势归属、动作按钮和信息列表出现  
  Pass condition: 玩家能知道当前为何可逃跑/说服或为何不可。

## Out of Scope

- 不制作正式美术。
- 不做动画 polish。
