# v0.8.21 防御对进攻稳定优势 QA 报告

## 测试范围

- 玩家防御承受敌方基础近战攻击时稳定获得优势。
- 敌人防御承受玩家基础近战攻击时，玩家攻击不会反抢优势。
- 基础近战打进防御且造成重伤时，若防御者未生命归零，优势仍归防御者。
- 左轮等远程枪线不被普通防御稳定克制的既有边界不回归。

## 自动化测试

命令：

```powershell
npm test
npm run build
```

结果：

- `npm test`：129/129 通过。
- `npm run build`：通过。

新增/更新覆盖：

- `tests/unit/combat_system_effective_defense_test.mjs`
  - `test_attack_into_defense_gives_defender_advantage_even_when_damage_lands`
  - `test_basic_attack_into_defense_keeps_defender_advantage_even_on_heavy_wound`

## 手动/视觉检查

- 本轮未补浏览器截图。
- 需要后续游玩确认：敌人防御成功后，由于 AI 会自动把优势压成速度，玩家是否能通过战斗日志理解“防御已经生效”。

## 结论

PASS WITH UX FOLLOW-UP。

规则和模拟已完成：基础近战 `Attack` 打进 `Defense` 时，防御者稳定获得有效防御优势；攻击方不会因为防御后伤害或重伤覆盖该优势。
