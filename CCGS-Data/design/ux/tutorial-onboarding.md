# UX Spec: 新手教程流程

> **Status**: In Design  
> **Author**: user + ux-designer  
> **Last Updated**: 2026-05-21  
> **Journey Phase(s)**: 首次进入、规则学习、正式开局前  
> **Template**: UX Spec

---

## Purpose & Player Need

新手教程的目的不是说明所有系统，而是让玩家在 3-5 分钟内真实完成一次“先读再打”的照面链条。玩家到达本流程时需要知道：本局目标是什么、五项属性怎么影响选择、防御为什么有价值、情报为什么能改变下一手、优势点能怎样花、什么时候应该击杀，什么时候可以说服。

---

## Player Context on Arrival

玩家首次进入页面时还没有形成战斗心智，通常只看到黑暗地图和按钮。若玩家选择“需要新手教程”，他们应被送入安全的训练场景，而不是直接进入正式局。训练中允许演示失败和受伤，但所有伤害、重伤、掉落和负面状态都不得带入正式开局。

---

## Navigation Position

本流程位于：

`页面首次进入` -> `教程选择弹窗` -> `脚本化训练场景` -> `完成总结提示` -> `正式开局四选一` -> `正常迷宫局`

若玩家选择“不需要”或在训练中点击“跳过教程”，流程变为：

`教程选择/训练场景` -> `正式开局四选一`

---

## Entry & Exit Points

| Entry Source | Trigger | Player Carries This Context |
|---|---|---|
| 首次页面加载 | localStorage 无教程偏好 | 新玩家，尚未选择是否教学 |
| 设置或重置流程 | 玩家清除教程偏好后重进 | 可重新选择教程 |

| Exit Destination | Trigger | Notes |
|---|---|---|
| 正式开局四选一 | 选择“不需要” | 保存关闭偏好 |
| 正式开局四选一 | 任意教程步骤点击“跳过教程” | 清空训练场景并恢复玩家 |
| 完成总结提示 | 完成第二名敌人说服教学 | 显示“下面在整个迷宫中找到出口，带着道具逃离吧。” |
| 正式开局四选一 | 玩家确认完成总结提示 | 正式开局装备选择出现 |

---

## Layout Specification

### Information Hierarchy

1. 当前教学目标：玩家现在应该理解什么，而不是只知道点哪个按钮。
2. 推荐动作：当前要点亮的按钮，例如防御、右闪、继续战斗：节奏、说服。
3. 刚获得的情报：属性数值、道具情况或下一次攻击方向。
4. 机制解释：为什么这条情报改变下一手选择。
5. 跳过教程：始终可见，但视觉低于主要动作。

### Layout Zones

| Zone | Content | Rule |
|---|---|---|
| Center Modal | 当前教学标题、短解释、确认/跳过 | 不遮住动作按钮太久；确认后让玩家操作 |
| Combat Panel Highlight | 当前推荐动作按钮动态框选/脉冲/角标 | 只高亮 1 个主要动作，避免信息噪音 |
| Intel Emphasis | 新增情报短暂高亮 | 情报条必须显示结构化字段 |
| Advantage Emphasis | 优势点数和续战按钮高亮 | 当教程要求投入优势时显示“剩余需投入 N 点” |

### Component Inventory

| Component | Type | Displays | Interactive | Pattern |
|---|---|---|---|---|
| Tutorial Prompt | Modal | 是否需要教程 | 需要 / 不需要 | Tutorial Choice Modal |
| Tutorial Step Modal | Modal | 当前目标、解释、下一步 | 知道了 / 跳过教程 | Scripted Tutorial Step |
| Action Highlight | Button State | 推荐动作、选择此项角标 | 点击后进入正式命令 | Coached Action Highlight |
| Intel Callout | Inline Highlight | `体质 = 1`、`下次攻击方向 = 右` | Hover 可解释 | Intel Tooltip |
| Advantage Spend Guide | Inline Counter | 当前优势点、目标投入点 | 引导点击续战 | Battle Choice Panel |

### ASCII Wireframe

```text
+---------------------------------------------------+
| HP / Turn / Advantage                             |
|                                                   |
|                  Playfield                        |
|            [enemy]     [player]                   |
|                                                   |
|        +--------------------------------+          |
|        | 教程：防御不是等待             |          |
|        | 先防御，读取体质与攻击线索。   |          |
|        | [知道了]           [跳过教程]  |          |
|        +--------------------------------+          |
|                                                   |
| Combat: [Attack] [DEFEND*] [Dodge L] [Dodge R]    |
+---------------------------------------------------+
```

---

## States & Variants

| State / Variant | Trigger | What Changes |
|---|---|---|
| Tutorial Prompt | 首次进入且无偏好 | 弹出是否需要教程 |
| Tutorial Active | 点击需要 | 正式开局四选一延后，训练敌人生成 |
| Coached Step | 每个教程步骤 | 高亮目标动作，弹窗解释机制 |
| Wrong Attack Demo | 第一敌人读方向前选择进攻 | 演示先手/重伤后检查点恢复 |
| Tutorial Skipped | 点击跳过 | 清空训练场景，进入开局四选一 |
| Tutorial Complete | 第二敌人说服成功 | 总结弹窗后进入开局四选一 |
| Tutorial Disabled | 点击不需要 | 保存偏好，后续不弹 |

