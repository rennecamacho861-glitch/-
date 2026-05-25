# v0.9 局外经济与五档地图 QA Report

日期：2026-05-25

## 结论

PASS WITH NOTES

局外 Profile、商店、仓库、战备、五档地图、撤离回仓与失败丢失已经接入运行时代码，并通过自动化测试与生产构建。真实账号和数据库未做，符合本轮排除范围。

## 覆盖范围

- 本地 Profile 初始化：金币、属性、商店、空仓库、空战备。
- 商店购买：金币扣除，商品实例进入仓库。
- 仓库带入：仓库实例移动到战备区，并受地图战备值上限限制。
- 入场：扣除入场费，战备实例进入本局玩家背包，战备区清空。
- 撤离：玩家身上剩余实例进入无限仓库，战利按地图档位转换金币。
- 失败/主动放弃：本局身上物品不回仓库，记录丢失数量。
- 地图档位：默认 `createMap(seed)` 兼容旧 15 点敌人；带档位参数时使用档位数值区间。
- 档位掉落/附魔参数：道具 offer 和自然附魔概率支持档位覆盖。

## 自动化验证

- `npm run build`：通过。
- `npm test`：通过，132/132。
- 新增测试：
  - `metagame buy equip start and extract returns carried inventory to unlimited stash`
  - `metagame failure loses deployed and run-acquired items instead of returning them to stash`
  - `tiered map generation uses tier enemy stat budgets without changing default map contract`

## 手动/运行验证

- 启动本地 Vite 服务。
- `http://127.0.0.1:5188/` 返回 200。

## 未覆盖与风险

- 尚未用真实浏览器截图验证桌面/移动战备区视觉遮挡；本轮仅完成可访问性与构建级验证。
- 商店、价格、入场费和金币产出仍是首版数值，需要后续用实际游玩反馈调参。
- 教程与局外战备的顺序仍需设计复核：当前保留训练入口，但正式局外流程以战备开始为主。
- `localStorage` 存档适合传播试玩，不适合跨设备或账号同步。
