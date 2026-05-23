# Changelog：ADR-0002 Phaser 表现层异步边界

日期：2026-05-13  
范围：架构文档、Vite 构建、Phaser 启动边界、技术债登记

## 变更

- 新增 ADR：`CCGS-Data/project-docs/architecture/ADR-0002-phaser-presentation-chunk-boundary.md`。
- 新增 `src/render/startPhaserGame.ts`，集中创建 `Phaser.Game`，只接收 `SimulationReadPort`。
- `src/main.ts` 不再静态导入 Phaser 或 `GameScene`，改为动态加载表现层启动模块。
- `vite.config.ts` 对齐固定端口 `5188` / `strictPort`，并拆出 `phaser-vendor` chunk。
- `module-ports.md` 与 `system-framework.md` 记录 Phaser 异步边界。
- `tech-debt.md` 新增 3 项开放债务：`GameSimulation` 过大、`snapshot()` 真实状态暴露、HUD 文件待拆。

## 构建结果

- 入口 chunk：约 78.65 kB，gzip 约 26.37 kB。
- `startPhaserGame` chunk：约 5.18 kB，gzip 约 2.15 kB。
- `phaser-vendor` chunk：约 1,478.57 kB，gzip 约 339.68 kB。
- 构建警告已消失；Phaser 体积被明确归入 vendor chunk。

## 验证

- `npm run build`：通过。
- `npm test`：35/35 通过。

## 偏离说明

- 本轮只拆 Phaser 与入口逻辑，不拆 `GameSimulation` 内部战斗系统。该项已登记为 TD-003。
