# CCGS Framework — Codex Configuration

本项目已接入 CCGS Universal 的流程、Agent 与 Skill 文档。

## Codex Entry

《照面之时》使用 CCGS 作为制作流程框架。它不替代游戏运行时代码；它负责规则、设计、架构、Story、QA 与生产追踪。

## Required Context

进行 CCGS 工作时先阅读：

- `.ccgs-core/workflows/pipeline-core.md`
- `.ccgs-core/docs/ai-bootstrap.md`
- `.ccgs-core/docs/technical-preferences.md`
- `.ccgs-core/docs/coding-standards.md`
- `.ccgs-core/ccgs.env`

项目权威文档：

- `CCGS-Data/design/gdd/rulebook.md`：玩法规则真源。
- `CCGS-Data/project-docs/architecture/system-framework.md`：规则到代码的落地框架。
- `CCGS-Data/design/gdd/game-concept.md`：项目概念。
- `CCGS-Data/design/gdd/systems-index.md`：系统拆分与设计顺序。

## Output Language

- 默认使用中文与用户沟通。
- 所有 CCGS/Codex 写入的 Proposal、Changelog、QA、Sprint、Review、阶段交接摘要等项目文档默认使用中文。
- 可保留模板中的机器可读字段名，但正文分析、结论、建议与问题列表使用中文。

## Slash Command Compatibility

Codex 不会自动把 CCGS slash command 注册到菜单。用户输入 `/dev-story`、`/code-review`、`/gameplay-programmer` 等文本命令时：

1. 先解析到 `.ccgs-core/workflows/skills/<name>/SKILL.md`。
2. 若不存在，再解析到 `.ccgs-core/workflows/Tier1-Directors/`、`Tier2-Leads/` 或 `Tier3-Specialists/` 下的同名 Agent。
3. 若仍不存在，查 `.ccgs-core/docs/skills-reference.md` 和 `.ccgs-core/docs/agent-roster.md`。
4. 读取匹配文件后执行对应流程或代入对应角色。

## Agent Role Compatibility

请求 CCGS 角色时，先读取对应角色定义：

- 设计与数值：`.ccgs-core/workflows/Tier2-Leads/game-designer.md`
- 架构与审查：`.ccgs-core/workflows/Tier2-Leads/lead-programmer.md`
- 玩法实现：`.ccgs-core/workflows/Tier3-Specialists/gameplay-programmer.md`
- AI 行为：`.ccgs-core/workflows/Tier3-Specialists/ai-programmer.md`
- UI 实现：`.ccgs-core/workflows/Tier3-Specialists/ui-programmer.md`
- QA：`.ccgs-core/workflows/Tier2-Leads/qa-lead.md`

## Project Rules

- 玩法改动必须先修改并确认 `CCGS-Data/design/gdd/rulebook.md`。
- 进入实装前，对照 `CCGS-Data/project-docs/architecture/system-framework.md` 拆任务。
- `src/sim` 拥有规则和状态；`src/render` 只表现；`src/main.ts` 只做 HUD 与输入桥接。
- Logic / Integration 改动需要自动化测试或明确登记测试债务。
- 每次实现结束必须生成 Changelog 或 QA 记录，保证可恢复。

