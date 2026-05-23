# Changelog - v0.8.12 Story 004 道具使用限制与有效构筑预算
日期：2026-05-19  
范围：`story-004-item-limits-build-budget`

## 变更摘要

- 新增 `src/sim/systems/itemLimitSystem.ts`，提供主动槽上限、被动构筑预算、同名被动去重和 rare 主动道具 usage 审计 helper。
- `src/sim/GameSimulation.ts` 接入每名单位每战斗回合最多主动使用 1 件战斗道具的限制，玩家与敌人共用同一模拟层判定。
- 被动道具触发改为先经过有效构筑预算筛选：默认主动槽 4、被动预算 5；common/uncommon/rare 分别消耗 1/2/3。
- 同名被动在预算筛选中只保留 1 件，未进入预算的被动不触发。
- rare 主动道具补齐显式 usage 合约，确保手枪、绷带、长刀、回声针、霜凝钉、信号灯等道具的次数/消耗规则可审计。
- 旧回归测试同步移除“一回合连续使用多件主动道具”的过期假设，并改为单件主动道具或直接触发被动条件来验证原有系统。

## 修改文件

- `src/sim/systems/itemLimitSystem.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/items.ts`
- `src/sim/types.ts`
- `tests/integration/item_limits_build_budget_test.mjs`
- `tests/integration/simulation.test.mjs`
- `tests/unit/item_runtime_system.test.mjs`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`
- `CCGS-Data/production/session-state/active.md`

## 验证

- `npm test`：105/105 通过。
- `npm run build`：通过。

## Scope Check

- 计划内：模拟层道具限制、被动预算、rare usage 审计、集成测试、Epic/Story 状态与 session 记录更新。
- 计划外但必要：更新旧测试对同回合多道具使用的假设，避免回归测试与新规则冲突。
- 未改动：HUD/背包装备 UI、AI 战术评分、道具新增与美术资源。

## 备注

- 当前主动槽/被动预算是模拟层自动规则，尚未做可视化装备管理 UI；后续若需要玩家手动配置构筑，应在 UI Story 中接入同一端口。
