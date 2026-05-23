# Active Session State

## Session Extract - /quick-design + /combat-tweak 2026-05-23 v0.8.21

- Verdict: COMPLETE
- Topic: 防御对基础近战进攻稳定获得优势
- Files changed: `CCGS-Data/design/quick-specs/stable-defense-vs-attack-advantage-2026-05-23.md`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/combat-system.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `src/sim/GameSimulation.ts`, `tests/unit/combat_system_effective_defense_test.mjs`, `CCGS-Data/production/changelogs/2026-05-23-v0-8-21-stable-defense-vs-attack-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-23-v0-8-21-stable-defense-vs-attack-qa-report.md`, `CCGS-Data/production/tracking/bug-tracker.md`
- Implemented: 基础近战 `Attack` 打进 `Defense` 时直接标记有效防御；防御者稳定获得优势；攻击方不再因为防御后伤害、显著伤害或重伤覆盖该优势；远程枪线仍不被普通防御稳定克制。
- Validation: `npm test` 129/129 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-23-v0-8-21-stable-defense-vs-attack-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-23-v0-8-21-stable-defense-vs-attack-qa-report.md`
- Notes: 敌人获得防御优势后仍会按现有 AI 立刻把优势压成下一次速度或后撤，因此 HUD 不一定长期显示敌方优势点；若玩家仍困惑，应补日志/提示。

## Session Extract - /quick-design + /hotfix 2026-05-23 v0.8.19

- Verdict: COMPLETE
- Topic: 战斗判定解释与附魔展示清晰化
- Files changed: `CCGS-Data/design/quick-specs/combat-clarity-enchantment-display-2026-05-23.md`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/combat-system.md`, `CCGS-Data/design/ux/interaction-patterns.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `src/sim/GameSimulation.ts`, `src/sim/itemText.ts`, `src/main.ts`, `src/styles.css`, `tests/integration/combat_clarity_feedback_test.mjs`, `tests/unit/combat_system_effective_defense_test.mjs`, `tests/unit/item_text.test.mjs`, `CCGS-Data/production/changelogs/2026-05-23-v0-8-19-combat-clarity-enchantment-display-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-23-v0-8-19-combat-clarity-enchantment-display-qa-report.md`, `CCGS-Data/production/tracking/bug-tracker.md`
- Implemented: 有效防御最低减伤从 2 点调为 1 点；玩家防御但未获得优势时会弹出原因解释；玩家选择正确闪避方向但概率判定失败时会弹出闪避率与判定值解释；附魔道具 tooltip 增加对应附魔颜色、承载模板和具体效果说明；HUD 道具按钮新增六类附魔边框与辉光。
- Validation: `npm test` 127/127 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-23-v0-8-19-combat-clarity-enchantment-display-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-23-v0-8-19-combat-clarity-enchantment-display-qa-report.md`
- Notes: 本轮未修改附魔实际伤害/状态端口，也未把拾取三选一扩展为预生成附魔实例；若需要在拾取 offer 上提前显示附魔，需要单独扩展 `LootNode` 的实例化结构。

## Session Extract - /quick-implementation 2026-05-21 v0.8.18

