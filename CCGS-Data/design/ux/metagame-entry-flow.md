# UX Spec: Metagame Entry Flow

> **Status**: Implemented  
> **Author**: Codex + ux-designer  
> **Last Updated**: 2026-05-25  
> **Journey Phase(s)**: 局外准备、入场前决策  
> **Template**: UX Spec

---

## Purpose & Player Need

玩家来到局外大厅时，最重要的需求不是浏览所有系统，而是决定“这局去哪、带什么、能不能出发”。本流程把地图档位和战备清单合并到主页的行动主窗口中，商店、仓库和档案降级为辅助管理入口。

---

## Player Context on Arrival

玩家可能是第一次打开游戏、刚完成教程、刚撤离成功，或刚失败回到局外。设计默认玩家处于“想开始下一局但需要做风险判断”的状态，因此主页优先呈现关卡档位、入场费、战备上限、敌人区间和开始行动条件。

---

## Navigation Position

本流程位于根层级：`游戏启动 -> 局外大厅 -> 行动主页`。顶层导航只保留四个入口：`行动 / 商店 / 仓库 / 档案`。地图与战备不再是顶层页面，而是行动主页内部的入场前配置区。

---

## Entry & Exit Points

| Entry Source | Trigger | Player Carries This Context |
|---|---|---|
| 游戏启动 | 本地 Profile 加载完成 | 金币、属性、仓库、商店、当前地图档位、战备清单 |
| 局内撤离/失败 | Run 结算完成 | 上局摘要、回收/丢失物、金币变化 |
| 辅助页面 | 点击“行动”导航 | 当前商店、仓库或档案状态 |

| Exit Destination | Trigger | Notes |
|---|---|---|
| 局内探索 | 点击“支付入场费并开始” | 金币足够且战备未超上限 |
| 商店 | 点击“购买补给”或导航 | 用于补齐构筑 |
| 仓库 | 点击“调整携带”或导航 | 用于带入、撤下、出售 |
| 档案 | 点击“查看属性”或导航 | 用于属性 reroll、升级和账号 hook |

---

## Layout Specification

### Information Hierarchy

1. 当前行动区域：档位名、入场费、战备上限、敌人属性区间、掉落风险。
2. 入场检查：当前携带物、战备值、金币、是否可出发。
3. 行动目标：进场、搜刮/交战、找到出口撤离。
4. 辅助入口：商店、仓库、档案、教程。

### Layout Zones

| Zone | Role | Relative Weight |
|---|---|---|
| Hero | 建立游戏身份和目标感 | 中 |
| 行动区域选择 | 主页最大窗口，承载关卡选择 | 高 |
| 入场检查 | 侧栏窗口，承载战备和开始按钮 | 高 |
| 快捷摘要 | 说明当前目标、档位、战备、上局记录 | 中 |
| 辅助按钮 | 进入教程、商店、仓库、档案 | 低 |

### Component Inventory

| Component | Type | Interactive | Notes |
|---|---|---|---|
| 地图档位卡 | Button Card | Yes | 触发 `select-tier`，当前选中卡更大更亮 |
| 入场检查窗口 | Panel | Partial | 展示战备清单，包含开始/调整携带/购买补给 |
| 战备物品卡 | Item Card | Yes | 保留 hover/focus tooltip 和撤下操作 |
| 顶层导航 | Tab Buttons | Yes | 只显示行动、商店、仓库、档案 |
| 主页快捷按钮 | Buttons | Yes | 教程、属性、商店、仓库 |

### ASCII Wireframe

```text
+--------------------------------------------------------------+
|  局外战备 / 行动选择                         金币             |
|  [行动] [商店] [仓库] [档案]                                  |
|  属性总值 / 当前地图 / 入场费 / 战备 / 仓库                    |
|                                                              |
|  +----------------------- HERO -----------------------------+ |
|  | 照面之时：搜打撤目标说明                                  | |
|  +----------------------------------------------------------+ |
|                                                              |
|  +------------------- 行动区域选择 ----------------+ +------+-+
|  | [当前选中档位大卡]                              | |入场检查|
|  | [档位卡] [档位卡]                               | |战备清单|
|  | [档位卡] [档位卡]                               | |开始按钮|
|  +--------------------------------------------------+ +------+-+
|                                                              |
|  当前目标 / 当前档位 / 战备状态 / 档案记录                    |
+--------------------------------------------------------------+
```

