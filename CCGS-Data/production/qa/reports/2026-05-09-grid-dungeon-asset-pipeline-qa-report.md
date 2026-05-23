# Grid Dungeon 资产流水线 QA 报告

日期：2026-05-09  
范围：绿底组件表、透明 PNG 拆分、manifest、9x9 合图预览  
结论：PASS

## 检查项

| 项目 | 结果 | 说明 |
|---|---|---|
| 源图归档 | PASS | 原始 image gen 输出已归档到 `CCGS-Data/design/art/source/grid-dungeon/grid-dungeon-components-iter01.png`。 |
| manifest 完整性 | PASS | `public/assets/grid-dungeon/manifest.json` 记录 35 个资产条目，包含类别、文件、源裁切框、输出尺寸和墙体 edges。 |
| 透明组件导出 | PASS | `extract-grid-assets.ps1` 成功导出 35 个透明 PNG。 |
| 合图预览 | PASS | `compose-grid-preview.ps1` 成功生成 `preview-iter01.png`。 |
| 文件与尺寸校验 | PASS | `validate-grid-assets.ps1` 校验 35 个 manifest 条目全部存在，尺寸符合定义。 |
| 自动化测试 | PASS | `npm test` 通过，15/15 tests passed。 |
| 生产构建 | PASS | `npm run build` 通过；Vite 仅提示既有 Phaser bundle 体积 warning。 |
| 运行时代码隔离 | PASS | 本轮未修改 `src/`，不改变 Phaser 运行时表现。 |

## 执行记录

```powershell
.\scripts\art\extract-grid-assets.ps1
.\scripts\art\compose-grid-preview.ps1
.\scripts\art\validate-grid-assets.ps1
npm test
npm run build
```

结果摘要：

```text
Extracted 35 transparent assets.
Composed preview: CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01.png
Validated 35 grid-dungeon assets.
tests 15 / pass 15 / fail 0
vite build PASS
```

## 风险与后续

- `actor-enemy-hint` 属于整格红光/噪声覆盖层，校验中作为 `fullFrameOverlay` 处理。
- 当前资产是参考级可用资产，不是最终商业切片；绿色边缘和个别墙体衔接仍可在 iter02 中专项优化。
- 后续接入 Phaser 时需要单独验证 72px 原画缩放到当前 36px 逻辑格后的清晰度和遮挡层级。
