# UI Evidence - v0.8.12 Story 006 道具玩家文案层与 HUD 展示边界

日期：2026-05-19  
Story：`CCGS-Data/production/epics/v0-8-12-combat-revision/story-006-item-text-hud-boundary.md`  
页面：`http://127.0.0.1:5188/`

## Evidence Files

- 桌面截图：`CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/desktop.png`
- 移动截图：`CCGS-Data/production/qa/evidence/ui/item-text-hud-boundary-v0-8-12/mobile.png`

## Checks

| 检查项 | 结果 | 说明 |
|---|---|---|
| 拾取卡主文案走玩家文案层 | PASS | 开局三选一显示回声针、手枪、绷带的自然中文短说明与限制说明，不显示端口名、实现字段或 raw counterplay。 |
| 移动端不依赖原生 title | PASS | 移动截图中拾取卡直接显示短说明与限制，玩家无需 hover。 |
| HUD 不直接展示 raw counterplay | PASS | 源码检查确认 `src/main.ts` 不再读取 `item.counterplay`，敌方道具应对提示改走 `itemEnemyCounter()`。 |
| 当前效果条显示具体效果 | PASS | 自动化测试覆盖 `activeEffectUiText()` 与 `statusEffectUiText()`，输出目标、当前效果与剩余回合。 |
| 主要 playfield 未被永久遮挡 | PASS | 桌面和移动尺寸下，HUD/拾取面板不遮挡顶部玩家当前格；拾取面板是暂停态确认面板，可关闭后恢复地图操作。 |

## Notes

- 本轮未新增美术资源，未修改 Phaser Scene。
- 敌方道具 tooltip 和战斗效果条的深层交互由源码与单元测试覆盖；截图覆盖开局拾取三选一和移动端可读性。
- `vite` 本地服务仅用于截图验证，验证后已停止。

