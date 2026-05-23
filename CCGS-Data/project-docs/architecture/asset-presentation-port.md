# Asset Presentation Port - Grid Dungeon

日期：2026-05-12  
范围：v0.6.9 地格/墙体/角色/HUD 资产接入  
规则来源：`CCGS-Data/design/gdd/rulebook.md`  
视觉来源：`CCGS-Data/design/art/art-bible.md`

## 1. 目标

本轮只接入表现资产，不改变模拟层规则。目标是让当前游戏页面从几何色块过渡到可复用的 grid-dungeon PNG 组件：地格、格边墙体、玩家、敌人、道具节点、陷阱和核心道具图标。

## 2. 端口边界

| 模块 | 文件 | 输入 | 输出/副作用 | 禁止事项 |
|---|---|---|---|---|
| Asset Manifest | `public/assets/grid-dungeon/manifest.json` | image gen 源图与裁切脚本 | 稳定资产 ID、文件路径、尺寸、墙体 edges | 禁止作为规则数据源 |
| Asset Config | `src/render/gridDungeonAssets.ts` | manifest 对应的公开 PNG 路径 | Phaser texture key、preload、HUD 图标 URL | 禁止被 `src/sim` 导入 |
| Phaser Render | `src/render/GameScene.ts` | `SimulationReadPort.snapshot()`、资产 texture key | 地格、墙体、角色、节点、提示渲染 | 禁止调用 `SimulationCommandPort` 或修改状态 |
| DOM HUD Icons | `src/main.ts` | `ITEMS`、玩家背包、`itemIconUrl()` | 道具按钮图标增强 | 禁止用图标替代文字、充能或反制说明 |

## 3. 运行时约束

- `src/sim` 禁止读取 `public/assets`、manifest、图片 URL、Phaser texture key 或 DOM icon URL。
- 未探索格不绘制地格资产，只保留黑暗背景。
- 已探索但不可见使用记忆地格；可见使用亮区地格；出口使用出口地格。
- 格边墙体由 `wallEdges` 驱动，外边界可由渲染层补画完整墙框。
- 可见敌人使用敌人角色资产；仅有提示但未看见实体时使用红光/噪声覆盖资产。
- 道具图标缺口允许使用类别文字 fallback；不得把错误图标绑定到未生产的道具。

## 4. 当前资产缺口

- 30 件扩展小收益道具尚未逐一生产图标，当前 HUD 使用类别 fallback。
- `floor-danger` 不在 manifest 中，运行时不得加载；全局危险格已经从规则中删除。
- 墙体绿边偏强，属于 Iter01 原型美术债，不阻塞当前接入。

## 5. 验收

- `.\scripts\art\validate-grid-assets.ps1` 通过。
- `npm test` 通过。
- `npm run build` 通过。
- 浏览器截图能看到 PNG 地格、墙体、玩家和 HUD；未知区域保持黑暗，不显示全图路线。
