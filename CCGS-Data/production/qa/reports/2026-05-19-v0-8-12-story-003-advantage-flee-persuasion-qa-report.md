# QA Report - v0.8.12 Story 003 优势窗口、逃跑与说服公式

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`  
测试类型：Logic / Regression

## 结论

PASS。Story 003 的 6 条验收标准均有自动化覆盖；完整回归与构建通过。

## 自动化证据

- 新增：`tests/unit/combat_advantage_flee_persuasion_test.mjs`
- 回归：`npm test`，98/98 通过。
- 构建：`npm run build`，通过。

## 覆盖项

- `pressPower` 只产生下一动作回合伤害 +1，不给速度。
- `pressTempo` 只产生下一动作回合速度 +1，不给伤害。
- 同场照面同类继续战斗兑现只能触发一次。
- 逃跑公式按速度差 -3 到 +3 夹取，并按 25%-90% 最终封顶。
- 说服公式将有效情报、支付修正、道具修正分别限制到设计上限，并确认普通目标值默认 8。

## 额外修复

- 修复 `package.json` 测试入口，使 `tests/**/*_test.mjs` 进入默认回归。
- 修复后 Story 001、Story 002、Story 003 的 CCGS 证据文件均被 `npm test` 执行。

## 风险与后续观察

- 当前“支付修正”仍使用已有的抽象战利筹码自动支付，上限已按公式执行；若后续需要让玩家选择具体道具支付，应在 UI/道具支付 Story 中扩展输入端口。
- 敌方优势仍按现有 AI 自动压为速度修正；敌人是否也需要 `pressPower / pressTempo` 的战术选择，建议并入 Story 005。
