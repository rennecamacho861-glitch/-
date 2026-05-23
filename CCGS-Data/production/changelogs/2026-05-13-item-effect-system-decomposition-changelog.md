# Changelog：战斗道具效果系统解构

日期：2026-05-13  
范围：模拟层内部解构、模块端口、技术债、测试

## 变更

- 新增 `src/sim/systems/itemEffectSystem.ts`。
- 将普通战斗道具 active effect 映射从 `GameSimulation.usePlayerCombatItem()` / `useEnemyCombatItem()` 的大 if 链中抽出。
- `itemEffectSystem` 只负责把 `ItemId + 目标 + 优势条件` 解析成：
  - `CombatItemEffectSpec`
  - `blocked` 阻塞原因
  - `unsupported` 不支持项
- `GameSimulation` 继续负责消费道具、写日志、挂载 `EncounterState.activeEffects` 和处理特殊道具。
- 新增 `tests/unit/item_effect_system.test.mjs`，覆盖玩家效果、优势阻塞、敌人当前可用面。
- 更新 `system-framework.md` / `module-ports.md`，登记 `itemEffectSystem` 端口。
- 更新 `tech-debt.md`：TD-003 标记为部分偿还，后续重点转为 `combatRoundSystem`。

## 非目标

- 本轮不改变任何道具数值和战斗规则。
- 本轮不拆完整 `resolveActionRound()`，避免一次移动过多战斗结算路径。
- 本轮不改变 `SimulationPort`、HUD 命令入口或 Phaser 渲染入口。

## 验证

- `npm test`：38/38 通过。
- `npm run build`：通过。
- 本地开发服务 `http://127.0.0.1:5188/`：HTTP 200。

## Scope Check

计划内文件：
- `src/sim/systems/itemEffectSystem.ts`
- `src/sim/GameSimulation.ts`
- `tests/unit/item_effect_system.test.mjs`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `CCGS-Data/production/tracking/tech-debt.md`

计划外但必要：
- `docs/system-framework.md`
- `docs/module-ports.md`

原因：同步轻量开发文档副本，避免工作区文档与 CCGS 真源不一致。
