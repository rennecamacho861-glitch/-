# Changelog - v0.8.16 优势资源、属性教学与场外远程

日期：2026-05-21

## 变更摘要

- 将照面优势从一次性“优势窗口”改为可积累、可支付的资源。
- 逃跑、说服、续战和首批优势联动主动道具改为支付 1 点优势使用。
- 新增开局 rare 装备 `长刀·光子切`，支持 1 点优势小伤害与 3 点以上优势爆发。
- `手枪` 更名为 `左轮·卑劣的正义`，弹药上限提升到 6，命中造成 3 点伤害，普通防御不再减免。
- 左轮、飞刀和可投掷长刀支持战斗外攻击可见且射线合法的敌人。
- 精神获得额外收益：高精神会在看见敌人时给确认情报，并提高敌人掉落判定概率。
- 新手教程新增五项属性教学与左轮场外射击教学；逃跑/续战/说服按钮新增成功率/收益来源悬浮说明。

## 设计文档

- 更新 `CCGS-Data/design/gdd/rulebook.md`：同步 v0.8.16 规则真源、道具文本、验收口径。
- 更新 `CCGS-Data/design/gdd/combat-system.md`：优势资源、远程防御关系和验收更新。
- 更新 `CCGS-Data/project-docs/architecture/system-framework.md`：模拟端口、UI 端口和 AI 评分说明更新。
- 新增 `CCGS-Data/design/quick-specs/advantage-resource-attribute-ranged-2026-05-21.md`。

## 代码变更

- `src/sim/GameSimulation.ts`
  - 新增优势资源 helper，兼容旧测试/旧状态对象。
  - `tryFlee()`、`tryPersuade()`、`continueFight()` 改为支付优势。
  - 新增 `usePhotonCut()`。
  - 场外左轮/飞刀/长刀投掷接入可见射线攻击。
  - 左轮远程伤害不再被普通防御减免。
- `src/sim/items.ts`、`src/sim/itemText.ts`
  - 增加 `photon-cut`。
  - 更新左轮、旧弹夹、优势支付道具玩家文案。
- `src/sim/stats.ts`、`src/sim/systems/lootSystem.ts`
  - 增加 `lootDropBonus` 并接入掉落判定。
- `src/sim/systems/enemySystem.ts`、`enemyTacticalScoringSystem.ts`
  - 敌人优势判断改读优势点数。
- `src/main.ts`
  - HUD 显示优势点数。
  - 新增属性/左轮教程与二级战斗按钮 tooltip。
- `src/render/gridDungeonAssets.ts`
  - `photon-cut` 暂复用长刀图标。

## 测试

- `npm test`：119/119 通过。
- `npm run build`：通过。

## 备注

- 本轮未重新启动本地 dev server，也未推送 GitHub Pages。若要让传播链接更新，需要后续执行部署流程。
