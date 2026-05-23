# Codex 新线程交接摘要

日期：2026-05-15

## 当前状态

- 项目：`D:\游戏设计\照面之时`
- 固定预览端口：`http://127.0.0.1:5188/`
- 当前预览服务：已停止，`5188` 无监听。
- 最新规则版本：`rulebook.md` v0.8.5，新增战斗内下一次攻击方向情报。
- 最新自动化验证：`npm test` 70/70 通过，`npm run build` 通过。

## 上下文瘦身

- `docs/rulebook.md`、`docs/system-framework.md`、`docs/module-ports.md` 已改成轻量入口。
- 权威真源仍在：
  - `CCGS-Data/design/gdd/rulebook.md`
  - `CCGS-Data/project-docs/architecture/system-framework.md`
  - `CCGS-Data/project-docs/architecture/module-ports.md`
- 可清理但尚未删除的缓存/产物：
  - `.npm-cache/`
  - `dist/`
  - `.test-build/`
  - 根目录零散 `.log`

## 继续工作建议

- 若 Codex 当前线程卡顿，优先新开线程并引用本文件。
- 新线程只需先读 `AGENTS.md`、本交接摘要、当前任务相关的 GDD/架构小节，不要全量读取历史 Changelog/QA。
- 玩法改动继续遵循：先改 `rulebook.md`，再同步架构，再实装和测试。
