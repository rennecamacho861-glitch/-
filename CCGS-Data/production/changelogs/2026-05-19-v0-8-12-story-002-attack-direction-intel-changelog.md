# Changelog - v0.8.12 Story 002 Attack Direction 与战斗情报

日期：2026-05-19  
范围：`story-002-attack-direction-intel`

## 变更摘要

- 实装玩家视野领先照面入口：当玩家能看见非相邻敌人、敌人未看见玩家时，可创建照面并记录玩家视野优势。
- 视野领先不再只是开局状态：玩家获得 `vision` 优势窗口时，会触发一次来自 `sight` 来源的结构化情报读取。
- 保持战斗情报边界：战斗内单体情报仍限定为属性数值、具体道具、下一击方向三类。
- 新增 Story 002 集成测试，覆盖视野领先、闪避情报、攻击方向真实读取与过期、旧倾向标签禁入、未见远程伤害来源提示。

## 修改文件

- `src/sim/GameSimulation.ts`
- `tests/integration/combat_attack_direction_intel_test.mjs`
- `CCGS-Data/production/epics/v0-8-12-combat-revision/story-002-attack-direction-intel.md`

## 验证

- `npm test`：83/83 通过。
- `npm run build`：通过。

## 备注

- 本次未修改 Phaser 渲染、DOM HUD 或道具文案字段。
- 非相邻视野领先照面仅在玩家可见且敌人不可见时触发；未见持枪敌人的远程先手仍走原有 ambush 分支并产生枪声/来源提示。
