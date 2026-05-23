# Quick Design Spec: 防御对进攻稳定获得优势

**Type**: Tweak  
**System**: Encounter Combat  
**GDD Reference**: `CCGS-Data/design/gdd/combat-system.md` — Defense / Action Matrix / Closure  
**Date**: 2026-05-23

## Change Summary

将基础动作矩阵中的 `Defense vs Attack` 改为稳定克制：只要防御者本动作回合承受的是基础近战 `Attack`，防御者必定形成有效防御并获得 1 点优势资源。

## Motivation

玩家反馈“防御有时不加优势”和“攻击打进防御也像有效行动”会削弱读牌感。当前规则需要玩家理解减伤量、重伤阈值和软收束，成本过高。第一版体验应让三基础动作更像清晰博弈：防御克制莽攻，躲闪克制读向，进攻兑现先手或优势。

## Design Delta

Current GDD says (`combat-system.md`, Defense):

> 防御至少减少 1 点伤害，或防止一次重伤，或触发防御型道具/情报效果。

This spec changes that to:

基础近战 `Attack` 打进 `Defense` 时，不再检查减伤量、是否防止重伤或是否触发防御道具。防御者稳定获得有效防御、情报和 1 点优势资源。攻击仍可造成被防御减免后的伤害；防御不是完全免伤。远程、投掷和特殊压制仍按各自道具规则处理，普通防御不稳定克制左轮枪线。

## New Rules / Values

- `Defense vs Attack`：防御者承受基础近战攻击后，必定形成有效防御。
- 有效防御的收益：防御者获得 1 点优势资源，并按防御来源进行情报获取。
- 攻击方仍结算防御后的伤害、状态、附魔和命中触发，但不得因为“打出了小额伤害”或软收束显著伤害反抢该回合优势。
- 若防御者被打到生命归零，生命归零仍优先结束战斗；否则优势归防御者。
- `Ranged / Throw / Special` 不继承本规则，除非道具文字明确说明可被普通防御稳定克制。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Rulebook | 防御规则和边界情况更新 | 更新 `rulebook.md` |
| Combat GDD | Defense、Action Matrix、Closure 更新 | 更新 `combat-system.md` |
| Simulation | 近战防御有效判定和重伤优势覆盖逻辑更新 | 修改 `GameSimulation.ts` |
| Tests | 防御对攻击稳定优势回归 | 更新/新增测试 |

## Acceptance Criteria

- [ ] 玩家防御承受敌方基础近战攻击时，稳定获得 1 点优势。
- [ ] 敌人防御承受玩家基础近战攻击时，稳定获得 1 点优势，即使玩家造成了防御后伤害。
- [ ] 基础近战攻击打进防御时，攻击方不会因为小额伤害、显著伤害或软收束反抢优势。
- [ ] 左轮等远程枪线仍不被普通防御稳定克制。
- [ ] 生命归零仍优先于优势收益结算。

## GDD Update Required?

Yes。更新 `CCGS-Data/design/gdd/rulebook.md`、`CCGS-Data/design/gdd/combat-system.md` 和 `CCGS-Data/project-docs/architecture/system-framework.md`，把“有效防御最低减伤”改为“基础近战 Attack 打进 Defense 必定有效防御”。
