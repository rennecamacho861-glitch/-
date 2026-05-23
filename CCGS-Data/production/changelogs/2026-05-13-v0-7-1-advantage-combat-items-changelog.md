# Changelog：v0.7.1 优势联动战斗道具

日期：2026-05-13  
范围：规则书、系统框架、道具数据、战斗结算、敌人 AI、自动化测试

## 变更

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/advantage-combat-items-2026-05-13.md`。
- 规则书升级到 v0.7.1，新增 6 件优势联动战斗道具：肋钩、绊踝线、追步刺、反压铁片、压胆钉、定神线。
- 同步更新 `system-framework.md` 和 `module-ports.md`，明确玩家与敌人的优势道具入口。
- 扩展 `ItemId`、`ITEMS`、`PICKUP_ITEM_POOL`，新道具可被三选一拾取、持有、掉落和显示。
- 玩家可在优势窗口使用新增道具，效果写入 `EncounterState.activeEffects`。
- 敌人 AI 在敌方优势窗口或已有 `enemyBonus` 时会使用新增优势道具。
- 新增道具暂复用现有图标资产，保证物品栏与道具情报悬浮不会断图。

## 验证

- `npm test`：35/35 通过。

## 备注

本次没有新增情报文本类型。新增道具若被情报系统揭示，仍只显示“拥有某道具”。
