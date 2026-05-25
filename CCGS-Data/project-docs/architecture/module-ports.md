# 《照面之时》模块端口契约

版本：2026-05-21
对应规则：`CCGS-Data/design/gdd/rulebook.md` v0.8.17 脚本化战斗教学与新手开局顺序
对应实现：Phaser 3 + TypeScript + Vite

## 1. 总原则

本文件确定当前游戏文件的解耦边界。所有模块只能通过公开端口协作，禁止跨层直接修改对方内部状态。

本地开发服务固定端口：`http://127.0.0.1:5188/`。该端口只用于 Vite 以 HTTP 方式加载 TypeScript/ES Module 资源；游戏不依赖本地存档。`package.json` 的 `dev` 与 `preview` 脚本必须使用 `--port 5188 --strictPort`，避免多个项目同时运行时抢占 `5173/5174`。

v0.7.2 起，Phaser 不允许由 `src/main.ts` 静态导入。`main.ts` 必须通过动态 import 加载 `src/render/startPhaserGame.ts`，让 DOM HUD、模拟层入口和 Phaser vendor chunk 保持拆分。Vite 构建必须将 `node_modules/phaser` 命名为 `phaser-vendor`，便于区分引擎体积与游戏逻辑体积。

核心方向：

- `src/sim` 是唯一规则与状态真源。
- `src/render` 只通过只读端口读取状态并绘制。
- `src/main.ts` 只做 DOM HUD、输入绑定和模拟层命令转发。
- `src/styles.css` 只控制表现，不承载玩法含义。
- `tests` 可以直接调用模拟层端口验证规则，但不得成为运行时代码依赖。

## 2. 运行时端口

