# 《照面之时》系统落地框架

版本：v0.8.17，对应规则书 v0.8.17 与 `combat-system.md` 脚本化教学补充
用途：把规则拆成可直接实现的数据、流程、模块和待确认问题。本文不替代规则书与 `combat-system.md`；规则书决定玩法，`combat-system.md` 决定照面战斗验收，本文帮助代码落地。

## 1. 设计原则

战斗由“视野 + 信息 + 博弈”构成。

- 视野决定是否能先手、远程攻击、进入照面、被偷袭。
- 信息决定玩家是否知道敌人的属性数值、道具情况和战斗内下一次攻击方向。
- 博弈决定在有限信息下选择进攻、防御、躲闪、逃跑、说服或使用道具。

代码边界：

- `sim` 拥有规则、状态、结算和随机。
- `render` 只表现地图、单位、提示和动画。
- DOM HUD 只派发输入和展示可见状态，不直接改规则。

## 2. 建议模块拆分

后续实装建议把当前 `GameSimulation` 拆成以下系统：

- `statsSystem`：属性、派生值、临时修正、debuff。
- `visionSystem`：视野半径、边缘墙遮挡、可见/察觉状态、视野领先。
- `intelSystem`：已知信息、信息获取、推测/确认信息。
- `combatSystem`：照面创建、动作选择、先后手、伤害、重伤、优势资源。
- `itemSystem`：道具定义、三选一刷新、拾取、使用、放置、掉落、AI 持有道具。
- `itemBalanceSystem`：道具稀有度权重、强度评分、战利价值、敌人拾取基础评分。
- `itemRuntimeSystem`：解析道具使用次数、生效端口、手动使用锁、效果触发链和结构化结果。
- `passiveItemSystem`：保存 v0.8.10 被动网状道具的触发规则表；只输出结构化规则，不直接修改 `GameState`。
- `statusEffectSystem`：结算灼烧、中毒、流血、冻结等战斗状态。
- `intelTemplateSystem`：输出单体属性/道具/下一击攻击方向情报和全场变量情报模板。
- `enemySystem`：敌人属性预算、行为倾向、巡逻、避圈、拾取成长、战斗 AI、敌人内战。
- `tutorialSystem`：教程选择后的训练场景、固定敌人、脚本动作、输入门控、检查点恢复和正式开局切换。
- `mapSystem`：格子、道具节点、出口、陷阱、红光提示、噪音、毒圈格、空投点。
- `poisonSystem`：每 20 回合向内收缩地图外层、结算毒圈伤害、给 AI 提供避圈评分。
- `airdropSystem`：每 15 回合生成额外 LootNode、红点提示和争夺目标。
- `rng`：固定 seed 随机，保证可复现调参。

第一阶段不需要一次性拆完文件，但数据结构应按这些边界设计。

## 2.1 MVP Run State 与地图闭环

规则书 v0.4 补齐了局内闭环，实装时需要先确保一局可被模拟层完整推进。

最小状态：

```ts
type RunOutcome = "inProgress" | "extracted" | "failed";

type RunState = {
  seed: number;
  turn: number;
  outcome: RunOutcome;
  extractAt?: number;
  failReason?: string;
  poison: PoisonState;
  airdrops: AirdropState;
};

type PoisonState = {
  level: number;
  nextCollapseTurn: number;
  damagePerTurn: number;
  cells: Position[];
};

type AirdropState = {
  nextDropTurn: number;
  activeDropIds: string[];
};
```

地图 MVP 要求：

- 由当前局 seed 生成，保证同 seed 完全复现，不同 seed 墙线不同。
- 至少包含起点、出口、30 个初始道具节点、15 名初始敌人和 1 条绕路分支。
- 格子内容与墙体阻挡分离：`TileKind` 只表达 `floor | exit`，墙体只存在于 `wallEdges`。
- `wallEdges` 使用规范化边键：`v:x,y` 表示 `(x-1,y)` 与 `(x,y)` 之间的墙，`h:x,y` 表示 `(x,y-1)` 与 `(x,y)` 之间的墙。
- 外边界自动视为墙；渲染层绘制边框，模拟层用越界检查阻挡。
- 生成后每个格子至少有 1 面墙，每个可进入格有 2-3 个可通行方向，避免死路和全开放大厅。
- 任一横向或纵向连续直线开放段不得超过 4 个连续开放边，避免整排大长条道路。
- 玩家站在出口格时，模拟层提供 `canExtract`。
- 玩家生命为 0，或被敌人、边缘墙与毒圈共同封死且无法移动时，模拟层设置 `outcome = "failed"` 并写入 `failReason`。

长期压力 MVP 要求：

- 没有固定生存回合上限。
- 每 20 回合毒圈收缩 1 层，毒圈格内单位行动结算后受到 5 点伤害。
- 每 15 回合生成 1 个空投 LootNode，并通过红点提示。
- v0.6.7 起删除全局危险数值和危险格；左轮、报警、说服失败等只保留直接效果、日志、情报和位置提示。

## 3. 属性系统

### 3.1 核心属性

使用统一属性块：

```ts
type StatKey = "spirit" | "intellect" | "strength" | "speed" | "constitution";

type StatBlock = Record<StatKey, number>;
```

默认范围：

- 玩家和普通敌人：1-6。
- 普通人基准：3。
- 普通敌人总点数：15。
- 精英敌人总点数：18。

### 3.2 派生值

派生值不要存死，优先由属性和修正计算：

```ts
type DerivedStats = {
  maxHp: number;
  visionRadius: number;
  brightVisionRadius: number;
  meleeDamage: number;
  heavyWoundThreshold: number;
  basePersuasion: number;
};
```

默认公式：

- `maxHp = 6 + constitution * 2`
- `visionRadius = 2 + floor(spirit / 2)`
- `brightVisionRadius = max(1, floor(visionRadius / 2))`
- `meleeDamage = 2 + floor(strength / 2) + weaponDamageBonus`
- `heavyWoundThreshold = 4 + floor(constitution / 2)`
- `basePersuasion = intellect + confirmedIntelCount`
- `lootDropBonus = max(0, spirit - 3) * 2`

### 3.3 修正来源

所有修正都应结构化，避免散落在结算代码里。

```ts
type StatModifier = {
  sourceId: string;
  stat?: StatKey;
  derived?: keyof DerivedStats;
  amount: number;
  duration: "run" | "encounter" | number;
};
```

常见来源：

- 道具数值提升。
- 视野领先第一攻速度 +2。
- 长刀初见第一攻速度 +2。
- 支付 1 点优势继续战斗时，下一动作回合在近战伤害 +1 或速度 +1 中二选一；同场照面多点优势可分次支付并叠加。
- debuff 降低速度、视野或攻击。

## 4. 单位状态

玩家和敌人应尽量共用同一套单位结构。

