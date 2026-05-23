# v0.6.1 大逃杀压力与战斗收束规则 Changelog

日期：2026-05-09  
类型：规则修改 / 架构端口同步  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.6.1 候选  
对应 Quick Spec：`CCGS-Data/design/quick-specs/battle-royale-pressure-and-combat-revisions-2026-05-09.md`

## 修改文件

- 新增：`CCGS-Data/design/quick-specs/battle-royale-pressure-and-combat-revisions-2026-05-09.md`
- 更新：`CCGS-Data/design/gdd/rulebook.md`
- 更新：`CCGS-Data/project-docs/architecture/system-framework.md`
- 更新：`CCGS-Data/project-docs/architecture/module-ports.md`
- 同步：`docs/rulebook.md`
- 同步：`docs/system-framework.md`
- 同步：`docs/module-ports.md`

## 变更摘要

- 取消独立战斗压力数值，不再作为规则状态、公式或 UI 字段。
- 战斗收束改为第 3 动作回合起执行软收束检查。
- 成功躲闪必定获得至少 1 点真实情报。
- 优势窗口选择继续战斗改为下一动作回合力量 +1、速度 +1。
- 说服成功改为停战 1 个玩家行动回合，并给予路线情报与其他敌人接触情报。
- 新增敌人内战：敌人相遇会自动结算战斗，产生战损、遗物和胜者拾取成长。
- 新增空投：每 15 行动回合生成红点提示的额外 LootNode。
- 移除固定生存回合上限，新增毒圈：每 20 行动回合收缩 1 层，毒圈内行动结算受到 5 伤害。
- 敌人 AI 规则新增避圈和空投争夺倾向。

## Scope Check

计划内：

- 根据用户 7 条修改意见更新规则书。
- 同步系统框架、端口文档和 docs 副本。
- 登记 Quick Spec 与 Changelog。

计划外：

- 未进入代码实装。
- 未修改 UI、模拟层或测试。

## 验证

- 文档静态核对：规则书、系统框架、端口文档和 docs 副本均包含 v0.6.1 毒圈、空投、敌人内战和战斗收束规则。
- 静态搜索确认：旧的 72 回合上限、说服中立 6 回合、压力惩罚公式和战斗压力系统不再作为有效规则存在。
- 未运行 `npm test` 或 `npm run build`，因为本次只修改规则与架构文档。