- Verdict: COMPLETE
- Topic: 教程推荐动作动态框选与脚本教程流程收束
- Files changed: `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/ux/tutorial-onboarding.md`, `CCGS-Data/design/ux/interaction-patterns.md`, `src/sim/GameSimulation.ts`, `src/main.ts`, `src/styles.css`, `CCGS-Data/production/changelogs/2026-05-21-v0-8-18-tutorial-highlight-flow-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-21-v0-8-18-tutorial-highlight-flow-qa-report.md`
- Implemented: 选择“需要教程”后直接进入脚本化战斗教学，不再穿插旧版通用文字教程；推荐动作按钮新增动态外框、光晕、脉冲和“选择此项”角标；战斗教学完成后先显示“下面在整个迷宫中找到出口，带着道具逃离吧。确认后进入开局选择。”，确认前隐藏开局四选一。
- Validation: `npm test` 122/122 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-21-v0-8-18-tutorial-highlight-flow-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-21-v0-8-18-tutorial-highlight-flow-qa-report.md`
- Notes: 未补桌面/移动截图证据，后续视觉验收建议补。

## Session Extract - /implementation 2026-05-21 v0.8.17

- Verdict: COMPLETE
- Topic: 脚本化战斗教程与新手开局顺序实装
- Files changed: `src/sim/types.ts`, `src/sim/ports.ts`, `src/sim/systems/tutorialSystem.ts`, `src/sim/GameSimulation.ts`, `src/main.ts`, `src/styles.css`, `tests/integration/tutorial_scenario_test.mjs`, `CCGS-Data/production/changelogs/2026-05-21-v0-8-17-scripted-combat-tutorial-implementation-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-21-v0-8-17-scripted-combat-tutorial-qa-report.md`
- Implemented: 选择“需要新手教程”后进入独立训练场景；生成 2 名属性总值 10 的固定训练敌；第一名教学防御读情报、方向闪避、3 点优势投入速度与击杀；第二名教学低智力敌人的说服出口；完成或跳过后恢复正式开局四选一，教程状态不污染正式局。
- Validation: `npm test` 122/122 通过；`npm run build` 通过；`http://127.0.0.1:5188/` 返回 200。
- Changelog: `CCGS-Data/production/changelogs/2026-05-21-v0-8-17-scripted-combat-tutorial-implementation-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-21-v0-8-17-scripted-combat-tutorial-qa-report.md`
- Notes: UI 浏览器截图证据尚未补；后续需要确认移动端教程弹窗与高亮按钮不遮挡核心地图。

## Session Extract - /quick-design + /ux-design 2026-05-21 v0.8.17

- Verdict: RULE + UX DRAFT WRITTEN / AWAITING IMPLEMENTATION CONFIRMATION
- Topic: 脚本化战斗教学与新手开局顺序
- Files changed: `CCGS-Data/design/quick-specs/scripted-combat-tutorial-onboarding-2026-05-21.md`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/combat-system.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `CCGS-Data/project-docs/architecture/module-ports.md`, `CCGS-Data/design/ux/tutorial-onboarding.md`, `CCGS-Data/design/ux/interaction-patterns.md`
- Key rules: 选择“需要新手教程”后进入独立训练场景，正式开局四选一延后；玩家 5 格内生成 2 名属性总值 10 的固定教学敌人；第一名教学防御、情报、速度/重伤风险、方向闪避、3 点优势投入速度和击杀；第二名教学低智力说服出口；教程可随时跳过并恢复玩家状态。
- Runtime: 未实装。确认前不得修改 `src/sim` / `src/main.ts`。
- Open questions: 第一名敌人总值 10 下难以同时稳定“高速度 + 高伤 + 重伤”，草案建议使用不掉落教学长刀/教学装备，或把教学敌人预算提高到 12；错误攻击演示是允许真实结算后恢复，还是直接阻止提交。
- Next recommended: 用户确认规则后，拆 Story 实装 `tutorialSystem`、HUD 教学步骤、高亮输入和自动化测试。

## Session Extract - /quick-design 2026-05-21 v0.8.16