```ts
type ActorState = {
  id: string;
  name: string;
  faction: "player" | "enemy";
  position: Position;
  previousPosition: Position;
  facing: Direction;
  stats: StatBlock;
  hp: number;
  combatCount: number;
  inventory: ItemInstance[];
  modifiers: StatModifier[];
  debuffs: DebuffState[];
  awareness: AwarenessState;
  aiState?: "patrol" | "seekLoot" | "huntPlayer" | "recover" | "duel";
  defeated: boolean;
};
```

这样左轮、绷带、陷阱、眼镜等规则可以同时适用于玩家和敌人。

## 5. 视野系统

### 5.1 状态定义

```ts
type VisibilityLevel = "unseen" | "aware" | "visible";

type ActorVisibility = {
  viewerId: string;
  targetId: string;
  level: VisibilityLevel;
  hasLineOfSight: boolean;
  distance: number;
  reason: "sight" | "noise" | "trap" | "damage" | "memory";
};
```

玩家看到敌人和敌人看到玩家必须分开计算，因为它们可能不对称。

### 5.2 判定流程

每个行动回合后执行：

1. 根据精神计算基础视野半径和玩家明亮视野半径。
2. 玩家作为观察者时使用明亮视野半径；敌人作为观察者时使用基础视野半径。
3. 检查边缘墙或障碍是否阻挡。
4. 检查照明、红光、陷阱、噪音等额外来源。
5. 得出每对单位之间的 `VisibilityLevel`。
6. 若一方 `visible`，另一方不是 `visible`，记录视野领先。

### 5.3 实装默认

为了第一版落地，建议默认：

- 视野距离用曼哈顿距离。
- 边缘墙遮挡用简单直线检测：横向/纵向逐格检查跨过的相邻边。
- 斜向视线沿用一次拐角窥视规则：水平后垂直或垂直后水平至少一条路径没有边缘墙，即视为可见。
- 先不做扇形视野，朝向只影响远程/陷阱提示，后续再扩。
- `aware` 不允许直接攻击，只允许显示方位提示或触发搜索/戒备行为。
- `visible` 才允许远程攻击、主动照面、明确识别位置。

### 5.5 v0.6.6 明亮视野压缩

- `updateVisibilityState()` 写入 `state.map.visible` 时使用玩家 `brightVisionRadius + revealBoost`。
- `getVisibility(state, state.player, enemy)` 使用玩家 `brightVisionRadius`，因此玩家主动看见敌人的范围被压缩。
- `getVisibility(state, enemy, state.player)` 使用敌人 `visionRadius`，敌人视野不因玩家明亮视野压缩而削弱。
- Phaser 的视野圈必须从 `calculateDerivedStats(state.player.stats).brightVisionRadius` 读取，不允许手写旧公式。

### 5.4 视野领先结算

当 A `visible` B，B 对 A 不为 `visible`：

- A 获得 1 点 `advantage.playerPoints` 或 `advantage.enemyPoints`，并记录最新优势来源。
- A 第一攻速度 +2。
- 若 A 有可用远程攻击，可执行一次远程先手。
- B 受到攻击或噪音后，至少变为 `aware`。

这里需要避免“连续白打”。远程先手默认每次遭遇只触发一次。

## 6. 信息系统

信息系统必须产出结构化真实情报，而不是预写文本。

### 6.1 数据结构

```ts
type IntelKind =
  | "statExact"
  | "itemExact"
  | "attackDirection";

type IntelCertainty = "confirmed" | "suspected";

type IntelPayload =
  | { kind: "statExact"; stat: StatKey; value: number }
  | { kind: "itemExact"; itemId?: ItemId; charges?: number; durability?: number; noneVisible?: boolean }
  | { kind: "attackDirection"; direction: "left" | "right"; round: number };

type IntelEntry = {
  targetId: string;
  kind: IntelKind;
  payload: IntelPayload;
  certainty: IntelCertainty;
  source: "sight" | "defend" | "dodge" | "item" | "trap" | "persuasion" | "visionLead";
  roundSeen: number;
  validUntilRound?: number;
};
```

实现原则：
- `confirmed` 情报只从 `ActorState`、`InventorySlot` 和当前照面的攻击方向序列读取。
- `suspected` 情报必须带 `confidence`，并按可信率决定读取真实数值/道具还是生成同格式随机数值/道具。
- UI 文案可以本地化，但不得替代结构化字段；情报列表禁止出现态势、意图、路线或接触记录文本。攻击方向只允许作为下一次真实攻击的 `attackDirection: left | right` 结构化字段出现，该次攻击消耗后过期。
- 同一字段重复获得时，优先更新过期状态或具体次数，不重复刷日志。

### 6.2 情报预算

```ts
type IntelSourceContext = {
  source: IntelEntry["source"];
  viewer: ActorState;
  target: ActorState;
  advantageBonus?: number;
  itemBonus?: number;
  interferencePenalty?: number;
};
```

`intelBudget = viewer.stats.intellect + sourceBonus + itemBonus + advantageBonus - interferencePenalty`

预算到情报点：0-2 => 0，3-4 => 1，5-6 => 2，7-8 => 3，9+ => 4。

来源修正默认：首次看见 +1；视野领先 +2；有效防御 +3；成功躲闪直接至少 1 点且修正 +2；对方使用道具 +3；陷阱直接给 1 条；说服成功直接给 1-2 条。战斗内单体情报只能产出 `statExact`、`itemExact` 或 `attackDirection`；不得产出 AI 意图、路线、性格或态势文本。

### 6.3 情报选择器

新增 `intelSystem` 时建议暴露：

```ts
type IntelSystem = {
  calculateIntelPoints(context: IntelSourceContext): number;
  revealIntel(options: { state: GameState; target: ActorState; points: number; preferredKinds?: IntelKind[] }): IntelEntry[];
  markIntelExpired(state: GameState, targetId: string, predicate: (entry: IntelEntry) => boolean): void;
};
```

优先级：
1. 当前能反制的确定威胁，例如左轮、速度、力量、体质。
2. 玩家主动指定的情报类别。
3. 未知的具体属性或具体道具。
4. 若确认字段已穷尽，可生成带 `confidence` 的数值/道具推测。
## 7. 战斗系统

### 7.1 遭遇状态

```ts
type EncounterPhase = "chooseAction" | "advantageWindow" | "ended";

type PlannedIntent = {
  actorId: string;
  action: CombatAction;
  locked: boolean;
  confidence?: number;
  validUntilRound: number;
  invalidatesWhen: Array<"targetLost" | "noAmmo" | "heavyWound" | "itemLost" | "outOfRange">;
};

type EncounterState = {
  enemyId: string;
  enemyName: string;
  round: number;
  phase: EncounterPhase;
  plannedIntents: Record<string, PlannedIntent | undefined>;
  visibility: {
    playerToEnemy: VisibilityLevel;
    enemyToPlayer: VisibilityLevel;
  };
  advantage: AdvantageState;
  visionLeadOwner?: "player" | "enemy" | null;
  log: CombatLogEntry[];
};
```

