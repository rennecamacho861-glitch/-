# Markdown 上下文成本清理 Changelog

日期：2026-05-14

## Summary

处理 Markdown 上下文成本审计中的优先项，避免新对话默认读取旧规则、重复副本或已吸收的 Quick Spec。

## Changes

- 压缩 `CCGS-Data/production/session-state/active.md` 为 v0.8.3 当前状态摘要。
- 将 `CCGS-Data/design/quick-specs/*.md` 历史文件移动到 `CCGS-Data/production/archive/quick-specs/`。
- 在 `CCGS-Data/design/quick-specs/README.md` 中说明该目录只放未沉淀的新 Quick Spec。
- 将 `docs/rulebook.md`、`docs/system-framework.md`、`docs/module-ports.md`、`docs/asset-presentation-port.md` 改为指向 CCGS 真源的短入口。
- 更新 `README.md` 与 `rulebook.md` 中残留的旧 `docs/` 真源流程说明。
- 更新 `CCGS-Data/production/tracking/md-context-cost-audit-2026-05-14.md` 为已处理状态。

## Verification

- 文档清理，不涉及运行时代码。
- 未运行 `npm test` 或 `npm run build`。
