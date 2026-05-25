# v0.9 局外账号与搜打撤经济规则提案 Changelog

**Date**: 2026-05-25  
**Mode**: CCGS Full / Phase 1 Proposal  
**Status**: 规则草案，等待用户确认；未实装运行时代码

## Summary

为解决目标感弱的问题，本轮将搜打撤大框架写成正式规则草案：本地账号 Profile、金币、属性 roll/升级、商店、仓库、战备、五档地图、入场费、撤离带回和失败丢失。

## Files Changed

- `CCGS-Data/design/gdd/metagame-economy.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/systems-index.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `CCGS-Data/production/proposals/2026-05-25-v0-9-metagame-economy-proposal.md`
- `CCGS-Data/production/session-state/active.md`

## Design Notes

- 当前难度被定义为 Tier 2，但敌人数值从固定 15 改为 10-20 波动。
- 五档地图逐步提高敌人数值、入场费、战备上限、掉落稀有度、附魔概率和宝石产出。
- Tier 5 增加附魔宝石掉落，并要求所有敌人出生时至少携带 1 件附魔物品。
- 首版账号默认是本地 Profile，不引入服务器登录。
- 失败默认丢失本次带入和本局所得，仓库未带入物品保留。

## Scope Check

计划内：

- GDD 新增。
- Rulebook 摘要新增。
- Systems index 和 architecture 端口同步。
- Proposal 和会话记录。

计划外：

- 未修改 `src/sim`、`src/main.ts`、`src/render` 或测试。
- 未运行 `npm test` / `npm run build`，因为本轮没有代码变更。

## Validation

- `git diff --check`：通过，仅有既有 Windows CRLF 提示。

## Next Recommended

确认规则后进入 `/create-epics`，建立 `v0-9-metagame-economy` Epic，再按 Profile、Economy、Shop、Deployment、Run Start、Extraction、Tier Loot、UI 和 QA 拆 Story。
