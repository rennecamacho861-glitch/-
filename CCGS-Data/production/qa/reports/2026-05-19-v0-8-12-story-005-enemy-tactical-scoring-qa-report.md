# QA Report - v0.8.12 Story 005 敌人战术包评分与隐藏信息边界

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`  
测试类型：Integration / Logic  
结论：PASS

## Test Evidence

- 自动化测试：`tests/integration/enemy_tactical_scoring_test.mjs`
- 全量验证：`npm test` 110/110 passed
- 构建验证：`npm run build` passed

## Acceptance Coverage

| AC | 覆盖结果 | 证据 |
|---|---|---|
| AC-CMB-060 隐藏信息边界 | PASS | 测试验证敌人未知玩家速度时不会读取真实 `player.stats.speed`；公开速度效果出现后才改变估算。 |
| AC-CMB-061 战术包评分 | PASS | 测试验证 `soot-hook` + `tinder-vial` 的 BurnCrit 包会让燃烧来源主动道具胜过无关主动道具，并由 `chooseEnemyAction` 返回。 |
| AC-CMB-062 拾取评分 | PASS | 测试验证持空枪敌人会选择较远但能补齐构筑的 `old-magazine` 节点，而不是最近低价值节点。 |
| AI 纯决策 | PASS | 测试验证 `chooseEnemyAction` 返回行动时不修改 HP、效果、背包手动锁或道具状态。 |
| usage / charges / manual lock | PASS | 测试验证空充能或本回合已锁定主动槽的道具不会被评分为可用战斗道具。 |

## Regression Notes

- Story004 的主动道具使用上限、被动预算、charges 与 manual lock 机制仍通过全量测试。
- `enemySystem`、`enemyTacticalScoringSystem`、`lootSystem` 的 AI 评分路径经检索未发现 `state.player.stats` 读取。
- 本次不涉及 UI 与渲染截图；风险集中在模拟层 AI 评分公式，已由集成测试覆盖。

## Residual Risk

- AI 目前仍是“可解释评分”，不是长期规划搜索；复杂道具连携只能通过新增能力标签与战术包逐步扩展。
- 玩家尚未在 HUD 中看到敌方倾向的可读解释；Story006 将处理玩家文案与 HUD 展示边界。

