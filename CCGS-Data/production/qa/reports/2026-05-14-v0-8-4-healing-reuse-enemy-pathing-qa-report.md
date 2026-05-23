# v0.8.4 治疗续航、主动道具复用与敌人寻路 QA Report

日期：2026-05-14  
版本：v0.8.4

## 结论

PASS。新增治疗道具、主动道具复用和敌人可达寻路均通过自动化回归；生产构建通过。

## 覆盖项

| 项目 | 结果 | 证据 |
|---|---|---|
| 新治疗道具进入内容池 | PASS | `all v0.8 pickup items have runtime template ports and effects`，73 件道具均有 usage/ports/effects/counterplay |
| 主动道具默认复用 | PASS | `reusable active healing item survives repeated field uses across turns` |
| 固定次数道具仍会消耗 | PASS | `charged healing item is removed only after its authored uses are spent` |
| 敌人可使用治疗道具 | PASS | `enemy AI can choose and use reusable healing items in combat` |
| 敌人绕墙移动 | PASS | `enemy movement uses reachable pathing around edge walls instead of getting stuck` |
| 场外提示不被推进回合清空 | PASS | 红指南盘、信号火、假声哨相关回归测试通过 |
| 旧核心流程回归 | PASS | 拾取、遭遇、远程、掉落、情报、敌人内战、地图、状态效果测试通过 |

## 自动化结果

- `npm test`：67 passed，0 failed。
- `npm run build`：通过，Vite build 成功生成 `dist/`。

## 残余风险

- 新治疗道具暂复用旧图标，信息可读性通过测试，但美术辨识度仍可在后续图标迭代中提升。
- 当前治疗强度按 v0.8.2 稀有度模型纳入测试；仍建议后续通过实机局内死亡率和平均剩余 HP 再做数值微调。
