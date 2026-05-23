# v0.8.12 Story 002 Readiness Changelog

日期：2026-05-19  
模式：Lean  
范围：Story readiness 状态

## Summary

完成 `Story 002: 攻击方向与战斗情报读取` 的 readiness 检查。前置依赖 `Story 001: Combat Matrix 与有效防御` 已完成，Story 002 的 GDD、TR、ADR、Manifest、测试证据字段均可追溯。

## 修改文件

- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`
  - 状态从 `Todo` 改为 `Ready`。
  - 补充性能预算说明，明确视野、情报和攻击方向读取不进入 Phaser 高频循环。

## Readiness 结果

- GDD：`combat-system.md` 状态为 `Confirmed`，`AC-CMB-001`、`AC-CMB-002`、`AC-CMB-005`、`AC-CMB-020`、`AC-CMB-021`、`AC-CMB-022` 可定位。
- TR：`TR-VISION-001`、`TR-INTEL-001`、`TR-COMBAT-001` 存在。
- ADR：`ADR-0001` 存在且状态为 `Accepted`。
- Control Manifest：Story `manifest_version` 与当前 `2026-05-09` 一致。
- 依赖：`story-001-combat-matrix-effective-defense` 已 `Complete`。
- 测试证据：Integration Story 要求新增或复用攻击方向/情报集成测试。

结论：Story 002 已 Ready，可进入 `/dev-story`。

## 已知注意事项

- `TR-INTEL-001` 来自旧版 rulebook 表述，仍包含“倾向信息”；Story 002 应以 `combat-system.md` 的战斗内情报限制为准：属性数值、具体道具、下一次攻击方向。
