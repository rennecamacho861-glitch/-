# Changelog - v0.8.12 Story 003 优势窗口、逃跑与说服公式

日期：2026-05-19  
范围：`story-003-advantage-flee-persuasion`

## 变更摘要

- 新增 `src/sim/systems/advantageSystem.ts`，集中承载优势窗口继续战斗、逃跑概率和说服公式的纯逻辑 helper。
- `continueFight` 从旧的任意 `BonusTarget` 改为明确的 `pressPower / pressTempo`：
  - `pressPower`：下一动作回合近战伤害 +1。
  - `pressTempo`：下一动作回合速度 +1。
  - 同场照面同类兑现只能触发 1 次。
- `tryFlee` 改用 `55% + clamp(速度差, -3, 3) x 8% + 道具修正`，最终限制在 25%-90%。
- `tryPersuade` 改用新说服公式，情报、支付和道具修正分别封顶，普通目标值为 8。
- DOM HUD 的优势窗口继续战斗按钮拆为“续战·力量”和“续战·节奏”，仍只通过模拟层命令提交。
- 修复 `npm test` 脚本，使 `tests/**/*_test.mjs` 也进入回归；此前 CCGS Story 证据文件没有被默认测试脚本覆盖。

## 修改文件

- `src/sim/systems/advantageSystem.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/types.ts`
- `src/sim/ports.ts`
- `src/main.ts`
- `package.json`
- `tests/unit/combat_advantage_flee_persuasion_test.mjs`
- `tests/unit/item_runtime_system.test.mjs`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`

## 验证

- `npm test`：98/98 通过。
- `npm run build`：通过。

## 备注

- 本 Story 未新增说服奖励、临时同盟或敌人战术包评分。
- 当前支付仍沿用已有抽象战利筹码，没有加入“选择具体道具支付”的 UI；公式端口已先保证修正封顶。
