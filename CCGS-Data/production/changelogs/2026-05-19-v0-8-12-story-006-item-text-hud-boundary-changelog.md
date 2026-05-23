# Changelog - v0.8.12 Story 006 道具玩家文案层与 HUD 展示边界

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`  
类型：UI / Presentation  
状态：Complete

## Summary

本次把道具展示从 raw `description/counterplay` 推进为玩家文案层。拾取卡、背包、敌方道具情报 tooltip、日志和当前效果条现在都通过 `src/sim/itemText.ts` 取得玩家可读文案，HUD 不再直接显示设计审查语气或实现字段。

## Changed Files

- `src/sim/itemText.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/unit/item_text.test.mjs`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`
- `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12.md`
- `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/desktop.png`
- `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/mobile.png`
- `CCGS-Data/production/session-state/active.md`

## UI Changes

- 新增 `itemUiText()` 文案 bundle，包含 `uiShort`、`uiLimit`、`uiEnemyCounter`。
- 高风险道具手写覆盖：回声针、药膏铁盒、烟雾球、木盾片、标记硬币、越线链，并同步开局道具手枪、绷带、长刀等常见展示。
- 背包按钮新增可见短说明与限制说明，不再只依赖原生 `title`。
- 拾取三选一卡片新增限制/次数/使用条件行。
- 敌方道具 tooltip 的 raw `counterplay` 改为玩家可执行的“应对”文本。
- 当前效果条改为显示目标、具体效果和剩余回合；状态效果也进入同一展示。

## Scope Notes

- 未修改道具数值、效果结算或敌人 AI。
- 未新增图片资产。
- 未修改 Phaser Scene；本次只涉及 DOM HUD 与模拟层文本 view-model。

## Verification

- `npm test`：112/112 passed。
- `npm run build`：通过。
- UI evidence：桌面与移动 headless 截图已生成并登记。

