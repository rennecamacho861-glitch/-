# v0.6 战斗真实情报与软三回合收束 Changelog

日期：2026-05-09  
类型：规则修改 / 架构端口同步  
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.6 候选  
对应 Quick Spec：`CCGS-Data/design/quick-specs/combat-truthful-intel-soft-three-rounds-2026-05-09.md`

## 修改文件

- 新增：`CCGS-Data/design/quick-specs/combat-truthful-intel-soft-three-rounds-2026-05-09.md`
- 更新：`CCGS-Data/design/gdd/rulebook.md`
- 更新：`CCGS-Data/project-docs/architecture/system-framework.md`
- 更新：`CCGS-Data/project-docs/architecture/module-ports.md`
- 同步：`docs/rulebook.md`
- 同步：`docs/system-framework.md`
- 同步：`docs/module-ports.md`

## 变更摘要

- 将战斗信息从“文本倾向/台词”改为结构化真实情报。
- 新增 `statExact`、`statProfile`、`itemExact`、`loadoutSummary`、`nextIntent`、`attackDirection` 情报类型。
- 明确 `confirmed` 情报必须读取实时 `ActorState`、`InventorySlot` 或已锁定 AI 意图；`suspected` 情报必须有置信度或过期轮次。
- 设计情报预算：智力、来源、优势和道具共同决定一轮能获得几条可行动信息。
- 移除固定 3 回合/4 回合上限表达，改为 `EncounterPressure` 软收束：大多数战斗约 3 回合出现击败、优势窗口、逃跑、说服或脱战。
- 补充任务 4 的内部端口：`intelSystem`、`combatRoundSystem`、`encounterPressureSystem`、`enemyCombatIntentSystem`。

## 设计结论

- 一次有效防御应该至少给普通智力玩家 2 点可行动情报，例如“速度具体值 + 道具概况”或“力量具体值 + 下一动作倾向”。
- 成功躲闪应更偏向短期反制情报，例如攻击方向、速度值、下一意图或具体道具。
- 视野领先不只是先手伤害，也会提高情报预算，使“先看见”成为战斗优势的一部分。
- `nextIntent.locked=true` 必须约束 AI 后续动作，除非弹药、目标、重伤、道具或距离等条件失效。

## Scope Check

计划内：

- 先写规则，再同步系统框架和端口。
- 明确信息真实性、短回合可读性和非固定战斗回合。

计划外：

- 未进入代码实装。
- 未修改 HUD、战斗结算或 AI 行为代码。

## 验证

- 文档静态核对：规则书、系统框架和 docs 副本均包含真实情报与遭遇压力规则。
- 未运行 `npm test` 或 `npm run build`，因为本次未修改运行时代码。
