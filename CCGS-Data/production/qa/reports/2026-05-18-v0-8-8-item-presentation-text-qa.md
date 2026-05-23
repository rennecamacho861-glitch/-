# v0.8.8 道具展示文案 QA 记录

日期：2026-05-18

## 范围

- 验证玩家可见道具介绍与运行时规则字段分离。
- 验证开局三选一卡片不再出现“橙色稀有”、端口、事件或动画实现说明。
- 验证 HUD 与拾取日志走统一展示文案端口。

## 自动化结果

- `tests/unit/item_text.test.mjs`
  - 开局三件道具使用玩家可读文案。
  - 所有道具都有非空 UI 文案，且不包含实现噪音词。
  - HUD 与 `GameSimulation.choosePickup()` 均调用 `itemUiDescription()`。
- 全量 `npm test`：通过，77/77。
- `npm run build`：通过。

## 剩余风险

- 本轮未重写全部 73 件道具的源 `description` 字段；它们仍可作为规则摘要使用。玩家可见面统一由 `itemUiDescription()` 清洗或覆盖。
- 后续新增道具时，应同步补 `itemUiDescription()` 覆盖项，尤其是源规则描述包含稀有度、动画、端口或触发事件时。