---

## States & Variants

| State / Variant | Trigger | What Changes |
|---|---|---|
| Default | 局外无 active run | 显示行动主页和四入口导航 |
| Cannot Start | 金币不足或战备超限 | 开始按钮禁用，入场检查显示原因 |
| Empty Loadout | 没有携带物 | 战备清单显示空状态并引导去仓库 |
| Active Run | 已进入局内 | 局外面板折叠为紧凑摘要 |
| Mobile | 宽度较窄 | 行动区域选择与入场检查改为纵向堆叠 |

---

## Interaction Map

| Component | Input | Feedback | Outcome |
|---|---|---|---|
| 地图档位卡 | Click / keyboard focus + Enter | 选中卡高亮、摘要更新 | `select-tier` |
| 开始行动 | Click | 禁用/可用状态明确 | `start-run` |
| 调整携带 | Click | 切换到仓库页 | `set-meta-view: stash` |
| 购买补给 | Click | 切换到商店页 | `set-meta-view: shop` |
| 查看属性 | Click | 切换到档案页 | `set-meta-view: account` |

---

## Events Fired

| Player Action | Event Fired | Payload / Data |
|---|---|---|
| 选择地图档位 | `select-tier` | `tierId` |
| 开始行动 | `start-run` | 当前 Profile、地图档位、战备清单 |
| 切换辅助页 | `set-meta-view` | `view` |
| 训练教程 | `tutorial-run` | 无额外 payload |

---

## Transitions & Animations

顶层导航切换保持即时响应，不做长动画。选中地图档位通过边框、发光和更大卡片面积传达重要性。按钮 hover/focus 保持轻微上移和边框高亮。若系统启用 `prefers-reduced-motion`，保留静态高亮即可。

---

## Data Requirements

| Data | Source System | Read / Write | Notes |
|---|---|---|---|
| Profile 金币/属性/仓库/战备 | `MetagameState.profile` | Read | HUD 不直接改写 |
| 当前地图档位 | `MetagameState.selectedMapTier` | Read | 由 `select-tier` 修改 |
| 可否开始 | `MetagameState.canStartRun` | Read | 由模拟层判定 |
| 物品文案与图标 | `itemText` / `gridDungeonAssets` | Read | 用于卡片 tooltip |

---

## Accessibility

所有顶层入口、地图卡、开始按钮和物品卡必须可键盘聚焦。当前页面使用 `aria-pressed` 标记。不能只用颜色传达可出发状态：按钮禁用、文字状态和数值摘要需要同时存在。移动端布局必须保持按钮最小高度可点。

---

## Localization Considerations

地图档位描述和物品 tooltip 是最长文本，必须允许换行。顶层导航标签保持 2-4 个汉字级别；后续本地化时若文本扩展 40%，应优先保留主语义，压缩 hint 文本。

---

## Acceptance Criteria

- [ ] 局外顶层导航只显示 `行动 / 商店 / 仓库 / 档案`。
- [ ] 主页中地图档位选择比辅助入口更大、更显眼，当前选中档位有明确高亮。
- [ ] 战备清单和开始按钮出现在主页入场检查窗口中，不需要进入独立战备页。
- [ ] 点击地图档位、购买、带入、撤下、出售后，`MetagameState` 数据正常更新。
- [ ] 桌面与移动尺寸下，行动区域和入场检查不互相遮挡。
- [ ] `npm test` 与 `npm run build` 通过。

---

## Open Questions

- 后续是否需要为每个地图档位提供独立插画或缩略图。
- 是否需要在主页显示商店精选 1-2 件物品，作为更强的构筑引导。
