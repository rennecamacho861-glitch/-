---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "gameplay-programmer"
type: "Integration"
estimate: "1天"
points: ""
dependencies: ["story-001-combat-matrix-effective-defense"]
group: ""
sprint: ""
layer: "Core"
manifest_version: "2026-05-09"
---
# Story 002: 攻击方向与战斗情报读取

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-001`, `AC-CMB-002`, `AC-CMB-005`, `AC-CMB-020`, `AC-CMB-021`, `AC-CMB-022`  
**Related TR**: `TR-VISION-001`, `TR-INTEL-001`, `TR-COMBAT-001`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: MEDIUM

本 Story 让视野领先、防御和躲闪产出可用的结构化情报，并确保攻击方向情报读取真实下一击方向。

## Acceptance Criteria

- [x] 照面进入前必须计算双方可见/察觉状态，并记录视野领先归属。
- [x] 视野领先至少提供开局优势和一次可追溯结构化情报机会，不能只给速度 +2。
- [x] 战斗内单体情报只允许属性数值、具体道具、下一次攻击方向。
- [x] 成功躲闪必须获得至少 1 条可追溯情报。
- [x] 攻击方向情报必须读取模拟层真实下一击方向，并在该攻击被消耗后过期。
- [x] 玩家未知来源受伤时必须获得来源提示，不允许无解释扣血。

## Implementation Notes

- 保持 `IntelEntry` 结构化，不新增态势、意图、路线或性格文本。
- `attackDirection` 只服务左右躲闪，不改变进攻、防御、伤害、逃跑或说服公式。
- 视野领先情报应来自真实 Actor / Inventory / attack direction 数据。
- 未见远程先手必须生成方向、红光或枪声提示。
- 性能预算：视野、情报和攻击方向读取只在照面创建、道具/动作回合结算、远程先手触发时运行，不进入 Phaser `update()` 高频循环。

## Out of Scope

- 不改道具文案字段。
- 不改 AI 战术包评分。
- 不实现路线情报。

## QA Test Cases

- **AC-1**: 视野领先给开局优势与情报机会。
  - Given: 玩家看见敌人，敌人未看见玩家。
  - When: 创建照面。
  - Then: 玩家获得开局优势，并至少触发一次可追溯结构化情报机会。
  - Edge cases: 双方互相看见；敌人视野领先。

- **AC-2**: 攻击方向情报读取真实下一击方向并过期。
  - Given: 玩家获得敌人下一击方向情报。
  - When: 敌人完成一次真实攻击。
  - Then: 该方向情报被消耗或标记过期。
  - Edge cases: 敌人本回合未攻击；敌人远程攻击；敌人攻击被重伤打断。

- **AC-3**: 未知来源受伤必须有提示。
  - Given: 玩家未看见持枪敌人，敌人合法远程先手。
  - When: 玩家受到伤害。
  - Then: 日志或反馈事件包含来源方向、红光或枪声提示。
  - Edge cases: 远程先手未命中；射线被墙阻断。

## Test Evidence

**Story Type**: Integration  
**Required evidence**:
- `tests/integration/combat_attack_direction_intel_test.mjs` 或现有模拟集成测试中的同名用例必须存在并通过。

**Status**: [x] `tests/integration/combat_attack_direction_intel_test.mjs` 已创建并通过；`npm test` 83/83 通过；`npm run build` 通过。

## Dependencies

- Code Dependencies: `story-001-combat-matrix-effective-defense`
- Asset Dependencies: None
- Unlocks: Story 005、Story 006

## Completion Notes

**Completed**: 2026-05-19  
**Criteria**: 6/6 passing。  
**Deviations**: None blocking。备注：远距视野领先可以创建照面；照面后的近战距离限制仍沿用现有战斗解析，建议后续在独立 combat-range 或 Story 005 相关工作中收束。  
**Test Evidence**: Integration 自动化测试已创建并通过：`tests/integration/combat_attack_direction_intel_test.mjs`；完整回归 `npm test` 83/83 通过；`npm run build` 通过。  
**Code Review**: Complete。审查结论为无阻塞问题；已将远距照面后续风险写入 QA 报告。  
