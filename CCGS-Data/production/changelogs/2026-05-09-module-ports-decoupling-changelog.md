# 模块端口与解耦确认 Changelog

日期：2026-05-09  
关联架构：`CCGS-Data/project-docs/architecture/module-ports.md`

## 修改文件

- 新增：`src/sim/ports.ts`
- 更新：`src/sim/GameSimulation.ts`
- 更新：`src/render/GameScene.ts`
- 更新：`src/main.ts`
- 新增：`CCGS-Data/project-docs/architecture/module-ports.md`
- 更新：`CCGS-Data/project-docs/architecture/system-framework.md`
- 更新：`CCGS-Data/project-docs/architecture/control-manifest.md`
- 更新：`CCGS-Data/project-docs/architecture/architecture.md`
- 同步：`docs/system-framework.md`、`docs/module-ports.md`

## 变更摘要

- 明确运行时端口：
  - `SimulationReadPort`：只读状态与订阅，供渲染层使用。
  - `SimulationCommandPort`：玩家输入与 HUD 命令，供输入桥接层使用。
  - `SimulationPort`：当前原型完整模拟层端口，由 `GameSimulation` 实现。
- `GameScene` 从直接依赖 `GameSimulation` 改为依赖 `SimulationReadPort`。
- `main.ts` 将运行实例标注为 `SimulationPort`，作为 HUD/输入桥接的唯一命令端口。
- `GameSimulation.onChange()` 现在返回 unsubscribe 函数，方便后续场景/生命周期清理。
- 补充公共端口方法注释，符合项目公共 API 文档要求。

## 架构结论

当前文件解耦状态为 PASS：

- `src/sim` 拥有规则和状态，不依赖 DOM、Phaser、CSS。
- `src/render` 只读取状态，不调用命令端口。
- `src/main.ts` 只通过模拟层命令端口改变游戏状态。
- 道具、地图、属性、端口、模拟聚合实现已形成独立板块。

## Scope Check

计划内：

- 确认当前游戏文件解耦。
- 固化每个板块的输入/输出端口。
- 做最小代码对齐，让端口不只停留在文档。

计划外：

- 无。

## 验证

- 静态检查：`src/render` 未调用 `move/useItem/playCombatAction` 等命令端口。
- 静态检查：`src/sim` 未出现 Phaser、DOM、window、document 依赖。
- `npm test`：11 tests passed。
- `npm run build`：通过。
