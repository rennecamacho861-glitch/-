# Markdown 上下文成本审计

日期：2026-05-14  
范围：项目自有 Markdown；排除 `node_modules/`、`dist/` 与 `.ccgs-core/` 框架模板本体。  
目标：筛选对当前制作不再有帮助，或容易在新对话中增加阅读成本、制造旧规则干扰的文件。

## Codex 阅读入口检查

当前 Codex 自带的项目阅读方式是 `AGENTS.md`。该文件明确要求 CCGS 工作优先读取：

- `.ccgs-core/workflows/pipeline-core.md`
- `.ccgs-core/docs/ai-bootstrap.md`
- `.ccgs-core/docs/technical-preferences.md`
- `.ccgs-core/docs/coding-standards.md`
- `.ccgs-core/ccgs.env`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/design/gdd/game-concept.md`
- `CCGS-Data/design/gdd/systems-index.md`

因此，`CCGS-Data/` 是当前真源阅读方式；`docs/` 下的旧同步副本不是 Codex 默认入口，已按“另一种重复阅读来源”处理为短指针。

## 已处理

1. `CCGS-Data/production/session-state/active.md` 已压缩为 v0.8.3 当前状态摘要，避免新对话读取过期 v0.7.1 长文。
2. `docs/rulebook.md`、`docs/system-framework.md`、`docs/module-ports.md`、`docs/asset-presentation-port.md` 已替换为短指针，只指向 CCGS 真源，不再维护完整副本。
3. `CCGS-Data/design/quick-specs/` 已仅保留 `README.md` 和 `.gitkeep`；历史 Quick Spec 已移动到 `CCGS-Data/production/archive/quick-specs/`。
4. `README.md` 已从旧 `docs/` 链接改为指向 `CCGS-Data/` 真源。
5. `CCGS-Data/design/gdd/rulebook.md` 中“同步 docs 副本”的旧流程说明已改为“docs 只保留短入口”。

## 默认保留上下文

| 文件 | 原因 |
|---|---|
| `AGENTS.md` | 当前项目给 Codex 的入口规则。 |
| `CCGS-Data/design/gdd/rulebook.md` | 玩法规则真源。 |
| `CCGS-Data/project-docs/architecture/system-framework.md` | 规则到代码的落地框架真源。 |
| `CCGS-Data/project-docs/architecture/module-ports.md` | 模块边界与端口契约。 |
| `CCGS-Data/design/gdd/game-concept.md` | 项目概念和核心体验。 |
| `CCGS-Data/design/gdd/systems-index.md` | 系统拆分与优先级。 |
| `CCGS-Data/production/session-state/active.md` | 当前状态短摘要。 |
| `CCGS-Data/production/tracking/tech-debt.md` | 当前债务登记，体量小。 |
| `CCGS-Data/production/tracking/bug-tracker.md` | 当前 Bug 登记，体量小。 |

## 按任务读取

| 文件/目录 | 触发场景 |
|---|---|
| `CCGS-Data/design/balance/item-overview-v0-8-3-2026-05-14.md` | 道具、掉落、稀有度、平衡任务。 |
| `CCGS-Data/design/balance/balance-check-item-rarity-v0-8-2-2026-05-14.md` | 回查稀有度强度模型。 |
| `CCGS-Data/project-docs/architecture/ADR-*.md` | 架构决策、边界争议、重构任务。 |
| `CCGS-Data/project-docs/architecture/asset-presentation-port.md` | 资产表现层或图标映射任务。 |
| `CCGS-Data/design/art/**` | 美术风格、视觉反馈、图标生成任务。 |
| `CCGS-Data/design/assets/**` | 资产清单、切图、资源管线任务。 |
| `CCGS-Data/design/audio/**` | 音频任务。 |
| `CCGS-Data/design/ux/**` | HUD、弹窗、交互任务。 |
| `CCGS-Data/production/qa/evidence/**` | 手动证据、截图、听感验证回查。 |

## 不默认读取

| 文件/目录 | 处理方式 |
|---|---|
| `docs/` | 只保留短指针；不要当正文读取。 |
| `CCGS-Data/production/archive/quick-specs/` | 历史 Quick Spec；只在追溯某次变更时按文件名读取。 |
| `CCGS-Data/production/changelogs/` | 历史证据库；默认只读最近 1-2 条或按关键词读取。 |
| `CCGS-Data/production/qa/reports/` | 历史验证证据；默认只读最近 1-2 条或按关键词读取。 |
| `CCGS-Data/production/proposals/*.md` | 早期提案；不默认读取。 |
| `CCGS-Data/production/epics/v0-4-mvp-core/**` | 早期故事文件；只在追溯验收时读取。 |
| `CCGS-Data/production/epics/v0-5-item-build-enemy-growth/**` | 已被 v0.8 道具体系覆盖；不默认读取。 |
| `public/assets/audio/grid-dungeon/DEPRECATED-PROCEDURAL-ASSETS.md` | 明确 deprecated；只在资产清理任务读取。 |

## 后续可选

- 若后续上下文仍偏重，可以继续把早期 `proposals/` 与 v0.4/v0.5 `epics/` 移入 `CCGS-Data/production/archive/`。
- 若需要更快的新对话启动，可以把 `active.md` 进一步压缩为“当前实现状态 + 最近一次变更 + 下一步”三段。
