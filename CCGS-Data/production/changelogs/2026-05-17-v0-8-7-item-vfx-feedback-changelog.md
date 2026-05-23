# Changelog: v0.8.7 道具稀有度与程序化反馈演出

日期：2026-05-17

## 变更内容

- 更新规则书到 v0.8.7：绷带与回声针改为橙色 rare，手枪、绷带、回声针的文字规则同步更新。
- 绷带改为仅战斗外使用，回复 3 点生命；成功回血会生成 `item-heal` 反馈事件和窗口级回血动画。
- 回声针不再输出方向/距离文字，改为生成 `echo-pulse` 反馈事件，并标出包含最近目标的 `2x2` 四格回响区。
- 手枪改为可在战斗外和战斗中使用；每次真实开火生成 `gunshot` 反馈事件，Phaser 播放枪口火光、弹道线和命中/擦过点。
- 扩展 `FeedbackEvent`：新增 `item-heal`、`echo-pulse`、`gunshot`，并增加 `origin`、`target`、`positions`、`itemId` 结构字段。
- 将 rare 稀有度 UI 边框调整为橙色；背包、拾取、敌人道具情报悬浮继续通过 `data-rarity` 统一读取。
- 新增 quick design spec 与程序化 VFX asset spec，并更新 asset manifest。

## 验证

- `npm test`：74/74 通过。
- `npm run build`：通过，Phaser 仍拆为 `phaser-vendor` chunk。

## 备注

- 本轮未调用 imagegen，因为三段反馈均为短促程序化 VFX，不需要新增贴图或图集。
