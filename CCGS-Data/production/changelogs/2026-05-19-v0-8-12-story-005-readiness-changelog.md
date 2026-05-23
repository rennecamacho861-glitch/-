# Changelog - v0.8.12 Story 005 Readiness
日期：2026-05-19  
范围：`story-005-enemy-tactical-scoring`

## 变更摘要

- 对 `Story 005: 敌人战术包评分与隐藏信息边界` 执行 CCGS Story Readiness 检查。
- 补充 Control Manifest 落地边界：AI 决策、拾取评分与隐藏信息边界必须由 `src/sim` 结算，表现层不得反向决定规则。
- 补充性能预算：战术评分只在敌人选择移动目标、拾取目标或战斗动作时运行，不进入 Phaser 高频循环。
- 依赖 `story-002-attack-direction-intel` 与 `story-004-item-limits-build-budget` 均为 `Complete`。
- 状态从 `Todo` 更新为 `Ready`。

## 验证

- GDD 需求：`AC-CMB-060`、`AC-CMB-061`、`AC-CMB-062` 已在 Story 中引用并可测试。
- TR：`TR-AI-001`、`TR-AI-002` 存在于 `tr-registry.yaml`。
- ADR：`ADR-0001-v0-4-simulation-boundary.md` 状态为 `Accepted`。
- Test Evidence：已指定 `tests/integration/enemy_tactical_scoring_test.mjs`。

## 后续

- 可进入 `/dev-story CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`。
