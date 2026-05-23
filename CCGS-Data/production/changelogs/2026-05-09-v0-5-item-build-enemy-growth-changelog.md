# v0.5 道具构筑与敌人成长 Changelog

日期：2026-05-09  
关联 Proposal：`CCGS-Data/production/proposals/2026-05-09-v0-5-item-build-enemy-growth-proposal.md`  
关联 Epic：`CCGS-Data/production/epics/v0-5-item-build-enemy-growth/EPIC.md`

## 修改文件

- 规则/架构：`CCGS-Data/design/gdd/rulebook.md`、`CCGS-Data/project-docs/architecture/system-framework.md`、`systems-index.md`、`tr-registry.yaml`、`docs/rulebook.md`、`docs/system-framework.md`
- 生产记录：新增 v0.5 Proposal、Epic、3 个 Story、本 Changelog 与 QA 报告。
- 运行时代码：`src/sim/types.ts`、`src/sim/items.ts`、`src/sim/map.ts`、`src/sim/GameSimulation.ts`
- 表现与 UI：`src/render/GameScene.ts`、`src/main.ts`、`src/styles.css`
- 测试：`tests/integration/simulation.test.mjs`、`tests/unit/stats.test.mjs`

## 规则变化

- 移除玩家主动搜索和屏息/等待动作。
- 搜索点替换为道具节点：玩家踩到后弹出 3 选 1，选择不额外推进回合，未选项移除。
- 敌人无固定类型字段，行为由属性、生命、视野、优势和道具推导。
- 敌人会拾取未清空道具节点，普通敌人持有上限 4 件，精英 5 件。
- 敌人被击败后按掉落概率结算装备，并保留手枪弹药等实例状态。
- 手枪默认弹药从 3 发调整为 5 发，长刀支持战斗中投掷后失去装备效果。
- 新增 30 件战斗小收益道具定义，分为伤害、生存、信息三类。

## 实现摘要

- 新增 `LootNode`、`pendingPickupOffer`、扩展 `ItemDefinition` 与 `InventorySlot`。
- `GameSimulation` 新增 `choosePickup`、AI 节点拾取、敌人掉落、手枪场外可见目标射击、长刀投掷和旧弹夹补弹。
- HUD 新增拾取弹窗与跳过按钮，移除搜索/屏息按钮。
- Phaser 地图绘制改为显示未清空道具节点。

## Scope Check

计划内：

- 规则书优先修改并同步架构。
- 三选一拾取、敌人拾取成长、掉落保留状态、道具池扩展。
- UI 与自动化测试同步。

计划外但必要：

- 同步 `docs/` 镜像文档，保持项目轻量文档入口一致。
- 更新 `tr-registry.yaml` 与 Epic Index，保持 CCGS 追踪链可恢复。

## 验证

- `npm test`：11 tests passed。
- `npm run build`：通过。
- `http://127.0.0.1:5173/`：本地服务返回 200。

## 已知局限

- 30 件新增小收益道具已进入数据和规则，但当前原型只实装其中关键基础效果；未实装主动效果会在日志中提示。
- 浏览器截图证据仍沿用既有 `TD-002` 记录，未在本次新增截图文件。