### 7.2 回合流程

1. 刷新视野。
2. 处理已锁定 intent；无效时清除并重新决策。
3. 玩家选择动作，AI 选择或执行 intent。
4. 结算速度、命中、防御、躲闪、伤害、重伤和道具。
5. 触发情报系统，写入结构化 `IntelEntry`。
6. 结算优势。
7. 执行战斗收束检查。

### 7.3 收束检查

取消独立战斗压力数值。收束检查由动作回合结果直接触发，不在 UI 中显示额外压力资源。

每回合结束时先检查硬结果：

1. 生命归零。
2. 重伤造成者获得 1 点优势资源；若该重伤来自基础近战 `Attack` 打进 `Defense`，且防御者没有生命归零，则仍由防御者获得有效防御优势。
3. 已有优势资源者可在之后任意可操作时机支付优势。

第 3 个动作回合结束后，若没有硬结果，执行软收束：

1. 有效防御者获得 1 点优势资源；基础近战 `Attack` 打进 `Defense` 时直接标记有效防御，不再按减伤量或重伤结果判定。
2. 成功躲闪者获得 1 点优势资源。
3. 造成未被有效防御压低的显著伤害者获得 1 点优势资源；基础近战打进防御时，攻击方不得因防御后伤害进入显著伤害收束。
4. 生命更高者获得 1 点优势资源。
5. 速度更高者获得 1 点优势资源。
6. 仍无法区分时双方后退脱战，回到非战斗状态。

实现时不要显示固定 `x/4` 或“压力 P”，只显示“轮次 N”和双方优势点数。
## 8. 道具落地框架

道具定义需要拆成“静态定义”和“实例状态”。

```ts
type ItemDefinition = {
  id: string;
  name: string;
  rarity: "common" | "uncommon" | "rare";
  category: "damage" | "survival" | "intel" | "utility";
  useContext: "field" | "combat" | "both" | "passive";
  timing: "active" | "reaction" | "passive";
  tags: ItemTag[];
  maxCharges?: number;
  durationTurns?: number;
  trigger?: string;
  effectKey: string;
  counterplay: string;
};

type ItemInstance = {
  instanceId: string;
  definitionId: string;
  ownerId?: string;
  position?: Position;
  charges?: number;
  durability?: number;
  usedFlags: Record<string, boolean>;
};

type LootNode = {
  id: string;
  position: Position;
  offerItemIds: [ItemId, ItemId, ItemId];
  depleted: boolean;
  source: "map" | "airdrop";
  visibleHint?: "redDot";
};

type PendingPickupOffer = {
  nodeId: string;
  itemIds: [ItemId, ItemId, ItemId];
};
```

当前重点道具：

- 道具节点：玩家踩到后生成/显示 3 选 1，选择不额外推进回合，未选项移除。
- 空投：每 15 回合生成额外 LootNode，`source = "airdrop"`，地图显示红点提示，稀有道具权重略高。
- AI 拾取：敌人踩到未清空节点时自动选 1 件并清空节点。
- 左轮·卑劣的正义：远程攻击，6 次，视野内 4 格，命中 3 伤害；防御不能减免，仅明确远程减伤道具可抵消；战斗外也可对可见且射线合法的敌人开火；不修改全局危险；真实开火后向 `feedbackEvents` 推送 `gunshot`，由 Phaser 画枪口火光和弹道线。
- 长刀·光子切：战斗中支付优势的 rare 主动道具。优势 1-2 时支付 1 点造成 2 伤害；优势 3+ 时支付全部优势并造成 `支付优势 x 3` 伤害；使用 `HIT` 附魔模板。
- 飞刀/长刀投掷：战斗外和战斗中都可对视野内 2 格、射线合法目标使用；场外使用后推进 1 个探索回合。
- 绷带：橙色 rare；仅战斗外使用，回复 3 生命；成功回血后向 `feedbackEvents` 推送 `item-heal`，由 DOM 确认弹窗播放窗口级回血脉冲，Phaser 可播放角色治疗脉冲。
- 长刀：初见第一攻速度 +2，近战伤害 +1；可投掷为 2 格飞刀，投出后失去装备效果。
- 陷阱：放置后成为地图实体，触发后报警、红光、揭示位置和 1 条信息。
- 眼镜：躲闪成功后揭示对方 1 件道具。
- 照明棒：短时扩大视野。
- 回声针：橙色 rare；无限使用。每次成功释放花费 1 个探索回合，不再输出方向/距离文字，改为向 `feedbackEvents` 推送 `echo-pulse`，并把最近未清空道具节点或 AI 所在的 `2x2` 四格回响区写入 `MapState.hints` 与反馈事件 `positions`。
- 绷带：橙色 rare；无限使用。仅限战斗外，成功治疗花费 1 个探索回合并推送 `item-heal` 反馈；满血或战斗中使用失败时不推进回合。
- 旧弹夹：橙色 rare；无限使用。仅在战斗外启动，两段式换弹共花费 2 个探索回合；每个换弹回合后都执行敌人移动、拾取、视野、陷阱和照面检查。任一阶段进入照面则换弹失败，不补弹。
- 优势联动战斗道具：肋钩、绊踝线、追步刺、反压铁片、压胆钉、定神线，以及钩绳、烟雾球、夹板、冷凝钉、压力绷带。玩家支付 1 点优势使用；敌人可在敌方优势资源或 `enemyBonus` 存在时使用；效果统一写入 `EncounterState.activeEffects`。
- 掉落：敌人被击败时，`rare` 不参与保底，也不使用 35% 普通掉落检定；每件 rare 候选独立 8% 掉落，且不得突破 `rareItemAppearances` 中同物品每局 2 个的可见出现上限。`nonRare` 候选仍保底 1 件，其余按 35% 独立检定补充，最多 2 件，5% 概率额外 1 件，并保留 charges/durability/usedFlags；若无候选，生成“未发现可回收道具”反馈。

## 9. AI 与平衡落地

### 9.1 属性预算

普通敌人：

- 总点数 15。
- 单项 1-5。
- 至少 1 个强项和 1 个弱项。

精英敌人：

- 总点数 18。
- 单项 2-6。
- 至少 1 个明显强项。

### 9.2 AI 决策输入

AI 决策不应读玩家隐藏信息，除非它已通过视野或信息系统获得。

AI 可以使用：

- 自己的可见状态。
- 自己已知的玩家信息。
- 自己的属性倾向。
- 自己携带的道具。
- 当前优势归属。
- 当前生命。
- 当前毒圈格、下次收缩回合和安全路径。
- 空投红点提示。
- 自己记忆中遇见过的其他敌人位置和状态。

