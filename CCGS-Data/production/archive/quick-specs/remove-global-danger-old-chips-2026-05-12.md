# Quick Design Spec: 删除全局危险与旧筹码危险格

**Type**: Tweak  
**System**: Run State / Map & Exploration  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-12

## Change Summary

移除当前原型中的全局 `危险` 数值和“旧筹码响动”危险格。迷宫压力后续由视野差、敌人移动、道具成长、空投、毒圈与敌人内战承担，不再保留一个无明确后果的抽象 HUD 数值。

## Motivation

当前 `危险` 会在 HUD 中显示，但实际反馈不足，容易让玩家误以为它是完整系统；“旧筹码”危险格又与道具节点的金色占位视觉混淆。删除该接口能让第一版地图信息更干净，也避免后续在无效字段上继续堆规则。

## Design Delta

当前 GDD 中存在危险格和危险数值规则，例如“危险表示迷宫和敌人对玩家的注意程度”“触发危险格会提高危险”。本规格改为：

全局危险值从运行状态中移除；地图格内容不再包含危险格；旧筹码响动不再作为触发事件存在。枪击、陷阱、说服失败等事件只保留其直接效果、日志、情报或位置提示，不再修改全局危险。

## New Rules / Values

- `GameState` 不再包含 `danger`。
- `TileKind` 只允许 `floor | exit`。
- 地图布局不再使用 `D` 字符，不生成危险格。
- 玩家踩到原危险格位置时只按普通地面处理。
- HUD 不显示“危险”数值。
- 手枪开火不再提高危险，但仍消耗弹药、造成伤害、受视野/射线/防御/躲闪反制限制。
- 陷阱触发不再提高危险，但仍报警、红光提示、暴露敌人位置并给予情报。
- 说服失败不再提高危险，只会失去优势并回到战斗选择。
- `FeedbackEvent.tone = "danger"` 保留为演出语义，用于受击、敌方优势、重伤、枪击等红色提示；它不代表全局危险系统。

## Affected Systems

| System | Impact | Action Required |
|---|---|---|
| Rulebook | 删除危险/危险格规则 | 更新 GDD |
| System Framework | 删除 `GameState.danger` 与 `TileKind.danger` | 更新架构 |
| Module Ports | Run State 输出不再包含 danger | 更新端口 |
| Simulation | 移除危险字段、旧筹码触发与 `addDanger()` | 修改代码 |
| Map Data | `D` 改为普通地面 | 修改代码 |
| Render | 不再绘制危险格色块 | 修改代码 |
| HUD | 不再显示危险 | 修改代码 |
| Tests | 移除 72 回合危险增长测试，新增无危险字段/无危险格断言 | 修改测试 |

## Acceptance Criteria

- [ ] `GameState` 快照中不存在 `danger` 字段。
- [ ] `TileKind` 不包含 `danger`，初始地图不存在危险格。
- [ ] HUD 不显示“危险”数值。
- [ ] 玩家踩到原危险格坐标不会触发“旧筹码”日志。
- [ ] 手枪、陷阱、说服失败、僵持脱战不再调用危险增长逻辑。
- [ ] 自动化测试覆盖无危险字段、无危险格和 72 回合后不产生危险。

## GDD Update Required?

Yes. 更新 `CCGS-Data/design/gdd/rulebook.md` 中运行状态、地图内容、道具反制、UI、验收标准等危险相关描述。
