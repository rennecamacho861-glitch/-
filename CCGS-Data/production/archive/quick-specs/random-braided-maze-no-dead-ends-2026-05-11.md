# Quick Design Spec: 随机编织无死路迷宫

**Type**: Tweak  
**System**: Map & Exploration  
**GDD Reference**: `CCGS-Data/design/gdd/rulebook.md`  
**Date**: 2026-05-11

## Change Summary

将当前固定蛇形边缘墙地图改为按 seed 生成的随机编织迷宫。地图仍保持全图连通、无占格墙、无死路、每格至少 1 面墙，但画面不再呈现整排长条走廊。

## Motivation

当前蛇形环路虽然满足“无死路”和“每格有墙”，但玩家看到的是大长条道路，缺少迷宫的频繁转向、局部遮挡和不规律读图压力。随机编织迷宫能让每局仍可复现，同时提供更像黑暗管廊的复杂路径感。

## Design Delta

Current GDD says (quoting `CCGS-Data/design/gdd/rulebook.md`, 第 4 章地图规则):

> MVP 固定地图不存在死路：每个可进入格至少有 2 个可通行方向，允许形成环路和窄走廊。

This spec changes that to:

MVP 地图由当前局 seed 生成边缘墙布局。生成结果必须全图连通、没有死路、每个格子的开放方向为 2-3，并且最长直线走廊不超过 4 个连续开放边。生成只改变 `wallEdges`，不改变地图尺寸、格子内容、道具节点数量或敌人数量。

## New Rules / Values

- 地图尺寸保持 `17x13`。
- `TileKind` 仍只表示格子内容，墙体只能由 `wallEdges` 表示；v0.6.7 起格子内容收缩为 `floor | exit`。
- `wallEdges` 必须由当前局 `seed` 生成；同 seed 生成完全一致，不同 seed 生成明显不同。
- 生成算法从全开放格网逐步加墙，每次加墙后必须保持全图连通、两侧格开放方向不低于 2。
- 所有格子的开放方向必须为 2-3：开放方向 1 视为死路，开放方向 4 视为没有墙面约束。
- 任一横向或纵向连续直线开放段不得超过 4 个连续开放边。
- 30 个初始道具节点、10 名初始敌人和出口仍使用既有格子内容，并且必须从玩家起点可达；危险格已在 v0.6.7 删除。
- 敌人巡逻路径必须基于生成后的开放边生成或校正，不能假设固定横向通道存在。

## Affected Systems

| System | Impact | Action Required |
|--------|--------|-----------------|
| Map & Exploration | `wallEdges` 从固定蛇形改为 seed 生成 | 更新 GDD、架构和 `map.ts` |
| Enemy AI | 固定 patrol 可能被随机墙阻断 | 按开放邻格生成巡逻点 |
| HUD & Render | 只读取 `wallEdges`，表现逻辑不变 | 无需新增 UI |
| QA | 需要覆盖 seed 复现、无死路和最长直线 | 更新地图单元测试与集成测试 |

## Acceptance Criteria

- [ ] 同一 seed 生成相同 `wallEdges`，不同 seed 生成不同 `wallEdges`。
- [ ] 全图所有格子从玩家起点可达。
- [ ] 所有格子开放方向为 2-3，不存在死路或全开放格。
- [ ] 横向/纵向最长连续开放边不超过 4。
- [ ] 初始 30 个道具节点、10 名敌人和出口均从玩家起点可达。
- [ ] 敌人 patrol 的每一步不穿越 `wallEdges`。
- [ ] No regression: 移动、视野和远程攻击仍以 `wallEdges` 为唯一阻挡真源。

## GDD Update Required?

Yes. 更新 `CCGS-Data/design/gdd/rulebook.md` 第 4 章地图规则和验收标准：将“固定蛇形密集地图”改为“seed 随机编织迷宫”，并加入开放方向 2-3 与最长直线不超过 4 的约束。
