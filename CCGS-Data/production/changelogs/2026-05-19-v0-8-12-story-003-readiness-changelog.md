# Changelog - v0.8.12 Story 003 Readiness

日期：2026-05-19  
范围：`story-003-advantage-flee-persuasion`

## 变更摘要

- 对 Story 003 进行 readiness 检查。
- 补充 Control Manifest 落地边界：优势窗口、逃跑和说服必须由 `src/sim` 结算，HUD 只派发模拟层命令。
- 补充性能预算：相关公式只在优势窗口选择、逃跑/说服判定和下一动作回合结算时运行，不进入 Phaser 高频循环。
- Story 状态从 `Todo` 更新为 `Ready`。

## 结论

READY。Story 003 依赖的 Story 001 已完成；GDD、TR、ADR、Manifest、测试证据要求均可追踪。
