# v0.8.12 Story 001 Effective Defense Changelog

日期：2026-05-18  
模式：Lean  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`

## Summary

完成 Story 001 的战斗矩阵修正：防御不再在无人攻击或小额减伤时直接白拿优势；真实承受攻击后仍会提供读牌情报；满足有效防御条件时才授予防御优势。第 3 动作回合起接入软收束优先级，按有效防御、成功躲闪、未被防御压低的伤害、生命、速度、双方后撤脱战依次找出口。

## 修改文件清单

- `src/sim/GameSimulation.ts`
  - 新增防御结算元数据：减伤量、防止重伤、是否触发防御效果、是否有效防御。
  - 将防御读牌收益与防御优势拆分：受击防御可给情报，只有有效防御给优势窗口。
  - 移除“选择防御即优势”的旧逻辑。
  - 防御重伤阈值增加默认 `+2`。
  - 第 3 回合起按软收束优先级决定优势或双方后撤脱战。
  - Code Review 修正：显著伤害必须达到 GDD 高伤阈值 `6` 才进入软收束伤害优先级；生命/速度等软收束来源统一标为 `forced`，不再误标为 `item`。
- `tests/unit/combat_system_effective_defense_test.mjs`
  - 新增 Story 001 专项测试，覆盖小额减伤、防御无人攻击、减伤有效防御、防止重伤有效防御。
  - Code Review 后补充小额防御伤害不应作为显著伤害赢得软收束的回归测试。
- `tests/integration/simulation.test.mjs`
  - 同步旧远程防御测试：远程防御仍减伤并给读牌，但小额减伤不再自动给优势。
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`
  - AC 全部勾选，登记测试证据。

## Scope Check

计划内：

- `src/sim/**` 战斗结算修正。
- Logic 自动化测试。
- Story 状态与测试证据更新。

计划外：

- 更新了既有 integration 测试的预期，以匹配 v0.8.12 “小额防御减伤不自动给优势”的新规则。

## 验证

- `npm test`：83/83 通过。
- `npm run build`：通过。

## 已知局限

- 投掷道具与压制动作的有效防御细分尚未独立拆出；当前 Story 001 落地重点为基础动作矩阵、远程/近战攻击与软收束。
- Story 状态保持 `In Progress`，待 `/story-done` 进行最终验收后再关闭。
