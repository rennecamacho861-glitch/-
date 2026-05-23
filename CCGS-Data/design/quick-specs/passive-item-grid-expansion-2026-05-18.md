# v0.8.10 被动道具网状扩展 Quick Spec

日期：2026-05-18

## 类型

Addition。基于既有 v0.8 道具模板，不新增战斗动作，只扩展“触发时机 × 生效结果”的被动道具网。

## 目标

当前主动道具已被次数限制削弱，但构筑仍需要更多非点击式联动。新增 50 件被动道具，用不同触发端口连接速度、力量、智力、情报、伤害、闪避、暴击、逃脱、说服、重伤阈值、治疗、优势和状态施加，减少单纯数值高低替代品。

## 触发网格

| 触发时机 | 新增道具 |
|---|---|
| 持续生效 | `servo-heel`、`mnemonic-plate`、`knuckle-core`、`exit-charm` |
| 首回合 | `opener-gear`、`first-glint`、`pilot-flame`、`rawhide-guard` |
| 次回合 | `second-gear`、`coolant-breath`、`second-sight`、`venom-timer` |
| 三回合后每回合 | `long-fuse`、`fatigue-tax`、`bunker-prayer`、`escape-count` |
| 闪避成功 | `spring-step`、`dust-kicker`、`slip-venom`、`dodge-reader` |
| 防御成功 | `guard-lens`、`brace-piston`、`shield-spark`、`calm-mouthpiece` |
| 造成重伤 | `wound-motor`、`crack-reader`、`crush-salt` |
| 触发燃烧 | `ember-step`、`heat-read`、`ash-threshold` |
| 触发中毒 | `toxic-focus`、`bitter-mouth`、`green-pulse` |
| 触发冻结 | `ice-step`、`cold-reader`、`shatter-pin` |
| 暴击 | `crit-lens`、`white-spark`、`snap-sinew` |
| 受到伤害 | `pain-wheel`、`blood-map`、`recoil-plate` |
| 造成伤害 >= 5 | `overrun-chain`、`hard-receipt`、`marrow-coin` |
| 受到重伤 | `breakwater-splint`、`trauma-scan`、`last-ice` |
| 剩余 1 点生命 | `last-match` |
| 获得情报 | `data-spur` |

## 设计约束

- 新道具默认都是 `useContext = passive`、`timing = passive`，不增加点击负担。
- 所有效果进入 `usage / ports / effects / counterplay` 模板，不允许只写说明不实装。
- 自动触发仍受每战斗回合全场 5 次上限约束。
- “获得情报”只能调用既有结构化情报系统：属性数值、道具情况、下一次攻击方向，不生成态势文本。
- “获得优势”只设置本轮待结算优势来源，不直接绕过当前回合死亡/失败检查。
- 敌人持有这些道具时与玩家共用触发逻辑。

## 验收标准

- 道具池从 84 件增加到 134 件。
- 50 件新增道具全部有稀有度、端口、效果、反制、图标和玩家可读说明。
- 持续、回合、闪避、防御、重伤、状态、暴击、受伤、高伤、低血和情报触发至少各有 1 条自动化覆盖或被通用触发测试覆盖。
- `npm test` 与 `npm run build` 通过。
