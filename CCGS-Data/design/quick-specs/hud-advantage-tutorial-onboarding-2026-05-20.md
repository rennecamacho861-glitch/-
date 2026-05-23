# Quick Design Spec: HUD 道具折叠、优势续战反馈与新手教程

**Type**: Addition  
**System**: HUD & Combat UI / Encounter Combat / Tutorial Onboarding  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`、`CCGS-Data/design/gdd/combat-system.md`  
**Date**: 2026-05-20

## Change Summary

本轮把背包道具显示改为默认只显示名称、图标和剩余次数，说明与限制改为悬浮/聚焦时展开；优势窗口的继续战斗选择允许同一照面内重复选择力量或节奏，并通过确认弹窗说明临时加成；新增可关闭的新手教程，在关键场景触发目的、敌人、战斗、视野和道具规则说明。

## Motivation

当前背包按钮在拿到道具后立即塞入较长说明，右侧栏阅读压力过大。优势窗口重复获得时，玩家希望能把连续优势兑现成多次临时增强，而不是因为隐藏的一次性限制被阻断。新手首次进入迷宫时缺少目标、视野、敌人和道具触发说明，容易把“黑暗”和“博弈”理解成不可控。

## Design Delta

Current GDD says (`rulebook.md`, 11.2):

> 当前优势转化为 1 回合战斗修正，必须二选一：`pressPower` 使下一动作回合近战伤害 +1，或 `pressTempo` 使下一动作回合速度 +1。  
> 同场照面同类继续战斗修正最多触发 1 次。

This spec changes that to:

同一次优势仍只能选择一种兑现方式；但只要玩家在同场照面中再次获得优势，就可以再次选择 `pressPower` 或 `pressTempo`。继续战斗修正始终只作用于下一动作回合，不跨回合永久叠加，不允许在同一次优势中同时获得力量和速度。每次选择继续战斗必须生成确认式反馈，明确写出“下一动作回合近战伤害 +1”或“下一动作回合速度 +1”。

## New Rules / Values

- 背包道具按钮默认只展示图标、道具名、剩余次数/数量；玩家可读说明、限制和使用状态只在鼠标悬浮或键盘聚焦时显示。
- 拾取三选一仍直接显示简洁说明，因为这是构筑选择时刻；背包是已获得物品的快速操作区，应优先节省空间。
- 优势窗口继续战斗：
  - `pressPower`：下一动作回合近战伤害 +1。
  - `pressTempo`：下一动作回合速度 +1。
  - 同一次优势只能选择一种兑现方式。
  - 同场照面内没有同类次数上限；再次取得优势即可再次选择。
  - 选择后优势消耗，照面进入下一动作选择。
  - 每次选择生成 `advantage-press` 反馈事件，HUD 弹窗需由玩家确认。
- 新手教程：
  - 首次进入页面弹出“是否需要新手教程”。
  - 选择“不需要”后，本地记录关闭教程，不再弹出本教程提示。
  - 选择“需要”后，在本次页面会话中按触发场景展示一次性教程卡。
  - 教程触发主题包括：游戏目的、拾取三选一、视野规则、道具触发规则、敌人风险、照面战斗、优势窗口。
  - 教程属于 HUD 表现层，不写入 `GameState`，不改变模拟规则。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Rulebook | 优势续战次数限制、HUD 背包展示、新手教程规则变化 | 更新第 11、14、23 章 |
| Combat System GDD | `pressPower/pressTempo` 限制变化 | 更新优势窗口规则和验收 |
| System Framework | 反馈事件、HUD 本地教程状态边界 | 更新反馈与 UI 边界 |
| GameSimulation | 移除同场同类续战阻断，新增 `advantage-press` 反馈 | 修改 `continueFight()` 与类型 |
| HUD / CSS | 背包说明 hover 展开、教程弹窗 | 修改 `src/main.ts`、`src/styles.css` |
| Tests | 覆盖重复续战与反馈事件 | 更新优势窗口单元测试 |

## Acceptance Criteria

- [ ] 背包道具按钮默认不显示长说明；悬浮/聚焦后显示说明与限制。
- [ ] 拾取三选一仍能直接看到道具简洁说明。
- [ ] 玩家在同场照面中再次获得优势后，可以再次选择同类续战加成。
- [ ] `pressPower` 与 `pressTempo` 仍只影响下一动作回合，不永久叠加。
- [ ] 每次选择继续战斗都会弹出确认式反馈，说明获得的临时属性增强。
- [ ] 首次进入游戏询问是否需要教程；选择不需要后不再弹出教程。
- [ ] 教程覆盖目的、拾取、视野、道具、敌人、战斗和优势窗口，不写入模拟层状态。
- [ ] No regression：移动、拾取、战斗、道具使用、反馈队列与构建测试继续通过。

## GDD Update Required?

Yes. 本轮直接更新 `rulebook.md`、`combat-system.md` 与 `system-framework.md`，作为实装前的轻量规则同步。
