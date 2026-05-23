# v0.8.10 被动道具网状扩展 Changelog

日期：2026-05-18

## 变更摘要

- 按 CCGS quick-design 流程新增规格：`CCGS-Data/design/quick-specs/passive-item-grid-expansion-2026-05-18.md`。
- `rulebook.md`、`system-framework.md`、`module-ports.md` 更新到 v0.8.10，并同步 `docs/` 副本。
- 新增 `src/sim/systems/passiveItemSystem.ts`，集中维护 50 件网状被动道具的触发规则，避免继续把大批道具写成 `GameSimulation` 内的单件 if 链。
- 新增 50 件被动道具并加入拾取池、稀有度模型、图标映射和 UI 描述：
  - 持续/回合时机：持续生效、首回合、次回合、第三回合后每回合。
  - 行动结果：闪避成功、防御成功、造成重伤、受到重伤。
  - 状态/伤害端口：燃烧、中毒、冻结、暴击、受到伤害、造成 5 点以上伤害、剩余 1 点生命。
  - 情报端口：获得情报后触发后续暴击收益。
- `GameSimulation` 新增被动事件分发：
  - 战斗开始、回合时机、闪避/防御成功、重伤、受伤、高伤、低血、状态施加、暴击、击中防御和获得情报。
  - 获得情报现在会真实广播 `onIntelGain`，不再只是写入情报列表。
  - 被动获得优势会接入本回合优势窗口结算。
- 更新道具强度模型：
  - 补充 v0.8.10 网状道具的 `effectKey` 分值。
  - 道具总数从 84 件提升到 134 件。
  - 稀有度清单与拾取池测试同步。

## 影响范围

- 规则层：`CCGS-Data/design/gdd/rulebook.md`、`docs/rulebook.md`
- 架构层：`CCGS-Data/project-docs/architecture/system-framework.md`、`module-ports.md` 与 `docs/` 副本
- 模拟层：`src/sim/GameSimulation.ts`、`src/sim/items.ts`、`src/sim/types.ts`
- 系统层：`src/sim/systems/passiveItemSystem.ts`、`itemBalanceSystem.ts`
- 表现映射：`src/render/gridDungeonAssets.ts`
- 测试：`tests/integration/simulation.test.mjs`、`tests/unit/item_balance_system.test.mjs`

## 验证

- `npm test`：83 项通过。
- `npm run build`：通过。

## 备注

- 本轮没有新增独立 UI 面板；被动触发继续进入现有日志与反馈链。
- 触发链仍遵守每战斗回合最多 5 次自动触发，防止状态互相循环。
- 新道具复用了现有图标资产映射，没有新增美术文件。
