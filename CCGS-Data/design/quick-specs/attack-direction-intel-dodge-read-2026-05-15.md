# Quick Design Spec: 攻击方向情报与闪避读向

**Type**: Addition  
**System**: 战斗 / 情报 / 闪避  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-15

## Change Summary

战斗内情报新增第三类结构化字段：`attackDirection`。它只表示目标下一次攻击方向为 `left` 或 `right`，用于让玩家在下一回合进行高价值闪避读向。

## Motivation

当前情报只能给属性与道具，能帮助长期判断，但对“下一手该左闪还是右闪”的短促博弈帮助不足。加入真实攻击方向情报后，防御、成功闪避和镜片可以直接转化为下一回合的行动优势。

## Design Delta

当前 GDD 第 6 章禁止攻击方向进入情报列表。本规格将其改为一个明确例外：

`attackDirection` 不是态势、意图或预写台词，而是由战斗随机系统为下一次攻击生成的真实方向字段。

## New Rules / Values

1. 每次攻击都有真实方向：`left` 或 `right`。
2. 攻击方向由 seed、攻击者 ID、当前 turn、战斗 round 共同决定，同一局同一时点可复现。
3. `attackDirection` 情报只揭示目标“下一次攻击方向”，格式为：
   - `下次攻击方向 = 左`
   - `下次攻击方向 = 右`
4. 该情报必须保存结构化字段：
   - `kind = "attackDirection"`
   - `attackDirection = "left" | "right"`
   - `attackDirectionRound = number`
5. 进入该 round 结算时，旧的方向情报过期并从当前情报列表移除。
6. 玩家选择与攻击方向相同的闪避方向视为读向正确，基础成功率高；选择相反方向视为读向错误，基础成功率低。
7. 推荐闪避概率：
   - 正确方向：`clamp(75 + speedDiff * 8 + itemModifier, 55, 95)`
   - 错误方向：`clamp(10 + speedDiff * 3 + itemModifier, 5, 30)`
8. 镜片改为一次性战斗道具：使用后揭示当前敌人的下一次攻击方向并销毁。
9. 说服、场外全局情报、推测情报仍不得生成攻击方向；推测情报继续只允许属性数值或道具情况。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Rulebook | 情报类型从两类扩为三类 | 更新第 6、7、8、14、17 章相关约束 |
| Combat Resolve | 闪避方向判定改为同侧正确 | 修正近战/远程闪避概率 |
| IntelEntry | 新增结构化方向字段 | 更新类型、HUD、测试 |
| Item Runtime | 镜片效果改变 | `lens` 改为一次性揭示方向 |
| QA | 需要覆盖真实方向与正确/错误闪避差异 | 新增集成测试 |

## Acceptance Criteria

- [x] 防御或成功闪避可生成 `kind = "attackDirection"` 的确认情报。
- [x] 方向情报包含 `attackDirection` 与 `attackDirectionRound`，并与下一回合真实攻击方向一致。
- [x] 镜片使用后生成方向情报，并按一次性道具消耗。
- [x] 选择正确方向时闪避成功率明显高于错误方向。
- [x] 推测情报仍只生成属性数值或道具情况。
- [x] 不出现“态势、性格、路线、意图”等新文本情报。

## GDD Update Required?

Yes。更新 `rulebook.md`：
- 第 6 章将 `attackDirection` 加入允许的单体战斗情报。
- 第 7 章修正闪避方向公式。
- 第 12/14/17 章同步镜片、HUD 与验收标准。
