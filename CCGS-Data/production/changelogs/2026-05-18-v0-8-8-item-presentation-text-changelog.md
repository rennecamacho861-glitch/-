# v0.8.8 道具展示文案与规则字段分离 Changelog

日期：2026-05-18

## 变更摘要

- 新增 `src/sim/itemText.ts`，作为玩家可见道具介绍的统一出口。
- 拾取卡片、背包按钮 title、敌人道具情报悬浮、战斗生效条 title 与拾取日志改为读取 `itemUiDescription(itemId)`。
- 回声针、手枪、绷带的开局卡片文案改为简洁功能说明，不再显示“橙色稀有”、动画实现或规则字段描述。
- 规则书更新到 v0.8.8，并同步 `system-framework.md` / `module-ports.md` 的 HUD 文案端口约束。

## 验证

- `npm test`：通过，77/77。
- `npm run build`：通过。
