# Quick Design Spec: Responsive Map Carousel Lobby

**Type**: Addition
**System**: Game Shell / Metagame UI
**GDD Reference**: `CCGS-Data/design/gdd/metagame-shell-product-ui.md`
**Date**: 2026-05-26

## Change Summary

局外大厅从“同页信息面板”调整为产品化入口外壳：桌面端以左侧地图轮播为核心，右侧为纵向导航和进入地图；手机端以顶部角色资源、中部地图轮播、底部五入口导航为核心。

## Motivation

玩家反馈当前局外目标感仍不够强，页面区块都挤在同一层级。参考用户提供的手机/桌面界面后，本轮把“选择地图并进入搜打撤”提升为大厅首要视觉对象，同时补齐触屏端长按查看道具详情，避免移动端没有 hover 时丢失信息。

## Design Delta

当前大厅已经把战备和地图合并到行动页，但地图仍像普通列表。本规格改为：

1. 桌面端：地图轮播占据主舞台左侧，前后地图露出边缘并被阴影压后；右侧竖栏首位固定为“进入地图”，下方为商城、角色、战斗、背包、百科。
2. 手机端：顶部展示账号、金币、等级/属性、当前地图与战备；中间显示可左右滑动的地图轮播；底部固定五入口导航：商城、角色、战斗、背包、百科。
3. 地图切换支持点击左右地图/箭头/圆点，也支持拖动或滑动。
4. 所有原本依赖 hover/focus 的局外道具详情，在触屏端可通过长按打开；长按不应同时触发购买、带入或出售。
5. 本轮不改变 `src/sim` 的经济、地图、战备或战斗规则。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| DOM HUD / Metagame shell | 新布局、新导航、新触屏输入 | 修改 `src/main.ts` 与 `src/styles.css` |
| Interaction patterns | 新增地图轮播与长按 tooltip 模式 | 更新 `interaction-patterns.md` |
| Simulation | 无规则改动 | 不修改 |

## Acceptance Criteria

- [ ] 局外未进关时不显示局内 HUD，只显示大厅外壳。
- [ ] 桌面端地图轮播为主视觉，右侧首个操作是进入地图。
- [ ] 手机端底部导航为商城、角色、战斗、背包、百科。
- [ ] 鼠标可 hover/focus 查看道具详情，触屏可长按查看同样详情。
- [ ] 滑动/拖动地图轮播会切换到相邻地图。
- [ ] `npm run build` 与 `npm test` 通过。

## GDD Update Required?

No。该改动是现有局外 UI 的布局与输入适配，不改变玩法规则；以本 Quick Spec 和 UX 文档作为实现依据。
