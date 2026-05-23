# v0.8.12 Story 001 Effective Defense QA Report

日期：2026-05-18  
模式：Lean  
Story：`Story 001: Combat Matrix 与有效防御`  
测试类型：Logic / Integration

## 测试摘要

本轮验证 Story 001 的有效防御与第 3 回合软收束规则。核心风险是旧逻辑中“只要选择防御就直接获得优势”，会让防御在无人攻击时变成免费窗口，也会让攻击、防御、躲闪的博弈层次不清。

## 自动化测试

| 命令 | 结果 | 说明 |
|---|---|---|
| `npm test` | PASS | 83/83 tests passed |
| `npm run build` | PASS | TypeScript 与 Vite build 通过 |

## 覆盖矩阵

| Acceptance Criteria | 覆盖证据 |
|---|---|
| 基础动作仍只包含进攻、防御、左躲闪、右躲闪；远程、治疗、压制来自道具 | 既有战斗动作类型未新增；`npm test` 全量回归通过 |
| 进攻打防御时，防御必须减伤并可触发有效防御 | `test_effective_defense_reduced_damage_wins_over_mitigated_attack` |
| 攻击方不得因为被防御压低的小额伤害自动压过有效防御 | `test_effective_defense_reduced_damage_wins_over_mitigated_attack` 与软收束优先级实现 |
| 有效防御条件：承受攻击且减伤、防止重伤或触发防御效果 | `test_small_defense_reduction_does_not_create_advantage`、`test_effective_defense_prevents_heavy_wound` |
| 防御无人攻击不形成有效防御，不获得优势窗口 | `test_defense_without_incoming_attack_does_not_create_advantage` |
| 第 3 动作回合起软收束优先级 | `test_defense_without_incoming_attack_does_not_create_advantage`、`test_effective_defense_reduced_damage_wins_over_mitigated_attack`、`test_soft_closure_ignores_small_mitigated_damage` |

## Code Review 回归点

- 显著伤害必须达到 GDD 高伤阈值 `6` 才能进入软收束伤害优先级。
- 生命/速度等软收束来源必须记录为 `forced`，避免被误判为道具优势。

## 结果

PASS。Story 001 已具备进入 `/code-review` 与 `/story-done` 的条件。

## 风险与后续

- 投掷道具与压制动作尚未做专门有效防御测试，建议在后续道具/压制 Story 中补齐。
- 当前 `EPIC.md` 仍是 `Draft for Story Approval`，本轮只完成 Story 001 的实现闭环。
