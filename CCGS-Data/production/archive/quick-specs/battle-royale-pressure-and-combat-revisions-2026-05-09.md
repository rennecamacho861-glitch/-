# Quick Design Spec: 大逃杀压力与战斗收束修订

**Type**: Addition  
**System**: Encounter Combat / Vision & Intel / Enemy AI / Item System / Run State  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md` 第 4、6、7、8、11、12、13、14、19-23 章  
**Date**: 2026-05-09

## Change Summary

本修订取消独立 `encounterPressure` 数值，改为第 3 动作回合起的直接收束检查；同时补强躲闪情报、优势继续战斗、说服成功收益，并新增敌人内战、空投和毒圈，形成大逃杀式迷宫压力。

## Motivation

玩家需要看到每个系统的真实用途：战斗收束不应依赖看不懂的“压力”资源，信息获取必须能在一两回合内变成可行动情报；战斗外长期压力也不应靠固定回合死亡，而应来自毒圈收缩、空投争夺和敌人互相变强。

## Design Delta

当前 v0.6 候选规则使用 `encounterPressure` 推动约三回合收束：

> 当 `encounterPressure >= 3` 时，从本回合结束开始进行收束检查。

本规格改为：

取消 `encounterPressure` 作为状态、公式和 UI 字段。每回合结束只检查硬结果；第 3 动作回合起，如果没有硬结果，按本回合有效结果、躲闪、防御情报、生命、速度进行软收束。

## New Rules / Values

### 1. 战斗收束

- 每回合结束检查生命归零、重伤、已有优势。
- 第 3 动作回合起执行软收束。
- 软收束优先级：有效伤害 > 成功躲闪 > 成功防御并获得情报 > 当前生命 > 速度 > 双方后退脱战。
- UI 显示当前动作回合，不显示固定 `x/3`、`x/4` 或遭遇压力。

### 2. 情报与优势

- 成功躲闪必定获得至少 1 点情报。
- 继续战斗不再自由指定 +1，固定给予下一动作回合力量 +1、速度 +1。
- 说服成功停战 1 个玩家行动回合。
- 说服成功额外给予 `routeIntel` 和 `enemyContactIntel`。

### 3. 敌人内战

- 两个敌人相邻且至少一方看见/察觉，或一方看见且拥有远程手段时，自动结算内战。
- 内战使用同一套属性、道具、伤害、重伤和掉落规则。
- 胜者可拾取败者遗物并成长。
- 玩家未看见时只显示方向/声音提示，不泄露完整数据。

### 4. 空投

- 每 15 行动回合生成 1 个空投 LootNode。
- 空投点显示地图红点，所有单位都可被吸引。
- 空投仍使用 3 选 1；稀有道具权重略高。

### 5. 毒圈

- 移除固定生存回合数上限。
- 每 20 行动回合，当前地图最外层非毒圈变成毒圈。
- 单位在毒圈格内完成行动结算时受到 5 伤害。
- 敌人 AI 必须避开已生成毒圈；无安全路径时选择毒圈内停留最少的路线。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Encounter Combat | 移除 `EncounterPressure`，新增软收束检查 | 更新规则书、框架、后续实装 `combatClosureSystem` |
| Vision & Intel | 成功躲闪保底情报，说服给路线/接触情报 | 扩展 `IntelKind` 与 UI 情报卡 |
| Enemy AI | 新增避圈、空投争夺、敌人内战 | 后续实装 `enemyCivilWarSystem`、移动评分 |
| Item System | 新增空投 LootNode，遗物可被 AI 拾取 | 扩展 LootNode source 与掉落包策略 |
| Run State | 移除固定回合上限，新增 Poison/Airdrop state | 更新 `RunState` 与调参参数 |
| HUD/Render | 显示毒圈、空投红点、内战提示 | 后续 UI/Phaser 同步 |

## Acceptance Criteria

- [ ] 规则书不再要求维护或显示 `encounterPressure`。
- [ ] 战斗 UI 不显示固定 `x/3`、`x/4` 或遭遇压力。
- [ ] 成功躲闪至少获得 1 点真实情报。
- [ ] 继续战斗给予力量 +1、速度 +1，持续 1 动作回合。
- [ ] 说服成功停战 1 个玩家行动回合，并提供路线和其他敌人接触情报。
- [ ] 敌人相遇可自动结算内战，产生战损、遗物和胜者拾取成长。
- [ ] 每 15 回合生成空投红点和额外 LootNode。
- [ ] 每 20 回合毒圈收缩 1 层，毒圈内行动结算受到 5 伤害。
- [ ] 敌人移动评分会避开已生成毒圈。

## GDD Update Required?

Yes. 已更新 `CCGS-Data/design/gdd/rulebook.md` 第 4、6、7、8、11、12、13、14、19-23 章，并同步系统框架与端口文档。
