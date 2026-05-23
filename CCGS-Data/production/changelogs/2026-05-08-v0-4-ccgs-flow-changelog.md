# Changelog: v0.4 CCGS 规则审阅与实装计划

- 日期：2026-05-08
- 类型：GDD / Architecture / Production Planning
- 范围：规则书、系统框架、CCGS 追踪文档、Epic/Story

## 修改文件

- `CCGS-Data/design/gdd/rulebook.md`
- `docs/rulebook.md`
- `CCGS-Data/design/gdd/systems-index.md`
- `CCGS-Data/design/gdd/gdd-cross-review-2026-05-08.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `docs/system-framework.md`
- `CCGS-Data/project-docs/architecture/architecture.md`
- `CCGS-Data/project-docs/architecture/control-manifest.md`
- `CCGS-Data/project-docs/architecture/tr-registry.yaml`
- `CCGS-Data/project-docs/architecture/ADR-0001-v0-4-simulation-boundary.md`
- `CCGS-Data/production/proposals/2026-05-08-v0-4-rules-to-mvp-implementation-proposal.md`
- `CCGS-Data/production/epics/index.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/EPIC.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-001-test-setup.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-002-actor-stats.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-003-run-state.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-004-map-exploration.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-005-vision-intel.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-006-encounter-combat.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-007-items-v0-4.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-008-enemy-ai-mvp.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-009-hud-combat-ui.md`
- `CCGS-Data/production/epics/v0-4-mvp-core/story-010-qa-playtest.md`
- `CCGS-Data/production/qa/reports/2026-05-08-v0-4-ccgs-flow-qa-report.md`
- `CCGS-Data/production/session-state/active.md`

## 变更摘要

- 将规则书升级为 v0.4 候选规则，补齐 CCGS GDD 要求的 Summary、Overview、Player Fantasy、Detailed Rules、Formulas、Edge Cases、Dependencies、Tuning Knobs、Acceptance Criteria。
- 补齐战斗外闭环：地图要求、时间、危险、撤离、失败、AI 巡逻、遭遇触发。
- 将原本待确认的实装阻塞点改写为 v0.4 MVP 默认决策。
- 更新系统索引，将 Foundation/Core 关键系统标记为 Designed。
- 补齐轻量架构文档、控制清单、TR 追踪表和 ADR-0001。
- 创建 v0.4 MVP Core Epic 和 10 个 Story，等待用户确认后进入实装。

## Proposal 偏离说明

- 未进入代码实装，因为规则书 v0.4 仍需要用户确认。
- 未关闭 TD-001，因为测试框架尚未实际建立；已作为 Story 001。

## 已知局限

- Enemy AI 与 HUD/UI 仍是 Drafted 级别，足够支撑 MVP，但后续需要更细 GDD 或线框。
- 当前目录不是 Git 仓库，无法记录 git status / git log。

## Scope Check

- 计划内：GDD、架构、生产追踪、Epic/Story 文档。
- 计划外：无运行时代码修改。
