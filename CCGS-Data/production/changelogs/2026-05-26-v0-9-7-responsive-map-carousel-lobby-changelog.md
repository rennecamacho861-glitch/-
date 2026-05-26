# Changelog: v0.9.7 Responsive Map Carousel Lobby

**Date**: 2026-05-26
**Mode**: Lean UI implementation
**Scope**: 局外大厅布局、响应式导航、触屏 tooltip

## Changed

- 将局外大厅重排为产品化入口外壳：顶部显示本地档案、金币、属性档、背包库存、战备和当前地图。
- 桌面端改为左侧地图轮播主舞台，右侧竖向导航；右侧首个操作固定为“进入地图”。
- 手机端改为顶部状态、中部地图轮播、底部五入口导航：商城、角色、战斗、背包、百科。
- 行动页地图支持点击箭头/圆点/相邻地图，也支持拖动或滑动切换。
- 新增百科页，收束游戏目标、五维属性、优势、道具规则和地图档位说明。
- 为触屏端增加长按 tooltip：商店、背包、战备和情报卡片在无 hover 环境下也能查看详情，且长按不会误触发购买或带入。

## Files Changed

- `src/main.ts`
- `src/styles.css`
- `package.json`
- `scripts/serve-dist.cjs`
- `CCGS-Data/design/quick-specs/responsive-map-carousel-lobby-2026-05-26.md`
- `CCGS-Data/design/ux/metagame-responsive-carousel-lobby.md`
- `CCGS-Data/design/ux/interaction-patterns-v0-9-7-addendum.md`
- `CCGS-Data/production/qa/reports/2026-05-26-v0-9-7-responsive-map-carousel-lobby-qa-report.md`

## Notes

- 本轮未修改 `src/sim`，地图、商店、战备、经济和战斗规则保持原样。
- 没有调用 imagegen；当前复用已有局外 UI 与地图背景资产。
