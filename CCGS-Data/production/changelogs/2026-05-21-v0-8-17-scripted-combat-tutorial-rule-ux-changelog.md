# Changelog: v0.8.17 脚本化战斗教学规则与 UX 草案

**Date**: 2026-05-21  
**Mode**: Lean / Design + UX  
**Status**: Draft written, awaiting implementation confirmation

## Summary

根据玩家反馈，当前战斗教程只说明按钮和主题，无法让玩家理解防御、情报、优势、攻击方向、闪避、击杀与说服之间的实际决策链。本轮将新手教程规则细化为正式局前的脚本化训练场景：选择教程后先生成 2 名固定教学敌人，完成训练后再进入开局四选一。

## Files Changed

- `CCGS-Data/design/quick-specs/scripted-combat-tutorial-onboarding-2026-05-21.md`
- `CCGS-Data/design/gdd/rulebook.md`
- `CCGS-Data/design/gdd/combat-system.md`
- `CCGS-Data/project-docs/architecture/system-framework.md`
- `CCGS-Data/project-docs/architecture/module-ports.md`
- `CCGS-Data/design/ux/tutorial-onboarding.md`
- `CCGS-Data/design/ux/interaction-patterns.md`
- `CCGS-Data/production/session-state/active.md`

## Design Changes

- 新手教程从 HUD-only 场景说明扩展为 `tutorialScenario` 训练场景。
- 选择“不需要”后直接进入正式开局四选一。
- 选择“需要”后延后正式开局四选一，先完成或跳过训练。
- 训练场景生成 2 名属性总值 10 的固定教学敌人。
- 第一名敌人教学防御读情报、体质低的意义、速度/重伤风险、攻击方向、正确闪避、3 点优势投入速度、击杀。
- 第二名敌人教学低智力目标与优势支付说服。
- 教程偏好和已读弹窗仍由 HUD/localStorage 保存；脚本敌人、步骤、允许输入、检查点和开局切换归模拟层。

## Known Open Questions

- 属性总值 10 很难同时稳定演示高速度、高伤害和重伤风险。草案建议第一名敌人携带不掉落教学长刀或等价教学装备；另一方案是把教学敌人预算提高到 12。
- 错误攻击演示可以真实结算后通过教程检查点恢复，也可以直接阻止提交并解释风险。草案偏向真实演示后恢复，因为玩家更容易理解“为什么攻击不总是最优”。

## Scope Check

计划内变更：

- 规则书教程章节。
- 战斗 GDD 教学照面补充。
- 系统框架教程端口。
- UX 规格与交互模式。

计划外变更：

- 无。

## Validation

- 本轮仅文档与设计规格更新，未修改运行时代码。
- 未运行自动化测试。

## Next Step

用户确认规则草案后，进入 Story 拆分与实装：`tutorialSystem`、训练敌人生成、固定动作脚本、输入门控、检查点恢复、HUD 步骤弹窗、按钮高亮与测试覆盖。
