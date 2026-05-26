# Interaction Patterns Addendum: v0.9.7 Responsive Lobby

**Date**: 2026-05-26
**Applies To**: 局外大厅、地图轮播、商店/背包/战备道具卡

## Pattern: Responsive Metagame Map Carousel

- 局外大厅的首要操作是选择地图并进入行动；地图卡必须比商城、背包、百科等辅助入口更醒目。
- 桌面端使用左侧大地图轮播和右侧竖向导航；右侧导航首位固定为“进入地图”。
- 手机端使用顶部资源条、中部地图轮播、底部五入口导航：商城、角色、战斗、背包、百科。
- 地图切换必须同时支持按钮/圆点点击和拖动/滑动，不能只依赖手势。
- 上一张和下一张地图可露出边缘，但必须通过阴影和透明度表达它们位于当前地图背后。

## Pattern: Touch Long-Press Tooltip

- 所有依赖 hover/focus 的道具详情，在触屏端必须可通过长按查看。
- 长按打开 tooltip 后，应抑制随后的 click，避免玩家查看信息时误触发购买、带入、出售或使用。
- 长按 tooltip 是鼠标 hover 和键盘 focus 的补充，不得替代键盘可访问性。
- Tooltip 内容仍来自同一玩家文案端口，不允许移动端单独写另一套规则文字。
