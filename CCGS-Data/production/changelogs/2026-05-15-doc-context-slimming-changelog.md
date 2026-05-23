# 文档上下文瘦身 Changelog

日期：2026-05-15  
范围：`docs/` 轻量入口、Codex 上下文负担

## 变更摘要

- 检查 CCGS 文档与缓存目录，确认卡顿风险主要来自重复文档和历史产物，而不是运行时代码。
- `docs/rulebook.md`、`docs/system-framework.md`、`docs/module-ports.md` 原本是 CCGS 真源的完整副本，且哈希一致。
- 将上述三份 `docs/` 文件改为轻量入口，只指向对应权威真源：
  - `CCGS-Data/design/gdd/rulebook.md`
  - `CCGS-Data/project-docs/architecture/system-framework.md`
  - `CCGS-Data/project-docs/architecture/module-ports.md`
- 不删除 CCGS 真源、不删除历史 Changelog/QA、不改运行时代码。

## 盘点结论

- `docs/` 从三份完整副本改为短入口，可减少重复上下文读取。
- `.npm-cache/`、`dist/`、`.test-build/` 已在 `.gitignore` 中，属于可清理缓存/构建产物，但本次未删除。
- `.ccgs-core/` 是框架本体，包含大量 Skill/Agent 模板；不建议删除，只建议按需读取。

## 验证

- 本次为文档入口瘦身，未改代码，未运行自动化测试。
- 权威文档仍保留在 `CCGS-Data/` 下。
