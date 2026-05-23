# Balance Check: v0.8.2 道具稀有度与强度模型

## Data Sources Analyzed

- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `src/sim/items.ts`
- `src/sim/systems/itemBalanceSystem.ts`
- `src/sim/map.ts`
- `src/sim/systems/lootSystem.ts`
- `tests/unit/item_balance_system.test.mjs`
- `tests/integration/simulation.test.mjs`

## Health Summary: HEALTHY

v0.8.2 已将 55 件局内道具从 `common/rare` 两档扩展为 `common/uncommon/rare` 三档，并将拾取权重、玩家战利价值、敌人拾取基础评分和强度评分收束到 `itemBalanceSystem`。

当前分布：

| 稀有度 | 件数 | 目标说明 |
|---|---:|---|
| `common` | 22 | 基础治疗、基础情报、小额数值修正、轻量反制 |
| `uncommon` | 28 | 中等战斗收益、优势联动、状态/移动/全场情报 |
| `rare` | 5 | 手枪、长刀、旧弹夹、冷凝钉、信号火 |

强度检查：

- 最大单件强度为 `pistol = 5.5`，未超过上限 `6.0`。
- `glass-spike = 0.8`，按暴击期望收益处理，没有把 `20%` 误当作 20 点强度。
- `signal-flare = 4.5`，固定为 `+4` 明亮视野、持续 2 回合。
- `old-magazine = 4.6`，作为手枪组合件保持 rare；无手枪时敌人评分下降。

拾取分布抽样验证：

| 样本 | common | uncommon | rare |
|---|---:|---:|---:|
| 240 seeds x 30 offers x 3 items | 15658 | 4888 | 1054 |

该结果接近规则目标 `72 / 23 / 5`，且保持 `common > uncommon > rare`。

## Outliers Detected

| Item/Value | Expected Range | Actual | Issue |
|---|---:|---:|---|
| 无 | - | - | 未发现超过 6.0 或稀有度区间不匹配项 |

## Degenerate Strategies Found

- 未发现新增退化策略。
- 远程强度仍集中在 `pistol`，但稀有度权重和弹药上限继续限制其频率。
- `frost-nail` 保留优势窗口和近战命中限制，避免冻结稳定硬控。

## Progression Analysis

普通拾取节点现在先按稀有度档位抽取，再在该档内选具体道具，避免 common 道具数量较多时稀释 rare 概率。玩家会更常获得基础构筑件，偶尔获得明确改变局势的 rare。

## Recommendations

| Priority | Issue | Suggested Fix | Impact |
|---|---|---|---|
| P2 | 后续新增道具若只给 rarity 不给强度模型，会破坏审计 | 新增道具必须同时补 `EFFECT_KEY_POWER` 或可验证 fallback | 保持平衡测试可持续 |
| P3 | 空投权重已预留但空投系统尚未完全落地 | 实装空投时复用 `createWeightedItemOffer(..., "airdrop")` | 避免另写一套掉落表 |

## Values That Need Attention

- `pistol = 5.5` 已接近上限，后续若增加弹药补充来源，需要同步下调手枪或弹夹收益。
- `signal-flare = 4.5` 是最低 rare，若玩家感知不够强，可优先增强 UI/演出，而不是继续提高视野持续。

Re-run `/balance-check` after future item additions or rarity changes to verify.