### 9.3 行为倾向

敌人没有固定种类字段，名称由 seed 生成稳定混合姓名。行为由属性、道具、生命、优势、视野态势和 `combatCount` 即时推导。

- 高速度：偏进攻、躲闪、追击和逃跑。
- 高体质：偏防御、续战和压迫。
- 高精神：偏利用视野领先、远程先手、巡逻追踪；玩家高精神还提供初见确认情报和击败掉落率小幅提高。
- 高智力：偏读信息、说服、识破陷阱和选择反制道具。
- 高力量：偏进攻制造重伤。
- 持有治疗/防护道具：低生命或劣势时优先自保。
- 持有远程道具：仅在 `visible`、射线清晰且有弹药时使用。
- 毒圈威胁：优先离开毒圈或避免进入即将收缩的外层。
- 空投争夺：状态良好或装备较弱时更愿意靠近红点。

战斗动作选择使用 seed 决定的加权状态机：

- `recover`：低血量/重伤，治疗、防御、躲闪权重上升。
- `rangedPressure`：有可用远程与射线，远程权重上升。
- `advantagePress`：敌方拥有可支付优势或优势修正后，进攻、远程、压制道具权重上升。
- `advantagePress` 或存在 `enemyBonus`：敌人若持有优势联动道具，可优先使用道具把优势转为下一动作回合修正。
- `skirmish`：高速或信息不足时，进攻/躲闪/防御混合。
- `guarded`：高体质/高智力时，防御和反制道具权重上升。
- `default`：按属性基础权重混合选择。

随机权重必须使用 `seed + turn + enemyId + round`，确保回归测试可复现。

### 9.4 拾取成长

敌人每次移动后检查所在格：

- 若所在格存在未清空 `LootNode`，AI 从 `offerItemIds` 中选择评分最高的 1 件。
- 若未追踪玩家、未处于低血量后撤，AI 可进入 `seekLoot`，朝可达的近处未清空 `LootNode` 移动。
- 评分优先级：可立即使用的保命道具 > 弥补最低属性/短板的道具 > 强化最高属性/当前战法的道具 > 支付价值。
- 选择后节点 `depleted = true`，其余候选移除。
- 普通敌人持有上限 4 件，精英上限 5 件；超过时替换最低评分或 0 充能道具。
- 若看见空投红点，AI 可将空投视为高价值移动目标，但路径评分必须避开毒圈。

### 9.5 掉落

敌人被击败时由模拟层一次性结算：

- 跳过 `charges <= 0`、`durability <= 0` 或 `usedFlags.broken = true` 的道具。
- 若候选不为空，先保底选择 1 件；其余候选执行固定 seed 掉落检定：35% 成功。
- 默认最多 2 件；额外检定 5% 成功时上限变为 3。
- 掉落实例必须保留 `charges`、`durability`、`usedFlags`。
- MVP 直接把玩家击败敌人的掉落加入玩家背包，并生成 `loot-drop` 确认反馈；后续若改成地面掉落，需新增地面道具实体。

### 9.6 敌人内战

新增 `enemyCivilWarSystem` 时建议暴露：

```ts
type EnemyCivilWarSystem = {
  findEnemyConflicts(state: GameState): EnemyConflict[];
  resolveEnemyConflict(state: GameState, conflict: EnemyConflict): EnemyConflictResult;
};

type EnemyConflict = {
  attackerId: string;
  defenderId: string;
  trigger: "adjacent" | "visibleRanged";
  observedByPlayer: boolean;
};

type EnemyConflictResult = {
  defeatedIds: string[];
  woundedIds: string[];
  spoils: ItemInstance[];
  lootedBy?: string;
  logVisibility: "full" | "directionOnly";
};
```

实现要求：

- 内战使用同一套属性、道具、伤害、重伤和掉落规则。
- 每对敌人每回合最多结算一次；发生内战时双方 `combatCount +1`。
- 玩家未看见时，不泄露完整数据，只写方向/声音提示。
- 胜者按道具评分拾取遗物，仍受持有上限限制。
- 道具实例状态必须真实保留，例如弹药、耐久、已触发状态。

## 9.7 毒圈与空投落地

```ts
type PoisonSystem = {
  collapseIfDue(state: GameState): Position[];
  applyPoisonDamage(state: GameState, actorId: string): PoisonDamageResult | undefined;
  scorePoisonRisk(state: GameState, position: Position): number;
};

type AirdropSystem = {
  spawnIfDue(state: GameState): LootNode | undefined;
  chooseDropPosition(state: GameState): Position;
};
```

实现要求：

- `collapseIfDue` 每 20 行动回合把最外层非毒圈变成毒圈。
- `applyPoisonDamage` 在单位行动结算后触发，默认 5 伤害。
- `scorePoisonRisk` 供敌人移动评分使用，已毒圈格应高惩罚，即将收缩层应中惩罚。
- `spawnIfDue` 每 15 行动回合生成 `source = "airdrop"` 的 LootNode，并写入红点提示。

## 10. 推荐实装顺序

第一步：属性与单位统一

- 新增 `StatBlock`、`ActorState`、派生值计算。
- 玩家和 AI 都走同一套属性/生命/背包结构。

第二步：视野系统

- 实现 `unseen / aware / visible`。
- 实现精神视野半径。
- 实现视野领先和远程先手触发。

第三步：战斗新状态机

- 替换旧 `Attack / Guard / Trick`。
- 实现进攻、防御、左右躲闪。
- 实现优势资源、逃跑拉开 1 格。

第四步：信息系统

- 实现已知信息列表。
- 防御、躲闪、眼镜、陷阱能揭示信息。
- UI 区分已知和未知。

第五步：道具与敌人预算

- 左轮、绷带、长刀、陷阱、眼镜与小收益道具数据。
- 地图生成 `LootNode` 三选一。
- 敌人生成属性、携带道具、局内拾取成长和掉落。

第六步：毒圈、空投与敌人内战

- 毒圈每 20 回合收缩，单位毒圈内行动结算受伤。
- 空投每 15 回合生成，红点提示并作为额外 LootNode。
- 敌人相遇触发自动内战，胜者拾取遗物成长。
- AI 移动评分避开毒圈，并能被空投吸引。

第七步：Playtest 和调参

- 检查 5-10 分钟一局是否成立。
- 检查视野领先是否强但不无解。
- 检查无信息战斗是否紧张，有信息战斗是否有明确对策。
- 检查毒圈和空投是否形成移动压力，而不是替代核心照面战斗。

## 11. v0.6.1 MVP 默认决策

以下默认已写入规则书，可直接作为第一轮 Story 的实现依据：

