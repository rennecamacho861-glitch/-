# Quick Design Spec: 绷带、回声针与手枪反馈改造

**Type**: Addition  
**System**: 道具系统 / 反馈表现  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-17

## Change Summary

本轮把三件开局核心道具的收益变得更可读：绷带与回声针提升为橙色 rare，绷带只在战斗外回血，回声针不再输出方向文字，手枪开火加入明确枪火演出。

## Motivation

玩家需要在非常短的探索和照面节奏里立刻理解“道具正在产生价值”。旧回声针用方向文字给信息，既不够直观，也和“不要额外编写情报文本”的规则相冲突；绷带在战斗优势窗口可用会和战斗治疗道具抢定位；手枪缺少开火演出导致远程威胁不够清晰。

## Design Delta

Current GDD says:

> 绷带：回复 3 点生命；战斗中使用需要优势窗口；战斗外可直接使用。  
> 回声针：指出最近未清空道具节点或 AI 的大致方向与距离。  
> 手枪：远程攻击，5 次，视野内 4 格，命中 3 伤害。

This spec changes that to:

绷带为橙色 rare，只能战斗外使用，回复 3 点生命，并在成功回血时生成确认式回血弹窗和窗口级治疗脉冲。回声针为橙色 rare，场外使用时释放扩散声波，标出含有最近目标的 2x2 四格回响区，目标必定在四格之一，但不显示方向、距离、路径或目标类型文字。手枪每次真实开火必须生成 `gunshot` 反馈事件，Phaser 以枪口闪光、短弹道线和命中/擦过点表现。

## New Rules / Values

- `bandage.rarity = rare`，`bandage.useContext = field`，效果为战斗外回复 3 点生命。
- `echo.rarity = rare`，效果为标记最近未清空道具节点或未击败 AI 所在的 2x2 四格回响区。
- `pistol` 可在战斗外和战斗中使用，仍需视野、距离和射线；开火动画不改变伤害、弹药或命中结算。
- 新增反馈事件：`item-heal`、`echo-pulse`、`gunshot`。
- `FeedbackEvent.origin` 用于动画起点；`target` 用于枪线终点；`positions` 用于回声针四格区域。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| GDD Rulebook | 三件道具文字与稀有度变化 | 更新当前道具框架与稀有度分配 |
| Item Data | `bandage`、`echo`、`pistol` 描述和端口变化 | 更新 `src/sim/items.ts` |
| Simulation | 生成结构化反馈事件和回声四格提示 | 更新 `GameSimulation` |
| DOM HUD | 回血/声波/枪击弹窗样式 | 更新 `src/main.ts`、`src/styles.css` |
| Phaser Render | 程序化动画表现 | 更新 `src/render/GameScene.ts` |
| Tests | 稀有度、回血限制、回声四格和枪击反馈 | 更新自动化测试 |

## Acceptance Criteria

- [ ] 绷带和回声针在背包与开局三选一中显示橙色 rare 边框。
- [ ] 绷带在战斗外可回复 3 点生命，并生成 `item-heal` 反馈；战斗中不可使用。
- [ ] 回声针生成 `echo-pulse` 反馈，`positions` 恰好包含 4 格，且真实目标位于四格之一。
- [ ] 回声针不再写入“方向 + 距离”的文字情报。
- [ ] 手枪开火生成 `gunshot` 反馈，包含 `origin` 与 `target`。
- [ ] No regression：手枪弹药、射线、伤害、掉落保留状态和回声/绷带开局选择继续可用。

## GDD Update Required?

Yes. 更新 `CCGS-Data/design/gdd/rulebook.md` 的 v0.8.7 摘要、稀有度分配、当前道具框架和反馈表现要求。
