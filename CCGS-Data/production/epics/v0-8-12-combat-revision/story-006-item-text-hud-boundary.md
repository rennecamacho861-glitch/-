---
epic: "v0-8-12-combat-revision"
status: "Complete"
phase: "P1"
owner: "ui-programmer"
type: "UI"
estimate: "1天"
points: ""
dependencies: ["story-002-attack-direction-intel", "story-003-advantage-flee-persuasion", "story-004-item-limits-build-budget"]
group: ""
sprint: ""
layer: "Presentation"
manifest_version: "2026-05-09"
---
# Story 006: 道具玩家文案层与 HUD 展示边界

## Context

**GDD**: `CCGS-Data/design/gdd/combat-system.md`  
**Requirement**: `AC-CMB-080`, `AC-CMB-081`, `AC-CMB-082`  
**Related TR**: `TR-UI-001`, `TR-ARCH-001`  
**ADR Governing Implementation**: ADR-0001 / existing simulation boundary  
**Engine**: Phaser 3 + TypeScript + Vite | **Risk**: MEDIUM

本 Story 清理道具玩家文案：拾取、背包、日志和敌方情报悬浮不再直接显示原始 `counterplay` 或规则实现语气。

## Acceptance Criteria

- [x] 拾取卡、背包、日志和情报悬浮主文案必须走玩家文案层，不得直接显示 rulesDescription 或 counterplay。
- [x] 已知敌方道具详情可显示 `uiEnemyCounter`，但必须写成玩家可执行应对，不显示设计审查语气。
- [x] 主动/被动效果条必须显示当前生效效果、剩余回合和目标，而不是只显示通用道具介绍。
- [x] 玩家主文案不得出现端口名、trigger、effectKey、动画事件、DOM、Phaser、代码实现或泛泛“获得情报”但不说明输出类型。
- [x] 回声针、药膏铁盒、烟雾球、木盾片、标记硬币、越线链等已知高风险文案必须与当前代码效果一致；未实现的效果不得写入玩家文案。

## Implementation Notes

- 可扩展 `src/sim/itemText.ts`，提供 `uiShort / uiLimit / uiEnemyCounter` 或等价结构。
- [main.ts](</D:/游戏设计/照面之时/src/main.ts:339>) 当前直接显示 `反制：${item.counterplay}`，需改为玩家可执行应对字段或暂不显示。
- 移动端不能只依赖原生 `title` 展示关键信息。
- HUD 不能直接改道具状态，只读取模拟层快照。
- Control Manifest：Presentation 层只能展示模拟层可见状态；`main.ts` 可以组装 HUD view-model，但不得根据道具名称自行推断或改写规则状态。
- Engine / UI Notes：本 Story 不改 Phaser Scene；桌面与移动布局需保留主要 playfield，可用源码检查 + 构建 + UI 证据文档登记，若浏览器截图不可用需在 QA 中明确说明。
- 文案端口：`rulesDescription` / `description` / `counterplay` 继续可作为设计核验字段，但拾取、背包、日志、敌情 tooltip 和效果条必须走 `src/sim/itemText.ts` 的玩家文案函数。

## Out of Scope

- 不重做完整背包布局。
- 不新增图标或美术资源。
- 不修改道具实际数值，除非发现文案承诺与实现冲突并登记后续 Story。

## QA Test Cases

- **Manual check**: 拾取卡和背包主文案不显示实现字段。
  - Setup: 开新局并打开三选一拾取，查看多个道具和背包按钮。
  - Verify: 文案不出现端口名、trigger、effectKey、DOM、Phaser、代码实现、稀有度实现词。
  - Pass condition: 所有可见主文案都能用一句自然中文说明“做什么、对谁、多少、限制”。

- **Manual check**: 敌方道具情报不直接显示 raw counterplay。
  - Setup: 通过眼镜、防御或情报道具获得敌方道具情报。
  - Verify: 悬浮或详情不出现 `反制：${raw counterplay}` 风格文案；若有应对提示，必须是玩家可执行动作。
  - Pass condition: 玩家能理解如何应对，不看到生产/审查语气。

- **Manual check**: 生效效果条显示具体当前效果。
  - Setup: 使用一个 active effect 道具或触发被动。
  - Verify: 效果条显示当前效果、剩余回合和目标。
  - Pass condition: 玩家能知道“现在谁被加成/压制，以及还剩多久”。

## Test Evidence

**Story Type**: UI  
**Required evidence**:
- `CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12.md`
- 可选：桌面与移动截图。

**Status**: [x] Created and passing

## Completion Notes

- `src/sim/itemText.ts` 扩展为玩家文案层，提供 `itemUiDescription()`、`itemUiLimit()`、`itemEnemyCounter()`、`activeEffectUiText()`、`statusEffectUiText()`。
- `src/main.ts` 的拾取卡、背包按钮、敌方道具情报 tooltip 和效果条改为读取玩家文案函数；HUD 不再直接显示 `item.counterplay`。
- 背包按钮新增可见短说明和限制说明，移动端不再只依赖原生 `title`。
- 高风险道具文案已与当前实装对齐：回声针、药膏铁盒、烟雾球、木盾片、标记硬币、越线链。
- `system-framework.md` 与 `rulebook.md` 已同步 raw `counterplay` 不进 HUD 主文案的边界。
- 验证：`npm test` 112/112 通过；`npm run build` 通过；桌面和移动 headless 截图已生成。

## Dependencies

- Code Dependencies: `story-002-attack-direction-intel`, `story-003-advantage-flee-persuasion`, `story-004-item-limits-build-budget`
- Asset Dependencies: None
- Unlocks: None
