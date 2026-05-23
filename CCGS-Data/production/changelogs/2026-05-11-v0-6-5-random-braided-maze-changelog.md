# v0.6.5 随机编织迷宫 Changelog

日期：2026-05-11  
类型：地图生成 Tweak / Quick Design / 模拟层测试  
对应 Quick Spec：`CCGS-Data/design/quick-specs/random-braided-maze-no-dead-ends-2026-05-11.md`  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.6.5 随机编织迷宫规则  

## 修改文件

- `CCGS-Data/design/quick-specs/random-braided-maze-no-dead-ends-2026-05-11.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `docs/rulebook.md`
- `docs/system-framework.md`
- `docs/module-ports.md`
- `src/sim/map.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/ports.ts`
- `src/main.ts`
- `tests/unit/map_edges.test.mjs`
- `tests/integration/simulation.test.mjs`

## 变更摘要

- 新增 Quick Design Spec，将本次改动归类为 Map & Exploration 的 Tweak。
- 地图 `wallEdges` 从固定蛇形环路改为当前局 seed 生成的随机编织迷宫。
- `createMap(seed)` 现在接收 seed；同 seed 生成相同墙线，不同 seed 生成不同墙线。
- 生成器从全开放格网逐步加墙，并在每次加墙后保持全图连通、开放方向不低于 2。
- 地图硬约束更新为所有格子开放方向 2-3，最长横向/纵向连续开放边不超过 4。
- 浏览器运行时初始开局和重开会使用新随机 seed；测试仍可传固定 seed 复现。
- 敌人初始巡逻点改为根据生成后的开放邻格生成，避免随机墙阻断固定横向 patrol。
- 保留 `17x13` 地图、30 个初始道具节点、10 名初始敌人、出口和危险格数量。

## Proposal 偏离

- 无。按计划只替换地图墙线生成与巡逻适配，不改战斗、道具、毒圈、空投或敌人内战规则。

## 已知局限

- 生成器当前仍在小型固定外框内工作，不包含多地图池或地图编辑器。
- 视觉观感需要浏览器人工确认；自动化只能验证连通性、开放度、最长直线和可达性。
- Vite 构建仍提示 Phaser bundle 体积超过 500 kB，属于既有提示。

## Scope Check

- 计划内：Quick Spec、规则/架构同步、seed 生成、重开新 seed、巡逻适配、自动化测试、Changelog/QA。
- 计划外：未新增 UI 面板、未新增地图资产、未改变核心战斗/道具规则。