| 板块 | 文件 | 拥有内容 | 输入端口 | 输出端口 | 禁止 |
|---|---|---|---|---|---|
| Simulation Core | `src/sim/GameSimulation.ts` | 局内状态、行动推进、战斗、拾取、AI、掉落、日志、反馈事件、教程场景编排 | `SimulationCommandPort`：`move`、`choosePickup`、`useItem`、`playCombatAction`、`tryFlee`、`continueFight`、`tryPersuade`、`beginTutorialScenario`、`skipTutorialScenario`、`reset` | `SimulationReadPort`：`snapshot`、`onChange` | 禁止依赖 DOM、Phaser、CSS |
| Simulation Types | `src/sim/types.ts` | 结构化状态、道具、战斗、地图、信息类型 | TypeScript 类型导入 | 类型导出 | 禁止写运行逻辑 |
| Simulation Ports | `src/sim/ports.ts` | 模拟层公开端口定义 | 类型导入 | `SimulationReadPort`、`SimulationCommandPort`、`SimulationPort` | 禁止持有实现细节 |
| Item Data | `src/sim/items.ts` | 道具静态定义、拾取池、道具实例工厂 | `ItemId`、`InventorySlot` 类型 | `ITEMS`、`PICKUP_ITEM_POOL`、`createInventorySlot` | 禁止读取 UI 或渲染状态 |
| Item Presentation Text | `src/sim/itemText.ts` | 玩家可读道具介绍文本 | `ItemId`、`ITEMS` | `itemUiDescription(itemId)` | 禁止承载规则结算；禁止输出端口名、事件名或动画实现说明 |
| Item Balance | `src/sim/systems/itemBalanceSystem.ts` | 稀有度权重、强度评分、战利价值、敌人拾取基础评分 | `ItemDefinition`、`ItemRarity`、offer source、seed | `createWeightedItemOffer`、`itemPowerScore`、`lootValueForItem`、`enemyBaseScoreForRarity` | 禁止读取 UI/Phaser；禁止让 map/loot/GameSimulation 分散硬编码稀有度数值 |
| Item Runtime | `src/sim/systems/itemRuntimeSystem.ts` | 道具使用次数、生效端口、手动锁、效果解析 | `GameState`、使用者、道具实例、触发上下文 | 结构化道具结果、状态、情报、日志 | 禁止读取 DOM/Phaser；禁止硬编码单个道具 if 链 |
| Passive Item Rules | `src/sim/systems/passiveItemSystem.ts` | v0.8.10 被动道具触发规则表 | `PassiveTrigger`、`ItemId` | `PassiveItemRule[]` | 禁止直接修改 `GameState`；禁止读取 DOM/Phaser |
| Status Effect | `src/sim/systems/statusEffectSystem.ts` | 灼烧/中毒/流血/冻结状态 | `EncounterState.statusEffects`、行动事件 | 伤害、停滞、状态过期日志 | 禁止生成情报文本 |
| Intel Template | `src/sim/systems/intelTemplateSystem.ts` | 单体和全场情报模板 | `GameState`、目标、模板 ID | 结构化情报值 | 禁止输出态势、意图、路线或性格；方向只允许作为下一击 `attackDirection` 字段 |
| Map Data | `src/sim/map.ts` | 固定地图、边缘墙、道具节点、敌人初始状态、位置工具 | 道具工厂、类型 | `createMap`、`edgeKeyBetween`、位置工具 | 禁止读取 DOM/Phaser |
| Stats | `src/sim/stats.ts` | 属性派生、明亮视野、最高/最低属性、概率夹取 | 属性类型 | 纯函数 | 禁止持有局内状态 |
| Phaser Render | `src/render/GameScene.ts` | 画布绘制、格子地图、视野表现、单位、提示、轻量演出 | `SimulationReadPort` | Phaser 画面 | 禁止调用命令端口，禁止写规则结算 |
| DOM HUD Bridge | `src/main.ts` | HUD HTML、确认式反馈弹窗、道具情报悬浮、按钮事件、键盘输入、Phaser 启动 | 浏览器事件、`SimulationPort` | 命令调用、HUD DOM | 禁止直接修改 `GameState` 字段 |
| Phaser Bootstrap | `src/render/startPhaserGame.ts` | Phaser.Game 创建与表现层异步启动 | `SimulationReadPort` | Phaser game instance | 禁止接收 `SimulationCommandPort`，禁止写规则结算 |
| Styling | `src/styles.css` | HUD 和弹窗布局 | CSS class | 浏览器样式 | 禁止承载规则文本或隐藏玩法状态 |

## 3. 端口定义

当前代码端口位于 `src/sim/ports.ts`。

```ts
interface SimulationReadPort {
  snapshot(): GameState;
  onChange(listener: SimulationListener): Unsubscribe;
}

interface SimulationCommandPort {
  reset(seed?: string): void;
  move(dx: number, dy: number): void;
  choosePickup(itemId: ItemId | null): void;
  useItem(itemId: ItemId): void;
  playCombatAction(action: CombatAction): void;
  tryFlee(): void;
  continueFight(bonusTarget?: BonusTarget): void;
  tryPersuade(): void;
  beginTutorialScenario(): void;
  skipTutorialScenario(): void;
}
```

使用规则：

- `GameScene` 只能接收 `SimulationReadPort`。
- HUD 可以接收完整 `SimulationPort`，但只能通过命令方法改变状态。
- `snapshot()` 返回当前状态视图，调用方必须按只读使用。
- 后续若发现 HUD 或渲染需要新数据，优先扩展模拟层状态或只读查询端口，不允许从 UI 反推规则。
- 教程偏好可以保存在 HUD/localStorage；但一旦玩家选择“需要教程”，训练敌人、教程步骤、允许输入、检查点和正式开局切换必须通过模拟端口完成。

## 4. 未来拆分端口

当前 `GameSimulation` 仍是聚合实现。后续拆分时，每个系统应先定义端口再迁移逻辑。

