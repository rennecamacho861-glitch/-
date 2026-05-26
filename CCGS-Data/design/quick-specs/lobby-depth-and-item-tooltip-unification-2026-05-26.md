# Quick Design Spec: 主页面层次与道具说明统一

**Type**: Tweak  
**System**: Game Shell & Product UI / HUD & Combat UI  
**GDD Reference**: `CCGS-Data/design/gdd/metagame-shell-product-ui.md`, `CCGS-Data/design/ux/interaction-patterns.md`  
**Date**: 2026-05-26

## Change Summary

在上一轮视觉降权基础上补回主页面的光照和立体层次，同时修复战斗中道具 tooltip 被面板遮挡的问题，并把所有道具说明统一为“效果 + 使用限制 / 经济信息 / 附魔”的玩家文案格式。

## Motivation

玩家反馈主页面变得过暗，缺少可读的空间层级；同时战斗中从右侧携带物或情报 token 展开的道具说明会被战斗面板遮挡，且“应对：……”文案显得像设计注释，不适合作为所有道具的常规说明。

## Design Delta

当前交互库要求道具文本来自玩家文案层。本规格进一步明确：

- 背包、商店、战备预览和战斗情报中的道具 tooltip 使用同一类信息结构：名称、稀有度、效果说明、使用限制，必要时再追加经济信息或附魔效果。
- 常规道具 tooltip 不显示“应对：……”前缀，也不常驻展示敌方 counter 文案。
- 若未来需要敌方对策提示，应作为单独“百科 / 敌方情报扩展”层，而不是混入道具基础说明。
- 战斗状态下，右侧携带物 tooltip 必须高于战斗面板显示；战斗面板内部情报 tooltip 不应被自身裁切。
- 主页面可以增加局部光照、内外阴影、卡片抬升和背景高光来建立层次，但不恢复上一轮被降权的多入口高亮。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Game Shell & Product UI | 主页面光照、边框和卡片层次调整 | 更新 `src/styles.css` |
| HUD & Combat UI | tooltip 层级、情报 tooltip 文案结构 | 更新 `src/main.ts` 与 `src/styles.css` |
| Item Text Port | 不改运行时文本生成规则，只改 HUD 选择展示字段 | 无 `src/sim` 规则变更 |
| UX Pattern Library | Intel tooltip 不再展示 counterplay | 更新 `interaction-patterns.md` |

## Acceptance Criteria

- [ ] 主页面比 v0.9.10 更亮，有明确前后层次，但地图和开始行动仍是第一视觉焦点。
- [ ] 战斗中右侧携带物 tooltip 不被战斗面板遮挡。
- [ ] 战斗面板里的道具情报 tooltip 不再显示“应对：……”。
- [ ] 背包、商店、战备预览和情报道具说明使用同一套玩家文案端口。
- [ ] `npm run build` 与 `npm test` 通过。

## GDD Update Required?

No. 本轮属于 UI/UX 展示层修正；不改变道具效果、敌人行为、战斗结算或局外经济。
