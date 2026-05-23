# Quick Design Spec: 被动道具链与主动次数限制

**Type**: Addition  
**System**: Item System / Enemy AI / Encounter Combat  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-18

## Change Summary

本次修正主动道具无限复用造成的数值碰撞，并补充一批被动道具，让构筑不只依赖“点击道具给下一击 +1”。非 `rare` 主动/反应道具默认获得使用次数上限；新增被动道具覆盖常驻属性、首/次/三回合时间端口，以及状态、暴击、击中防御等条件端口。

## Motivation

当前主动道具存在三类体验问题：低稀有主动道具可无限反复点击，容易堆出数值碰撞；敌人 AI 对主动道具使用偏保守，导致同等拾取下玩家战力更容易滚雪球；主动道具之间连携少，构筑更像单次数值高低比较。新增被动链后，玩家和敌人都能通过“状态来源 + 被动触发 + 回合时机”形成更可读的短线组合。

## Design Delta

Current GDD says (`rulebook.md`, 24A.1):

> 未标明 `maxCharges` 或显式一次性的主动道具，默认 `usage.mode = "unlimited"`，但仍受 `manualLock = "per-round"` 限制。

This spec changes that to:

非 `rare` 的主动/反应道具若未显式声明次数，则默认获得使用次数：`common = 2 次`，`uncommon = 3 次`，用完销毁；`rare` 主动道具仍可按单独规则无限、保留、补充或消耗。被动道具不消耗次数，必须通过时间或条件端口触发，并受每回合全场 5 次自动触发链上限约束。

## New Rules / Values

- 非 `rare` 主动/反应道具默认 `usage.mode = "charges-destroy"`。
- 默认次数：`common 2`，`uncommon 3`；若道具已有 `maxCharges` 或显式 usage，以显式规则为准。
- 新增被动道具按三类进入拾取池：
  - 常驻属性被动：战斗开始时提供小额力量、速度、暴击或防护修正。
  - 时间端口被动：首回合、次回合、第三回合及以后触发小额 buff/debuff 或状态准备。
  - 条件端口被动：施加灼烧/中毒/冻结、暴击、击中防御时触发额外效果。
- 敌人 AI 获得与玩家相同的被动触发；主动道具选择权重提高，尤其在持有状态联动被动时更倾向使用对应状态主动道具。
- 被动触发不得递归无限生效；状态施加类仍调用统一触发链计数，每战斗回合最多 5 次。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Rulebook | 主动次数与被动链规则变化 | 更新 v0.8.9 |
| Item Data | 新增道具 ID、usage、ports、effects、rarity | 更新 `items.ts` 与 `types.ts` |
| Item Balance | 新增 effectKey 强度评分 | 更新 `itemBalanceSystem.ts` |
| Encounter Combat | 增加战斗开始、回合时机、暴击、击中防御触发 | 更新 `GameSimulation.ts` |
| Enemy AI | 更积极使用可连携主动道具 | 更新 `enemySystem.ts` |
| HUD/Icon | 新道具图标映射复用现有素材 | 更新 `gridDungeonAssets.ts` |
| Tests | 次数限制、被动触发、AI 使用回归 | 新增/更新自动化测试 |

## Acceptance Criteria

- [ ] 非 `rare` 主动/反应道具默认具备次数：common 2 次、uncommon 3 次；rare 不被该默认规则强行限制。
- [ ] 新增被动道具全部有可解析 `usage / ports / effects / counterplay / rarity`，并进入拾取池。
- [ ] 战斗开始、首回合、次回合、三回合后、施加状态、暴击、击中防御触发均至少有一个道具可验证。
- [ ] 玩家和敌人共用被动触发逻辑；敌人能更积极地选择与持有被动协同的主动道具。
- [ ] 自动触发链仍受每回合 5 次上限保护。
- [ ] No regression：现有拾取、战斗、治疗、情报、掉落、稀有度、地图测试继续通过。

## GDD Update Required?

Yes. 更新 `CCGS-Data/design/gdd/rulebook.md`：

- 版本推进至 v0.8.9。
- 修改 24A.1 主动道具默认复用规则。
- 新增“v0.8.9 被动道具链与非 rare 主动次数限制”章节，列出新增道具与验收标准。