| 系统 | 未来端口 | 输入 | 输出 |
|---|---|---|---|
| Run State | `RunStatePort` | 行动推进、撤离、失败请求 | turn、outcome、log |
| Map & Exploration | `MapPort` | 移动请求、节点清空、陷阱放置 | 地图、边缘墙可进入性、道具节点、提示 |
| Vision & Intel | `VisionIntelPort` | 单位状态、信息来源 | visible/aware/unseen、IntelEntry |
| Encounter Combat | `CombatPort` | CombatAction、优势窗口选择 | EncounterState、伤害/重伤/脱战结果 |
| Item System | `ItemPort` | itemId、owner、target、timing | 消耗、修正、掉落、日志 |
| Item Runtime | `ItemRuntimePort` | slot、owner、trigger、target、context | 可用性、消耗、主动/自动效果、同回合手动锁 |
| Status Effect | `StatusEffectPort` | statusEffects、action events | dot、冻结停滞、过期、触发事件 |
| Enemy AI | `EnemyAiPort` | 可见状态、敌人状态、道具评分、毒圈/空投提示 | 移动意图、战斗动作、拾取选择、内战目标 |
| Tutorial | `TutorialPort` | 教程开始/跳过、当前步骤、正式战斗命令 | 教程状态、允许输入、检查点恢复、完成后开局四选一 |
| Poison Ring | `PoisonPort` | turn、地图外层、单位位置 | poisonCells、毒圈伤害、避圈评分 |
| Airdrop | `AirdropPort` | turn、地图候选格、道具池 | 红点提示、额外 LootNode |
| Profile / Economy | `MetaCommandPort` + `MetaReadPort` | 创建 Profile、属性 roll、金币、仓库、商店、战备、地图档位 | ProfileState、ShopState、DeploymentState、run 启动/结算 |
| Presentation | `PresentationReadPort` | GameState | HUD view model、render view model |

## 5. 当前耦合结论

当前项目已达到原型期可接受的高解耦：

- 规则和状态集中在 `src/sim`，未写入 Phaser Scene。
- 渲染层已降级为只读端口依赖。
- HUD 通过命令端口调用模拟层，不直接改状态。
- 道具、地图、属性已经独立为数据/纯函数模块。

仍需注意：

- `snapshot()` 目前返回真实状态对象，调用方约定只读。后续进入更大规模前，应改为只读快照或 view model，避免外部误改。
- `GameSimulation` 仍聚合多个系统。下一轮扩展大量道具主动效果前，建议先拆 `itemSystem` 和 `combatSystem`。

## 6. v0.5.1 模拟层内部系统端口

外部端口保持不变：`GameSimulation` 仍实现 `SimulationPort`，渲染层仍只依赖 `SimulationReadPort`。

内部拆分新增以下模块：

| 系统模块 | 文件 | 输入 | 输出/副作用 | 禁止事项 |
|---|---|---|---|---|
| Random | `src/sim/systems/randomSystem.ts` | seed、label、turn、round | 可复现 hash/百分比/方向 | 禁止读取 `GameState` |
| Movement | `src/sim/systems/movementSystem.ts` | `GameState`、Actor、Position、可选起点 | 合法移动/边缘墙/占位判定 | 禁止写日志、禁止触发战斗 |
| Visibility | `src/sim/systems/visibilitySystem.ts` | `GameState`、revealBoost、`wallEdges` | visible/explored/hints/awareness | 禁止创建 Encounter |
| Inventory | `src/sim/systems/inventorySystem.ts` | `GameState`、Actor、Item/Slot | 背包增删与玩家背包同步 | 禁止结算掉落概率 |
| Loot | `src/sim/systems/lootSystem.ts` | `GameState`、LootNode、Enemy | 拾取 offer、敌人拾取、掉落结果 | 禁止直接调用 UI 或 Phaser |
| Enemy | `src/sim/systems/enemySystem.ts` | `GameState`、Enemy、可用性回调 | 敌人移动和行动选择 | 禁止读取玩家隐藏输入 |
| Tutorial | `src/sim/systems/tutorialSystem.ts` | `GameState`、教程开始/跳过、正式战斗命令 | 教程敌人生成、步骤推进、输入门控、检查点恢复、正式开局四选一切换 | 禁止读取 DOM/Phaser；禁止把教程伤害带入正式局 |
| Enemy Civil War | `src/sim/systems/enemyCivilWarSystem.ts` | `GameState`、敌人位置/视野/背包/生命、掉落登记 | 内战战损、击败、胜者拾取、可见日志、战斗次数增加 | 禁止打开玩家战斗面板；禁止写入玩家未观察到的完整情报 |
| Combat helper | `src/sim/systems/combatSystem.ts` | `GameState`、Actor、Target | 手枪可用性判定 | 完整伤害结算暂不在此处 |
| Item Effect | `src/sim/systems/itemEffectSystem.ts` | `ItemId`、对手 actor id、优势条件 | 结构化 `CombatItemEffectSpec` 或阻塞原因 | 禁止消耗道具、禁止写日志、禁止直接改 `EncounterState` |

