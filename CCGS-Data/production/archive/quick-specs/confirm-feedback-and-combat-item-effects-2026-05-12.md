# Quick Design Spec: 确认式战斗反馈与战斗道具实效

**Type**: Polish / Implementation Tweak  
**System**: Combat Feedback / Item Effects / Intel UI  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-12

## Change Summary

将遇敌和战斗回合结果从短暂自动淡出的提示，改为玩家点击确认后才关闭的战斗反馈弹窗。同步把当前已在道具池中的一批战斗内道具落地为真实模拟效果，并在 HUD 中显示正在生效的道具修正。敌人道具情报需要保留结构化 `itemId`，鼠标悬浮时显示道具效果、限制与反制空间。

## Motivation

照面战斗的结果信息密度较高，自动淡出会让玩家来不及阅读，也削弱“读牌复盘”的手感。道具如果只显示在背包但不进入结算，会让三选一构筑失去意义；本次优先落地短收益、可反制、易测试的战斗道具效果。

## New Rules / Values

- `FeedbackEvent.kind = "encounter" | "combat-round"` 的 HUD 表现必须是确认式弹窗；玩家点击“确认”前保持可读。
- 确认弹窗是 HUD 本地状态，不回写或删除 `GameState.feedbackEvents`。
- 弹窗存在时，HUD 应暂缓战斗/移动输入，避免玩家误操作越过战斗信息。
- `EncounterState.activeEffects` 保存战斗中来自道具的临时效果，至少包含来源道具、作用者、目标、剩余回合、数值和触发方式。
- 玩家和敌人每个战斗回合最多主动使用 1 件道具；临时效果在战斗日志和 HUD 生效条中可见。
- 敌人道具情报必须携带 `itemId`；HUD 悬浮显示 `description` 与 `counterplay`。
- 本轮首批落地道具效果：配重握柄、刀油、石灰粉、飞刀、袖中石、冰锥、钩绳、腐蚀小瓶、厚布衣、护臂、烟雾球、止痛片、凝血粉、木盾片、软底鞋、稳心符、肾上针、夹板、镜片、计数珠、记事本、气味粉、标记硬币，以及既有手枪、绷带、长刀、旧弹夹。

## Acceptance Criteria

- [ ] 遇敌和每回合结果弹窗不会自动消失，必须点击确认关闭。
- [ ] 弹窗存在时键盘移动和战斗按钮不会继续推进状态。
- [ ] 至少 10 件战斗道具能改变模拟结算，而不是只写日志。
- [ ] 生效中的道具修正显示在战斗面板中，并随回合减少或消失。
- [ ] 道具情报 hover 能看到道具说明和反制空间。
- [ ] 自动化测试覆盖战斗道具效果、道具情报元数据和反馈事件。

## GDD Update Required?

Yes. 更新 `rulebook.md`、`system-framework.md`、`module-ports.md` 后再实装。
