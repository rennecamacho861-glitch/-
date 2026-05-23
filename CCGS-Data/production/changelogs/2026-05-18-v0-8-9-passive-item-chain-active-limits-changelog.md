# v0.8.9 被动道具链与主动次数限制 Changelog

日期：2026-05-18

## 变更摘要

- 按 CCGS quick-design 流程新增规格：`CCGS-Data/design/quick-specs/passive-item-chain-and-active-charge-limits-2026-05-18.md`。
- `rulebook.md`、`system-framework.md`、`module-ports.md` 同步到 v0.8.9：橙色稀有度以下主动/反应道具默认有限次数；新增被动道具链规则。
- 非 rare 主动/反应道具默认次数：
  - common：2 次，用完销毁。
  - uncommon：3 次，用完销毁。
  - rare：只按道具自身规则处理，不套默认限制。
- 新增 11 件被动道具并加入拾取池：
  - 直接被动属性：铅缠带、踝簧、裂准镜。
  - 时间端口：火星引线、二息带、锈粉囊。
  - 条件端口：煤珠串、毒丝束、冷铆钉、裂口钩、破挡楔。
- `GameSimulation` 接入被动触发：
  - 照面开始触发属性类被动。
  - 第 1 / 第 2 / 第 3 回合及以后触发时间端口。
  - 施加燃烧/中毒/冻结、暴击、击中防御目标时触发条件端口。
- 敌人 AI 增强：
  - 更积极使用可用主动道具。
  - 持有被动连携道具时，会优先尝试匹配的主动触发道具，例如燃烧、中毒、冻结、暴击与破防链。
- 道具系统补充：
  - 堆叠同名有限次数道具时会累加默认次数。
  - 道具强度模型、稀有度测试、图标映射和拾取池数量同步更新到 84 件。

## 影响范围

- 规则层：`CCGS-Data/design/gdd/rulebook.md`
- 架构层：`CCGS-Data/project-docs/architecture/system-framework.md`
- 端口层：`CCGS-Data/project-docs/architecture/module-ports.md`
- 模拟层：`src/sim/GameSimulation.ts`、`src/sim/items.ts`、`src/sim/types.ts`
- 系统层：`src/sim/systems/enemySystem.ts`、`inventorySystem.ts`、`itemBalanceSystem.ts`
- 表现资源映射：`src/render/gridDungeonAssets.ts`
- 测试：`tests/integration/simulation.test.mjs`、`tests/unit/item_runtime_system.test.mjs`、`tests/unit/item_balance_system.test.mjs`

## 验证

- `npm test`：82 项通过。
- `npm run build`：通过。

## 备注

- 本轮没有新增独立 UI 面板；被动触发反馈进入现有日志与战斗效果队列。
- 触发链仍遵守每战斗回合最多 5 次自动触发，防止状态互相循环。
