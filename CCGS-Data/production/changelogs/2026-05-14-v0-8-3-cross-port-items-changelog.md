# v0.8.3 交叉端口道具批次 Changelog

日期：2026-05-14

## Summary

本次按 CCGS 流程先完成 v0.8.2 旧道具池盘点，再新增 10 件交叉端口道具并实装。道具总数从 55 件扩展为 65 件，新增内容重点补足“状态触发转化、成功躲闪反击、受击反扎、场外高价值拾取点情报、陷阱情报”几个旧池缺口。

## Design

- 新增盘点文件：`CCGS-Data/design/balance/item-inventory-audit-v0-8-2-before-v0-8-3-2026-05-14.md`。
- 更新 `rulebook.md` 到 v0.8.3，新增“交叉端口新增道具”章节。
- 更新 `system-framework.md` 与 `module-ports.md`，明确新增道具的模块端口、事件桥接和测试要求。

## Implementation

- 新增道具：`soot-hook`、`venom-saw`、`blood-knot`、`frost-latch`、`lens-thread`、`stitch-kit`、`tripwire-spool`、`red-compass`、`smoke-needle`、`thorn-plate`。
- 扩展 `ItemId`、`ITEMS`、`PICKUP_ITEM_POOL`、图标映射、稀有度强度评分。
- `itemEffectSystem` 新增 `smoke-needle` 与 `thorn-plate` 的延迟触发 active effect。
- `GameSimulation` 新增状态转化被动桥接：灼烧转躲闪惩罚、中毒转下一击伤害、流血转速度、冻结转受伤减免。
- `GameSimulation` 新增成功躲闪触发 `lens-thread / smoke-needle`，受近战命中触发 `thorn-plate`，场外使用 `red-compass` 与 `tripwire-spool`。
- 敌人 AI 将 `stitch-kit / smoke-needle / thorn-plate` 纳入可用道具候选，并在持有状态转化被动时更倾向使用对应状态来源道具。

## Verification

- `npm test`：63/63 通过。
- `npm run build`：通过。

