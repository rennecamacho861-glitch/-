# v0.6.7 删除全局危险与旧筹码危险格 Changelog

日期：2026-05-12

## 设计与文档

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/remove-global-danger-old-chips-2026-05-12.md`。
- `rulebook.md` 更新为 v0.6.7：全局危险数值和“旧筹码响动”危险格被删除。
- `system-framework.md`、`module-ports.md`、`systems-index.md`、`game-concept.md` 同步删除危险系统描述。
- `docs/rulebook.md`、`docs/system-framework.md`、`docs/module-ports.md` 已同步。
- 音频/资产规格移除 `exploration.danger.tile` 与 `floor-danger` manifest 引用。

## 实装变化

- `GameState` 移除 `danger` 字段。
- `TileKind` 收缩为 `floor | exit`。
- 地图布局中的 `D` 全部改为普通地面，不再生成危险格。
- 玩家踩到原危险格坐标时不再触发“旧筹码响了一声”日志。
- `addDanger()` 与所有危险增长调用删除。
- HUD 不再显示“危险”数值。
- Phaser 地图渲染不再绘制危险格色块。
- 手枪、陷阱、说服失败、僵持脱战只保留直接效果/日志/提示，不再修改全局危险。

## 保留说明

- `FeedbackEvent.tone = "danger"` 保留为视觉演出语义，用于敌方优势、受击、枪击、重伤等红色反馈；它不代表全局危险数值。

## 验证

- `npm test`：25/25 通过。
- `npm run build`：通过；保留 Phaser bundle 超过 500 kB 的既有 Vite 警告。
- 浏览器刷新 `http://127.0.0.1:5173/`：HUD 不再出现“危险”，控制台 error 数为 0。