- Verdict: COMPLETE
- Topic: 目标引导、五项属性教学、优势资源、场外远程与长刀·光子切
- Files changed: `CCGS-Data/design/quick-specs/advantage-resource-attribute-ranged-2026-05-21.md`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/combat-system.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `src/sim/types.ts`, `src/sim/stats.ts`, `src/sim/items.ts`, `src/sim/itemText.ts`, `src/sim/map.ts`, `src/sim/GameSimulation.ts`, `src/sim/systems/enchantmentSystem.ts`, `src/sim/systems/enemySystem.ts`, `src/sim/systems/enemyTacticalScoringSystem.ts`, `src/sim/systems/itemBalanceSystem.ts`, `src/sim/systems/itemEffectSystem.ts`, `src/sim/systems/lootSystem.ts`, `src/render/gridDungeonAssets.ts`, `src/main.ts`, `tests/integration/combat_attack_direction_intel_test.mjs`, `tests/integration/simulation.test.mjs`, `tests/unit/enchantment_system.test.mjs`, `tests/unit/item_balance_system.test.mjs`, `tests/unit/item_effect_system.test.mjs`, `tests/unit/item_text.test.mjs`, `CCGS-Data/production/changelogs/2026-05-21-v0-8-16-advantage-resource-attribute-ranged-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-21-v0-8-16-advantage-resource-attribute-ranged-qa-report.md`
- Implemented: 新局加入四选一开局装备；优势改为可积累点数，逃跑/说服/续战/优势道具支付 1 点优势；续战同类加成可叠加；新增 `长刀·光子切`；`手枪` 改为 `左轮·卑劣的正义`，6 发、3 伤害、普通防御不减免；左轮/飞刀/长刀投掷支持战斗外可见射线攻击；精神新增确认情报和掉落修正；HUD 增加优势点数、属性教程、左轮教程和二级按钮 tooltip。
- Validation: `npm test` 119/119 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-21-v0-8-16-advantage-resource-attribute-ranged-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-21-v0-8-16-advantage-resource-attribute-ranged-qa-report.md`
- Notes: `photon-cut` 当前复用长刀图标；本轮未重新部署公开链接。

## Session Extract - /quick-design 2026-05-20 v0.8.15

- Verdict: COMPLETE
- Topic: HUD 道具折叠、优势续战反馈与新手教程
- Files changed: `CCGS-Data/design/quick-specs/hud-advantage-tutorial-onboarding-2026-05-20.md`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/combat-system.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `src/main.ts`, `src/styles.css`, `src/sim/GameSimulation.ts`, `src/sim/types.ts`, `tests/unit/combat_advantage_flee_persuasion_test.mjs`, `.gitignore`, `CCGS-Data/production/changelogs/2026-05-20-v0-8-15-hud-advantage-tutorial-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-20-v0-8-15-hud-advantage-tutorial-qa-report.md`, `CCGS-Data/production/session-state/active.md`
- Implemented: 背包道具按钮默认只显示图标、名称和次数，说明/限制改为 hover/focus 展开；优势窗口继续战斗移除同场同类一次限制，并新增 `advantage-press` 确认反馈；HUD 新增可关闭的新手教程，覆盖目的、拾取、视野、道具、敌人、战斗和优势窗口。
- Validation: `npm test` 119/119 通过；`npm run build` 通过；本地 `http://127.0.0.1:5188/` 返回 200。
- Changelog: `CCGS-Data/production/changelogs/2026-05-20-v0-8-15-hud-advantage-tutorial-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-20-v0-8-15-hud-advantage-tutorial-qa-report.md`
- Notes: 本轮尚未重新导出/推送公开 GitHub Pages 仓库；若要让传播链接更新，需要按最小公开版本流程重新上传。

## Session Extract - /dev-story 2026-05-20 v0.8.14

