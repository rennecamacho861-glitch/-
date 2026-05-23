# Changelog - v0.8.12 Story 004 Readiness

日期：2026-05-19  
范围：`story-004-item-limits-build-budget`

## 变更摘要

- 对 Story 004 进行 readiness 检查。
- 补充 Control Manifest 落地边界：道具效果、主动使用上限、被动预算和触发链必须由 `src/sim` 结算，HUD 不按道具名推断限制。
- 补充性能预算：预算筛选和同类修正解析只在背包变化、照面创建、手动使用道具和动作回合结算时运行，不进入 Phaser 高频循环。
- Story 状态从 `Todo` 更新为 `Ready`。

## 结论

READY。Story 004 依赖的 Story 001 已完成；GDD、TR、ADR、Manifest、测试证据要求均可追踪。
