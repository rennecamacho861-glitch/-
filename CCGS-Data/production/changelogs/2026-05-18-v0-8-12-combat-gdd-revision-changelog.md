# v0.8.12 Combat GDD 与规则真源修订 Changelog

日期：2026-05-18  
类型：Design / Architecture Traceability  
状态：Draft for Confirmation  

## Summary

根据 full design-review 结论，补齐缺失的独立战斗 GDD，并同步规则书、系统索引和落地框架。此轮只修改 CCGS 设计/架构文档，不修改运行时代码。

核心目标是让后续实装先围绕“视野 + 信息 + 短促照面”建立清晰验收真源，避免继续把道具、被动链和 AI 特例堆在尚未稳定的基础战斗矩阵上。

## Changed Files

- `CCGS-Data/design/gdd/combat-system.md`
  - 新增照面战斗专门 GDD。
  - 明确 Attack / Defense / Dodge 动作矩阵。
  - 新增有效防御定义、攻击方向生命周期、优势窗口兑现、软收束优先级。
  - 定义战斗公式、AI 信息边界、有效构筑预算、道具文案分层与 AC 编号。

- `CCGS-Data/design/gdd/rulebook.md`
  - 版本推进到 v0.8.12 战斗博弈修订稿。
  - 标记 `combat-system.md` 为照面战斗专门真源。
  - 同步有效防御、重伤阈值、逃跑公式、说服公式、继续战斗二选一、普通节点稀有节流、道具主动使用限制与敌方道具文案展示规则。

- `CCGS-Data/design/gdd/systems-index.md`
  - Encounter Combat 追溯改为 `combat-system.md`、`rulebook.md`、`system-framework.md`。
  - 状态改为 Draft for Confirmation。

- `CCGS-Data/project-docs/architecture/system-framework.md`
  - 版本说明同步到 v0.8.12。
  - 修正情报输出类型：允许 `statExact`、`itemExact`、`attackDirection`，禁止 AI 意图/路线/态势。
  - 同步继续战斗二选一和软收束优先级。

- `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`
  - 新增 v0.8.12 照面战斗博弈修订 Epic。
  - 将 `combat-system.md` 的 AC 拆成 6 个 Story，并更新为 Todo。

- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`
  - 新增 6 个可执行 Story 文件，均引用 `combat-system.md` 的 AC 编号、实现边界和 QA 证据路径。

- `CCGS-Data/production/epics/index.md`
  - 追加 v0.8.12 Epic 追踪行。

## Design Notes

- 当前规则仍需用户确认后再进入代码 Story。
- 暂缓继续扩展大批被动道具，先稳定基础动作矩阵。
- 暂缓把“探步”加入正式动作，先建立安全线/资源线/热点线探索结构。
- AI 后续应从硬编码道具组合改为 `ItemCapability -> TacticalPackage -> Intent -> ScoreBreakdown`。

## Verification

- 未运行自动化测试：本轮无运行时代码变更。
- Story schema：官方 `.ccgs-core/hooks/verify-schema.sh` 因当前 Windows 环境缺少 `bash` 未运行；`.ccgs-core/hooks/verify-schema.py` 因 `python/py` 运行时不可用未运行。已按 `.ccgs-core/rules/schemas/story.json` 用 PowerShell 进行等价必填字段校验，6 个 Story 均 PASS。

- 下一步建议按顺序运行 `/story-readiness`：
  1. `story-001-combat-matrix-effective-defense.md`
  2. `story-002-attack-direction-intel.md`
  3. `story-003-advantage-flee-persuasion.md`
  4. `story-004-item-limits-build-budget.md`
  5. `story-005-enemy-tactical-scoring.md`
  6. `story-006-item-text-hud-boundary.md`