- Verdict: COMPLETE
- Topic: 附魔实例、神话宝石与统一生效端口实装
- Files changed: `src/sim/types.ts`, `src/sim/items.ts`, `src/sim/systems/enchantmentSystem.ts`, `src/sim/systems/inventorySystem.ts`, `src/sim/systems/itemBalanceSystem.ts`, `src/sim/systems/itemLimitSystem.ts`, `src/sim/systems/lootSystem.ts`, `src/sim/map.ts`, `src/sim/GameSimulation.ts`, `src/render/gridDungeonAssets.ts`, `src/main.ts`, `src/styles.css`, `tests/unit/enchantment_system.test.mjs`, `tests/unit/item_balance_system.test.mjs`, `tests/unit/rarity_ui.test.mjs`, `tests/integration/simulation.test.mjs`, `CCGS-Data/project-docs/architecture/system-framework.md`, `CCGS-Data/production/changelogs/2026-05-20-v0-8-14-enchantment-runtime-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-20-v0-8-14-enchantment-runtime-qa-report.md`, `CCGS-Data/production/session-state/active.md`
- Implemented: 134 件普通拾取道具 10% 自然附魔；6 件 `mythic` 附魔宝石 1% offer 注入；`InventorySlot.affix` 保留于背包/掉落/克隆；近战、远程、投掷、陷阱、主动准备和旧弹夹换弹成功接入统一附魔生效；HUD 显示附魔实例名与 mythic 稀有度样式。
- Validation: `npm test` 119/119 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-20-v0-8-14-enchantment-runtime-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-20-v0-8-14-enchantment-runtime-qa-report.md`
- Notes: 宝石使用目标暂时自动选取背包中最高强度未附魔道具；独立宝石图标未生成，当前复用同主题现有图标。后续若要玩家选择写入目标，应新增 `chooseEnchantTarget` 模拟端口。

## Session Extract - /proposal 2026-05-20

- Verdict: RULE DRAFT WRITTEN / AWAITING CONFIRMATION
- Topic: v0.8.14 附魔宝石与实例修饰草案
- Files changed: `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/gdd/enchantment-authoring-matrix-v0-8-14.md`, `CCGS-Data/design/gdd/enchantment-exhaustive-table-v0-8-14.md`, `CCGS-Data/production/proposals/2026-05-20-v0-8-14-enchantment-gems-proposal.md`, `CCGS-Data/production/changelogs/2026-05-20-v0-8-14-enchantment-gems-rule-proposal-changelog.md`, `CCGS-Data/production/session-state/active.md`
- Key rules: 所有非宝石新实例 10% 自然附魔；6 种附魔等概率；红色 `mythic` 附魔宝石以 1% 槽位概率生成；134 件当前可拾取道具全部映射到 `HIT/PRIME/COUNTER/SUPPORT/TRAP/AMMO` 承载模板，并在 `enchantment-exhaustive-table-v0-8-14.md` 中穷举 804 个附魔组合；宝石战斗外消耗并给非宝石道具写入指定附魔。
- Open questions: 用户原文“5 种”但列出 6 种，草案按 6 种处理；诅咒首版只保留接口；`SUPPORT` 预备模板是否确认；附魔强度上限为 3。
- Runtime: 未实装。确认前不得修改 `src/sim`。
- Proposal: `CCGS-Data/production/proposals/2026-05-20-v0-8-14-enchantment-gems-proposal.md`
- Changelog: `CCGS-Data/production/changelogs/2026-05-20-v0-8-14-enchantment-gems-rule-proposal-changelog.md`
- Next recommended: 用户确认规则草案后，同步 `CCGS-Data/project-docs/architecture/system-framework.md`，创建 v0.8.14 Story 并进入实装。

## Session Extract - /dev-story 2026-05-20

- Verdict: COMPLETE
- Topic: v0.8.13 橙色局外道具与掉落经济实装
- Files changed: `src/sim/items.ts`, `src/sim/itemText.ts`, `src/sim/types.ts`, `src/sim/map.ts`, `src/sim/GameSimulation.ts`, `src/sim/systems/itemBalanceSystem.ts`, `src/sim/systems/lootSystem.ts`, `src/sim/systems/enemyTacticalScoringSystem.ts`, `tests/integration/simulation.test.mjs`, `tests/unit/item_runtime_system.test.mjs`, `tests/unit/item_text.test.mjs`, `CCGS-Data/project-docs/architecture/system-framework.md`, `CCGS-Data/design/quick-specs/rare-field-items-and-drop-economy-2026-05-19.md`, `CCGS-Data/production/changelogs/2026-05-20-v0-8-13-rare-field-items-implementation-changelog.md`, `CCGS-Data/production/qa/reports/2026-05-20-v0-8-13-rare-field-items-qa-report.md`, `CCGS-Data/production/session-state/active.md`
- Implemented: 回声针/绷带无限使用并花费 1 探索回合；旧弹夹无限使用、2 回合换弹、照面中断失败；rare 掉落独立 8% 且不保底；nonRare 保底保留；同一 rare 每局可见生成上限 2。
- Validation: `npm test` 115/115 通过；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-20-v0-8-13-rare-field-items-implementation-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-20-v0-8-13-rare-field-items-qa-report.md`
- Notes: 敌人不会在照面中即时用旧弹夹；敌人场外换弹 AI 尚未实现，后续若需要应单独拆 Story。

## Session Extract - /quick-design 2026-05-19

- Verdict: RULE DRAFT WRITTEN / AWAITING CONFIRMATION
- Topic: v0.8.13 橙色局外道具与掉落经济草案
- Files changed: `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/design/quick-specs/rare-field-items-and-drop-economy-2026-05-19.md`, `CCGS-Data/production/changelogs/2026-05-19-v0-8-13-rare-field-items-rule-proposal-changelog.md`, `CCGS-Data/production/session-state/active.md`
- Key rules: 回声针与绷带改为无限使用，成功使用花费 1 探索回合；旧弹夹改为无限换弹工具，一次换弹花费 2 探索回合，期间进入照面则失败；`rare` 敌人掉落改为独立 8%，不参与保底；同一 `rare ItemId` 每局可见出现上限为 2。
- Runtime: 未实装。当前浏览器中的游戏仍是上一版行为。
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-13-rare-field-items-rule-proposal-changelog.md`
- Next recommended: 用户确认规则草案后，同步 `CCGS-Data/project-docs/architecture/system-framework.md` 并拆 Story 实装。

## Session Extract - /story-done 2026-05-19

- Verdict: COMPLETE
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md` - Story 006: 道具玩家文案层与 HUD 展示边界
- Files changed: `src/sim/itemText.ts`, `src/main.ts`, `src/styles.css`, `tests/unit/item_text.test.mjs`, `CCGS-Data/design/gdd/rulebook.md`, `CCGS-Data/project-docs/architecture/system-framework.md`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`, `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`, `CCGS-Data/production/session-state/active.md`
- Test updated: `tests/unit/item_text.test.mjs`
- Visual evidence: `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12.md`, `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/desktop.png`, `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/mobile.png`
- Validation: `npm test` 112/112 通过；`npm run build` 通过
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-006-item-text-hud-boundary-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-19-v0-8-12-story-006-item-text-hud-boundary-qa-report.md`
- Notes: 道具展示已改为玩家文案层；HUD 不再直接显示 raw `counterplay`。背包与拾取卡直接展示短说明和限制，效果条显示目标、效果和剩余回合。
- Next recommended: `/gate-check CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md` 或进入下一轮玩法问题拆解。

