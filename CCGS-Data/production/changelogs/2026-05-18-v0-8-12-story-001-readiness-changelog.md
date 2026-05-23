# v0.8.12 Story 001 Readiness Changelog

日期：2026-05-18  
模式：Lean  
范围：CCGS 文档与 Story readiness 状态

## Summary

完成 `Story 001: Combat Matrix 与有效防御` 的 readiness 解阻与状态推进。用户继续推进后，将 `combat-system.md` 从待确认草案推进为已确认规则真源，并补齐 Story 001 的性能预算说明。

## 修改文件

- `CCGS-Data/design/gdd/combat-system.md`
  - 状态从 `Draft for Confirmation` 改为 `Confirmed`。
- `CCGS-Data/design/gdd/systems-index.md`
  - `Encounter Combat` 状态从 `Draft for Confirmation` 改为 `Designed`。
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`
  - 补充性能预算说明。
  - Story 状态从 `Todo` 改为 `Ready`。

## Readiness 结果

- GDD：存在，且 `AC-CMB-003`、`AC-CMB-004`、`AC-CMB-006` 可追溯。
- TR：`TR-COMBAT-001`、`TR-COMBAT-002` 存在。
- ADR：`ADR-0001` 存在且状态为 `Accepted`。
- Control Manifest：Story `manifest_version` 与当前 `2026-05-09` 一致。
- 依赖：无代码依赖、无资产依赖。
- 测试证据：Logic Story 要求新增或复用自动化战斗测试。

结论：Story 001 已 Ready，可进入 `/dev-story`。

## Scope Check

计划内：

- 确认战斗 GDD 状态。
- 更新系统索引中的 Encounter Combat 状态。
- 补齐 Story 001 readiness 缺口。
- 将 Story 001 标记为 Ready。

计划外：

- 无。

## 已知局限

- `EPIC.md` 仍保持 `Draft for Story Approval`，本轮只推进 Story 001 的 readiness。若要一次性批准全部 Story，需另跑 Story 批量 readiness 或 Epic approval。
