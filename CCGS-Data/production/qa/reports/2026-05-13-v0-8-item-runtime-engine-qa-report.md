# v0.8 局内道具规范化与效果引擎 QA 报告

日期：2026-05-13  
结论：PASS

## 范围

- 规则真源：`CCGS-Data/design/gdd/rulebook.md`
- 架构端口：`CCGS-Data/project-docs/architecture/system-framework.md`、`module-ports.md`
- 模拟层：`src/sim`
- HUD 输入桥：`src/main.ts`
- 自动化测试：`tests/unit`、`tests/integration`

## 内容审查

- `ALL_ITEM_IDS.length === 43`。
- `PICKUP_ITEM_POOL.length === 43`。
- 每个拾取池道具均具备：
  - `usage`
  - 至少 1 个 `ports`
  - 至少 1 个 `effects`
  - `counterplay`
- 自动化覆盖：`all v0.8 pickup items have runtime template ports and effects`。
- `src` 中未发现玩家可见的“暂未实装主动效果”提示。

## 一致性审查

- `rulebook.md` 已声明 v0.8 道具规范、使用次数、端口、效果、触发链、Debuff 与情报模板。
- `system-framework.md` 已声明 `itemRuntimeSystem`、`statusEffectSystem`、`intelTemplateSystem`。
- `module-ports.md` 已声明 HUD 只读置灰、Phaser/DOM 不写规则、道具情报 hover 读取 `ITEMS`。
- 单体情报仍只允许两类：
  - `statExact`：属性具体数值。
  - `item`：拥有/未见某道具。
- 全场情报使用运行时模板变量，不写预设数值。

## 代码审查

- 规则和状态仍在 `src/sim`：
  - 道具次数与同回合锁：`itemRuntimeSystem.ts`
  - 灼烧/中毒/流血/冻结：`statusEffectSystem.ts`
  - 全场情报模板：`intelTemplateSystem.ts`
- `GameSimulation` 只做调度与兼容接线，没有把新规则放进 Phaser。
- `src/main.ts` 只读取 `InventorySlot.lastManualUseRound` 置灰按钮，不自行判断道具效果。
- 敌人和玩家共用战斗道具效果解析表，敌人 AI 可选择更多可用道具。

## 自动化结果

- `npm test`
  - 结果：PASS
  - 用例：49/49 通过
- `npm run build`
  - 结果：PASS
  - Vite 产物成功生成

## 覆盖点

- 同一可复用道具同回合只能手动使用一次。
- 不同道具可同回合连续使用。
- 手枪可保留弹药状态，旧弹夹可补充。
- 默认数值修正取最强值，显式 `add` 才叠加。
- 自动触发链第 6 次停止。
- 灼烧、中毒、流血、冻结均有单元测试。
- 铁蒺藜、黑布等场外道具进入集成测试。
- 单体推测情报不出现态势、意图、路线、方向或性格文本。
- 全场情报来自当前 `GameState`。

## 残余风险

- 道具模板已覆盖 43 个现有 ID，但批量新增道具时仍需继续按 v0.8 模板补测试，不应直接追加 `effectKey` 后依赖默认日志效果。
- 当前 UI 仍以 `itemId` 触发道具，背包中同名多个实例仍表现为聚合槽位；对当前原型足够，但未来如果出现“同名不同耐久/附魔”的道具，需要拆成可选实例 UI。