1. 玩家初始属性固定为 3/3/3/3/3。若玩家关闭教程，直接通过 `pendingPickupOffer.nodeId = "starter"` 选择回声针、左轮·卑劣的正义、绷带、长刀·光子切之一；若玩家选择教程，先进入 `tutorialScenario`，完成或跳过后再生成该开局四选一。
2. 基础视野使用曼哈顿半径；格子边缘墙和封闭门阻断视线；朝向暂不影响基础视野。
3. 远程攻击必须目标 `visible`、射程内、路径无遮挡；不可穿过边缘墙，不可只凭暗区记忆攻击。
4. 未见敌人不直接打开完整战斗面板；受到远程先手、噪音或红光后至少进入 `aware` 并显示来源提示。
5. 躲闪第一版使用方向预判按钮，不做限时点击。
6. 伤害第一版固定，便于调参和自动化测试。
7. 战斗不使用固定回合上限，也不维护独立压力状态；第 3 动作回合起做软收束检查。
8. 说服成功停战 1 个玩家行动回合，并给予属性数值或道具情报。
9. 支付道具第一版直接从背包移除，不转移给敌人。
10. 玩家没有主动搜索/屏息动作；踩到道具节点后弹出 3 选 1，选择不额外推进回合。
11. 敌人会拾取未清空道具节点，普通敌人最多 4 件，精英敌人最多 5 件。
12. 敌人被击败后按 35% 独立检定、最多 2 件、5% 额外 1 件规则掉落，并保留实例状态。
13. 玩家第一版不会触发自己放置的陷阱，敌人会触发。
14. AI 第一版不共享玩家精确位置；全局通过毒圈、空投和内战间接升压。
15. 每 20 行动回合毒圈收缩 1 层，毒圈内单位行动结算后受到 5 伤害。
16. 每 15 行动回合生成 1 个空投 LootNode，并在地图上显示红点。
17. 敌人相遇自动结算内战，胜者可拾取遗物并成长。

## 12. 后续仍需设计确认

这些点不阻塞 MVP，但后续扩展前必须回到规则书：

1. 是否在开局装备三选一之外加入属性构筑。
2. 说服是否扩展到临时同行、交换道具或透露出口。
3. 视野是否升级为扇形、真实光照或房间级遮挡。
4. AI 是否共享信息或形成围捕。
5. 陷阱是否可能误触玩家或被敌人拆除。
6. 地面遗物掉落包是否第一版完整呈现，还是先用日志与自动拾取降级。
7. 教学敌人第一名是否允许使用不掉落教学装备来稳定演示高伤/重伤风险，还是把教学敌人属性预算提高到 12。

## 13. 模块端口确认

端口真源：`CCGS-Data/project-docs/architecture/module-ports.md`。

本地开发 HTTP 入口固定为 `http://127.0.0.1:5188/`。端口用于浏览器加载 Vite/TypeScript 模块，不用于本地存档；`npm run dev` 与 `npm run preview` 必须通过 `--strictPort` 固定该端口，避免与其他项目的 `5173/5174` 互相挤占。

Phaser 表现层按 ADR-0002 拆为异步启动边界：`src/main.ts` 不静态导入 Phaser，只动态加载 `src/render/startPhaserGame.ts`。构建层将 Phaser 命名为 `phaser-vendor` chunk，入口 chunk 保持轻量，避免把引擎体积和规则/HUD 桥接代码混在一起。

当前运行时端口：

- `SimulationReadPort`：供渲染层读取 `snapshot()` 并订阅 `onChange()`。
- `SimulationCommandPort`：供 HUD/输入层调用 `move`、`choosePickup`、`useItem`、`playCombatAction`、`tryFlee`、`continueFight`、`tryPersuade`、`beginTutorialScenario`、`skipTutorialScenario`、`reset`。
- `SimulationPort`：当前原型的完整模拟层端口，由 `GameSimulation` 实现。

强制边界：

- `src/render` 只能依赖 `SimulationReadPort`，不得调用命令端口。
- `src/main.ts` 可以依赖 `SimulationPort`，但不得直接修改 `GameState`。
- `src/sim` 不得依赖 DOM、Phaser 或 CSS。
- 后续拆分 `combatSystem`、`itemSystem`、`enemySystem` 前，必须先在端口文档中登记新增端口。

### 13.1 Tutorial Scenario Port

HUD 负责询问玩家是否需要教程；模拟层负责真实训练场景。

```ts
type TutorialStepId =
  | "intro"
  | "enemy1-guard"
  | "enemy1-constitution-intel"
  | "enemy1-speed-risk"
  | "enemy1-direction-guard"
  | "enemy1-dodge"
  | "enemy1-invest-tempo"
  | "enemy1-kill"
  | "enemy2-intro"
  | "enemy2-intel"
  | "enemy2-persuade"
  | "complete";

type TutorialScenarioState = {
  active: boolean;
  stepId: TutorialStepId;
  allowedInputs: ActionInput[];
  highlightedInput?: ActionInput;
  enemyIds: string[];
  checkpoint?: TutorialCheckpoint;
  openingLoadoutDeferred: boolean;
};
```

端口规则：

- `beginTutorialScenario()`：创建训练地图/训练敌人，设置 `openingLoadoutDeferred = true`，不生成正式开局四选一。
- `skipTutorialScenario()`：清除训练敌人和教程状态，恢复玩家生命、重伤、状态和临时修正，然后生成正式开局四选一。
- 教程中的普通输入仍走 `playCombatAction()`、`continueFight()`、`tryPersuade()` 等正式命令；命令进入模拟层后先由 `tutorialSystem` 检查 `allowedInputs`。
- 如果玩家在允许分支中选择“错误示范攻击”，模拟层使用正式战斗结算展示后果，再用 `checkpoint` 恢复到上一教学步骤。
- `complete` 步骤调用与 `skipTutorialScenario()` 同样的正式开局切换，但会记录本次会话教程已完成。

## 14. v0.5.1 GameSimulation 拆分落地

本轮不改变规则书语义，只把模拟层内部职责拆开，保持外部 `SimulationPort` 不变。

当前 `src/sim/GameSimulation.ts` 的职责收缩为：
- 接收 `SimulationCommandPort` 命令。
- 编排回合推进、遭遇创建、战斗回合、撤离/失败结算与日志。
- 持有当前 `GameState`、监听器和少量运行期标记。

