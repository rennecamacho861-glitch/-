# Asset Specs - system: grid-dungeon-item-vfx-v0-8-7

> **Source**: `CCGS-Data/design/gdd/rulebook.md`  
> **Art Bible**: `CCGS-Data/design/art/art-bible.md`  
> **Generated**: 2026-05-17  
> **Status**: 3 assets specced / 3 approved / 3 procedural / 3 done

## Scope

本规格覆盖 `bandage`、`echo`、`pistol` 三件道具的程序化反馈演出。它们不新增 PNG 贴图，运行时由 DOM/CSS 与 Phaser Graphics 绘制，避免为短促反馈引入额外素材加载和图集维护成本。

## Shared Technical Rules

- 命名以反馈事件为真源：`item-heal`、`echo-pulse`、`gunshot`。
- `src/sim` 只生成结构化 `FeedbackEvent` 字段，不读取任何美术资源。
- `src/render/GameScene.ts` 只读取 `origin`、`target`、`positions` 播放程序化动画，不改变状态。
- `src/main.ts` 只根据 `kind-*` class 播放窗口级 CSS 动画。
- 必须尊重 `prefers-reduced-motion: reduce`，禁用 shake 与大幅动画，保留确认式弹窗文本。

## Asset List

| Asset ID | Runtime ID | Category | Dimensions | Implementation | Status |
|---|---|---|---:|---|---|
| ASSET-090 | vfx-item-heal-window | VFX/UI | DOM panel scoped | CSS pseudo-element + Phaser ring | Done |
| ASSET-091 | vfx-echo-pulse-cluster | VFX | Grid world scoped | Phaser rings + 2x2 marker | Done |
| ASSET-092 | vfx-pistol-gunshot | VFX | Grid world scoped | Phaser line + muzzle/impact flash | Done |

## Visual Descriptions And Prompts

### ASSET-090 - vfx-item-heal-window

窗口级治疗反馈。确认式弹窗边缘转为温绿，面板内有一条柔和治疗脉冲从左到右掠过；地图角色脚下同步出现一圈绿色细环和小十字。视觉不应像魔法治愈，而应像临时包扎后生命条重新稳定。

**Art Bible Anchors**

- §4 Color System：使用可交互收益的琥珀与生存绿，不覆盖黑暗底色。
- §7 Motion And Feedback：轻量 flash / pulse，不能遮挡核心地图。

**Generation Prompt**

Procedural CSS/Phaser VFX only, no raster generation. If later rasterized: subtle medical pulse on dark metal HUD, muted green and amber, light cyberpunk wasteland dungeon, no text, no icon, no neon overload.

### ASSET-091 - vfx-echo-pulse-cluster

回声针反馈。以玩家所在格为中心连续扩散三圈暗青色声波，随后在真实目标所在的 2x2 四格区域上叠加短暂橙色/暗青框线。四格整体被提示，但不能让单个目标格比其他格更亮。

**Art Bible Anchors**

- §2 Camera And Readability：墙后敌人不可显示实体，只能通过噪声或提示暗示。
- §4 Color System：情报使用暗青，关键回响区使用低饱和橙色。

**Generation Prompt**

Procedural Phaser rings and grid markers, top-down grid dungeon, dark teal sound waves, muted orange four-cell echo cluster, low-tech wasteland UI, no arrows, no text, no exact target marker.

### ASSET-092 - vfx-pistol-gunshot

手枪开火反馈。开火格出现极短的暖橙枪口火光，起点到目标点画一条 200-300ms 的细弹道线，目标格出现小红/橙命中点或擦过点。表现必须短促、低武、危险，而不是电影化长尾特效。

**Art Bible Anchors**

- §4 Color System：危险/敌意使用暗红；可交互收益和枪口光使用琥珀/橙。
- §7 Motion And Feedback：枪击允许轻微 shake，reduced motion 时禁用。

**Generation Prompt**

Procedural Phaser muzzle flash and bullet tracer, top-down grid dungeon, muted orange line, dim red impact point, low-tech pistol shot, short duration, no smoke cloud, no cinematic explosion, no floating text.
