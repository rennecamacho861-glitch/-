# QA Report - v0.8.12 Story 004 道具使用限制与有效构筑预算
日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md`  
测试类型：Integration / Regression

## 结论

PASS。Story 004 的 6 条验收标准均有自动化覆盖；完整回归与生产构建通过。

## 自动化证据

- 新增：`tests/integration/item_limits_build_budget_test.mjs`
- 回归：`npm test`，105/105 通过。
- 构建：`npm run build`，通过。

## 验收覆盖

| 验收项 | 覆盖方式 | 状态 |
|---|---|---|
| 每单位每战斗回合最多主动使用 1 件道具 | `one actor can actively use only one combat item per combat round`；`enemy active combat item use also obeys the one item per round limit` | COVERED |
| 同类数值修正同轮只取最高 | `same stat modifiers in one round resolve to the strongest value` | COVERED |
| 同名被动不叠加 | `passive budget equips first affordable unique passives only` | COVERED |
| 自动触发链最多 5 次并记录日志 | `trigger chain stops after five automatic passive steps and logs the cap` | COVERED |
| 被动受有效构筑预算限制，未装备不触发 | `passive budget equips first affordable unique passives only` | COVERED |
| rare 主动道具显式声明 usage/charges/消耗方式 | `rare active items all declare explicit usage contracts` | COVERED |

## 回归观察

- 旧 `simulation.test.mjs` 中依赖“一回合连开多件主动道具”的用例已改写，不再违反 Story 004 新限制。
- `tests/**/*_test.mjs` 已由上一 Story 纳入默认 `npm test`，本轮新增 CCGS 证据文件会随主回归执行。

## 风险与后续

- 当前装备槽与被动预算的选择顺序由模拟层按背包顺序自动决定，玩家尚不能在 UI 中手动调整构筑优先级。
- AI 已遵守主动/被动限制，但尚未理解预算内道具连携的深层策略；建议后续 Story 005/006 继续处理 AI 战术评分与可读反馈。
