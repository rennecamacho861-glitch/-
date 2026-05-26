# Changelog: v0.9.10 Metagame Lobby Visual Priority

**Date**: 2026-05-26  
**Mode**: Lean / UI Tweak  
**Scope**: 局外大厅视觉优先级与信息降权

## Changed

- 新增 quick spec，明确局外大厅的五层视觉权重：主行动层、决策辅助层、管理入口层、背景信息层、装饰层。
- 行动主页不再把“已选择某档地图”作为全宽消息条常驻显示，改由地图卡自身承担选中反馈。
- 入场检查从完整携带物列表改为紧凑摘要：显示携带数量、战备值、失败/撤离风险和最多 3 个携带物预览。
- 紧凑携带物预览继续复用现有道具 tooltip；桌面 hover/focus 与触屏长按都能查看详细说明。
- 降低顶部资源条、右侧普通导航、底部摘要、相邻地图和装饰框的视觉权重，保留当前地图和开始行动作为第一焦点。
- 相邻地图卡隐藏次级说明和标签，只保留“背后还有地图”的轮播暗示。

## Files Changed

- `CCGS-Data/design/quick-specs/metagame-lobby-visual-priority-deemphasis-2026-05-26.md`
- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/production/qa/reports/2026-05-26-v0-9-10-metagame-lobby-visual-priority-qa-report.md`

## Notes

- 本轮不修改 `src/sim`、局外经济、地图档位、战备规则或进入关卡端口。
- 完整携带物管理仍在背包/仓库页面中进行；行动主页只承担入场前快速判断。
