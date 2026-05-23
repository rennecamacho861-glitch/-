# v0.6.6 视野压缩与照面反馈演出 Changelog

日期：2026-05-11

## 设计与文档

- 新增轻量视觉规格 `CCGS-Data/design/art/visual-feedback-addendum-2026-05-11.md`，定义照面弹窗、红光/金光/暗闪与低动效表现边界。
- 新增 UX 规格 `CCGS-Data/design/ux/combat-feedback-overlays.md`，定义遇敌与战斗回合结果弹窗的自动淡出、可读性和移动端约束。
- 更新 `rulebook.md`、`system-framework.md`、`module-ports.md` 至 v0.6.6，并同步 `docs/` 副本。

## 规则变化

- `calculateDerivedStats()` 新增 `brightVisionRadius = max(1, floor(visionRadius / 2))`。
- 玩家明亮视野、玩家主动看见敌人、Phaser 视野圈统一使用 `brightVisionRadius`。
- 敌人视野仍使用基础 `visionRadius`，因此未见远程先手和视野差压力保留。
- 照明棒等 `revealBoost` 叠加在玩家明亮视野之后。

## 实装变化

- `GameState` 新增 `feedbackEvents`，用于保存最近的遇敌与战斗回合反馈事件。
- 遇敌时推送 `encounter` 反馈事件，写入敌人名、双方视野状态与优势归属。
- 每次 `resolveActionRound()` 收束时推送 `combat-round` 反馈事件，聚合本轮行动、伤害、闪避、重伤与优势变化。
- DOM HUD 新增 `.feedback-toast` 自动淡出弹窗，不阻塞输入。
- Phaser 渲染层在新反馈事件出现时触发轻量 camera flash / shake；低动效偏好下禁用相机演出。

## 验证

- `npm test`：25/25 通过。
- `npm run build`：通过；保留 Phaser bundle 超过 500 kB 的既有 Vite 警告。
- 浏览器冒烟：`http://127.0.0.1:5173/` 正常打开，控制台无 error，初始亮区已缩小。

## 后续关注

- 需要一次浏览器人工确认：弹窗位置是否在高回合日志展开后仍不遮挡核心战斗按钮。
- 当前只做轻量演出，未加入音效与正式美术资产。
