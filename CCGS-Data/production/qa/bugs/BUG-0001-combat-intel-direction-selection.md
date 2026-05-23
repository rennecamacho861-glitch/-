---
id: "BUG-0001"
title: "战斗情报总是优先攻击方向且方向可能失真"
severity: "S2-Major"
priority: "P1-Immediate"
status: "Verified Fixed"
reporter: "user"
---

# Bug Report

## Summary

**Reported**: 2026-05-15

战斗内情报获取不符合规则书：当前更容易固定获得攻击方向，而不是在属性数值、道具情况、攻击方向三类之间随机分配；同时攻击方向按回合号推断和过期，存在与敌人下一次真实攻击方向不一致的风险。

## Classification

- **Category**: Gameplay
- **System**: Combat Intel / Dodge Direction
- **Frequency**: Often
- **Regression**: Yes

## Environment

- **Build**: 本地 Vite 原型
- **Platform**: Windows / Browser
- **Scene/Level**: 迷宫照面战斗
- **Game State**: 玩家通过防御、成功闪避或镜片获得战斗内情报

## Reproduction Steps

**Preconditions**: 进入一场敌人可攻击的照面战斗。

1. 让玩家进行防御或成功闪避。
2. 查看战斗面板中的新增情报。
3. 在下一次敌人攻击时按情报方向闪避。

**Expected Result**: 情报类型在 `属性 = 数值`、`拥有/未见道具`、`下次攻击方向 = 左/右` 三类中随机分配；若获得攻击方向，该方向必须读取敌人下一次真实攻击序列值，且在该次攻击发生前保持正确。

**Actual Result**: 情报倾向于优先输出攻击方向；方向按 round 推断和过期，可能在结算时提前失效或与下一击序列不一致。

## Technical Context

- **Likely affected files**:
  - `src/sim/GameSimulation.ts`
  - `src/sim/systems/randomSystem.ts`
  - `src/sim/types.ts`
  - `tests/integration/simulation.test.mjs`
- **Related systems**: 情报预算、闪避判定、HUD 情报列表、镜片道具。
- **Possible root cause**: `revealNextIntel()` 将 `attackDirection` 放在候选队列前部；方向使用 `encounter.round + 1`，而真实攻击消耗没有独立的 per-attacker attack index。

## Evidence

- **Visual**: 用户截图与反馈指出情报只出现攻击方向，且实际使用时不可信。
- **Logs**: 暂无运行日志。

## Related Issues

- `CCGS-Data/design/quick-specs/attack-direction-intel-dodge-read-2026-05-15.md`
- `CCGS-Data/design/gdd/rulebook.md` v0.8.5 情报规则

## Notes

修复必须保持情报文本限制：单体情报只能是属性数值、道具情况或下一次攻击方向，不允许写入态势、意图、路线、性格或临场描述。

## Verification Record

**Verified**: 2026-05-15  
**Verdict**: VERIFIED FIXED  
**Fix Summary**: 战斗情报类型改为 seed 随机分配；攻击方向改为读取攻击者下一击序列真值，并在真实攻击结算后过期。  
**Regression Test**: `tests/integration/simulation.test.mjs` 新增/更新方向序列与情报类型分布覆盖。  
**Command**: `npm test`，71/71 通过。
