# v0.6.9 Grid Dungeon 资产接入 QA 报告

日期：2026-05-12  
范围：资产规格、透明 PNG、Phaser 地图渲染、HUD 道具图标  
结论：PASS_WITH_NOTES

## 检查项

| 项目 | 结果 | 说明 |
|---|---|---|
| Art Bible | PASS | `CCGS-Data/design/art/art-bible.md` 已建立轻量生产规范。 |
| Asset Spec | PASS | `grid-dungeon-map-assets.md` 登记 35 个已完成资产。 |
| Manifest | PASS | `public/assets/grid-dungeon/manifest.json` 可被脚本校验。 |
| 透明扣图 | PASS | `actor-enemy` 已从新增 image gen 源图裁切并扣图。 |
| 资产文件 | PASS | `validate-grid-assets.ps1` 通过，35 个资产存在且尺寸符合 manifest。 |
| 端口隔离 | PASS | `src/sim` 未导入资产、DOM、Phaser 或图片 URL。 |
| Phaser 接入 | PASS | `GameScene` 通过 `gridDungeonAssets.ts` preload 并使用 PNG 组件渲染地图。 |
| HUD 图标 | PASS_WITH_NOTES | 7 个核心道具有图标；30 件扩展道具使用类别 fallback。 |
| 未探索区域 | PASS | 最终截图中未探索区域保持黑暗，不显示全图路线。 |
| 自动化测试 | PASS | `npm test` 通过，32/32 tests passed。 |
| 生产构建 | PASS | `npm run build` 通过；Vite 仅提示既有 Phaser bundle size warning。 |
| 浏览器证据 | PASS | Chrome headless 截图显示 PNG 地格、墙体、玩家和 HUD。 |

## 执行记录

```powershell
.\scripts\art\extract-grid-assets.ps1
.\scripts\art\validate-grid-assets.ps1
.\scripts\art\compose-grid-preview.ps1 -OutputPath CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01-with-enemy.png
npm test
npm run build
```

结果摘要：

```text
Validated 35 grid-dungeon assets.
tests 32 / pass 32 / fail 0
vite build PASS
http://127.0.0.1:5188/ status 200
```

## 证据文件

- 最终运行时截图：`CCGS-Data/production/qa/evidence/art/grid-dungeon/runtime-asset-integration-2026-05-12-final.png`
- 延迟截图：`CCGS-Data/production/qa/evidence/art/grid-dungeon/runtime-asset-integration-2026-05-12-delay.png`
- 合图预览：`CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01-with-enemy.png`
- Vite dev server 日志：`CCGS-Data/production/qa/evidence/art/grid-dungeon/vite-dev-server.out.log`

## 风险与后续

- 需要单独制作 30 件扩展道具的图标 sheet，当前 fallback 不影响规则但弱化构筑识别。
- 墙体组件现在按单段缩放，能表达格边阻挡，但连接处仍可继续美术精修。
- 角色还没有朝向和动作帧；后续若进入移动/战斗动画，需要扩展 actor spritesheet。
