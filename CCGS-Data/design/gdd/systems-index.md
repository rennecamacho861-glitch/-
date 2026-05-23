# 《照面之时》系统索引

## Systems Enumeration

| System | Layer | Priority | Status | Design Doc | Notes |
|---|---|---|---|---|---|
| Run State | Foundation | MVP | Designed | `rulebook.md`, `system-framework.md` | 局内时间、撤离、失败、可复现 seed |
| Map & Exploration | Core | MVP | Designed | `rulebook.md`, `system-framework.md` | 格子地图、道具节点、出口、遭遇触发 |
| Vision & Intel | Core | MVP | Designed | `rulebook.md`, `system-framework.md` | 视野、察觉、信息层级、视野领先 |
| Actor Stats | Core | MVP | Designed | `rulebook.md`, `system-framework.md` | 五项属性与派生值 |
| Encounter Combat | Core | MVP | Designed | `combat-system.md`, `rulebook.md`, `system-framework.md` | 动作矩阵、有效防御、攻击方向、优势窗口、逃跑、说服 |
| Item System | Feature | MVP | Designed | `rulebook.md`, `system-framework.md` | 三选一道具节点、手枪、绷带、长刀、陷阱、眼镜与小收益道具 |
| Enemy AI | Feature | MVP | Drafted | `rulebook.md`, `system-framework.md` | 巡逻、视野、战斗决策、局内拾取成长、掉落 |
| HUD & Combat UI | Presentation | MVP | Drafted | `rulebook.md`, `system-framework.md` | 地图可读性、信息面板、战斗动作 |
| QA & Playtest Loop | Production | MVP | Not Started |  | 冒烟测试、截图验证、规则验收 |

## Dependency Order

1. Run State
2. Actor Stats
3. Map & Exploration
4. Vision & Intel
5. Encounter Combat
6. Item System
7. Enemy AI
8. HUD & Combat UI
9. QA & Playtest Loop

## High-Risk Systems

- Vision & Intel：必须避免玩家“不知道为什么吃亏”。
- Encounter Combat：必须以 `combat-system.md` 为专门真源；先保护视野、信息和短促照面，不能膨胀成传统 HP 消耗战。
- Item System：敌人也能持有道具，随机性需要预算控制。

## Current Production Rule

规则书确认前不得实装对应玩法。实装前先从本索引拆出 Proposal / Story。
