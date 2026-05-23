# Changelog: CCGS Codex 技能接入

- 日期：2026-05-08
- 类型：工具链 / 流程框架
- 范围：Codex 本地技能、CCGS 角色包装器、安装脚本

## 变更

- 新增 `scripts/install-ccgs-codex-skills.ps1`，用于在 Windows 环境下将项目内 `.ccgs-core/workflows` 注册到 Codex 本地技能目录。
- 更新 `README.md`，记录缺失 CCGS 可调用技能时的重新注册命令。
- 已安装 124 个 CCGS 管理的 Codex 技能目录到 `C:\Users\tmz\.codex\skills`。
- 标准 Skill 直接复制原始 `SKILL.md`；Tier 1/2/3 Agent 与 `pipeline-core` 生成轻量 wrapper，并指向工作区内的源文档。
- wrapper 记录 `.ccgs-source` 与 `.ccgs-kind`，后续重复运行脚本只更新 CCGS 管理项，不覆盖既有非 CCGS 技能。

## 验证

- 确认 `dev-story`、`gameplay-programmer`、`game-designer`、`lead-programmer`、`pipeline-core` 已出现在 Codex 本地技能目录。
- 确认 `gameplay-programmer` wrapper 正确指向 `.ccgs-core/workflows/Tier3-Specialists/gameplay-programmer.md`。
- 确认 CCGS 管理技能数量为 124。
- `npm run build` 通过。

## 注意

- 当前 Codex 会话的可用技能列表可能不会热更新；重启或刷新 Codex 后，新安装的 CCGS 技能应可作为用户可调用技能出现。
- 在刷新前，`AGENTS.md` 中定义的 slash command 兼容路径仍可作为兜底流程使用。
