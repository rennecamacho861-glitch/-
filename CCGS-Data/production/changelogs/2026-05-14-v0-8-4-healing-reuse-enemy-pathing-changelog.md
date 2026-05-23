# v0.8.4 治疗续航、主动道具复用与敌人寻路 Changelog

日期：2026-05-14  
范围：规则书、架构端口、道具数据、道具运行时、敌人 AI、测试

## 变更摘要

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/healing-sustain-active-reuse-enemy-pathing-2026-05-14.md`。
- 更新 `rulebook.md` 至 v0.8.4，新增 8 件治疗/止损道具，并明确主动道具默认可复用。
- 更新 `system-framework.md` 与 `module-ports.md`，将治疗道具、主动使用扣费、敌人可达寻路写入架构约束。
- 新增道具：`salve-tin`、`field-ration`、`charcoal-tablet`、`pressure-bandage`、`heat-pad`、`blood-sponge`、`mercy-thread`、`emergency-syringe`。
- 修正主动道具默认 usage：未标明固定次数、弹药或显式消耗的主动道具不再默认一次性销毁。
- 新增 `spendItemUse()`，统一处理无限使用、固定次数、用完销毁、用完保留和可补充弹药。
- 敌人战斗 AI 新增治疗候选，会在低血量或负面状态下使用可用治疗道具。
- 敌人移动从贪心步进改为可达寻路，复杂边缘墙迷宫中可绕墙追踪、巡逻和找道具。
- 修正场外道具推进回合后提示点被视野刷新清空的问题。
- 新增图标映射复用现有图标资源；未新增美术资产。

## 验证

- `npm test`：67/67 通过。
- `npm run build`：通过。

## 注意

- 新治疗道具进入现有 3 选 1 拾取池，当前 `ALL_ITEM_IDS` 与 `PICKUP_ITEM_POOL` 均为 73。
- 部分新道具暂复用相近图标，后续如进入美术迭代可单独制作治疗道具图标表。
