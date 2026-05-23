# v0.8.11 低血量全屏反馈 QA Report

日期：2026-05-18

## 测试范围

验证玩家生命值低于半血和低于 3 点时的 HUD 全屏提示是否可读、非阻塞，并遵守 DOM HUD 与模拟层解耦边界。

## 自动化测试

| 项目 | 结果 | 备注 |
|---|---|---|
| `npm test` | PASS | 83 tests passed |
| `npm run build` | PASS | Vite/TypeScript 构建通过 |

## 浏览器验证

| 项目 | 结果 | 证据 |
|---|---|---|
| 正常生命 HUD | PASS | `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/normal-hud.png` |
| 桌面 critical 低血量视觉 | PASS | `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/critical-hud-forced.png` |
| 移动 critical 低血量视觉 | PASS | `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/mobile-critical-hud-forced.png` |

## 验收检查

| 检查项 | 结果 | 说明 |
|---|---|---|
| 低于半血出现血迹 | PASS | `is-wounded` 使用边缘血迹和暗红 vignette，不遮挡中心操作区。 |
| 低于 3 点生命出现临界反馈 | PASS | `is-critical` 增加心跳脉冲与呼吸浮动，生命 chip 同步变为临界样式。 |
| 表现层不改模拟状态 | PASS | 改动只读取 `simulation.snapshot()` 和 `calculateDerivedStats()`，没有写入 `src/sim` 状态。 |
| HUD 不阻塞操作 | PASS | overlay 使用 `pointer-events: none`，拾取卡片和按钮仍可读可点。 |
| 低动效可访问性 | PASS | `prefers-reduced-motion: reduce` 关闭心跳和呼吸动画，保留静态视觉提示。 |

## 发现问题

| ID | 严重度 | 问题 | 状态 |
|---|---|---|---|
| QA-NOTE-001 | Low | Playwright 控制台记录 `favicon.ico` 404。 | 既有静态资源缺口，本次不处理。 |

## 结论

PASS。低血量反馈完成并通过桌面、移动截图验证；本次未改变玩法规则或模拟层。
