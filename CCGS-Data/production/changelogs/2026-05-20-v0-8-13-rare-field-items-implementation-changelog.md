# Changelog - v0.8.13 橙色局外道具与掉落经济实装

日期：2026-05-20  
类型：Gameplay / Loot Economy / HUD Feedback  
状态：Complete

## 变更摘要

- `回声针` 改为无限使用；每次成功释放花费 1 个探索回合，并继续标出最近敌人或道具节点所在的 `2x2` 回响区。
- `绷带` 改为无限使用；战斗外成功治疗回复 3 点生命并花费 1 个探索回合，满血或战斗中使用不会推进回合。
- `旧弹夹` 改为无限使用；战斗外启动 2 回合换弹，完成后手枪 +2 发，最多到 5 发；换弹任一阶段进入照面则失败且不补弹。
- 新增 `item-reload` 反馈事件，用于换弹开始、完成和失败的确认式弹窗。
- `rare` 掉落不再参与敌人掉落保底，也不再使用 35% 普通掉落检定；每件 rare 候选独立 8% 掉落。
- `nonRare` 掉落保留稳定收益：有候选时保底 1 件，其余按 35% 检定，最多 2 件，5% 额外 1 件。
- 地图生成新增 `rareItemAppearances` 记录，开局三选一、敌人初始携带和 LootNode offer 共享同一 rare 同物品可见生成上限 2。
- 敌人战斗 AI 不再尝试在照面中使用旧弹夹换弹。

## 代码变更

- `src/sim/items.ts`
  - 更新 `bandage`、`echo`、`old-magazine` 的 usage 与说明。
- `src/sim/GameSimulation.ts`
  - 增加旧弹夹两段式换弹流程。
  - 增加换弹中断反馈。
  - 更新回声针与绷带反馈正文，明确回合成本。
- `src/sim/types.ts`
  - 增加 `FeedbackEvent.kind = "item-reload"`。
  - 增加 `GameState.rareItemAppearances`。
- `src/sim/map.ts`
  - 在开局、敌人初始携带、LootNode 生成时登记 rare 出现次数。
  - 避免同一 rare 在一局可见生成超过 2 个。
- `src/sim/systems/itemBalanceSystem.ts`
  - 增加 rare 出现上限与 rare 掉落率常量。
  - 扩展 `createWeightedItemOffer()` 支持 rare cap-aware offer 生成。
- `src/sim/systems/lootSystem.ts`
  - 拆分 `rare` 与 `nonRare` 掉落结算。
  - 保留掉落实例的 charges/durability/usedFlags。
- `src/sim/systems/enemyTacticalScoringSystem.ts`
  - 阻止敌人在战斗动作选择中把旧弹夹当作即时战斗道具。
- `src/sim/itemText.ts`
  - 更新回声针、绷带、旧弹夹的玩家可见说明与限制说明。

## 文档变更

- `CCGS-Data/project-docs/architecture/system-framework.md`
  - 同步 v0.8.13 的无限 rare 局外道具、旧弹夹延迟换弹、rare 掉落和 rare 出现上限。
- `CCGS-Data/design/quick-specs/rare-field-items-and-drop-economy-2026-05-19.md`
  - 增加 2026-05-20 implementation status。

## 验证

- `npm test`：115/115 通过。
- `npm run build`：通过。

## 备注

- 本轮没有改 Phaser 渲染或 CSS 布局；HUD 复用现有反馈弹窗显示 `item-reload`。
- `signal-flare`、`frost-nail` 与 rare 被动道具本轮未改具体强度；它们已受到 rare 低掉落率和同物品上限约束。后续若继续调整橙色强度，建议单独做 rare item audit。
