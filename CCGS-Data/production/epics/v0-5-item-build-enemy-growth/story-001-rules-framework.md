# Story 001: 规则书与架构同步

状态：Done  
类型：Design / Architecture  
关联：`CCGS-Data/design/gdd/rulebook.md`、`CCGS-Data/project-docs/architecture/system-framework.md`

## Acceptance Criteria

- [x] 规则书移除主动搜索与屏息/等待。
- [x] 规则书定义道具节点三选一、敌人拾取成长、掉落保留状态。
- [x] 规则书列出现有 7 件道具并新增 30 件小收益道具。
- [x] 系统框架同步 `LootNode`、`pendingPickupOffer`、扩展 `ItemDefinition` 和 `InventorySlot`。
- [x] `systems-index.md` 与 `tr-registry.yaml` 同步 v0.5 需求。

## Notes

本 Story 已在 v0.5 实装前完成，满足“玩法改动先写规则”的项目约束。
