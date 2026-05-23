# v0.8 局内道具规范化与效果引擎 Changelog

日期：2026-05-13  
范围：规则书、架构端口、模拟层道具运行时、状态效果、情报模板、HUD 道具置灰、自动化测试

## 变更摘要

- 将 `rulebook.md` 更新到 v0.8，新增“局内道具设计规范”和“情报模板规范”。
- 将 `system-framework.md` / `module-ports.md` 更新到 v0.8，明确 `itemRuntimeSystem`、`statusEffectSystem`、`intelTemplateSystem` 的职责和端口边界。
- 扩展 `ItemDefinition` 模板：`usage`、`ports`、`effects`、`aiWeight`、`counterplay` 成为道具数据必备结构。
- 现有 43 个道具全部进入统一模板；拾取池中不再保留只有规则、没有可解析端口和效果的道具。
- 新增道具运行时：
  - 同一件道具同回合手动使用一次后置灰。
  - 不同道具可在同回合连续使用。
  - 效果叠加默认取最强值，显式 `stackPolicy: "add"` 才叠加。
  - 自动触发链每战斗回合最多 5 次。
- 新增标准 Debuff 系统：
  - 灼烧立即出伤、短持续。
  - 中毒延迟出伤、持续更久。
  - 流血在攻击/躲闪时出伤。
  - 冻结使目标下一动作回合停滞一次。
- 新增情报模板系统：
  - 单体情报继续只允许“属性 = 数值”或“拥有/未见道具”。
  - 全场情报由 `GameState` 运行时计算，例如敌人平均速度、携带道具最多角色。
- 补齐一批原先容易“只写规则”的道具效果：
  - 铁蒺藜、铜铃线进入场外陷阱触发。
  - 黑布提供 2 回合敌方视野距离 -1，攻击后失效。
  - 假声哨可引导附近敌人移动，高智力敌人可能识破。
  - 数息绳在同敌人第 2 回合后触发概率推测情报。
  - 偏光片可对敌方烟雾反馈免疫提示。
  - 腐蚀小瓶接入中毒状态。
  - 凝血粉可清除灼烧/中毒/流血。
- 敌人战斗 AI 现在可使用更多与玩家共用的战斗道具效果，不再只限制在优势道具小集合。
- HUD 道具按钮读取 `InventorySlot.lastManualUseRound` 进行置灰，不在 DOM 层推导规则。

## 文件变更

- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `src/sim/types.ts`
- `src/sim/items.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/systems/itemRuntimeSystem.ts`
- `src/sim/systems/statusEffectSystem.ts`
- `src/sim/systems/intelTemplateSystem.ts`
- `src/sim/systems/itemEffectSystem.ts`
- `src/sim/systems/enemySystem.ts`
- `src/sim/systems/visibilitySystem.ts`
- `src/main.ts`
- `tests/unit/item_runtime_system.test.mjs`
- `tests/unit/status_effect_system.test.mjs`
- `tests/unit/intel_template_system.test.mjs`
- `tests/unit/item_effect_system.test.mjs`
- `tests/integration/simulation.test.mjs`

## 验证

- `npm test`：49/49 通过。
- `npm run build`：通过。
- 内容审查：43 个道具均在 `ALL_ITEM_IDS` 与 `PICKUP_ITEM_POOL` 中，且均具备 `usage`、`ports`、`effects`、`counterplay`。
- 文本审查：`src` 中不再存在“暂未实装主动效果”类玩家可见提示。

