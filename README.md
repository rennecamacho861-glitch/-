# 照面之时

一个 2D 浏览器游戏原型：玩家在无视野迷宫中搜寻道具、判断撤离时机，并在照面瞬间进入 2-3 手的读牌博弈。

## 规则优先流程

所有玩法改动必须先更新并确认 [规则书](CCGS-Data/design/gdd/rulebook.md)，再进入实装。

系统进入实装前，先对照 [系统落地框架](CCGS-Data/project-docs/architecture/system-framework.md) 拆分数据结构、结算流程和待确认问题。

## CCGS 制作流程

项目已接入 CCGS Universal：

- 框架核心：`.ccgs-core/`
- 项目数据层：`CCGS-Data/`
- Codex 入口：`AGENTS.md`
- 规则真源：`CCGS-Data/design/gdd/rulebook.md`
- 架构框架：`CCGS-Data/project-docs/architecture/system-framework.md`

后续建议流程：

1. 修改规则：更新并确认 `CCGS-Data/design/gdd/rulebook.md`。
2. 拆系统：参考 `CCGS-Data/design/gdd/systems-index.md`。
3. 写 Proposal / Story：放入 `CCGS-Data/production/proposals/` 和 `CCGS-Data/production/epics/`。
4. 实装：按 Story 修改 `src/sim`、`src/render`、HUD。
5. 验收：写 Changelog / QA 到 `CCGS-Data/production/`。

推荐工作流：

1. 先把新规则、改动动机、影响范围写入 `CCGS-Data/design/gdd/rulebook.md`。
2. 确认规则文本没有歧义。
3. 再修改 `src/sim` 和渲染/UI 代码。
4. 实装后对照规则书验收，不让代码规则和文档规则分叉。

## 运行

本项目固定使用本机端口 `5188`，避免与其他 Vite 项目的 `5173/5174` 默认端口互相挤占。该端口只用于本地 HTTP 模块加载，不代表游戏需要保存本地信息。

```bash
npm install
npm run dev
```

打开 http://127.0.0.1:5188/。

## 在线游玩部署

仓库包含 GitHub Pages 自动部署流程：`.github/workflows/deploy-pages.yml`。

推送到 GitHub 的 `main` 分支后，Actions 会自动执行：

```bash
npm ci
npm test
npm run build
```

构建产物会从 `dist/` 发布到 GitHub Pages。首次使用时，在 GitHub 仓库的 `Settings -> Pages` 中把 Source 设为 `GitHub Actions`。

## CCGS Codex 技能注册

如果 Codex 的可调用技能列表里没有 CCGS 项，运行：

```powershell
powershell -ExecutionPolicy Bypass -File scripts\install-ccgs-codex-skills.ps1
```

脚本会把 `.ccgs-core/workflows` 中的 Skill、Agent 和 `pipeline-core` 注册到本机 `C:\Users\tmz\.codex\skills`。安装后需要重启或刷新 Codex，新的 `$dev-story`、`$gameplay-programmer`、`$game-designer` 等技能才会出现在可调用列表中。
