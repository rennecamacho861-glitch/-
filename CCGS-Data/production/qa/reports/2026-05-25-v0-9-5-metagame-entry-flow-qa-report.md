# v0.9.5 局外行动入口编排 QA Report

## Verdict

PASS WITH NOTES

## Scope

验证局外大厅是否从六个同级页面改为四个顶层入口，并确认地图与战备作为“行动主页”的入场前选择存在。

## Checks

| Check | Result | Evidence |
|---|---|---|
| TypeScript / production build | PASS | `npm run build` 通过 |
| Automated regression tests | PASS | `npm test` 132/132 通过 |
| Local server health | PASS | `Invoke-WebRequest http://127.0.0.1:5188/` 返回 200 |
| Removed standalone map/loadout nav refs | PASS | `rg` 未找到旧顶层 `data-meta-view="map"` / `data-meta-view="loadout"` |
| Rule boundary | PASS | 未修改 `src/sim` |
| UX documentation | PASS | 新增 `CCGS-Data/design/ux/metagame-entry-flow.md` |

## Manual Review Targets

- 主页中“选择行动区域”是否明显大于辅助入口。
- 当前选中地图档位是否一眼可读。
- 入场检查是否能同时展示战备清单、入场费、金币、战备值和开始按钮。
- 商店、仓库、档案是否仍可正常切换。
- 移动端布局中行动区域和入场检查是否纵向堆叠且不遮挡。

## Known Notes

- 本轮没有新增截图证据，因为当前会话未暴露可用的 Browser/Playwright 截图工具。
- 本轮没有改经济和规则层，因此未新增专门的模拟测试。
