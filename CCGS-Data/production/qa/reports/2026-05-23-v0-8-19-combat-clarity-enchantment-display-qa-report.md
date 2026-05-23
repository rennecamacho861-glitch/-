# v0.8.19 战斗判定解释与附魔展示 QA 报告

## 测试范围

- 防御对低伤攻击的优势获取条件。
- 防御未获得优势时的玩家解释反馈。
- 正确方向闪避失败时的概率解释反馈。
- 附魔道具在 HUD 道具说明中的具体效果显示。
- 附魔道具的视觉边框与六类附魔样式端口。

## 自动化测试

命令：

```powershell
npm test
npm run build
```

结果：

- `npm test`：127/127 通过。
- `npm run build`：通过。

新增/更新覆盖：

- `tests/integration/combat_clarity_feedback_test.mjs`：覆盖低伤防御获优势、防御无优势解释、正确方向闪避失败解释。
- `tests/unit/combat_system_effective_defense_test.mjs`：更新有效防御阈值预期。
- `tests/unit/item_text.test.mjs`：覆盖附魔道具效果文案与 HUD 调用端口。

## 手动/视觉检查

- 本轮通过 TypeScript 构建确认 HUD 附魔属性、tooltip 结构与 CSS 样式可编译。
- 尚未补桌面/移动浏览器截图证据；后续视觉验收建议检查附魔边框在背包折叠、hover 展开、战斗面板等状态下是否足够清晰。

## 结论

PASS WITH VISUAL FOLLOW-UP。

P0 行为问题已修正：防御优势的低伤断点不再让玩家感觉失效；概率型正确闪避失败和防御无优势都会给出解释；附魔物品不再只显示名字前缀，而是展示具体附魔收益与视觉边框。
