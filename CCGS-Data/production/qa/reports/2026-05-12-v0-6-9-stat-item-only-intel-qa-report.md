# QA Report: v0.6.9 情报只允许数值与道具

**Date**: 2026-05-12  
**Scope**: 情报规则、推测情报生成、HUD 可信率显示  
**Verdict**: PASS

## 覆盖内容

- 规则书、系统框架、模块端口同步到 v0.6.9。
- `IntelKind` 收紧为 `statExact | item`。
- 所有情报写入点只生成：
  - `属性 = 数值`
  - `拥有某道具`
  - `未见道具`
- 推测情报携带 `confidence`，按玩家智力给出真情报概率；未命中时生成同格式随机假情报。
- HUD 标签显示 `推测 X%`。
- 镜片、说服、陷阱、气味粉等原先可能写入方向/路线/态势的入口已改为数值或道具情报。

## 自动化验证

- `npm test`：28/28 passed。
- `npm run build`：passed。

新增测试：
- `suspected intel only uses stat or item formats with confidence`，覆盖推测情报格式、可信率字段和禁止态势文本。

## Residual Notes

- “攻击方向”“路线”“敌人接触”等仍可作为非情报的系统提示或内部 AI 字段存在，但不得写入 `GameState.intel` 或 HUD 情报卡。