## Session Extract - /story-done 2026-05-19

- Verdict: COMPLETE
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md` - Story 005: 敌人战术包评分与隐藏信息边界
- Files changed: `src/sim/systems/enemyTacticalScoringSystem.ts`, `src/sim/systems/enemySystem.ts`, `src/sim/systems/lootSystem.ts`, `tests/integration/enemy_tactical_scoring_test.mjs`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`, `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`, `CCGS-Data/production/session-state/active.md`
- Test written: `tests/integration/enemy_tactical_scoring_test.mjs`
- Validation: `npm test` 110/110 通过；`npm run build` 通过
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-005-enemy-tactical-scoring-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-19-v0-8-12-story-005-enemy-tactical-scoring-qa-report.md`
- Notes: 敌人战斗道具、拾取和移动目标现在由纯模拟层评分系统产出；AI 未知玩家属性时使用保守默认值与公开效果，不读取隐藏真值。玩家端仍未展示敌方倾向解释，交由 Story006 处理。
- Next recommended: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md` - Story 006: 道具玩家文案层与 HUD 展示边界

## Session Extract - /story-readiness 2026-05-19

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md` - Story 005: 敌人战术包评分与隐藏信息边界
- Verdict: READY
- Updates: 补充 Control Manifest 落地边界与性能预算；状态从 `Todo` 更新为 `Ready`。
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-005-readiness-changelog.md`
- Next: `/dev-story CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md`

## Session Extract - /story-done 2026-05-19

- Verdict: COMPLETE
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md` - Story 004: 道具使用限制与有效构筑预算
- Files changed: `src/sim/systems/itemLimitSystem.ts`, `src/sim/GameSimulation.ts`, `src/sim/items.ts`, `src/sim/types.ts`, `tests/integration/item_limits_build_budget_test.mjs`, `tests/integration/simulation.test.mjs`, `tests/unit/item_runtime_system.test.mjs`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md`, `CCGS-Data/production/epics/v0-8-12-combat-revision/EPIC.md`, `CCGS-Data/production/session-state/active.md`
- Test written: `tests/integration/item_limits_build_budget_test.mjs`
- Validation: `npm test` 105/105 通过；`npm run build` 通过
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-004-item-limits-build-budget-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-19-v0-8-12-story-004-item-limits-build-budget-qa-report.md`
- Notes: 主动槽/被动预算目前由模拟层按背包顺序自动结算；后续若要玩家手动配置构筑，需要 UI Story 接入同一端口。
- Next recommended: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-005-enemy-tactical-scoring.md` - Story 005: 敌人战术包评分与隐藏信息边界

## Session Extract - /story-readiness 2026-05-19

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md` - Story 004: 道具使用限制与有效构筑预算
- Verdict: READY
- Updates: 补充 Control Manifest 落地边界与性能预算；状态从 `Todo` 更新为 `Ready`。
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-004-readiness-changelog.md`
- Next: `/dev-story CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md`

## Session Extract - /story-done 2026-05-19

- Verdict: COMPLETE WITH NOTES
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md` - Story 003: 优势窗口、逃跑与说服公式
- Tech debt logged: None
- Validation: `npm test` 98/98 通过；`npm run build` 通过
- Notes: 支付道具选择 UI 未纳入本 Story；当前按抽象战利筹码支付执行公式上限。
- Next recommended: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-004-item-limits-build-budget.md` - Story 004: 道具使用限制与有效构筑预算

