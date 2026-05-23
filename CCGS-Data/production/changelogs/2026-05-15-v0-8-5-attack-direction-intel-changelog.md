# v0.8.5 攻击方向情报与闪避读向 Changelog

日期：2026-05-15  
范围：规则书、架构端口、战斗情报、闪避判定、镜片道具、HUD、测试

## 变更摘要

- 新增 Quick Design Spec：`CCGS-Data/design/quick-specs/attack-direction-intel-dodge-read-2026-05-15.md`。
- 更新 `rulebook.md` 至 v0.8.5：单体战斗情报新增第三类结构化字段 `attackDirection = left | right`。
- 更新 `system-framework.md` 与 `module-ports.md`：攻击方向只允许作为下一次攻击的真实结构化字段，不允许扩展成态势、路线或意图文本。
- 扩展 `IntelKind` / `IntelEntry`：新增 `attackDirection` 与 `attackDirectionRound`，用于记录下一击方向和生效回合。
- 防御与成功躲闪的战斗内情报现在会优先揭示敌人的下一次攻击方向，其次才揭示属性或道具。
- 镜片改为一次性战斗道具：使用后揭示当前敌人下一次攻击方向并消耗。
- 修正躲闪方向判定：玩家闪避方向与敌人真实攻击方向一致时成功率显著提高，不一致时成功率显著降低。
- HUD 情报列表新增 `下次攻击方向 = 左/右` 的结构化显示，不生成额外叙述文本。
- 同步 `docs/` 下规则书和架构副本。

## 验证

- `npm test`：70/70 通过。
- `npm run build`：通过。

## 注意

- `attackDirection` 不参与推测情报；推测仍只允许属性数值或道具情况。
- 方向情报只对下一次攻击 round 有效，进入对应 round 后由模拟层过期或被新的方向情报覆盖。