新增 `src/sim/systems/`：
- `randomSystem.ts`：固定 seed 随机、百分比检定、攻击方向判定。
- `movementSystem.ts`：格子可进入、边缘墙阻挡、占位、朝向/远离目标移动。
- `visibilitySystem.ts`：可见格刷新、边缘墙视线判定、`unseen/aware/visible` 判定与 AI 记忆更新。
- `inventorySystem.ts`：背包查找、添加、消耗、掉落实例合并。
- `lootSystem.ts`：玩家 LootNode 三选一触发、敌人拾取评分、敌人背包上限、掉落检定。
- `enemySystem.ts`：敌人迷宫移动和战斗行动选择。
- `combatSystem.ts`：当前先抽出远程可用性判定；完整行动结算仍在 `GameSimulation` 中。
- `itemEffectSystem.ts`：抽出战斗道具 active effect 规格，输入 `ItemId`、目标、优势条件，输出结构化效果或阻塞原因；不负责消费道具、写日志或改状态。

后续扩展顺序：
1. 若继续增加战斗内道具，优先扩展 `itemEffectSystem` 的效果表，避免回写 `GameSimulation` if 链。
2. 若继续增加战斗动作与伤害分支，先拆 `combatRoundSystem`，把 `resolveActionRound`、近战/远程伤害和优势资源统一迁出。
3. 若 UI 需要更复杂展示，新增 view model，不让 HUD 直接读取或修改规则内部字段。

## 15. v0.6.4 密集边缘墙地图落地

本轮只改变地图阻挡表达，不改变战斗、道具、毒圈、空投和敌人内战规则。

数据结构：

```ts
type EdgeKey = `v:${number},${number}` | `h:${number},${number}`;
type TileKind = "floor" | "exit";

type MapState = {
  width: number;
  height: number;
  tiles: TileKind[][];
  wallEdges: Set<EdgeKey>;
  explored: Set<string>;
  visible: Set<string>;
  lootNodes: LootNode[];
  aiUnits: ActorState[];
  traps: TrapState[];
  hints: Position[];
};
```

系统职责：

- `map.ts` 根据当前局 seed 生成固定 `17x13` 地图、地面内容、30 个道具节点、15 名敌人和随机编织 `wallEdges`。
- `movementSystem.canEnter(state, target, from?)` 负责越界、边缘墙和基础可进入性；玩家、敌人、逃跑和陷阱放置都使用同一入口。
- `visibilitySystem.hasLineOfSight()` 只读取 `wallEdges` 和地图边界，不再读取 `wall` tile。
- `combatSystem.canUsePistol()` 继续复用 `hasLineOfSight()`，确保远程攻击不能穿过边缘墙。
- `GameScene` 将所有已探索格绘制为地面内容，再把 `wallEdges` 绘制为较粗的格边墙线；外边界绘制完整墙框。
- `wallEdges` 使用 seed 随机编织生成：所有格子可达，每格至少 1 面墙，每格开放方向为 2-3，最长直线开放段不超过 4。

验收重点：

- `state.map.tiles` 中不存在 `wall`。
- 两个相邻格之间有 `wallEdges` 时不可移动、不可直线看见、不可远程攻击。
- 没有边缘墙的相邻格仍可进入，地图道路以 1 格宽走廊为主。
- `state.map.lootNodes.length === 30`，`state.map.aiUnits.length === 15`。

## 16. v0.6.8 视野压缩、确认式反馈与道具生效落地

v0.6.6 增加玩家明亮视野压缩和遇敌/回合结果反馈；v0.6.8 将战斗反馈表现改为确认式，并要求战斗内道具进入模拟结算。

新增状态：

```ts
type FeedbackEvent = {
  id: string;
  kind:
    | "encounter"
    | "combat-round"
    | "loot-drop"
    | "persuasion-intel"
    | "enemy-flee"
    | "enemy-defeated"
    | "item-heal"
    | "echo-pulse"
    | "gunshot";
  title: string;
  body: string;
  tone: "neutral" | "advantage" | "danger" | "intel";
  turn: number;
  round?: number;
  durationMs: number;
  origin?: Position;
  target?: Position;
  positions?: Position[];
  itemId?: ItemId;
};

type ActiveEffect = {
  id: string;
  ownerId: string;
  sourceItemId: ItemId;
  label: string;
  stat: "damage" | "speed" | "dodge" | "flee" | "heavyThreshold" | "tieStrength" | "incomingDamage" | "heavyPenalty" | "dot" | "persuasion" | "mark";
  amount: number;
  remainingRounds: number;
  trigger: "round" | "nextMeleeHit" | "nextIncomingDamage" | "nextDodge" | "nextFlee" | "persuasion" | "passive";
  targetActorId?: string;
};

type GameState = {
  rareItemAppearances: Partial<Record<ItemId, number>>;
  feedbackEvents: FeedbackEvent[];
  tutorialScenario?: TutorialScenarioState;
};

type EncounterState = {
  activeEffects: ActiveEffect[];
};
```

系统职责：

- `GameSimulation` 在创建 encounter 时推送 `kind = "encounter"` 的反馈事件。
- `resolveActionRound()` 每结算一个玩家战斗动作，聚合本轮 `EncounterState.log` 增量并推送 `kind = "combat-round"`。
- 击败敌人后，`collectEnemyDrops()` 推送 `kind = "loot-drop"`，有掉落时列出自动加入背包的道具与剩余次数，无掉落时写明无可回收道具。
- 说服成功后，`tryPersuade()` 推送 `kind = "persuasion-intel"`，正文只列出本次新增的 `statExact` 或 `item` 情报。
- 选择续战并支付优势后，`continueFight()` 推送 `kind = "advantage-press"`，正文说明下一动作回合的临时近战伤害或速度修正和叠加值。
- `feedbackEvents` 只保留最近少量事件；HUD 通过本地已展示 ID 控制确认式弹窗，不回写模拟层。
- `EncounterState.activeEffects` 保存战斗道具临时效果；`resolveActionRound()` 统一读取这些效果结算速度、伤害、躲闪、逃跑、重伤阈值、减伤和说服修正。
- 敌人道具情报使用 `IntelEntry.itemId` 绑定 `ITEMS[itemId]`；HUD 悬浮主说明必须通过 `itemUiDescription(itemId)` 取得玩家可读介绍，应对提示必须通过 `itemEnemyCounter(itemId)` 取得，不得直接显示原始 `counterplay`。
- 背包按钮默认只显示图标、名称和次数；说明与限制由 `styles.css` 在 hover/focus 时展开。拾取三选一仍直接显示说明。
- 新手教程偏好、已展示弹窗 ID 与“是否询问过”保存在 `src/main.ts` 的 HUD 本地状态或浏览器本地存储中。
- 教学训练场景的真实状态必须写入 `GameState.tutorialScenario` 或等价模拟层状态，包括教学敌人、步骤、允许输入、检查点和开局四选一延后标记；不得只由 HUD 伪造。
- `GameScene` 只读最新反馈事件并播放轻量 camera flash / shake；reduced motion 时禁用 shake。
- `styles.css` 负责弹窗位置、tone 颜色、确认按钮和悬浮说明；不得承载规则判断。

验收重点：

