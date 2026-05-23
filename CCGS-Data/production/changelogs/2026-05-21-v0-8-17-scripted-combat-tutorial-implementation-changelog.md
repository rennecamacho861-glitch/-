# v0.8.17 脚本化战斗教程实装 Changelog

## 概要

本轮将已确认的“脚本化战斗教程与新手开局顺序”规则落地到运行时代码。玩家选择“需要新手教程”后，会进入独立训练场景；完成或跳过后才恢复正式开局四选一。

## 代码变更

- `src/sim/types.ts`
  - 新增 `TutorialScenarioState`、`TutorialStepId`、`TutorialInput`。
  - `GameState` 新增 `tutorialScenario`。
  - `FeedbackEvent.kind` 新增 `tutorial`。

- `src/sim/ports.ts`
  - 新增模拟层命令端口：`beginTutorialScenario()`、`skipTutorialScenario()`。

- `src/sim/systems/tutorialSystem.ts`
  - 新增教程步骤配置、固定教程敌人 ID、教程输入映射。

- `src/sim/GameSimulation.ts`
  - 新增独立教程场景创建逻辑。
  - 教程场景内生成 2 名属性总值 10 的训练敌人。
  - 第一名敌人固定教学：防御读低体质、读攻击方向、按方向闪避、3 点优势投入速度、抢先手击杀。
  - 第二名敌人固定教学：防御读低智力、支付优势说服。
  - 教程敌人不进入正常掉落与敌人成长经济。
  - 教程完成或跳过后重置到正式局开局四选一，避免教程伤害、情报、道具污染正式运行。

- `src/main.ts`
  - 新手教程弹窗改为进入脚本化训练场景。
  - HUD 根据模拟层 `tutorialScenario` 显示步骤说明、目标动作和跳过按钮。
  - 战斗按钮读取模拟层允许输入，高亮当前教学动作。

- `src/styles.css`
  - 新增教程目标块与教程高亮按钮样式。

- `tests/integration/tutorial_scenario_test.mjs`
  - 覆盖教程开场、敌人属性预算、错误进攻提示、防御/闪避/优势下注/击杀/说服完整流程，以及跳过教程恢复正式开局。

## 验证

- `npm test`：122/122 通过。
- `npm run build`：通过。
- `http://127.0.0.1:5188/`：本地开发服务器返回 200。

## 备注

- 第一名训练敌保持属性总值 10，通过训练敌携带长刀体现“高伤高速惩罚”，并给玩家临时训练长刀以保证后续抢先手击杀教学稳定。
- 本轮未重新上传公开 GitHub Pages，若需要传播链接同步，需要另走部署流程。
