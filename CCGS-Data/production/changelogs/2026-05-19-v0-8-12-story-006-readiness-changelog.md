# Changelog - v0.8.12 Story 006 Readiness

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`  
流程：/story-readiness -> /dev-story

## Summary

Story006 已完成 readiness 核对并进入实现。该 Story 的范围被收束为 UI 文案层与 HUD 展示边界，不改道具数值、不新增美术、不把规则结算写入 HUD。

## Updates

- 补充 Presentation 层 Control Manifest 约束：HUD 只展示模拟层快照，不根据道具名称自行结算规则。
- 补充 Engine / UI Notes：本 Story 不改 Phaser Scene，UI 证据以源码检查、构建和文档记录为基础。
- 补充文案端口说明：拾取、背包、日志、敌情 tooltip 和效果条必须走 `src/sim/itemText.ts` 的玩家文案函数。
- Story 状态更新为 `In Progress`，进入 `/dev-story` 实装。

## Verdict

READY -> In Progress