- 默认精神 3 的 `brightVisionRadius === 1`。
- 玩家亮区、玩家主动看见敌人和 Phaser 视野圈使用同一明亮半径。
- 敌人看见玩家仍使用基础 `visionRadius`。
- 遇敌和每个战斗回合都会生成结构化反馈事件。
- DOM 弹窗必须点击确认才关闭；弹窗存在时 `main.ts` 暂缓移动和战斗输入，不遮挡玩家阅读回合结果。
- 战斗面板显示当前 `activeEffects`，道具生效、消失和关键触发都进入战斗日志。

## 17. v0.8 局内道具模板与效果运行时

v0.8 起，所有可进入拾取池的道具都必须由统一模板驱动。旧字段 `useContext`、`timing`、`effectKey` 可保留为兼容展示字段，但运行逻辑优先读取新模板。
v0.8.1 起，新增道具必须先进入规则书道具表，再补 `ItemId`、`ITEMS`、`PICKUP_ITEM_POOL`、图标映射、运行时效果、敌人 AI 候选和自动化测试。

```ts
type ItemUsage = {
  mode: "unlimited" | "charges-destroy" | "charges-keep" | "rechargeable";
  maxUses?: number;
  refillItemIds?: ItemId[];
  manualLock: "per-round" | "none";
};

type ItemPort = {
  id: string;
  kind: "manual" | "time" | "condition";
  trigger: string;
  context: "field" | "combat" | "both" | "passive";
  requiresAdvantage?: boolean;
  requiresVision?: boolean;
  target: "self" | "enemy" | "all-enemies" | "tile";
};

type ItemEffect = {
  kind: "stat" | "status" | "intel" | "globalIntel" | "vision" | "movement" | "trap" | "rangedDamage" | "heal" | "ammo";
  stat?: "strength" | "speed" | "damage" | "dodge" | "flee" | "persuasion" | "suspectChance" | "heavyThreshold" | "incomingDamage" | "critChance";
  status?: "burn" | "poison" | "bleed" | "freeze";
  amount?: number;
  durationRounds?: number;
  stackPolicy?: "max" | "add";
};
```

运行规则：

- `itemRuntimeSystem` 接收 `GameState`、使用者、道具实例、触发端口和目标，返回结构化结果；它不读取 DOM 或 Phaser。
- 同一 `InventorySlot` 在同一战斗回合或场外行动回合只允许一次手动使用；HUD 通过实例状态置灰按钮。
- v0.8.9 起，`items.ts` 的默认 usage 规则必须将非 `rare` 主动/反应道具限制为有限次数：`common = 2`、`uncommon = 3`，模式为 `charges-destroy`；显式 `maxCharges`、显式 `usage` 和 `rare` 道具优先使用自身规则。
- `itemBalanceSystem` 是稀有度数值唯一真源，集中提供 `common/uncommon/rare` 权重、玩家战利价值、敌人拾取基础评分、强度评分和期望稀有度判定。
- 普通地图拾取 offer 使用 `common 72 / uncommon 23 / rare 5`；未来空投 offer 使用 `common 45 / uncommon 40 / rare 15`。同一 offer 必须无重复。
- 道具强度阈值为 `common < 2.5`、`uncommon 2.5-4.49`、`rare >= 4.5`，单件有效强度不得超过 `6.0`。
- `signal-flare` 使用明确持续模型：`+4` 明亮视野，持续 2 回合；不得通过 `revealBoost` 逐回合递减来隐式模拟。
- `map.ts` 只调用平衡系统生成 offer，不硬编码稀有度权重；`lootSystem.ts` 只调用平衡系统取得敌人基础评分；`GameSimulation.ts` 只调用平衡系统取得玩家拾取战利价值。
- `map.ts` 必须在开局三选一、敌人初始携带和 LootNode offer 生成时维护 `rareItemAppearances`，同一 `rare ItemId` 每局最多可见生成 2 个；拾取和敌人夺取只是转移实例，不额外增加计数。
- `main.ts` 只把 `ItemDefinition.rarity` 透传为 DOM `data-rarity`；稀有度颜色由 `styles.css` 控制，HUD 不得自行推导稀有度或收益价值。
- `ItemDefinition.description` 可以保留规则摘要和实现校验信息；玩家可见的拾取卡片、背包、情报 hover、状态条与拾取日志统一通过 `src/sim/itemText.ts` 的 `itemUiDescription()`、`itemUiLimit()`、`itemEnemyCounter()`、`activeEffectUiText()`、`statusEffectUiText()` 取得，不得直接照搬端口、事件、原始 `counterplay` 或动画实现描述。
- `EncounterState.activeEffects` 保存数值修正，默认同类同轮取绝对值最高；只有 `stackPolicy = "add"` 时相加。
- `EncounterState.statusEffects` 保存灼烧、中毒、流血、冻结；`statusEffectSystem` 在回合开始、行动前后和回合结束结算。
- v0.8.9 被动道具链由模拟层统一调度：战斗开始、首回合、次回合、第三回合及以后、施加状态、暴击、击中防御均从 `GameSimulation` 转交到结构化 `activeEffects/statusEffects`，不允许 HUD 或 Phaser 触发。
- v0.8.10 起，大批被动道具不得继续散落为单件 if 链；新增 `passiveItemSystem.ts` 维护触发规则表，`GameSimulation` 只负责在真实事件发生时分发 `combatStart / firstRound / secondRound / thirdRoundPlus / onDodgeSuccess / onDefendSuccess / onHeavyWoundDealt / onHeavyWoundTaken / onDamageDealt / onDamageTaken / onHighDamageDealt / onOneHp / onIntelGain / onStatusApplied / onCrit / onDefendedHit`。
- 敌人 AI 读取相同的 usage、charges 和被动构筑上下文；持有状态联动被动时，`enemySystem` 可提高对应主动状态道具的选择权重。
- 每个战斗回合全场自动触发链最多 5 次；达到上限后停止解析并写入战斗记录。
- `critChance` 是道具专属战斗维度，基础为 0；暴击命中默认最终伤害 +1，并参与重伤判断。
- `intelTemplateSystem` 禁止输出态势、意图、路线或性格文本；单体情报只输出属性数值、道具情况或下一次攻击方向，全场情报只输出由 `GameState` 计算出的模板变量。

迁移规则：

- 现有 43 个道具必须全部补齐 `usage`、`ports`、`effects`；若暂时没有可运行效果，不得保留在拾取池。
- 左轮为 `rechargeable`，0 弹保留在背包，可由旧弹夹补充。
- 场外视野、移动、陷阱和远程武器通过手动端口进入 `itemRuntimeSystem`；不得继续在 HUD 或 Phaser 层写特例。
- 敌人 AI 只通过端口和权重判断可用道具；玩家和敌人共用使用次数、状态、触发链和效果结算。

## 18. v0.8.3 交叉端口道具落地规则

