# v0.8.14 附魔运行时实装 Changelog

日期：2026-05-20  
范围：规则书 v0.8.14 附魔/神话宝石第一版代码落地

## 变更摘要

- 新增 6 件神话稀有度附魔宝石：燃烧、剧毒、极寒、染血、致命、闪耀。
- 新增 `src/sim/systems/enchantmentSystem.ts`，集中维护附魔类型、宝石映射、10% 自然附魔、1% 宝石 offer 注入、134 件普通拾取道具的附魔载体模板。
- `InventorySlot` 增加 `affix`，背包添加、合并、克隆和敌人掉落会保留附魔实例状态。
- 三选一 offer 保持普通道具池 134 件，并有 1% 概率注入一件神话附魔宝石。
- 道具实例生成时可按 seed 稳定获得自然附魔；玩家拾取、敌人拾取和敌人初始装备走同一实例生成入口。
- 战斗端接入统一附魔解析：近战、远程、投掷、陷阱、主动准备后的下一次伤害都能消费附魔。
- 旧弹夹附魔在完整换弹成功后写入下一次伤害预备；换弹中断不写入。
- HUD 背包显示附魔实例名称，新增 `mythic` 稀有度红色视觉样式；宝石图标临时复用现有同主题道具图标。
- `system-framework.md` 更新到 v0.8.14，登记附魔、宝石、实例状态、端口边界和测试要求。

## 关键文件

- `src/sim/types.ts`
- `src/sim/items.ts`
- `src/sim/systems/enchantmentSystem.ts`
- `src/sim/systems/inventorySystem.ts`
- `src/sim/systems/itemBalanceSystem.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/map.ts`
- `src/sim/systems/lootSystem.ts`
- `src/render/gridDungeonAssets.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/unit/enchantment_system.test.mjs`
- `tests/unit/item_balance_system.test.mjs`
- `tests/unit/rarity_ui.test.mjs`
- `tests/integration/simulation.test.mjs`

## 验证

- `npm test`：119 项通过。
- `npm run build`：通过。

## 后续建议

- 补一个专门的端到端集成测试，分别覆盖附魔近战、附魔枪击、附魔陷阱和宝石写入目标。
- 若要让玩家选择宝石写入对象，应新增模拟命令 `chooseEnchantTarget`，不要让 HUD 直接修改 `InventorySlot.affix`。
- 为 6 件宝石生成独立图标，替换当前复用图标。