`GameSimulation` 当前是编排器：负责调用这些系统、写日志、切换 encounter/outcome，并保留 `checkEncounter()` 与 `collectEnemyDrops()` 的测试兼容入口。战斗道具的普通 active effect 数值不再写在 `GameSimulation` 的 if 链中，而由 `itemEffectSystem.ts` 输出结构化规格后交给编排器消费。

## 7. v0.6.1 战斗真实情报、收束、毒圈与空投端口

本节为下一轮实装任务 4 的端口约束。规则来源为 `rulebook.md` 第 6、7、14、19、23 章；进入代码前必须先确认这些规则。

| 系统模块 | 建议文件 | 输入 | 输出/副作用 | 禁止事项 |
|---|---|---|---|---|
| Combat Round | `src/sim/systems/combatRoundSystem.ts` | `GameState`、`EncounterState`、玩家 `CombatAction`、AI `PlannedIntent` | 本回合伤害、重伤、优势、战斗结束请求 | 禁止生成 HUD 文案；禁止直接读取 DOM/Phaser |
| Combat Closure | `src/sim/systems/combatClosureSystem.ts` | 本回合结果、当前 round、优势状态、双方生命/重伤 | 第 3 回合起软收束结果、优势窗口或脱战请求 | 禁止维护独立压力状态或固定 3/4 回合硬上限 |
| Intel | `src/sim/systems/intelSystem.ts` | `GameState`、观察者、目标、`IntelSourceContext`、偏好情报类型 | 结构化 `IntelEntry[]`，只包含属性数值、道具情况或下一次攻击方向；推测必须带置信度 | 禁止输出态势、意图、路线、接触记录或预写台词；方向只允许作为下一击 `left/right` 字段 |
| Enemy Combat Intent | `src/sim/systems/enemyCombatIntentSystem.ts` | 敌人属性、可见性、已知目标、道具、毒圈/空投态势 | `PlannedIntent` 或即时动作，供 AI 内部决策使用 | 禁止把意图字段写入玩家情报列表 |
| Enemy Civil War | `src/sim/systems/enemyCivilWarSystem.ts` | 敌人位置、视野、道具、生命、玩家可见性 | 敌人内战结果、战损、遗物、胜者拾取成长、日志可见级别 | 禁止打开玩家战斗面板；禁止泄露玩家未观察到的完整战斗数据 |
| Poison Ring | `src/sim/systems/poisonSystem.ts` | turn、地图尺寸、当前 poison level、单位位置 | 新毒圈格、毒圈伤害、AI 避圈评分 | 禁止作为固定生存回合失败条件 |
| Airdrop | `src/sim/systems/airdropSystem.ts` | turn、地图候选格、道具池、毒圈状态 | 空投 LootNode、红点提示、日志 | 禁止生成在不可进入或已毒圈覆盖的优先点位，除非无安全点 |