---

## Interaction Map

| Player Action | Input | Immediate Feedback | Outcome |
|---|---|---|---|
| 选择需要教程 | Mouse / Keyboard / Touch | 弹窗关闭，地图切到训练态 | `beginTutorialScenario()` |
| 选择不需要 | Mouse / Keyboard / Touch | 弹窗关闭 | 生成正式开局四选一 |
| 确认教学弹窗 | Mouse / Keyboard / Touch | 弹窗关闭，目标按钮高亮 | 等待玩家执行动作 |
| 点击推荐动作 | Mouse / Keyboard / Touch | 按正式战斗反馈结算 | 推进教程步骤 |
| 点击非推荐但允许动作 | Mouse / Keyboard / Touch | 触发错误示范或普通结算 | 若是错误示范则检查点恢复 |
| 跳过教程 | Mouse / Keyboard / Touch | 确认后清空教程 | 进入正式开局四选一 |

---

## Events Fired

| Player Action | Event Fired | Payload / Data |
|---|---|---|
| 选择需要教程 | `TutorialStarted` | `stepId = intro` |
| 教程步骤完成 | `TutorialStepCompleted` | `stepId`, `actionInput` |
| 错误攻击演示 | `TutorialMistakeDemo` | `enemyId`, `damage`, `restored = true` |
| 跳过教程 | `TutorialSkipped` | `stepId` |
| 完成教程 | `TutorialCompleted` | `durationTurns`, `completedSteps` |

这些事件可先作为模拟日志或反馈事件存在，不要求首版接入外部分析。

---

## Transitions & Animations

- 教程弹窗进入：短淡入，不使用大幅位移。
- 推荐按钮：动态外框、金色微光、选择此项角标和轻微脉冲；`prefers-reduced-motion` 下改为静态强描边。
- 新情报：情报条短暂高亮 1 秒；不得只靠颜色，必须有“新情报”文字或图标标记。
- 错误攻击演示：可播放红色受击闪，但必须立即出现解释弹窗和恢复说明。

---

## Data Requirements

| Data | Source System | Read / Write | Notes |
|---|---|---|---|
| 教程偏好 | HUD localStorage | Read / Write | 不进入 `GameState` |
| 教程步骤 | `tutorialSystem` | Read / Write | 需要可复现 |
| 允许输入 | `tutorialSystem` | Read | HUD 用于高亮/禁用 |
| 教学敌人 | `GameState.map.enemies` 或等价结构 | Read / Write | 必须真实参与战斗 |
| 检查点 | `tutorialSystem` | Read / Write | 只在教程中可用 |
| 正式开局四选一 | `lootSystem` / `GameSimulation` | Write | 教程完成后生成 |

---

## Accessibility

- 所有教程按钮必须支持键盘聚焦和 Enter/Space 激活。
- 高亮推荐动作不能只依赖颜色；需要动态框选、文本提示或焦点顺序。
- 弹窗文字保持短句，避免一次解释多个系统。
- 跳过教程按钮必须可键盘到达。
- reduced motion 下关闭脉冲、震动和位移动画，保留静态高亮。

---

## Localization Considerations

教程文本最长的是机制解释句，应按 40% 文本膨胀预留高度。动作按钮仍使用短标签：进攻、防御、左闪、右闪、说服、继续战斗。结构化情报格式固定为 `属性 = 数值` 或 `下次攻击方向 = 左/右`，避免本地化后变成意图描述。

---

## Acceptance Criteria

- [ ] 首次进入时弹出是否需要教程；选择不需要后直接进入正式开局四选一。
- [ ] 选择需要教程后，玩家先进入训练场景，而不是立即开局四选一。
- [ ] 第一名教学敌人能引导玩家完成防御、读体质、理解速度/重伤风险、读方向、正确闪避、投入 3 点速度优势、击杀。
- [ ] 第二名教学敌人能引导玩家读出低智力，并支付优势说服成功。
- [ ] 任意教程步骤都能跳过，跳过后训练状态不污染正式局。
- [ ] 战斗教学完成后先显示“下面在整个迷宫中找到出口，带着道具逃离吧。”，确认后才显示开局四选一。
- [ ] 所有教学按钮可用键盘操作，推荐动作有非颜色提示和动态框选。
- [ ] reduced motion 下教程高亮仍清晰但不脉冲。

---

## Open Questions

- 第一名教学敌人是否允许携带“不掉落教学长刀”来满足总值 10 下的高伤/重伤演示，还是把教学敌人属性总值提高到 12。
- 错误攻击演示是否应该真实扣血后恢复，还是直接用弹窗说明风险并阻止提交。
