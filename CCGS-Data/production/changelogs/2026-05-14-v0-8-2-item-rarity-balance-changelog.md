# Changelog: v0.8.2 道具稀有度与强度模型平衡

日期：2026-05-14

## 变更摘要

- 将 `ItemDefinition.rarity` 扩展为 `common / uncommon / rare` 三档。
- 新增 `src/sim/systems/itemBalanceSystem.ts`，统一提供稀有度权重、强度评分、玩家战利价值、敌人拾取基础评分和三选一加权生成。
- 重分配 55 件道具稀有度：22 件 common、28 件 uncommon、5 件 rare。
- 普通道具节点 3 选 1 改为按 `72/23/5` 稀有度权重生成，并保证同一 offer 不重复、同 seed 可复现。
- 玩家拾取收益改为按稀有度结算：common +1、uncommon +2、rare +3。
- 敌人拾取评分改为从稀有度基础分开始计算，并保留旧弹夹有/无手枪时的评分差异。
- `signal-flare` 改为显式 `+4` 明亮视野、持续 2 回合，不再复用递减 `revealBoost`。
- HUD 将背包按钮、三选一拾取按钮、敌人道具情报悬浮项透传 `data-rarity`，并用灰/青绿/金色边框区分 common/uncommon/rare。
- 同步更新 `rulebook.md`、`system-framework.md`、`module-ports.md` 与 `docs/` 副本。

## 测试

- `npm test`：59/59 通过。
- `npm run build`：通过。

## 备注

- 空投系统暂未在本轮实装，但 `itemBalanceSystem` 已预留 `airdrop` 权重 `45/40/15`。
- 后续新增道具时必须同步补强度评分模型，避免只写 rarity 导致平衡审查失真。
