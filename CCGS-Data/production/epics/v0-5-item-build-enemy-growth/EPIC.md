# Epic: v0.5 道具构筑与敌人成长

状态：Done  
日期：2026-05-09  
GDD：`CCGS-Data/design/gdd/rulebook.md`  
架构：`CCGS-Data/project-docs/architecture/system-framework.md`

## Summary

将 v0.4 的主动搜索/屏息原型改造成 v0.5 的踩点三选一构筑，并让敌人在迷宫中拾取道具成长。战斗核心保持低武近战博弈，远程道具稀有且受弹药、视野和反制限制。

## Stories

| Story | Title | Type | Status |
|---|---|---|---|
| 001 | 规则书与架构同步 | Design/Architecture | Done |
| 002 | LootNode、敌人拾取与掉落 | Logic/Integration | Done |
| 003 | HUD 拾取弹窗与回归测试 | UI/QA | Done |

## Acceptance

- `rulebook.md` 与 `system-framework.md` 均进入 v0.5。
- `src/sim` 拥有 LootNode、pending pickup、AI 拾取、掉落保留状态。
- HUD 移除搜索/屏息按钮，新增三选一拾取弹窗。
- 自动化测试覆盖核心规则，构建通过。
