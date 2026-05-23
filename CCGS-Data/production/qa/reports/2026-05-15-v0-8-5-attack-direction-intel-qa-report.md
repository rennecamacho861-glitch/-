# v0.8.5 攻击方向情报与闪避读向 QA Report

日期：2026-05-15  
版本：v0.8.5

## 结论

PASS。攻击方向情报已经作为真实 `left/right` 字段接入模拟层，镜片、战斗情报、HUD 显示与闪避方向概率均通过自动化回归；生产构建通过。

## 覆盖项

| 项目 | 结果 | 证据 |
|---|---|---|
| 方向情报结构化 | PASS | `combat intel can reveal the real next attack direction as structured left or right` |
| 方向与真实攻击一致 | PASS | 测试对比 `IntelEntry.attackDirection` 与 `randomSystem.attackDirection(enemy.id, turn, nextRound)` |
| 镜片道具生效 | PASS | `lens reveals next attack direction and is consumed as an authored one-use item` |
| 正确读向收益显著 | PASS | `matching the revealed attack direction gives a much stronger dodge than the wrong side` |
| 推测情报白名单 | PASS | `suspected intel only uses stat or item formats with confidence` |
| 旧核心流程回归 | PASS | 拾取、遭遇、远程、掉落、敌人移动、道具运行时、地图、状态效果测试均通过 |

## 自动化结果

- `npm test`：70 passed，0 failed。
- `npm run build`：通过，Vite 成功生成 `dist/`。

## 残余风险

- 当前 HUD 只显示方向情报，不额外做箭头图标或方向高亮；后续若要强化可读性，应保持只读 `IntelEntry.attackDirection`，不得在 UI 层自行推断规则。
- 方向情报目前主要由防御、成功躲闪和镜片提供；后续新增道具可以复用该端口，但必须继续遵守“不生成意图/路线文本”的规则。
