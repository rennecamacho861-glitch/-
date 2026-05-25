# v0.9.3 局外大厅页面分区 Changelog

日期：2026-05-25  
类型：UI / UX / Art Bible 补充  
状态：完成

## 改动摘要

- 将局外大厅从单页大面板拆成五个页面：账号、地图、战备、商店、仓库。
- 新增顶部页面导航，并保留金币、当前地图、入场费、战备值、仓库数量摘要。
- 新增账号页，展示本地档案、五维属性说明、教程入口、重 Roll/升级按钮，并预留账号与密码输入 hook。
- 地图页集中展示地图档位、入场费、战备上限、敌人数值区间和档位描述。
- 战备页集中展示带入清单、开始行动按钮，并提供跳转仓库/地图的辅助操作。
- 商店页和仓库页保留物品 hover/focus tooltip，继续展示道具效果、限制、经济信息与附魔效果。
- 同页购买、带入、出售、撤下操作继续保留滚动位置；切换页面时不继承旧页面滚动位置。
- 补充 `metagame-page-separation.md`、局外页面交互模式补充和局外 UI 美术补充文档。

## 修改文件

- `src/main.ts`
- `src/styles.css`
- `CCGS-Data/design/ux/metagame-page-separation.md`
- `CCGS-Data/design/ux/metagame-page-patterns-2026-05-25.md`
- `CCGS-Data/design/art/metagame-ui-art-addendum-2026-05-25.md`

## 未改动

- 未修改 `src/sim` 规则、经济、战斗、地图或掉落逻辑。
- 未接入真实账号、数据库或云存档；仅留下 DOM hook。

## 验证

- `npm run build` 通过。
- `npm test` 通过，132/132。
- `git diff --check` 通过，仅存在既有 CRLF 提示。
- `http://127.0.0.1:5188/` 返回 200。
