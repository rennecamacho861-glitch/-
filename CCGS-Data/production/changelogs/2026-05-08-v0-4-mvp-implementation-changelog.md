# Changelog: v0.4 MVP 实装

- 日期：2026-05-08
- 类型：Gameplay / UI / Test
- 范围：v0.4 MVP Core Systems

## 修改文件

- `package.json`
- `.gitignore`
- `tsconfig.test.json`
- `scripts/prepare-test-build.cjs`
- `src/sim/types.ts`
- `src/sim/stats.ts`
- `src/sim/items.ts`
- `src/sim/map.ts`
- `src/sim/GameSimulation.ts`
- `src/render/GameScene.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/unit/stats.test.mjs`
- `tests/integration/simulation.test.mjs`
- `CCGS-Data/production/epics/index.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/*.md`
- `CCGS-Data/production/tracking/tech-debt.md`

## 变更摘要

- 建立零依赖 Node 内置测试入口：`npm test`。
- 新增属性系统：五项属性、默认玩家属性、派生值公式。
- 将玩家和敌人统一为 `ActorState`，敌人拥有属性、生命、背包、巡逻和倾向。
- 重建地图状态：当前可见区、已探索记忆、陷阱、红光提示。
- 实现 v0.4 视野/信息：`unseen / aware / visible`、视野领先、信息揭示。
- 替换旧 `Attack / Guard / Trick` 为动作战斗：进攻、防御、左躲闪、右躲闪、优势窗口、逃跑、继续战斗、说服。
- 实现第一批道具：手枪、绷带、长刀、陷阱、眼镜、照明棒、回声针。
- 实现敌人 MVP 行为：巡逻、搜索/追击、撤退、战斗动作选择、远程视野先手。
- 更新 Phaser 地图表现和 DOM HUD/战斗面板，以展示可见状态、优势、情报和动作按钮。
- Phase 3 审查后修复远程相关边界：未见远程先手每名敌人只触发一次；战斗内远程行动现在会被防御减免并可被躲闪处理；玩家行动中途失败会停止后续撤离/遭遇结算。

## 验证

- `npm test`：通过，8 个测试。
- `npm run build`：通过。
- `http://127.0.0.1:5173/`：返回 200。

## Proposal 偏离说明

- 未使用 Vitest：npm/cache 权限与网络导致安装不可稳定完成，改用零依赖 Node 内置测试流，仍满足“可自动化测试 sim”的验收目标。
- Story 010 未完全关闭：当前环境无法产出浏览器截图证据，已登记 `TD-002`。

## Scope Check

- 计划内：`src/sim`、`src/render`、`src/main.ts`、`src/styles.css`、`tests`、CCGS 生产文档。
- 计划外：未引入新运行时依赖；未改 Phaser/Vite 架构。