对外 `SimulationPort` 暂不新增命令。`playCombatAction()` 仍是玩家战斗动作入口；新增系统只改变 `src/sim` 内部编排。

UI/HUD 只能读取这些结构化字段：

- `EncounterState.round`：当前动作回合编号。
- `IntelEntry.payload`：只显示具体属性数值、具体道具、剩余次数、未见道具或下一次攻击方向 `left/right`。
- `IntelEntry.certainty`：区分确认情报与推测情报。
- `RunState.poison`：显示毒圈层数、下次收缩回合、毒圈格。
- `RunState.airdrops` / `LootNode.source`：显示空投红点和空投风险。

实现验收时需要确认：战斗 UI 不再显示固定 `x/3`、`x/4` 或额外压力字段；普通智力角色一次有效防御应能得到至少 2 点可行动情报；成功躲闪至少获得 1 点情报；多数遭遇约 3 回合出现击败、优势窗口、逃跑、说服或脱战；毒圈、空投和敌人内战只由 `src/sim` 结算。

## 8. v0.6.5 随机编织边缘墙地图端口

本轮扩展 `SimulationPort.reset(seed?: string)`，并将地图墙线从固定蛇形改为当前局 seed 生成。

| 系统模块 | 文件 | 输入 | 输出/副作用 | 禁止事项 |
|---|---|---|---|---|
| Map Data | `src/sim/map.ts` | 当前局 seed、固定内容布局、30 个节点、15 名敌人 | `MapState.tiles`、随机编织 `MapState.wallEdges`、起点、道具节点、敌人 | 禁止用 `wall` tile 表达阻挡 |
| Movement | `src/sim/systems/movementSystem.ts` | `GameState`、目标格、可选起点格 | `canEnter`、`hasWallBetween`、AI/玩家单步移动 | 禁止绕过 `wallEdges` 直接移动 |
| Visibility | `src/sim/systems/visibilitySystem.ts` | `GameState`、起点、终点、`wallEdges` | 横纵/斜向一次拐角视线结果 | 禁止读取旧墙格或只靠 UI 判断遮挡 |
| Render | `src/render/GameScene.ts` | `SimulationReadPort.snapshot().map.wallEdges` | 格边墙线、外框、地面内容 | 禁止把墙线当作规则真源 |

新增内部约定：

- 垂直边键 `v:x,y` 表示 `(x-1,y)` 与 `(x,y)` 之间的墙。
- 水平边键 `h:x,y` 表示 `(x,y-1)` 与 `(x,y)` 之间的墙。
- 外边界不进入 `wallEdges`，由越界检查和渲染外框共同处理。
- 道具节点、出口、陷阱、毒圈、空投和单位仍是格子内容。
- 随机编织迷宫生成必须保证同 seed 可复现、不同 seed 墙线不同、每格至少 1 面墙、开放方向为 2-3、最长直线开放段不超过 4、所有初始节点和敌人可达。
- 敌人初始巡逻点必须基于生成后的开放边生成或校正，禁止假设固定横向通道存在。

## 9. v0.6.6 视野压缩与反馈演出端口

本轮新增只读反馈事件，不新增玩家命令。

| 系统模块 | 文件 | 输入 | 输出/副作用 | 禁止事项 |
|---|---|---|---|---|
| Stats | `src/sim/stats.ts` | `StatBlock` | `visionRadius`、`brightVisionRadius` | 禁止读取局内状态 |
| Visibility | `src/sim/systems/visibilitySystem.ts` | `GameState`、viewer、target、revealBoost | 玩家亮区、玩家/敌人可见状态 | 禁止创建 HUD 弹窗 |
| Feedback | `src/sim/GameSimulation.ts` | 遇敌、战斗回合结算、优势结果 | `GameState.feedbackEvents` | 禁止读取 DOM/Phaser |
| DOM Overlay | `src/main.ts` | `feedbackEvents` 最新项、`EncounterState.activeEffects`、`IntelEntry.itemId` | 点击确认关闭的反馈弹窗、生效中道具条、道具情报悬浮说明 | 禁止回写或清空模拟状态 |
| Phaser Cue | `src/render/GameScene.ts` | `feedbackEvents` 最新项 | flash / shake / 轻量镜头反馈 | 禁止改变玩法状态 |

