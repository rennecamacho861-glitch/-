# v0.7 敌人生态闭环与可读性 Changelog

日期：2026-05-12  
模式：Quick Design Addition  
规则来源：`CCGS-Data/design/quick-specs/enemy-ecosystem-closure-readability-2026-05-12.md`

## 修改文件清单

- `CCGS-Data/design/quick-specs/enemy-ecosystem-closure-readability-2026-05-12.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `docs/rulebook.md`
- `docs/system-framework.md`
- `docs/module-ports.md`
- `src/sim/types.ts`
- `src/sim/map.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/systems/enemySystem.ts`
- `src/sim/systems/enemyCivilWarSystem.ts`
- `src/sim/systems/lootSystem.ts`
- `src/main.ts`
- `tests/integration/simulation.test.mjs`

## 规则与配置变更

- 敌人名称改为 seed 稳定混合姓名，移除固定称号作为可见身份。
- `ActorState` 新增 `combatCount` 与可选 `aiState`；`EncounterState` 新增 `combatCounted`。
- `FeedbackEvent.kind` 新增 `loot-drop` 与 `persuasion-intel`。
- 敌人掉落改为有候选装备时保底 1 件，其余仍按 35%/最多 2 件/5% 额外规则补充。
- 说服成功生成确认式结构化情报反馈，仍只允许属性数值或道具情况。
- 敌人移动加入 `seekLoot`，会朝可达未清空道具节点移动。
- 新增敌人内战系统，敌人相邻可见时后台结算战损、战斗次数和胜者拾取。
- 敌人战斗动作改为 seed 可复现的加权状态机。
- 战斗面板显示敌人战斗次数，并移除固定 `x/4` 回合上限显示。

## Proposal 偏离说明

- 未新增地面掉落实体。遵循计划中的 Assumption，敌人掉落仍自动加入玩家背包；敌人内战遗物由胜者自动拾取，剩余遗物消失。
- 内战第一版使用轻量自动战损公式，没有打开完整玩家战斗 UI，也没有逐回合演出。

## 已知局限

- 敌人 `seekLoot` 会寻找最近可达节点，但尚未综合毒圈、空投和敌人威胁评分。
- 敌人内战日志仍以短文本记录，后续可补可见范围内的轻量画面演出。
- 生产构建仍提示 Vite chunk 超过 500 kB，这是既有打包体积警告。

## Scope Check

计划内：Quick Spec、规则/架构/端口同步、敌人掉落反馈、说服反馈、战斗次数、随机姓名、寻物移动、敌人内战、战斗 AI、HUD 战斗次数、测试。  
计划外：无。
