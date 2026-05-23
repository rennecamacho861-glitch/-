# v0.8.3 交叉端口道具批次 QA Report

日期：2026-05-14

## Scope

验证新增 10 件交叉端口道具的模板完整性、稀有度强度匹配、运行时触发、敌人可用性和构建稳定性。

## Automated Results

| Command | Result |
|---|---|
| `npm test` | PASS，63/63 |
| `npm run build` | PASS |

## Coverage

- 内容审查：65 件 `ALL_ITEM_IDS` 与 `PICKUP_ITEM_POOL` 道具均有 `usage / ports / effects / counterplay`，且不只保留 `log` 占位效果。
- 平衡审查：65 件道具的 `itemPowerScore` 均落入对应 `common / uncommon / rare` 区间，且未超过 `6.0` 上限。
- 图标审查：65 件道具均能映射到已有格子地牢道具图标。
- 运行时审查：
  - `soot-hook / venom-saw` 能由真实灼烧/中毒触发不同维度 active effect。
  - `thorn-plate` 能把受到的近战命中转化为攻击者流血，且可联动 `blood-knot`。
  - `red-compass` 能读取真实 `LootNode.offerItemIds` 并标记含高稀有度道具的拾取点。
  - `tripwire-spool` 能触发伤害并暴露属性数值情报。
  - `smoke-needle / thorn-plate` 的主动准备效果能通过 `itemEffectSystem` 解析为延迟触发。

## Residual Risk

- `tripwire-spool` 本批按规则落地为场外即时伤害和属性情报；若后续需要场外持续 debuff，需要新增 Actor 级状态容器。
- `red-compass` 当前默认选择最近高稀有度拾取点，不提供玩家可手动选择目标的 UI；这与当前 `SimulationCommandPort.useItem(itemId)` 不新增参数的 v0.8 兼容约定一致。
