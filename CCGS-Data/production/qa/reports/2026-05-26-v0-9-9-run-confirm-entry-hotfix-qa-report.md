# QA Report: v0.9.9 Run Confirm Entry Hotfix

**Date**: 2026-05-26
**Feature**: 局外地图进入确认弹窗
**Verdict**: PASS WITH NOTES

## Automated Verification

| Check | Result |
|---|---|
| `npm run build` | PASS |
| `npm test` | PASS，132/132 |

## Manual / Structural Checks

- 当前地图卡使用 `data-meta-command="open-run-confirm"`，不再只是 `select-tier`。
- 侧栏“开始行动”和行动页“开始行动”同样先打开确认窗口。
- 确认按钮继续使用原有 `start-run` 分支，进入关卡仍由 `MetagamePort.startRun` 处理。
- 取消按钮关闭确认窗口，不修改 `MetagameState`。
- 金币不足或战备超限时，弹窗保留说明并禁用确认按钮。

## Notes / Gaps

- 当前环境没有可用浏览器截图工具，本轮验证以构建、测试和 DOM 结构检查为主。