v0.8.3 新增前的旧池盘点记录在 `CCGS-Data/design/balance/item-inventory-audit-v0-8-2-before-v0-8-3-2026-05-14.md`。新增 10 件道具后，道具池总数为 65 件。

落地边界：

- `src/sim/items.ts` 是静态真源：新增道具必须先有 `ItemId`、`ItemDefinition`、`PICKUP_ITEM_POOL`、`usage`、`ports`、`effects`、`counterplay` 与稀有度。
- `src/sim/systems/itemEffectSystem.ts` 只承接“手动准备 -> activeEffect”的可表格化战斗效果，例如 `smoke-needle` 的 `nextDodge` 和 `thorn-plate` 的 `nextIncomingDamage`。
- `GameSimulation.resolveMeleeAttack()` 负责把战斗事件转交给运行时：成功躲闪触发 `lens-thread / smoke-needle`，受到近战命中触发 `thorn-plate`，近战命中附加状态后触发状态转化被动。
- 状态转化被动只调用 `EncounterState.activeEffects` 追加不同维度收益：灼烧转躲闪惩罚、中毒转下一击伤害、流血转速度、冻结转受伤减免。它们不得直接再施加新状态，避免状态互相递归。
- `red-compass` 为场外真实信息道具，只读取未清空 `LootNode.offerItemIds` 的稀有度并写入地图提示，不生成单体敌人情报。
- `tripwire-spool` 归地图陷阱分支，触发后写红光提示、造成 1 点伤害并调用情报系统暴露属性数值。
- 敌人 AI 的 `chooseCombatItem()` 必须把 `stitch-kit / smoke-needle / thorn-plate` 纳入候选，并在拥有状态转化被动时提高对应状态来源道具的使用倾向。

测试要求：

- 内容审查测试检查 65 件道具都有模板端口和效果。
- 平衡测试检查 65 件道具稀有度与强度评分匹配。
- 集成测试至少覆盖：状态转化被动、受击反扎、场外高价值拾取点提示与新陷阱。

## 19. v0.8.4 / v0.8.9 治疗续航、主动次数与敌人寻路落地规则

- `items.ts` 的主动道具默认规则分层：`rare` 可继续按单件规则无限、保留、补充或消耗；非 `rare` 主动/反应道具若没有显式次数，则默认 `charges-destroy`，`common 2`、`uncommon 3`。
- `inventorySystem` 必须区分“支付/丢弃移除”和“使用成本结算”。玩家与敌人使用道具时走使用成本结算；说服支付、投掷长刀和陷阱布置可继续移除实体。
- 场外手动道具成功使用后由 `GameSimulation` 推进 1 回合，使 `moveAiUnits()`、敌人拾取、内战、陷阱与远程先手都正常结算。
- 新增治疗道具统一由模拟层结算生命回复、状态清除、主动效果和破碎状态；HUD 只读取道具定义、剩余次数、破碎状态和反馈日志。
- `enemySystem.moveAiUnits()` 必须用边缘墙可达路径寻找下一步。追击、寻物和巡逻共享 `canEnter`、`isOccupied` 与同一张 `wallEdges`，禁止只按直线贪心移动。
- 敌人战斗 AI 低生命时扫描所有 `healing` 标签道具，优先使用当前端口可触发的治疗/止损道具，而不是只识别绷带。

## 20. v0.8.14 附魔实例、神话宝石与统一生效端口

v0.8.14 在 134 件可拾取道具之上新增 6 件神话稀有度附魔宝石。134 件普通拾取池道具全部可自然附魔；宝石不进入普通 `PICKUP_ITEM_POOL`，但可以通过 1% 神话注入进入三选一 offer。

落地边界：

- `ItemRarity` 扩展为 `common / uncommon / rare / mythic`。`mythic` 不参与普通稀有度权重；地图/空投权重表中 mythic 权重固定为 0。
- `InventorySlot` 保存 `affix?: ItemAffix`，掉落、合并、克隆必须保留 `charges / durability / usedFlags / affix`。同一 `itemId` 只有 affix 完全一致时才可堆叠。
- `enchantmentSystem.ts` 是附魔规则表唯一真源：保存 6 种附魔、6 种宝石、10% 自然附魔、1% 宝石注入、134 件道具到 `HIT / PRIME / COUNTER / SUPPORT / TRAP / AMMO` 的载体模板映射。
- 新生成的非宝石道具实例由 `inventorySystem.addItemToActor()` 按 seed 稳定掷自然附魔；敌人初始携带道具、玩家拾取和敌人拾取都走同一入口。
- 附魔宝石是一次性场外道具，使用后自动选择当前背包中最高强度且未附魔的可附魔道具写入对应附魔。后续若做玩家选择目标 UI，应新增 `chooseEnchantTarget` 端口，不得让 HUD 直接改背包。
- `GameSimulation` 只在真实生效点解析附魔：近战命中、远程命中、投掷命中、陷阱触发、主动准备后的下一次伤害。HUD 和 Phaser 不解析附魔。
- `HIT` 类道具在直接造成伤害时读取自身 affix；`PRIME / COUNTER / SUPPORT` 类道具成功使用后写入 `ActorState.enchantmentPrep`，由下一次可造成直接伤害的动作消费；`TRAP` 类道具在放置时把 affix 写入 `TrapState`；`AMMO` 类道具在换弹成功后写入下一次伤害预备。
- 附魔生效保持统一端口：燃烧施加等量灼烧；剧毒施加等层中毒；极寒施加一半层数冻结；染血施加等层流血；致命以 50% 概率追加 +1 伤害；闪耀追加 `1-3` 点额外伤害，等价于简化的“再造成一次”。
- `itemBalanceSystem` 仍负责普通稀有度评分；`mythic` 视作规则特例，战利价值为 5、敌人基础评分为 6，不参加普通强度区间断言。
- UI 必须显示实例名称、稀有度和附魔效果：背包里附魔实例使用 `enchantedItemName(slot)`，并通过 `itemEnchantmentUiText(slot)` 展示该实例的 `HIT / PRIME / COUNTER / SUPPORT / TRAP / AMMO` 承载模板与具体附魔效果；HUD 用 `data-enchantment` 增加附魔边框/辉光，神话宝石仍通过 `data-rarity="mythic"` 走红色视觉样式。

测试要求：

- 单元测试必须确认 134 件 `PICKUP_ITEM_POOL` 道具都有附魔载体模板，6 个宝石不属于普通池且不可被附魔。
- 背包与掉落测试必须覆盖 `InventorySlot.affix` 的克隆与堆叠规则。
- 战斗集成测试后续应补强：附魔近战、附魔枪击、附魔陷阱、附魔宝石写入目标的端到端验证；当前 v0.8.14 第一版已通过类型、构建与现有回归测试。
