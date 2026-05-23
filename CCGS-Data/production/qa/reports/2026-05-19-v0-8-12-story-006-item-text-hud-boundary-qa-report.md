# QA Report - v0.8.12 Story 006 道具玩家文案层与 HUD 展示边界

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`  
测试类型：UI / Unit / Visual Evidence  
结论：PASS

## Test Evidence

- 自动化测试：`tests/unit/item_text.test.mjs`
- UI 证据：`CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12.md`
- 桌面截图：`CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/desktop.png`
- 移动截图：`CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/mobile.png`
- 全量验证：`npm test` 112/112 passed
- 构建验证：`npm run build` passed

## Acceptance Coverage

| AC | 覆盖结果 | 证据 |
|---|---|---|
| AC-CMB-080 玩家文案层 | PASS | `item_text.test.mjs` 覆盖全部道具 `uiShort/uiLimit/uiEnemyCounter` 存在且不包含实现词；`main.ts` 源码检查不再读取 `item.counterplay`。 |
| AC-CMB-081 敌方道具应对提示 | PASS | `main.ts` 敌方道具 tooltip 改为 `itemEnemyCounter(entry.itemId)`，文案写成“应对：玩家可执行动作”。 |
| AC-CMB-082 当前效果条 | PASS | `activeEffectUiText()` 与 `statusEffectUiText()` 单元测试验证目标、效果、剩余回合；HUD 效果条使用这两个函数。 |
| 高风险文案一致性 | PASS | 测试覆盖回声针、药膏铁盒、烟雾球、木盾片、标记硬币、越线链。越线链文案已从“获得优势”修正为当前代码实际的“下次逃跑 +20%”。 |
| 移动端可读性 | PASS | 移动截图确认拾取卡直接展示短说明与限制说明，不依赖 hover/title。 |

## Manual / Visual Notes

- 桌面截图显示开局拾取三选一：回声针、手枪、绷带均显示短说明与限制行。
- 移动截图显示三选一在窄屏下换行为 2 列布局，限制说明可见。
- 截图阶段未覆盖敌方道具 tooltip 的 hover 展开，但源码检查与单元测试覆盖其文案来源。

## Residual Risk

- 背包按钮加入短说明后信息密度提高，后续若背包容量继续增大，建议单独做背包详情面板 Story。
- 当前文案覆盖以规则一致性优先，最终废土语感润色仍可在后续文案专项中继续推进。

