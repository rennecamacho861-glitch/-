# Grid Dungeon 组件资产流水线 Changelog

日期：2026-05-09  
类型：美术资产流水线 / 合图验证  
对应规则：2D 俯视角格子迷宫、墙边阻视线、3x3 亮区与 5x5 可见/记忆范围  
范围边界：本轮不修改 Phaser 运行时代码

## 新增文件

- `CCGS-Data/design/art/source/grid-dungeon/grid-dungeon-components-iter01.png`
- `public/assets/grid-dungeon/manifest.json`
- `scripts/art/extract-grid-assets.ps1`
- `scripts/art/compose-grid-preview.ps1`
- `scripts/art/validate-grid-assets.ps1`
- `CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01.png`
- `CCGS-Data/production/qa/evidence/art/grid-dungeon/visual-review-iter01.md`
- `CCGS-Data/production/qa/reports/2026-05-09-grid-dungeon-asset-pipeline-qa-report.md`

## 新增资产目录

- `public/assets/grid-dungeon/tiles/`
- `public/assets/grid-dungeon/walls/`
- `public/assets/grid-dungeon/props/`
- `public/assets/grid-dungeon/actors/`
- `public/assets/grid-dungeon/ui/`
- `public/assets/grid-dungeon/items/`

## 变更摘要

- 使用 image gen 生成绿底组件表，并归档到 CCGS 美术源图目录。
- 按 72px 原画格子拆分 35 个组件资产，覆盖地格、墙体、场景装饰、角色提示、HUD、背包 UI 和 7 个核心道具图标。
- 新增 manifest 描述资产 id、类别、文件、源裁切框、输出尺寸；墙体额外记录 `edges`，用于后续按格边拼装。
- 新增 PowerShell 扣图脚本，使用 .NET `System.Drawing` 完成裁切、绿幕扣除、低 alpha 清理和 PNG 输出。
- 新增合图脚本，按 9x9 单格移动规则生成预览图：玩家居中、中心 3x3 亮区、外圈 5x5 暗记忆、之外黑雾，HUD 不遮挡核心区域。
- 新增校验脚本，验证 manifest 资产存在、尺寸对齐、普通非整格资产具备透明边角样本。

## 验证

- `.\scripts\art\extract-grid-assets.ps1`：PASS，导出 35 个透明资产。
- `.\scripts\art\compose-grid-preview.ps1`：PASS，生成 `preview-iter01.png`。
- `.\scripts\art\validate-grid-assets.ps1`：PASS，35 个 manifest 条目全部通过。
- `npm test`：PASS，15/15 tests passed。
- `npm run build`：PASS，保留既有 Vite chunk size warning。

## 已知限制

- 本轮资产尚未接入 Phaser loader 或实际地图渲染。
- Iter01 仍带有较强绿色边线，暂时可作为轻赛博废土风格的一部分；若影响可读性，下一轮应单独重生墙体与 UI 边框。
- `actor-enemy-hint` 是整格红光/噪声覆盖资产，已通过 `fullFrameOverlay` 与普通透明精灵区分。
