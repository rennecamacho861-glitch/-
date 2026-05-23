# Grid Dungeon 组件合图视觉证据 Iter01

日期：2026-05-09  
范围：72px 地格/墙体组件拆分、透明扣图、9x9 单格移动合图预览  
结论：PASS_WITH_NOTES

## 证据文件

- 原始绿底组件表：`CCGS-Data/design/art/source/grid-dungeon/grid-dungeon-components-iter01.png`
- 合图预览：`CCGS-Data/production/qa/evidence/art/grid-dungeon/preview-iter01.png`
- 资产 manifest：`public/assets/grid-dungeon/manifest.json`
- 透明组件目录：`public/assets/grid-dungeon/`

## 视觉检查

| 项目 | 结果 | 说明 |
|---|---|---|
| 单格移动可读性 | PASS | 9x9 预览中每格中心落点清晰，地面按 72px 对齐。 |
| 视野层级 | PASS | 玩家中心 3x3 为亮区，外圈 5x5 为暗记忆，之外为黑雾。 |
| 墙边阻视线 | PASS | 墙体按格边拼接，视觉上有厚度、顶边和阴影；墙后敌人没有实体透视。 |
| 墙灯照明 | PASS | 玩家不手持灯，亮区由墙灯和环境光表达。 |
| HUD 遮挡 | PASS | 顶部 HUD、右侧道具栏、左下日志不遮挡核心 5x5 视野。 |
| 风格统一 | PASS_WITH_NOTES | 轻赛博废土与地牢压迫感成立，但部分绿色边缘偏强，后续正式替换前可继续精修。 |
| 组件复用 | PASS | 地格、墙体、道具、UI、角色均已拆分为可复用 PNG。 |

## 已知问题

- `actor-enemy-hint` 是整格红光/噪声覆盖资产，允许不具备透明角样本；已在 manifest 中标记 `fullFrameOverlay`。
- 部分墙体和 UI 保留偏亮绿色边线，当前可作为轻赛博视觉语言使用；若后续过度抢眼，应在 iter02 单独重生墙体/边框。
- 本轮未接入 Phaser loader，不验证运行时缩放、动画或层级排序。

## 结论

Iter01 已满足“资产流水线与合图验证”目标，可作为后续 Phaser 地图渲染替换的参考资产包。下一轮若继续美术精修，建议优先补地格干净版和墙体无绿边版。