`FeedbackEvent` tone 约定：`neutral` 用于正常照面/僵持，`advantage` 用于我方优势、击杀、治疗生效，`danger` 用于受击/敌方优势/重伤/枪击/敌人逃跑，`intel` 用于情报获得与声波侦察。HUD 必须用文本表达结果，tone 只作为视觉辅助。v0.6.8 起，战斗反馈弹窗必须由玩家确认关闭；v0.8.6 起 HUD 必须按本地队列逐条展示 `encounter / combat-round / enemy-flee / enemy-defeated / loot-drop / persuasion-intel`；v0.8.7 起还必须展示或传递 `item-heal / echo-pulse / gunshot`。弹窗存在时，HUD 桥接层暂缓移动、战斗动作和道具按钮输入。

`FeedbackEvent` 位置字段约定：`origin` 表示动画起点，`target` 表示枪击等点对点动画终点，`positions` 表示回声针四格回响区。`GameSimulation` 只写这些结构化字段；`GameScene` 只读字段播放程序化动画，不得回写玩法状态。

`EncounterState.activeEffects` 由模拟层写入和消耗；HUD 只能读取并显示“道具正在生效”。道具情报 hover 只能通过 `IntelEntry.itemId -> itemUiDescription(itemId)` 读取玩家可读说明，并通过 `ITEMS[itemId].counterplay` 读取反制，不允许在 DOM 中手写另一份道具效果。

v0.7.1 起，优势联动道具仍归 `Item Data` 定义，玩家使用入口仍为 `SimulationCommandPort.useItem(itemId)`，敌人使用入口只允许通过 `Enemy AI -> GameSimulation.resolveActionRound` 的 `CombatAction { type: "useItem" }` 进入模拟层。HUD 不得自行判断敌人是否能用优势道具。

## 10. v0.8 局内道具运行时端口

本轮新增的道具能力必须先写入 `ItemDefinition.usage`、`ItemDefinition.ports` 和 `ItemDefinition.effects`，再由运行时系统解释。旧字段只作为兼容显示，不再作为新增效果的主要真源。

| 端口 | 文件 | 输入 | 输出 | 禁止事项 |
|---|---|---|---|---|
| Runtime Resolve | `src/sim/systems/itemRuntimeSystem.ts` | `GameState`、actor、slot、trigger context、target | 可用性、消耗、active effect、status effect、情报、日志 | 禁止直接改 DOM/Phaser |
| Manual Lock | `itemRuntimeSystem.ts` | slot、当前 turn/round | 是否可手动使用、置灰原因、标记本回合已用 | 禁止使用角色级总次数替代实例级锁 |
| Passive Trigger | `src/sim/GameSimulation.ts` + `itemRuntimeSystem.ts` | `combatStart`、`firstRound`、`secondRound`、`thirdRoundPlus`、`onStatusApplied`、`onCrit`、`onDefendedHit` | active effect、status effect、战斗日志 | 禁止由 HUD/Phaser 触发；必须共享 5 次触发链上限 |
| Status Resolve | `src/sim/systems/statusEffectSystem.ts` | `EncounterState.statusEffects`、行动事件 | 灼烧/中毒/流血/冻结结算与过期 | 禁止写预设情报文本 |
| Intel Template | `src/sim/systems/intelTemplateSystem.ts` | `GameState`、template id、目标 | 运行时计算出的数值/道具/下一击方向情报 | 禁止硬编码数值和态势描述 |

