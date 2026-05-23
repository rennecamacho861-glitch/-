# v0.6.4 密集迷宫与生成数量 Changelog

日期：2026-05-10  
类型：地图调参 / 初始生成数量 / 模拟层测试  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.6.4 密集迷宫与生成数量规则  
对应架构：`CCGS-Data/project-docs/architecture/system-framework.md`、`module-ports.md`

## 修改文件

- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `docs/rulebook.md`
- `docs/system-framework.md`
- `docs/module-ports.md`
- `src/sim/map.ts`
- `tests/integration/simulation.test.mjs`
- `tests/unit/map_edges.test.mjs`

## 变更摘要

- 将 MVP 初始道具节点数量固定为 30 个，进入节点后仍按既有三选一拾取规则结算。
- 将 MVP 初始敌人数量固定为 10 名，敌人仍无固定类型标签，由五项属性、血量、视野、道具和优势状态推导行为。
- 保持远程武器稀有：新增敌人规模后，初始手枪仍最多 1 把，避免破坏低武近战博弈。
- 将边缘墙布局改为高密度蛇形回路：所有格子至少有 1 面墙，且所有可进入格子至少有 2 个可通方向，不产生死路。
- `17x13` 地图外框不变，墙体仍由 `wallEdges` 表示，格子本身继续承载出口、危险区、道具节点和单位。
- 补充自动化测试，验证 30 个道具节点、10 名敌人、普通敌人属性总和 15、远程武器稀有、密集迷宫无死路。

## Proposal 偏离

- 无。按用户要求执行敌人数量和道具掉落点数量大幅增加，并增强迷宫复杂度。
- 本次没有改动情报概率弹窗、说服弹窗、战斗动作规则或敌人内战规则。

## 已知局限

- 当前密集迷宫为确定性蛇形回路，已经满足“每格至少 1 面墙且无死路”，但视觉节奏仍需浏览器内手动走图确认。
- 道具节点数量增加后，部分节点之间距离较近；后续可在 playtest 后继续调节节点稀疏度和风险热区。
- 敌人数量提高后，遭遇频率会显著上升；AI 内战、毒圈和空投的完整实装会进一步改变压力曲线。

## Scope Check

- 计划内：规则书、架构、端口、模拟层地图生成、敌人与道具节点数量、自动化测试、文档副本、Changelog/QA。
- 计划外：无 UI 新按钮；无战斗系统新端口；无美术资产替换。
