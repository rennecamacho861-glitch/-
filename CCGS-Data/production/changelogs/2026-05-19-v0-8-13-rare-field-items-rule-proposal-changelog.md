# Changelog - v0.8.13 橙色局外道具与掉落经济规则草案

日期：2026-05-19  
类型：规则提案 / Quick Design  
状态：Awaiting Confirmation

## 变更摘要

- 将 `回声针` 与 `绷带` 规则草案改为无限使用的橙色局外主动道具。
- 将 `旧弹夹` 规则草案改为无限使用的换弹工具，但一次换弹需要 2 个探索回合。
- 新增“确认式反馈”要求：橙色局外主动道具使用时必须让玩家明确意识到已花费探索回合。
- 新增旧弹夹中断风险：换弹期间若进入照面/战斗，则换弹失败且不补弹。
- 大幅下调橙色敌人掉落：`rare` 不参与掉落保底，每件候选独立 8% 掉落。
- 新增同一橙色物品每局出现上限：同一 `rare ItemId` 从开局、地图/空投、敌人出生携带到掉落的可见出现次数最多为 2。

## 文档变更

- 更新 `CCGS-Data/design/gdd/rulebook.md`
  - 版本标记更新为 `v0.8.13 橙色局外道具与掉落经济草案`。
  - 补充橙色局外主动道具的强度原则：可无限使用，但必须有回合成本、中断风险或强触发条件。
  - 更新手枪、绷带、回声针、旧弹夹、敌人掉落、拾取生成、调参旋钮和验收标准。
- 新增 `CCGS-Data/design/quick-specs/rare-field-items-and-drop-economy-2026-05-19.md`
  - 记录本次改动的设计动机、数值调整、实现影响范围、验收标准和开放问题。

## 实装状态

- 本轮未修改 `src/` 运行时代码。
- 当前浏览器中的游戏仍是上一版行为：回声针、绷带、旧弹夹的次数和掉落逻辑尚未变更。
- 规则确认后，下一步应先同步 `CCGS-Data/project-docs/architecture/system-framework.md`，再拆 Story 进入实装。

## 验证

- 文档检索确认：`rulebook.md` 与 quick spec 均已包含 v0.8.13 关键规则。
- 未运行 `npm test` 或 `npm run build`：本次仅改设计文档，没有运行时代码变更。

## 后续建议

- 确认 v0.8.13 草案后，建立实现 Story：
  - `ItemDefinition / InventorySlot`：支持无限主动道具与延迟换弹。
  - `GameSimulation`：支持花费探索回合、换弹 pending 状态和照面打断。
  - `lootSystem`：支持 rare 低掉落率、非保底和同物品每局出现上限。
  - `main.ts / HUD`：支持使用确认弹窗、换弹中提示和失败反馈。
- 单独审查其他橙色道具强度，尤其是 `signal-flare`、`frost-nail`、`emergency-syringe`、`bunker-prayer`、`crush-salt`、`overrun-chain`、`last-ice`、`last-match` 等 passive/trigger rare 道具。
