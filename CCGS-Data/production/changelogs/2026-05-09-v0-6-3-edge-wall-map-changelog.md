# v0.6.3 边缘墙地图 Changelog

日期：2026-05-09  
类型：地图结构改造 / 模拟层与渲染同步  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.6.3 边缘墙地图规则  
对应架构：`CCGS-Data/project-docs/architecture/system-framework.md`、`module-ports.md`

## 修改文件

- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `docs/rulebook.md`
- `docs/system-framework.md`
- `docs/module-ports.md`
- `src/sim/types.ts`
- `src/sim/map.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/systems/movementSystem.ts`
- `src/sim/systems/visibilitySystem.ts`
- `src/sim/systems/enemySystem.ts`
- `src/render/GameScene.ts`
- `vite.config.ts`
- `tests/integration/simulation.test.mjs`
- `tests/unit/map_edges.test.mjs`

## 变更摘要

- 将地图阻挡真源从 `wall` tile 改为 `MapState.wallEdges`。
- `TileKind` 收缩为 `floor | exit | danger`，出口、危险格、道具节点和单位仍位于格子中心。
- 保留 `17x13` 地图尺寸，手工重绘第一版边缘墙布局，使可走格子显著增加。
- 移动、敌人巡逻/追击/逃跑、陷阱放置统一使用边缘墙可进入判定。
- 视野和手枪远程判定改为检查跨过的边缘墙；斜向视野保留“一次拐角窥视”规则。
- Phaser 渲染改为先绘制地面格，再将 `wallEdges` 绘制为较粗的格边墙线，并绘制完整外边框。
- 修复本地开发服务器根路径入口：`http://127.0.0.1:5173/` 会回退到 `index.html`，避免只能访问 `/index.html`。
- 新增地图边缘墙单元测试，覆盖移动、边界、横纵视线和斜向窥视。

## Proposal 偏离

- 无。按照已确认计划保持地图外框 `17x13` 不变，并采用手工重绘的边缘墙布局。
- 本次没有改变战斗、道具、毒圈、空投或敌人内战规则。

## 已知局限

- 当前墙体仍是程序绘制线段，尚未接入 `public/assets/grid-dungeon/walls/` 的美术切片。
- 本地浏览器截图工具仍不可直接调用；视觉核验需用户在 `http://127.0.0.1:5173/index.html` 中手动查看，或后续接入可控浏览器截图证据。
- `snapshot()` 仍返回真实状态对象，沿用既有只读约定。

## Scope Check

- 计划内：规则书、架构、端口、模拟层、视野、渲染、自动化测试、文档副本、Changelog/QA。
- 计划外：无新增玩法规则；无 UI 命令端口变化；无美术资产替换。
