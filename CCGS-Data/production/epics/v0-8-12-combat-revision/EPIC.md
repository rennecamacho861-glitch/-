# Epic: v0.8.12 照面战斗博弈修订

状态：Draft for Story Approval  
日期：2026-05-18  
GDD：`CCGS-Data/design/gdd/combat-system.md`  
规则摘要：`CCGS-Data/design/gdd/rulebook.md`  
架构：`CCGS-Data/project-docs/architecture/system-framework.md`  
Review Mode：Lean  

## Summary

本 Epic 将 v0.8.12 战斗 GDD 转化为可实现 Story。目标是先修复照面战斗的基础博弈，再处理道具、AI、经济和 UI 文案的连带问题。

核心体验目标：

- 视野领先提供读牌权，而不只是攻击速度。
- 防御和躲闪产出下一手可用情报。
- 攻击仍强，但不能同时垄断伤害、重伤、状态、被动链和软收束。
- 道具构筑保留选择感，但通过有效预算和同族上限控制滚雪球。
- AI 用可解释的能力/战术包评分表现“会构筑”，不读取玩家隐藏真值。
- 玩家主文案清楚说明效果，不再直接显示原始 `counterplay`。

## Scope

### In Scope

- Combat matrix：Attack / Defense / Dodge 行为矩阵。
- Effective Defense：有效防御定义、重伤防护与软收束优先级。
- Intel reads：战斗内属性、道具、下一次攻击方向三类结构化情报。
- Advantage window：逃跑、说服、继续战斗二选一。
- Item limits：每回合主动道具上限、同族修正上限、有效构筑预算。
- Enemy tactical scoring：AI 能力标签、战术包、评分拆解和隐藏信息边界。
- Item text layer：`uiShort / uiLimit / uiEnemyCounter` 分层与 HUD 展示边界。

### Out of Scope

- 新增更多道具池内容。
- 正式加入“探步”动作。
- 敌人协作、共享情报或临时同盟。
- 重做美术或音频。
- 改动 Phaser 渲染架构。

## Governing Requirements

| Requirement | Source | Summary |
|---|---|---|
| AC-CMB-001 到 AC-CMB-007 | `combat-system.md#19-acceptance-criteria` | 战斗进入、基础动作、有效防御、躲闪、软收束和优势窗口 |
| AC-CMB-020 到 AC-CMB-022 | `combat-system.md#19-acceptance-criteria` | 战斗内结构化情报与攻击方向 |
| AC-CMB-040 到 AC-CMB-044 | `combat-system.md#19-acceptance-criteria` | 道具使用限制、触发链和有效构筑预算 |
| AC-CMB-060 到 AC-CMB-062 | `combat-system.md#19-acceptance-criteria` | AI 信息边界、战术包评分和拾取评分 |
| AC-CMB-080 到 AC-CMB-082 | `combat-system.md#19-acceptance-criteria` | 道具玩家文案、敌方应对提示和生效效果条 |
| AC-CMB-100 到 AC-CMB-101 | `combat-system.md#19-acceptance-criteria` | 测试追溯和自动化/债务要求 |

## Architecture Constraints

- `src/sim` 拥有战斗规则、状态和随机结算。
- `src/render` 只表现地图与视觉反馈，不结算规则。
- `src/main.ts` 只做 HUD 与输入桥接，不直接写 `GameState`。
- Logic / Integration Story 必须有自动化测试或明确登记测试债务。
- 本 Epic 中任何代码实装都必须先通过 Story Readiness。

## Stories

| # | Story | Type | Status | Covers |
|---|---|---|---|---|
| 001 | Combat Matrix 与有效防御 | Logic | Complete | AC-CMB-003/004/006 |
| 002 | 攻击方向与战斗情报读取 | Integration | Complete | AC-CMB-001/002/005/020/021/022 |
| 003 | 优势窗口、逃跑与说服公式 | Logic | Complete | AC-CMB-007、优势窗口公式 |
| 004 | 道具使用限制与有效构筑预算 | Integration | Complete | AC-CMB-040/041/042/043/044 |
| 005 | 敌人战术包评分与隐藏信息边界 | Integration | Complete | AC-CMB-060/061/062 |
| 006 | 道具玩家文案层与 HUD 展示边界 | UI | Complete | AC-CMB-080/081/082 |

## Story Order

1. Story 001 先稳定动作矩阵与软收束。
2. Story 002 接入读牌信息，让防御/躲闪变成可决策收益。
3. Story 003 调整优势兑现，避免继续战斗同时给力量和速度。
4. Story 004 限制道具滚雪球。
5. Story 005 让 AI 可解释地使用道具和拾取。
6. Story 006 清理玩家文案与 HUD 展示边界。

## Acceptance

- 所有 Story 均引用 `combat-system.md` 的 AC 编号。
- 所有 Logic / Integration Story 都提供自动化测试路径或测试债务说明。
- 实装前先运行 `/story-readiness`，通过后再运行 `/dev-story`。
- 完成后生成 Changelog 与 QA 证据。
