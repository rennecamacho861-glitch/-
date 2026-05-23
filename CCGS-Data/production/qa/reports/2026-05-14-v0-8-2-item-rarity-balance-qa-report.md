# QA Report: v0.8.2 道具稀有度与强度模型平衡

日期：2026-05-14

## 范围

- 三档稀有度类型与 55 件道具分配。
- 道具强度评分模型与区间校验。
- 普通拾取节点加权 3 选 1。
- 玩家拾取战利价值。
- 敌人拾取评分与旧弹夹上下文评分。
- `signal-flare` 精确 2 回合视野持续。
- 拾取、背包和敌人道具情报的稀有度边框表现。

## 自动化验证

| 命令 | 结果 |
|---|---|
| `npm test` | PASS，59/59 |
| `npm run build` | PASS |

## 新增/调整测试

- `tests/unit/item_balance_system.test.mjs`
  - 校验 `common / uncommon / rare` 三档存在。
  - 校验 55 件道具强度评分均匹配稀有度区间。
  - 校验无道具强度超过 `6.0`。
  - 校验 `glass-spike` 暴击率按期望收益计算。
  - 校验普通拾取与空投权重、玩家战利价值。
- `tests/integration/simulation.test.mjs`
  - 校验 loot offer 同 seed 可复现、不同 seed 有差异、同 offer 不重复。
  - 校验大样本稀有度分布满足 `common > uncommon > rare`，抽样结果接近 `72/23/5`。
  - 校验 common/uncommon/rare 拾取分别给予 +1/+2/+3 战利。
  - 校验 `signal-flare` 只提供固定两回合明亮视野加成。
  - 校验敌人拥有手枪时更重视旧弹夹，无手枪时明显降权。
- `tests/unit/rarity_ui.test.mjs`
  - 校验 HUD 将稀有度透传到背包按钮、拾取按钮和敌人道具情报。
  - 校验 CSS 拥有 common/uncommon/rare 三档边框色变量与选择器。

## 结论

PASS。v0.8.2 平衡改动已覆盖规则、架构、实现和回归测试。当前没有登记测试债务。

## 风险

- 强度评分目前以 `effectKey` 模型为主；后续新增道具若复用旧 `effectKey` 但实际效果更强，需要同步扩展评分函数。
- 空投权重已预留但空投生成本身不在本轮范围，后续接入时必须复用现有 `itemBalanceSystem`。
