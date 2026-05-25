# v0.9 局外经济与五档地图实装 Changelog

日期：2026-05-25

## 变更摘要

- 新增本地 Profile 局外层：金币、五项属性、属性重Roll、属性总值档升级、无限仓库、战备区、商店与地图档位。
- 新增 `MetagameSimulation` 包装端口：保留现有 `SimulationPort`，外层负责局外结算，内层 `GameSimulation` 仍负责单局迷宫与战斗。
- 新增五档地图配置：入场费、战备价值上限、敌人数值总值区间、稀有度权重、自然附魔概率、附魔宝石概率与撤离金币奖励。
- 当前默认局外进入不再发放旧式开局四选一，改为从仓库/商店战备带入；旧 `GameSimulation` 默认行为保持不变以兼容测试与教程。
- 敌人地图生成支持档位参数：未传入档位时保持旧的固定 15 点敌人；二档及以上使用档位区间随机分配，五档敌人起始附魔。
- 道具生成支持档位稀有度权重、自然附魔概率和 mythic 宝石概率覆盖。
- HUD 新增战备区面板：地图档位选择、角色属性、商店购买、仓库带入/卖出、战备撤下、开始入场、训练教程入口。
- 撤离结算：安全撤离把玩家身上所有剩余物品实例放回无限仓库，并根据战利与地图档位发放金币。
- 失败结算：失败或主动放弃会丢失携带进局内的物品和本局所得，不返还仓库。

## 主要文件

- `src/sim/metagame.ts`
- `src/sim/systems/mapTierSystem.ts`
- `src/sim/types.ts`
- `src/sim/GameSimulation.ts`
- `src/sim/map.ts`
- `src/sim/systems/itemBalanceSystem.ts`
- `src/sim/systems/enchantmentSystem.ts`
- `src/sim/systems/inventorySystem.ts`
- `src/main.ts`
- `src/styles.css`
- `tests/unit/metagame_system.test.mjs`

## 验证

- `npm run build` 通过。
- `npm test` 通过，132/132。
- 本地 Vite 服务已启动并验证 `http://127.0.0.1:5188/` 返回 200。

## 注意事项

- 本轮刻意不接真实账号、数据库、云存档；Profile 使用 `localStorage`，未来可通过同一存储适配器替换为后端。
- 战备区 UI 为第一版可玩实现，后续应继续做更清晰的局外成长目标、商店刷新说明、仓库筛选与移动端布局精修。