## Session Extract - /dev-story 2026-05-19

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md` - Story 003: 优势窗口、逃跑与说服公式
- Files changed: `src/sim/systems/advantageSystem.ts`, `src/sim/GameSimulation.ts`, `src/sim/types.ts`, `src/sim/ports.ts`, `src/main.ts`, `package.json`, `tests/unit/combat_advantage_flee_persuasion_test.mjs`, `tests/unit/item_runtime_system.test.mjs`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`
- Test written: `tests/unit/combat_advantage_flee_persuasion_test.mjs`
- Validation: `npm test` 98/98 通过；`npm run build` 通过
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-003-advantage-flee-persuasion-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-19-v0-8-12-story-003-advantage-flee-persuasion-qa-report.md`
- Notes: `npm test` 已修复为同时执行 `*_test.mjs` CCGS 证据文件。
- Blockers: None
- Next: `/code-review src/sim/GameSimulation.ts src/sim/systems/advantageSystem.ts src/sim/types.ts src/sim/ports.ts src/main.ts tests/unit/combat_advantage_flee_persuasion_test.mjs package.json` then `/story-done CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`

## Session Extract - /story-readiness 2026-05-19

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md` - Story 003: 优势窗口、逃跑与说服公式
- Verdict: READY
- Updates: 补充 Control Manifest 落地边界与性能预算；状态从 `Todo` 更新为 `Ready`。
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-003-readiness-changelog.md`
- Next: `/dev-story CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md`

## Session Extract - /story-done 2026-05-19

- Verdict: COMPLETE WITH NOTES
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md` - Story 002: Attack Direction 与战斗情报读取
- Tech debt logged: None
- Validation: `npm test` 83/83 通过；`npm run build` 通过
- Notes: 远距视野领先可以创建照面；照面后的近战距离限制仍沿用现有解析，后续建议单独收束。
- Next recommended: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-003-advantage-flee-persuasion.md` - Story 003: 优势窗口、逃跑与说服公式

## Session Extract - /dev-story 2026-05-19

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md` - Story 002: Attack Direction 与战斗情报读取
- Files changed: `src/sim/GameSimulation.ts`, `tests/integration/combat_attack_direction_intel_test.mjs`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`
- Test written: `tests/integration/combat_attack_direction_intel_test.mjs`
- Validation: `npm test` 83/83 通过；`npm run build` 通过
- Changelog: `CCGS-Data/production/changelogs/2026-05-19-v0-8-12-story-002-attack-direction-intel-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-19-v0-8-12-story-002-attack-direction-intel-qa-report.md`
- Blockers: None
- Next: `/code-review src/sim/GameSimulation.ts tests/integration/combat_attack_direction_intel_test.mjs` then `/story-done CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`

## Session Extract - v0.8.11 Low Health Screen Feedback 2026-05-18

- UI: `src/main.ts` 新增低血量 HUD 派生状态，玩家生命低于半血进入 `is-wounded`，低于 3 点进入 `is-critical`。
- Visual: `src/styles.css` 新增全屏血迹、临界心跳脉冲、呼吸浮动与生命 chip 警示样式；overlay 保持 `pointer-events: none`。
- Accessibility: `prefers-reduced-motion: reduce` 下关闭心跳/呼吸动画，保留静态血迹与临界提示。
- UX Docs: `CCGS-Data/design/ux/interaction-patterns.md` 新增 `Low Health Screen Feedback` 模式。
- Evidence: `CCGS-Data/production/qa/evidence/ui/low-health-feedback-v0-8-11/normal-hud.png`、`critical-hud-forced.png`、`mobile-critical-hud-forced.png`。
- Validation: `npm test` 83 tests passed；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-18-v0-8-11-low-health-screen-feedback-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-18-v0-8-11-low-health-screen-feedback-qa-report.md`

## Session Extract — /dev-story 2026-05-18

- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md` — Story 001: Combat Matrix 与有效防御
- Files changed: `src/sim/GameSimulation.ts`, `tests/unit/combat_system_effective_defense_test.mjs`, `tests/integration/simulation.test.mjs`, `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`
- Test written: `tests/unit/combat_system_effective_defense_test.mjs`
- Validation: `npm test` 83/83 通过；`npm run build` 通过
- Blockers: None
- Next: `/code-review src/sim/GameSimulation.ts tests/unit/combat_system_effective_defense_test.mjs tests/integration/simulation.test.mjs` then `/story-done CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md`

## Session Extract — /story-done 2026-05-19

- Verdict: COMPLETE WITH NOTES
- Story: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-001-combat-matrix-effective-defense.md` — Story 001: Combat Matrix 与有效防御
- Tech debt logged: None
- Validation: `npm test` 83/83 通过；`npm run build` 通过
- Next recommended: `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md` — Story 002: Attack Direction 与情报读牌

## Session Extract - v0.8.10 Passive Grid Item Icons 2026-05-18

- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-passive-grid-item-icons-v0-8-10-assets.md`，ASSET-116 到 ASSET-165 全部完成。
- Source Art: 通过 image gen 新增 `item-icons-passive-grid-a-iter01.png` 到 `item-icons-passive-grid-e-iter01.png` 五张 5x2 绿底图标表。
- Assets: 新增 50 个透明 PNG 到 `public/assets/grid-dungeon/items/`，覆盖 v0.8.10 网状被动装备。
- Runtime: `src/render/gridDungeonAssets.ts` 已新增 50 个资产端口，并将 v0.8.10 50 件装备从复用旧图标改为独立图标。
- Manifest: `public/assets/grid-dungeon/manifest.json` 新增 50 个 item asset；`asset-manifest.md` 更新为 165 个 CCGS 资产。
- Evidence: 新增 `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-passive-grid-v0-8-10-contact-sheet.png`。
- Validation: `validate-grid-assets.ps1` 通过，Validated 162 grid-dungeon assets；`npm test` 83 tests passed；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-18-v0-8-10-passive-grid-item-icons-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-18-v0-8-10-passive-grid-item-icons-qa-report.md`

## Session Extract - v0.8.8 Newly Added Item Icons 2026-05-18

- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-newly-added-item-icons-v0-8-8-assets.md`，ASSET-093 到 ASSET-115 全部完成。
- Source Art: 通过 image gen 新增 `item-icons-status-kit-iter01.png` 与 `item-icons-tempo-passives-iter01.png` 两张绿底图标表。
- Assets: 新增 23 个透明 PNG 到 `public/assets/grid-dungeon/items/`，覆盖此前复用旧图标的新增道具。
- Runtime: `src/render/gridDungeonAssets.ts` 已新增 23 个资产端口，并将 `ITEM_ICON_ASSETS` 的复用映射降为 0。
- Manifest: `public/assets/grid-dungeon/manifest.json` 当前 112 个运行时资产；`asset-manifest.md` 更新为 115 个 CCGS 资产。
- Evidence: 新增 `CCGS-Data/production/qa/evidence/art/grid-dungeon/item-icons-newly-added-v0-8-5-contact-sheet.png`。
- Validation: `validate-grid-assets.ps1` 通过；`npm test` 82 tests passed；`npm run build` 通过。
- Changelog: `CCGS-Data/production/changelogs/2026-05-18-v0-8-8-newly-added-item-icons-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-18-v0-8-8-newly-added-item-icons-qa-report.md`

## Session Extract — v0.8.4 Healing Item Icons 2026-05-14

- Asset Spec: 新增 `CCGS-Data/design/assets/specs/grid-dungeon-healing-item-icons-v0-8-4-assets.md`，ASSET-082 至 ASSET-089 全部完成。
- Source Art: 通过 image gen 新增 `CCGS-Data/design/art/source/grid-dungeon/item-icons-healing-iter01.png`，4x2 绿底图标表。
- Assets: 新增 `item-salve-tin.png`、`item-field-ration.png`、`item-charcoal-tablet.png`、`item-pressure-bandage.png`、`item-heat-pad.png`、`item-blood-sponge.png`、`item-mercy-thread.png`、`item-emergency-syringe.png` 到 `public/assets/grid-dungeon/items/`。
- Runtime: `src/render/gridDungeonAssets.ts` 已将 8 个 v0.8.4 `ItemId` 从复用旧图标改为独立图标。
- Manifest: `public/assets/grid-dungeon/manifest.json` 已记录 8 个新资产 source rect；`asset-manifest.md` 更新为 89 个资产。
- Evidence: 新增 `item-icons-healing-v0-8-4-contact-sheet.png` 作为 72px 运行时图标对照图。
- Tests: `validate-grid-assets.ps1` 通过，Validated 89 grid-dungeon assets；`npm test` 通过，67 tests passed。
- Build: `npm run build` 通过，保留既有 Phaser vendor chunk size warning。
- Changelog: `CCGS-Data/production/changelogs/2026-05-14-v0-8-4-healing-item-icons-changelog.md`
- QA: `CCGS-Data/production/qa/reports/2026-05-14-v0-8-4-healing-item-icons-qa-report.md`

更新时间：2026-05-14  
项目：《照面之时》  
当前阶段：v0.8.3 交叉端口道具批次完成  

## 当前真源

- 规则书：`CCGS-Data/design/gdd/rulebook.md`
- 系统落地框架：`CCGS-Data/project-docs/architecture/system-framework.md`
- 模块端口：`CCGS-Data/project-docs/architecture/module-ports.md`
- 项目概念：`CCGS-Data/design/gdd/game-concept.md`
- 系统索引：`CCGS-Data/design/gdd/systems-index.md`

## 当前实现摘要

- 技术路线：Phaser 3 + TypeScript + Vite，固定本地端口 `5188`。
- 代码边界：`src/sim` 拥有规则与状态；`src/render` 只表现；`src/main.ts` 只做 HUD 与输入桥接。
- 地图：17x13 俯视角格子，墙体位于格子边缘；seed 随机编织迷宫，无死路，30 个初始道具节点，10 名敌人。
- 视野：玩家明亮视野使用压缩半径；敌人保留基础视野；边缘墙阻断移动和视线。
- 情报：所有单体情报只允许两类：属性具体数值、拥有/未见具体道具；推测情报必须带可信率。
- 战斗：进攻、防御、左右躲闪为基础动作；优势窗口可逃跑、继续战斗或说服；战斗不固定 3 回合，但目标是约 3 回合出现出口。
- 敌人生态：敌人随机姓名、属性预算、拾取道具、敌人内战、掉落、战斗次数和状态机 AI 已接入。
- 道具：当前 65 件，支持 `common / uncommon / rare` 三档、稀有度加权 3 选 1、稀有度边框、强度评分、敌人使用和掉落保留实例状态。

## 最近完成

### v0.8.3 交叉端口道具批次

- 新增盘点：`CCGS-Data/design/balance/item-inventory-audit-v0-8-2-before-v0-8-3-2026-05-14.md`
- 新增一览：`CCGS-Data/design/balance/item-overview-v0-8-3-2026-05-14.md`
- 新增道具：`soot-hook`、`venom-saw`、`blood-knot`、`frost-latch`、`lens-thread`、`stitch-kit`、`tripwire-spool`、`red-compass`、`smoke-needle`、`thorn-plate`
- 核心交叉链：
  - 灼烧 -> 煤钩 -> 目标躲闪下降
  - 中毒 -> 毒锯片 -> 下一次近战伤害
  - 流血 -> 血结绳 -> 下一回合速度
  - 冻结 -> 霜扣 -> 下一次受伤减免
  - 成功躲闪 -> 镜线/烟针 -> 道具情报/中毒反击
  - 受近战命中 -> 刺片 -> 攻击者流血
  - 场外拾取路线 -> 红针罗盘 -> 高稀有度拾取点提示
- 验证：`npm test` 63/63 通过；`npm run build` 通过。
- Changelog：`CCGS-Data/production/changelogs/2026-05-14-v0-8-3-cross-port-items-changelog.md`
- QA：`CCGS-Data/production/qa/reports/2026-05-14-v0-8-3-cross-port-items-qa-report.md`

## 上下文阅读策略

默认不要整批读取：

- `docs/`：仅保留短链接，真源在 `CCGS-Data/`
- `CCGS-Data/production/changelogs/`：按版本或关键词读取
- `CCGS-Data/production/qa/reports/`：按版本或关键词读取
- `CCGS-Data/production/archive/quick-specs/`：历史 Quick Spec，已被规则书/系统框架吸收
- `CCGS-Data/production/epics/` 与 `production/proposals/`：早期生产记录，追溯时再读

## 下一步建议

1. 若继续玩法：优先做道具组合的 UI 可读性、敌人道具使用反馈、状态链提示。
2. 若继续维护：把历史 changelog/QA 做索引压缩，避免新对话误读旧版本细节。
3. 若继续内容：新增道具前先更新 `rulebook.md` 和 `item-overview`，再改 `src/sim/items.ts` 与运行时。
