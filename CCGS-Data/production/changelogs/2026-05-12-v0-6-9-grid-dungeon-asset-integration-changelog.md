# v0.6.9 Grid Dungeon 资产接入 Changelog

日期：2026-05-12  
类型：美术资产规格 / Phaser 表现层接入  
规则来源：`CCGS-Data/design/gdd/rulebook.md`  
架构来源：`CCGS-Data/project-docs/architecture/asset-presentation-port.md`

## 修改文件

- `CCGS-Data/design/art/art-bible.md`
- `CCGS-Data/design/assets/specs/grid-dungeon-map-assets.md`
- `CCGS-Data/design/assets/asset-manifest.md`
- `CCGS-Data/design/art/source/grid-dungeon/grid-dungeon-enemy-supplement-iter01.png`
- `public/assets/grid-dungeon/manifest.json`
- `public/assets/grid-dungeon/actors/actor-enemy.png`
- `scripts/art/extract-grid-assets.ps1`
- `src/render/gridDungeonAssets.ts`
- `src/render/GameScene.ts`
- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/project-docs/architecture/asset-presentation-port.md`
- `docs/asset-presentation-port.md`

## 变更摘要

- 补齐轻量 Art Bible，明确 2D 俯视格子地牢、格边墙、3x3 亮区/5x5 记忆区、轻赛博废土 UI 与资产尺寸标准。
- 按 `$asset-spec` 工作流补写 `grid-dungeon-map` 资产规格和 CCGS 资产 manifest，登记 35 个已完成资产。
- 使用 image gen 补充敌人角色绿底素材表，并通过裁切/绿幕扣图加入 `actor-enemy.png`。
- 扩展 `extract-grid-assets.ps1`，支持 manifest 中单个资产指定 `sourceImage`，方便后续多源图迭代。
- 新增 `src/render/gridDungeonAssets.ts`，集中管理 Phaser texture key、公开资源 URL、预加载和 HUD 道具图标映射。
- `GameScene` 改为使用 PNG 组件渲染已探索/可见地格、格边墙、玩家、敌人、道具节点、陷阱和红光提示。
- 未探索区域恢复为黑暗，不再因为 floor-fog 资产显示全图路线。
- `main.ts` 的背包和三选一拾取面板开始显示已有的核心道具图标；未生产图标的扩展道具使用类别 fallback。

## Scope Check

计划内：
- 资产规格、manifest、裁切流水线、Phaser 资产预加载、运行时地图表现、HUD 道具图标。

计划外未做：
- 不改 `src/sim` 规则。
- 不新增 30 件扩展道具的专属图标。
- 不把 `floor-danger` 加回 manifest。
- 不调整战斗、AI、掉落或数值。

## 验证

- `.\scripts\art\validate-grid-assets.ps1`：PASS，35 个资产通过。
- `npm test`：PASS，32/32 tests passed。
- `npm run build`：PASS，保留既有 Phaser bundle size warning。
- 本地 dev server：`http://127.0.0.1:5188/` 返回 200。
- 核心资产 URL 抽查：floor-lit、wall-horizontal、actor-enemy、item-pistol 均返回 200。
- 浏览器截图证据：`CCGS-Data/production/qa/evidence/art/grid-dungeon/runtime-asset-integration-2026-05-12-final.png`。

## 已知限制

- Iter01 墙体和 UI 仍有较明显绿色边线，当前作为原型美术可接受。
- 当前角色只有静态朝向图，未做移动/战斗动画。
- 30 件扩展小收益道具缺少专属图标，后续建议单独做 item icon sheet。
