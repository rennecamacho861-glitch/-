# v0.8.1 模板化新增道具 QA 报告

日期：2026-05-14  
结论：PASS

## 范围

- 规则：`CCGS-Data/design/gdd/rulebook.md`
- 架构：`system-framework.md`、`module-ports.md`
- 实现：`src/sim/types.ts`、`src/sim/items.ts`、`src/sim/GameSimulation.ts`、`src/sim/systems/itemEffectSystem.ts`、`src/sim/systems/enemySystem.ts`
- 映射：`src/render/gridDungeonAssets.ts`
- 测试：`tests/integration/simulation.test.mjs`、既有 unit/integration 回归

## 内容审查

- 新增道具数：12。
- 当前 `ALL_ITEM_IDS.length === 55`。
- 当前 `PICKUP_ITEM_POOL.length === 55`。
- 新增道具均具备：
  - `usage`
  - `ports`
  - `effects`
  - `counterplay`
  - 拾取池入口
  - 图标映射
- 55 个道具均通过 `all item definitions resolve to produced grid dungeon icons`。

## 一致性审查

- 新增道具先写入规则书 `12.5.2 v0.8.1 模板化新增道具`。
- 单体情报仍只生成属性数值或道具情况；信号镜只调用既有 `revealEnemyItem`。
- 折叠地图使用 `intelTemplateSystem` 的全场变量模板，不生成路线、意图、态势或性格文本。
- 状态效果继续走 `statusEffectSystem`，并受触发链上限保护。
- Phaser 渲染层只增加图标映射，没有写入玩法规则。

## 自动化结果

- `npm test`
  - 结果：PASS
  - 用例：51/51 通过
- `npm run build`
  - 结果：PASS

## 覆盖点

- 新增战斗道具：
  - 火绒瓶进入 active effect，命中后造成灼烧即时伤害。
  - 玻璃刺进入 `critChance` 修正。
  - 状态类 next-hit 道具通过共享运行时结算。
- 新增场外道具：
  - 信号镜能对可见敌人获取真实道具情报。
  - 折叠地图能输出全场变量情报。
  - 跑绳结能沿朝向移动 2 格，且不绕过墙线/单位检查。
- 敌人 AI：
  - 可选择新增战斗道具进入 `useItem` 行动。

## 残余风险

- 新增 12 件道具暂复用现有图标资产；后续若需要更强识别度，应走资产规格与图标生成流程。
- 信号火目前沿用既有 `revealBoost` 倒计时模型，表现为短时高亮，但半径与持续仍共用一个数值；若后续要精确区分“半径 +4、持续 2 回合”，建议把临时视野改为 `{amount, remainingTurns}` 结构。

