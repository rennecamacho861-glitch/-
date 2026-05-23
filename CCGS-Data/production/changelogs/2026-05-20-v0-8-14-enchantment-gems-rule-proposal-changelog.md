# v0.8.14 附魔宝石规则提案 Changelog

日期：2026-05-20  
模式：CCGS Phase 1 / 规则提案  
状态：等待用户确认后进入 `system-framework.md` 与 Story 拆分

## 修改文件

- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/enchantment-authoring-matrix-v0-8-14.md`
- `CCGS-Data/design/gdd/enchantment-exhaustive-table-v0-8-14.md`
- `CCGS-Data/production/proposals/2026-05-20-v0-8-14-enchantment-gems-proposal.md`
- `CCGS-Data/production/changelogs/2026-05-20-v0-8-14-enchantment-gems-rule-proposal-changelog.md`
- `CCGS-Data/production/session-state/active.md`

## 规则变更

- 新增 v0.8.14 附魔草案章节。
- 将道具稀有度扩展为 `common / uncommon / rare / mythic`，其中 `mythic` 用于红色附魔宝石。
- 规定所有非宝石道具实例有 10% 自然附魔概率。
- 规定 6 种附魔等概率：燃烧、剧毒、极寒、染血、致命、闪耀。
- 新增全道具附魔撰写矩阵：134 件当前可拾取道具全部映射到 `HIT / PRIME / COUNTER / SUPPORT / TRAP / AMMO` 承载模板。
- 新增全道具六附魔穷举表：134 件当前可拾取道具逐项列出六种附魔效果，共 804 个组合，并列明难适配道具的微调规则。
- 纯场外、治疗、情报、视野、移动和支付类道具不再是无效附魔，统一走 `SUPPORT` 预备模板。
- 新增 6 种一次性附魔宝石作为红色 `mythic` 道具，offer 槽位生成率 1%。
- 定义附魔统一生效端口：直接伤害、攻击附加效果、反击/条件伤害。
- 定义 `enchantPower`、极寒半量冻结、致命 +50% 暴击和闪耀复制规则。
- 明确诅咒首版只保留接口，不随机生成，不提供诅咒宝石。

## Scope Check

计划内：

- 只更新规则真源和 Proposal。
- 不修改 `src/sim`、`src/render`、`src/main.ts` 或测试。

计划外：

- 无。

## 已知风险

- 用户原文“5 种附魔”与列出的 6 个名称冲突，当前按 6 种写入草案。
- 诅咒缺少具体概率和效果，当前不能实装。
- 全道具承载模板仍需用户确认，尤其是 `SUPPORT` 预备是否会让高频局外道具过强；实装时需要用“不叠加、只刷新、限下一次有效攻击”控制。

## 下一步

等待用户确认规则草案。确认后：

1. 同步 `CCGS-Data/project-docs/architecture/system-framework.md`。
2. 创建 v0.8.14 Epic/Stories。
3. 进入实现与测试。
