# QA Report - v0.8.12 Story 002 Attack Direction 与战斗情报

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`  
测试类型：Integration / Regression

## 结论

PASS。Story 002 的 6 条验收标准均已有自动化覆盖，完整测试与构建通过。

## 自动化证据

- 新增：`tests/integration/combat_attack_direction_intel_test.mjs`
- 回归：`npm test`，83/83 通过。
- 构建：`npm run build`，通过。

## 覆盖项

- 玩家视野领先照面会记录 `visibility`、给予 `vision` 优势窗口，并产生 `sight` 来源结构化情报。
- 成功躲闪会产生可追溯的 `dodge` 来源情报。
- `lens` 读取的下一击方向等于模拟层真实 `attackDirection`，该攻击被消耗后方向情报过期。
- 战斗单体情报限制为 `statExact`、`item`、`attackDirection`，旧式倾向/擅长标签不会进入战斗情报。
- 未见持枪敌人造成远程伤害时，会产生 `gunshot` 反馈、来源坐标提示和日志来源。

## 风险与后续观察

- 本 Story 不扩展远程/近战距离规则；非相邻照面进入后，后续战斗动作仍沿用现有战斗解析。若后续需要严格区分“远距照面”和“贴身照面”，建议在 Story 005 或独立 combat-range Story 中处理。
- 当前来源提示的文字可读性仍受历史编码/文本清理任务影响；结构化反馈字段已经可供 HUD 或日志层稳定展示。
