# v0.8.11 低血量全屏反馈 Changelog

日期：2026-05-18

## Summary

本次按 `$team-ui` Lean 流程完成玩家低血量全屏提示。改动只发生在 DOM HUD 表现层：从模拟快照读取 `player.hp` 与体质派生最大生命值，不修改 `src/sim` 的生命、伤害或战斗规则。

## 修改文件

- `src/main.ts`
  - 引入 `calculateDerivedStats`，在 HUD 渲染时派生玩家最大生命值。
  - 新增低血量状态计算：低于半血为 wounded，低于 3 点生命为 critical。
  - 新增 `health-screen-effects` 全屏 overlay 标记，并将生命 chip 显示为 `当前/最大`。
- `src/styles.css`
  - 新增血迹 vignette、临界心跳脉冲、呼吸浮动动画。
  - 新增 wounded/critical 生命 chip 视觉样式。
  - 保留 `pointer-events: none`，并为 `prefers-reduced-motion: reduce` 提供静态视觉替代。
- `CCGS-Data/design/ux/interaction-patterns.md`
  - 新增 `Low Health Screen Feedback` 模式，记录阈值、表现层边界和低动效约束。

## 验证

- `npm test`：83 tests passed。
- `npm run build`：通过。
- Playwright 截图证据：
  - `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/normal-hud.png`
  - `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/critical-hud-forced.png`
  - `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/mobile-critical-hud-forced.png`

## Scope Check

- 计划内：HUD 低血量表现、交互模式登记、视觉 QA。
- 计划外：无。
- 未改动：`src/sim`、道具数据、战斗结算、地图规则。

## 已知事项

- Playwright 控制台记录了 `favicon.ico` 404，属于既有静态资源缺口，不影响本次低血量反馈。
- 临界态截图通过浏览器临时 DOM 注入强制模拟 `生命 2/12`，用于验证 CSS 表现；真实运行时由 `player.hp < 3` 自动触发。