v0.8 兼容约定：

- `SimulationCommandPort.useItem(itemId)` 不新增参数；当前原型仍默认选择第一个合法目标。
- v0.8.1 新增道具必须同步更新 `ItemId`、道具数据、拾取池、图标映射、运行时效果、敌人 AI 候选和内容审查测试。
- v0.8.2 起，`ItemDefinition.rarity` 必须为 `common | uncommon | rare`；强度评分、拾取权重、玩家战利价值和敌人拾取基础评分都由 `itemBalanceSystem.ts` 输出。
- 普通拾取 offer 由 `createWeightedItemOffer(..., "map")` 生成，权重为 `72/23/5`；未来空投使用 `"airdrop"`，权重为 `45/40/15`。
- `signal-flare` 的持续时间由模拟层显式计数 2 回合，视野系统只接收最终 reveal boost 数值，不维护持续状态。
- HUD 桥接层只可读取 `ItemDefinition.rarity` 并透传为 `data-rarity`；具体边框色归 `src/styles.css`，不得在 HUD 里硬编码稀有度收益或抽取权重。
- HUD 桥接层显示道具功能时必须调用 `itemUiDescription(itemId)`；`ItemDefinition.description` 保留给规则/审查语境，不直接用于拾取卡片、背包 title、情报 hover、状态条 title 或拾取日志。
- v0.8.7 起 `rare` 边框色采用橙色视觉；绷带与回声针必须以 `rarity = "rare"` 进入拾取、背包和情报悬浮 UI。
- v0.8.3 新增交叉端口道具必须同步更新 `ItemId`、`ITEMS`、`PICKUP_ITEM_POOL`、`itemBalanceSystem` 强度表、`itemEffectSystem` 主动效果表、`Enemy AI` 候选、`gridDungeonAssets` 映射与内容审查测试。状态转化类被动只能通过 `GameSimulation` 的战斗事件桥接触发，不允许在 HUD 或 Phaser 层触发。
- v0.8.4 新增治疗道具必须同步更新 `ItemId`、`ITEMS`、`PICKUP_ITEM_POOL`、稀有度评分、图标映射、敌人 AI 治疗候选和自动化测试。主动道具默认可复用，使用成本必须通过 `inventorySystem` 的 usage 结算端口，不得在 HUD 或渲染层移除道具。敌人移动必须通过 `enemySystem` 的可达寻路端口调用 `movementSystem`，不得在调用处自行穿墙或原地贪心卡死。
- v0.8.9 起非 `rare` 主动/反应道具若没有显式次数，默认由 `items.ts` 赋予 `charges-destroy`：`common 2`、`uncommon 3`；新增被动链道具必须覆盖 `combatStart / firstRound / secondRound / thirdRoundPlus / onStatusApplied / onCrit / onDefendedHit` 中的至少一个端口，并可由玩家和敌人共同触发。
- v0.8.10 起新增 50 件网状被动道具统一放入 `passiveItemSystem.ts` 的规则表。`GameSimulation` 只在真实战斗事件发生后调用规则表并应用结构化效果；不得在 HUD、Phaser 或道具卡片里补写隐藏结算。
- v0.8.5 新增 `IntelEntry.kind = "attackDirection"`，只用于战斗内下一次攻击方向。v0.8.6 起该字段必须读取 `EncounterState.attackDirectionIndex / attackDirections` 中当前未消耗的下一击序列值，不能由 HUD 文案或 round 推断；该次真实攻击结算后过期或被下一条方向情报替换。
- HUD 只能通过 `InventorySlot.lastManualUseRound` 或等价只读状态决定置灰，不允许自己推导规则。
- `EncounterState.activeEffects` 用于数值修正；`EncounterState.statusEffects` 用于灼烧、中毒、流血、冻结。
- 自动触发链计数保存在 encounter 内部或本回合解析上下文中，每战斗回合全场最多 5 次。
