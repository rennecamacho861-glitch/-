# Quick Design Spec: 战斗真实情报与软三回合收束

**Type**: Addition  
**System**: Vision & Intel / Encounter Combat  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md` 第 6、7、14、19、20、23 章  
**Date**: 2026-05-09

## Change Summary

战斗信息从“预写文本倾向”改为“从实时状态读取的真实情报”：具体属性数值、具体道具实例与剩余次数、下一回合意图或攻击方向。战斗不再使用固定 3 回合或固定 4 回合上限，而是通过压力值在大约第 3 回合开始推动优势窗口、撤退、说服或击败。

## Motivation

玩家需要在 1-2 个动作回合内拿到足够可行动的信息，否则“读心博弈”会退化成盲猜。信息必须能直接改变玩家选择，例如知道“敌人速度 5，所以我不该裸进攻”、知道“敌人有手枪但只剩 1 发”、知道“敌人下一回合倾向防御，可以说服或继续压伤害”。

## Design Delta

当前规则把信息写成层级和文本倾向：

> 有效信息包括：对方最高属性、对方最低属性、对方是否有远程手段、对方是否携带某类道具、对方偏好动作、对方攻击方向倾向。

本规格改为：

信息条目必须绑定实时数据字段，分为确认情报与推测情报。确认情报必须来自当前 `ActorState`、`InventorySlot` 或已锁定 AI 下一动作；推测情报必须显示置信度、来源和有效轮次。

## New Rules / Values

### 1. 情报类型

每条情报至少包含：

- `targetId`：目标单位。
- `kind`：情报类型。
- `payload`：结构化真实数据。
- `certainty`：`confirmed` 或 `suspected`。
- `source`：获得来源。
- `validUntilRound`：仅用于下一动作/攻击方向等短期情报。

MVP 情报类型：

| kind | payload | 说明 |
|---|---|---|
| `statExact` | `{ stat: StatKey, value: number }` | 知道某一项属性具体数值 |
| `statProfile` | `{ highest: StatKey, highestValue: number, lowest: StatKey, lowestValue: number }` | 知道最高/最低属性及具体值 |
| `itemExact` | `{ itemId: ItemId, charges?: number, durability?: number }` | 知道一件具体道具及状态 |
| `loadoutSummary` | `{ hasRanged: boolean, hasHealing: boolean, itemCount: number }` | 知道装备结构概况 |
| `nextIntent` | `{ action: CombatActionType, locked: boolean }` | 知道或预判对手下一回合动作 |
| `attackDirection` | `{ direction: "left" \| "right", appliesIfAttack: true }` | 知道下一次攻击方向 |

### 2. 真实情报原则

- `confirmed` 情报必须直接读取当前模拟状态，不允许写成固定台词。
- `itemExact` 必须显示真实 itemId；若道具有 `charges`，默认只显示“有充能”，需要更高情报或计数珠才显示具体剩余次数。
- `nextIntent.locked = true` 表示 AI 已为下一回合锁定动作；除非目标不可用、道具失效、被重伤打断或脱战，否则不得改动。
- `nextIntent.locked = false` 表示倾向预测，必须显示置信度，不得伪装成确定答案。
- 情报重复时不再生成同一字段；系统优先补足未知字段。

### 3. 情报获取预算

每次触发情报获取时计算：

`intelBudget = 智力 + 来源修正 + 道具修正 + 优势修正 - 压力惩罚`

默认换算：

| intelBudget | 情报点 |
|---:|---:|
| 0-2 | 0 |
| 3-4 | 1 |
| 5-6 | 2 |
| 7-8 | 3 |
| 9+ | 4 |

情报点花费：

| 情报 | 花费 |
|---|---:|
| 单项具体属性 `statExact` | 1 |
| 装备概况 `loadoutSummary` | 1 |
| 具体道具 `itemExact` | 1 |
| 道具剩余次数/耐久 | 额外 1 |
| 最高+最低属性概况 `statProfile` | 2 |
| 下一动作倾向 `nextIntent locked=false` | 1 |
| 下一动作锁定 `nextIntent locked=true` | 2 |
| 下一攻击方向 `attackDirection` | 1 |

### 4. 情报来源修正

| 来源 | 修正 | 额外规则 |
|---|---:|---|
| 首次看见敌人 | +1 | 只能揭示装备概况或单项属性 |
| 视野领先进入战斗 | +2 | 可揭示 `statExact` 或 `itemExact` |
| 防御并承受敌方动作 | +3 | 优先揭示攻击者具体属性、道具或下一意图 |
| 成功躲闪 | +2 | 可揭示攻击方向、速度值或道具 |
| 躲闪但未被攻击 | +0 | 最多获得 1 点情报，且不能锁定下一动作 |
| 对方使用道具 | +3 | 可揭示该道具；有计数珠时可揭示剩余次数 |
| 陷阱/报警触发 | 直接 1 条 | 至少揭示位置；若有铜铃线，揭示一类装备 |
| 优势窗口选择继续并指定信息 | +2 | 下一次情报获取额外加成 |

### 5. 一到两回合内足够读牌

MVP 目标：

- 普通智力 3 的玩家，只要成功防御一次，就应获得 2 点情报。
- 普通智力 3 的玩家，若视野领先开局，再成功躲闪或防御一次，应累计获得 3-4 点情报。
- 高智力 5+ 的玩家，在一次有效防御或一次视野领先后，应能获得“一个具体数值 + 一个具体道具”或“一个具体数值 + 下一动作倾向”。

### 6. 战斗软三回合收束

取消固定 3 回合和固定 4 回合上限。战斗使用 `encounterPressure` 推动收束。

`encounterPressure` 初始为 0，每个动作回合结束后增加：

- +1：完成一个动作回合。
- +1：本回合有人受到伤害。
- +1：本回合有人重伤。
- +1：双方都选择进攻。
- +1：双方都没有造成有效结果，且回合数已大于等于 3。

当 `encounterPressure >= 3` 时，从本回合结束开始进行收束检查：

1. 若有人重伤或生命归零，按击败/优势窗口结算。
2. 若一方拥有优势，必须选择逃跑、说服、继续战斗或使用优势道具。
3. 若无人拥有优势，比较本回合有效结果：造成伤害者 > 成功躲闪者 > 成功防御并获得情报者 > 当前生命更高者 > 速度更高者。
4. 胜出者获得优势窗口；若仍无法区分，双方各后退 1 格并脱战，危险 +1。

第 3 回合不是硬上限，而是压力开始明显推动结局的时间点。高体质或高防御构筑可以拖到 4-5 回合，但系统必须持续增加收束压力，避免变成长期 HP 消耗。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| `src/sim/types.ts` | 扩展 `IntelKind`、`IntelEntry`、`EncounterState` | 实装时更新类型 |
| `src/sim/GameSimulation.ts` | 移除固定回合上限，接入压力收束 | 实装时拆入 `combatRoundSystem` |
| `src/sim/systems/enemySystem.ts` | 支持下一动作锁定/预判 | 实装时新增 AI intent 阶段 |
| `src/main.ts` | 显示结构化情报 | 实装时 UI 改为情报卡 |
| Tests | 覆盖情报真实性和软收束 | 新增逻辑/集成测试 |

## Acceptance Criteria

- [ ] 情报 UI 能显示“力量=5”“手枪剩余 2 发”“下一回合：防御/进攻/躲闪”等结构化字段。
- [ ] `confirmed` 情报全部来自实时状态，敌人属性或道具变化后不会生成错误值。
- [ ] 普通智力玩家防御一次可获得至少 2 点可行动情报。
- [ ] 视野领先 + 一次成功防御/躲闪通常能让玩家获得 3-4 点情报。
- [ ] 战斗不再显示固定 `x/4` 回合上限，而显示当前轮次和压力。
- [ ] 大多数战斗在约 3 回合出现优势窗口、击败、逃跑、说服或脱战。
- [ ] 无回归：进攻、防御、躲闪、远程先手、逃跑和说服仍按规则书原有含义运行。

## GDD Update Required?

Yes。需要更新：

- `CCGS-Data/design/gdd/rulebook.md` 第 6 章信息系统。
- `CCGS-Data/design/gdd/rulebook.md` 第 7 章照面战斗框架。
- `CCGS-Data/design/gdd/rulebook.md` 第 14 章 UI 信息展示。
- `CCGS-Data/project-docs/architecture/system-framework.md` 第 6、7、11 章。
