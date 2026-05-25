# v0.9.5 局外行动入口编排 Changelog

## Summary

本轮按 `$ux-design` 调整局外窗口编排：主页不再只是宣传入口，而是承担“选择地图 + 检查战备 + 开始行动”的主操作窗口。地图和战备从顶层独立页面降级为入场前配置区；商店、仓库、档案保留为辅助管理页。

## Files Changed

- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/design/gdd/metagame-shell-product-ui.md`
- `CCGS-Data/design/gdd/systems-index.md`
- `CCGS-Data/design/ux/metagame-entry-flow.md`
- `CCGS-Data/production/session-state/active.md`

## Runtime Changes

- 顶层导航从六入口改为四入口：`行动 / 商店 / 仓库 / 档案`。
- 主页新增大号行动配置区：
  - 左侧为地图档位选择，当前选中档位使用更大卡片和高亮。
  - 右侧为入场检查，显示战备清单、入场费、金币、战备值和开始按钮。
- 战备清单与开始行动按钮保留原有 `MetagamePort` 调用，不改变经济和模拟层规则。
- 商店、仓库、档案仍作为独立辅助页，保留道具 tooltip 与账号 hook。
- 不再渲染独立 `map` / `loadout` 顶层页面。

## Design Sync

- `metagame-shell-product-ui.md` 更新到 `0.1.1`，记录“地图/战备是行动主页内部配置，而不是顶层页面”。
- 新增 `metagame-entry-flow.md`，记录入口流、信息层级、窗口区域、交互事件和验收标准。
- `systems-index.md` 将 Game Shell & Product UI 推进到 v0.9.5。

## Validation

- `npm run build`：通过。
- `npm test`：132/132 通过。
- `Invoke-WebRequest http://127.0.0.1:5188/`：返回 200。
- `rg` 检查：`src/main.ts` 未残留 `data-meta-view="map"` / `data-meta-view="loadout"` 顶层入口。

## Scope Check

- 计划内：局外 UI 编排、UX 文档、GDD 同步。
- 计划外：无。
- 未修改：`src/sim` 规则、经济数值、地图生成、战斗逻辑、资产文件。

## Notes

- 本轮未新增 imagegen 资产，直接复用 v0.9.4 已生成的 UI 美术资源。
- 当前环境没有暴露可用的 Browser/Playwright 截图工具；本轮以构建、测试和 HTTP 存活检查作为自动验证，建议发布前补桌面和移动截图证据。
