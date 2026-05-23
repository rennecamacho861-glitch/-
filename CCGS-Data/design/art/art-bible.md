# 《照面之时》Art Bible

生成日期：2026-05-12  
状态：v0.1 轻量生产版  
适用范围：MVP 俯视角格子迷宫、HUD、道具图标、照面反馈

## 1. Visual Identity Statement

《照面之时》的画面应像“废弃管廊里的短促押注”：黑暗厚重、信息稀缺、墙体压近玩家视野，但关键可交互物必须一眼可读。整体风格是轻赛博朋克废土地牢，不做高饱和赌场霓虹；赌感来自照面、撤离和道具构筑的风险，而不是现代赌场图形语言。

## 2. Camera And Readability

- 主视角为 2D 俯视 / 轻正交。
- 单格移动必须比装饰优先，格子中心落点和边缘墙阻挡必须清晰。
- 玩家核心亮区约 3x3，外圈记忆/可感知区约 5x5，之外为黑雾。
- 墙体逻辑上位于格边，视觉上表现为有厚度的矮墙、隔断、破损顶边和投影。
- 墙后敌人不可显示实体，只能通过红光、噪声或方向提示暗示。

## 3. Shape Language

- 地格：方形、清晰边线、低对比裂纹和污渍。
- 墙体：横竖直段、角、T 字、十字和端头都应能重复拼接；形体略厚，带顶边和线缆细节。
- 角色：瘦长、裹布、旧金属护具、少量红色传感点；从 36px 逻辑格缩放后仍能区分玩家与敌人。
- UI：旧金属边框、半透明黑底、暗青/琥珀/暗红点缀；不得盖住核心地图。
- 道具：小型低武器械和旧补给，图标轮廓优先，细节次之。

## 4. Color System

| 语义 | 色彩倾向 | 用途 |
|---|---|---|
| 黑暗/未知 | 近黑、冷灰 | 未探索区域、背景 |
| 记忆/已探索 | 暗青灰、低饱和绿边 | 已探索但不可见地格 |
| 当前亮区 | 冷白、暗青灯光 | 玩家当前可见格 |
| 可交互收益 | 琥珀、脏金 | 道具节点、战利、优势提示 |
| 危险/敌意 | 暗红、低饱和红光 | 敌人提示、受击、警报 |
| UI 金属 | 黑铁、脏铜、旧线缆绿 | HUD 框、背包栏、日志框 |

## 5. Lighting Rules

- 玩家不手持灯，主要照明来自墙灯、漏电、屏幕余光和环境反射。
- 亮区中心可读，外圈快速衰减。
- 红光只用于危险提示或墙后暗示，不能作为常驻地图装饰大面积铺满。

## 6. UI Rules

- HUD 必须展示生命、时间、战利、背包和最近记录。
- HUD 不显示已删除的全局危险数值。
- 道具按钮可使用图标增强识别，但文字和充能仍必须保留。
- 拾取三选一、战斗面板和确认式反馈弹窗不能遮挡核心 5x5 地图视野。

## 7. Motion And Feedback

- 普通移动不需要强动画，优先保持格子位置明确。
- 照面、受击、优势和情报获得可以触发轻量 flash / shake。
- `prefers-reduced-motion: reduce` 时禁用 shake，仅保留文本和透明度变化。

## 8. Asset Standards

| 类型 | 原画尺寸 | 运行时目标 | 格式 | 备注 |
|---|---:|---:|---|---|
| 地格 | 72x72 | 36x36 | PNG | 可缩放到 0.5，允许整格不透明 |
| 格边墙直段 | 216x72 或 72x216 | 108x36 或 36x108 | PNG | 拼在格边，可跨 3 格 |
| 墙角/T/十字 | 144x144 或 216x144 | 72x72 或 108x72 | PNG | 用于连接和预览验证 |
| 单格道具/提示 | 72x72 | 24-36px | PNG | 背景透明，轮廓优先 |
| 角色 | 72x144 | 36x72 | PNG | 脚点落在当前格中心偏下 |
| HUD 框 | 72px 倍数 | DOM/CSS 或 Phaser 图层 | PNG/CSS | 不承载规则状态 |

## 9. Generation Prompt Anchors

默认提示词应包含：top-down slight orthographic, reusable tile asset, light cyberpunk wasteland dungeon, old metal, dirty cables, dark teal light, amber utility glow, dim red warning leak, chroma key #00ff00 for extraction, no labels, no arrows, no modern casino neon, no floating warning icons.

## 10. Current Production Notes

- `public/assets/grid-dungeon/manifest.json` 是当前可加载资产 manifest。
- `CCGS-Data/design/art/source/grid-dungeon/` 保存 image gen 源图。
- `CCGS-Data/production/qa/evidence/art/grid-dungeon/` 保存合图和截图证据。
- Iter01 资产允许作为原型可用资产；若后续进入更高美术质量阶段，应优先重生墙体边缘和完整 37 件道具图标。
