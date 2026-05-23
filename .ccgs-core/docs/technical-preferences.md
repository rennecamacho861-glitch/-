# 《照面之时》技术偏好

本文件为 CCGS Agent 和 Skill 的项目技术真源。代码实现前必须读取。

## 引擎与语言

- **运行环境**: Web
- **游戏框架**: Phaser 3
- **构建工具**: Vite
- **语言**: TypeScript
- **UI**: DOM HUD + Phaser Canvas playfield
- **测试目标**: TypeScript 逻辑层优先单元测试，视觉/UI 用浏览器截图和手动证据

## 架构边界

- `src/sim`：唯一玩法规则与状态真源。
- `src/render`：Phaser 渲染、地图绘制、视觉反馈。
- `src/main.ts`：输入桥接、DOM HUD、按钮事件。
- `docs/`：轻量开发文档副本。
- `CCGS-Data/design/gdd/`：CCGS 规则和设计真源。
- `CCGS-Data/project-docs/architecture/`：架构与落地框架。

## 命名约定

- **类型/类名**: PascalCase，例如 `GameSimulation`, `EncounterState`。
- **变量/函数**: camelCase，例如 `resolveAction`, `visionRadius`。
- **TypeScript 文件**: PascalCase 用于类模块，camelCase 用于工具模块。
- **数据 ID**: kebab-case，例如 `long-knife`, `echo-pin`。
- **文档文件**: kebab-case。

## 性能预算

- **目标帧率**: 60 FPS。
- **一局时长**: 5-10 分钟。
- **地图规模**: MVP 使用小型固定或半随机格子地图。
- **实体规模**: MVP 同屏少量敌人，优先保证规则可读性。
- **规则结算**: 回合/行动驱动，避免把核心规则写入 Phaser `update()` 高频循环。

## 测试

- **当前状态**: 测试框架待建立。
- **推荐框架**: Vitest。
- **最低要求**: 实装 v0.3 战斗前，为属性派生、视野判定、动作结算、逃跑/说服公式建立单元测试。
- **视觉验证**: 每次 HUD 或地图可读性改动后，用浏览器截图验证桌面与移动视口。

## 禁止模式

- 禁止把玩法规则直接写入 Phaser Scene。
- 禁止 HUD 直接修改状态对象，必须调用模拟层 API。
- 禁止新增核心玩法而不更新 `CCGS-Data/design/gdd/rulebook.md`。
- 禁止硬编码不可调数值；临时原型值必须在规则书或系统框架中有来源。
- 禁止 UI 遮挡关键 playfield 后不做截图验证。

## 允许的外部依赖

- Phaser。
- Vite / TypeScript。
- 测试阶段可加入 Vitest。
- 浏览器验证可使用 Playwright 或 Codex in-app browser。

## 引擎专家

- **主要专家**: `gameplay-programmer`
- **架构审查**: `lead-programmer`
- **AI 行为**: `ai-programmer`
- **UI/HUD**: `ui-programmer`
- **规则与数值**: `game-designer` + `systems-designer`
- **QA**: `qa-lead`

## 文件扩展名路由

| 路径 | 负责 Agent |
|---|---|
| `src/sim/**` | `gameplay-programmer` |
| `src/render/**` | `gameplay-programmer` / `technical-artist` |
| `src/main.ts` | `ui-programmer` |
| `src/styles.css` | `ui-programmer` |
| `CCGS-Data/design/gdd/**` | `game-designer` |
| `CCGS-Data/project-docs/architecture/**` | `lead-programmer` |
| `tests/**` | `qa-lead` / `gameplay-programmer` |

