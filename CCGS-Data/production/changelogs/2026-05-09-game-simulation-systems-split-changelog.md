# GameSimulation 系统拆分 Changelog

日期：2026-05-09  
类型：架构重构 / 模拟层解耦  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.5  
对应架构：`CCGS-Data/project-docs/architecture/module-ports.md`

## 修改文件

- `src/sim/GameSimulation.ts`
- `src/sim/systems/randomSystem.ts`
- `src/sim/systems/movementSystem.ts`
- `src/sim/systems/visibilitySystem.ts`
- `src/sim/systems/inventorySystem.ts`
- `src/sim/systems/lootSystem.ts`
- `src/sim/systems/enemySystem.ts`
- `src/sim/systems/combatSystem.ts`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `docs/system-framework.md`
- `docs/module-ports.md`

## 变更摘要

- 将 `GameSimulation` 中的纯规则/状态工具拆出到 `src/sim/systems/`。
- 保持外部 `SimulationPort`、`SimulationReadPort`、`SimulationCommandPort` 不变。
- `GameSimulation` 继续负责命令入口、回合编排、遭遇创建、战斗回合编排、撤离/失败与日志。
- 新增系统模块覆盖随机、移动、视野、背包、拾取/掉落、敌人行动和手枪可用性判定。
- 保留 `checkEncounter()` 与 `collectEnemyDrops()` 的现有测试兼容入口。

## Proposal 偏离

- 本次是上一轮“模块端口解耦”后的执行性重构，没有新增玩法规则，因此未修改规则书。
- 完整战斗行动结算仍留在 `GameSimulation`，仅先拆出远程可用性判定；后续新增战斗内道具前再拆 `combatRoundSystem`。

## 已知局限

- `snapshot()` 仍返回真实状态对象，调用方仍需遵守只读约定。
- `resolveActionRound()`、`resolveMeleeAttack()`、`resolveRangedAttack()` 仍在编排器内，属于下一轮拆分优先项。

## Scope Check

- 计划内：模拟层内部拆分、架构文档同步、测试验证。
- 计划外：无玩法规则、HUD、Phaser 渲染或数值内容变更。
