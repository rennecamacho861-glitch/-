export type Position = {
  x: number;
  y: number;
};

export type Direction = "north" | "south" | "west" | "east";

export type Faction = "player" | "enemy";

export type AdvantagePressChoice = "pressPower" | "pressTempo";

export type StatKey = "spirit" | "intellect" | "strength" | "speed" | "constitution";

export type StatBlock = Record<StatKey, number>;

export type DerivedStats = {
  maxHp: number;
  visionRadius: number;
  brightVisionRadius: number;
  meleeDamage: number;
  heavyWoundThreshold: number;
  basePersuasion: number;
  lootDropBonus: number;
};

export type VisibilityLevel = "unseen" | "aware" | "visible";

export type AwarenessState = {
  level: VisibilityLevel;
  lastKnownPosition?: Position;
  source?: "sight" | "noise" | "trap" | "damage" | "memory";
};

export type EnemyAiState = "patrol" | "seekLoot" | "huntPlayer" | "recover" | "duel";

export type IntelKind =
  | "statExact"
  | "item"
  | "attackDirection";

export type IntelEntry = {
  targetId: string;
  kind: IntelKind;
  value: string;
  certainty: "confirmed" | "suspected";
  source: "sight" | "defend" | "dodge" | "item" | "trap" | "persuasion";
  itemId?: ItemId;
  attackDirection?: "left" | "right";
  attackDirectionRound?: number;
  attackDirectionIndex?: number;
  confidence?: number;
};

export type UseContext = "field" | "combat" | "both" | "passive";

export type ItemId =
  | "pistol"
  | "photon-cut"
  | "bandage"
  | "long-knife"
  | "trap"
  | "glasses"
  | "glow"
  | "echo"
  | "weighted-grip"
  | "blade-oil"
  | "lime-powder"
  | "throwing-knife"
  | "sleeve-stone"
  | "ice-awl"
  | "caltrops"
  | "hook-rope"
  | "acid-vial"
  | "old-magazine"
  | "thick-cloth"
  | "bracer"
  | "smoke-ball"
  | "painkiller"
  | "coagulation-powder"
  | "wood-shield"
  | "soft-shoes"
  | "steady-charm"
  | "adrenaline-shot"
  | "splint"
  | "lens"
  | "counting-beads"
  | "notebook"
  | "scent-powder"
  | "black-cloth"
  | "bell-wire"
  | "polarized-lens"
  | "marked-coin"
  | "voice-whistle"
  | "rib-hook"
  | "ankle-line"
  | "chase-spur"
  | "counter-plate"
  | "panic-nail"
  | "focus-thread"
  | "breath-cord"
  | "sharpening-stone"
  | "glass-spike"
  | "tinder-vial"
  | "poison-needle"
  | "barbed-line"
  | "frost-nail"
  | "antidote-tablet"
  | "insulation-cloth"
  | "signal-mirror"
  | "folded-map"
  | "runner-knot"
  | "signal-flare"
  | "soot-hook"
  | "venom-saw"
  | "blood-knot"
  | "frost-latch"
  | "lens-thread"
  | "stitch-kit"
  | "tripwire-spool"
  | "red-compass"
  | "smoke-needle"
  | "thorn-plate"
  | "salve-tin"
  | "field-ration"
  | "charcoal-tablet"
  | "pressure-bandage"
  | "heat-pad"
  | "blood-sponge"
  | "mercy-thread"
  | "emergency-syringe"
  | "lead-wrap"
  | "ankle-spring"
  | "cracked-scope"
  | "spark-fuse"
  | "second-breath"
  | "rust-cloud"
  | "coal-beads"
  | "toxin-skein"
  | "cold-rivet"
  | "crit-hook"
  | "guard-breaker"
  | "servo-heel"
  | "mnemonic-plate"
  | "knuckle-core"
  | "exit-charm"
  | "opener-gear"
  | "first-glint"
  | "pilot-flame"
  | "rawhide-guard"
  | "second-gear"
  | "coolant-breath"
  | "second-sight"
  | "venom-timer"
  | "long-fuse"
  | "fatigue-tax"
  | "bunker-prayer"
  | "escape-count"
  | "spring-step"
  | "dust-kicker"
  | "slip-venom"
  | "dodge-reader"
  | "guard-lens"
  | "brace-piston"
  | "shield-spark"
  | "calm-mouthpiece"
  | "wound-motor"
  | "crack-reader"
  | "crush-salt"
  | "ember-step"
  | "heat-read"
  | "ash-threshold"
  | "toxic-focus"
  | "bitter-mouth"
  | "green-pulse"
  | "ice-step"
  | "cold-reader"
  | "shatter-pin"
  | "crit-lens"
  | "white-spark"
  | "snap-sinew"
  | "pain-wheel"
  | "blood-map"
  | "recoil-plate"
  | "overrun-chain"
  | "hard-receipt"
  | "marrow-coin"
  | "breakwater-splint"
  | "trauma-scan"
  | "last-ice"
  | "last-match"
  | "data-spur"
  | "burning-enchant-gem"
  | "venomous-enchant-gem"
  | "frost-enchant-gem"
  | "blood-enchant-gem"
  | "deadly-enchant-gem"
  | "radiant-enchant-gem";

export type ItemCategory = "damage" | "survival" | "intel" | "utility";

export type ItemRarity = "common" | "uncommon" | "rare" | "mythic";

export type ItemTiming = "active" | "reaction" | "passive";

export type ItemTag =
  | "ranged"
  | "healing"
  | "melee"
  | "trap"
  | "intel"
  | "vision"
  | "scout"
  | "damage"
  | "survival"
  | "mobility"
  | "throwable"
  | "ammo"
  | "counter"
  | "persuasion"
  | "enchantment";

export type ItemUsageMode = "unlimited" | "charges-destroy" | "charges-keep" | "rechargeable";

export type ItemUsage = {
  mode: ItemUsageMode;
  maxUses?: number;
  refillItemIds?: ItemId[];
  manualLock: "per-round" | "none";
};

export type ItemPortKind = "manual" | "time" | "condition";

export type ItemPortTrigger =
  | "field"
  | "combat"
  | "advantage"
  | "ranged"
  | "trap"
  | "combatStart"
  | "roundStart"
  | "roundEnd"
  | "firstRound"
  | "secondRound"
  | "thirdRoundPlus"
  | "onDodgeSuccess"
  | "onDefendSuccess"
  | "onHeavyWoundDealt"
  | "onHeavyWoundTaken"
  | "onDamageDealt"
  | "onDamageTaken"
  | "onHighDamageDealt"
  | "onOneHp"
  | "onIntelGain"
  | "onDeath"
  | "onStatusApplied"
  | "onCrit"
  | "onDefendedHit"
  | "onAdvantageGain"
  | "onEnemyItemUse"
  | "onVisionLead";

export type ItemPort = {
  id: string;
  kind: ItemPortKind;
  trigger: ItemPortTrigger;
  context: UseContext;
  requiresAdvantage?: boolean;
  requiresVision?: boolean;
  target: "self" | "enemy" | "all-enemies" | "tile";
};

export type StatusEffectType = "burn" | "poison" | "bleed" | "freeze";

export type ItemEffectKind =
  | "stat"
  | "status"
  | "intel"
  | "globalIntel"
  | "vision"
  | "movement"
  | "trap"
  | "rangedDamage"
  | "heal"
  | "ammo"
  | "log";

export type ItemEffectStat =
  | "strength"
  | "intellect"
  | "speed"
  | "damage"
  | "dodge"
  | "flee"
  | "persuasion"
  | "suspectChance"
  | "heavyThreshold"
  | "incomingDamage"
  | "tieStrength"
  | "heavyPenalty"
  | "critChance"
  | "burn"
  | "poison"
  | "bleed"
  | "freeze"
  | "healOnMeleeHit";

export type ItemEffect = {
  kind: ItemEffectKind;
  stat?: ItemEffectStat;
  status?: StatusEffectType;
  amount?: number;
  durationRounds?: number;
  stackPolicy?: "max" | "add";
  label?: string;
};

export type ItemDefinition = {
  id: ItemId;
  name: string;
  useContext: UseContext;
  rarity: ItemRarity;
  category: ItemCategory;
  timing: ItemTiming;
  description: string;
  maxCharges?: number;
  durationTurns?: number;
  trigger?: string;
  effectKey: string;
  usage: ItemUsage;
  usageAuthored: boolean;
  ports: ItemPort[];
  effects: ItemEffect[];
  aiWeight?: number;
  counterplay: string;
  tags: ItemTag[];
};

export type EnchantmentKind = "burning" | "venomous" | "frost" | "blood" | "deadly" | "radiant";

export type ItemAffix =
  | {
      kind: "enchantment";
      enchantment: EnchantmentKind;
      source: "natural" | "gem";
      locked?: boolean;
    }
  | {
      kind: "curse";
      curse: string;
      source: "natural" | "item";
      locked?: boolean;
    };

export type EnchantmentPrep = {
  enchantment: EnchantmentKind;
  sourceItemId: ItemId;
};

export type InventorySlot = {
  item: ItemDefinition;
  count: number;
  charges?: number;
  durability?: number;
  usedFlags?: Record<string, boolean>;
  lastManualUseRound?: number;
  affix?: ItemAffix;
};

export type ProfileItemSlot = InventorySlot & {
  instanceId: string;
};

export type ActorState = {
  id: string;
  name: string;
  faction: Faction;
  position: Position;
  previousPosition: Position;
  facing: Direction;
  stats: StatBlock;
  hp: number;
  combatCount: number;
  inventory: InventorySlot[];
  defeated: boolean;
  enemyTier?: "normal" | "elite";
  patrol?: Position[];
  patrolIndex?: number;
  awareness: AwarenessState;
  enchantmentPrep?: EnchantmentPrep;
  neutralUntilTurn?: number;
  aiState?: EnemyAiState;
};

export type LootNode = {
  id: string;
  position: Position;
  depleted: boolean;
  offerItemIds: [ItemId, ItemId, ItemId];
};

export type TileKind = "floor" | "exit";

export type EdgeKey = `v:${number},${number}` | `h:${number},${number}`;

export type TrapState = {
  id: string;
  ownerId: string;
  itemId?: ItemId;
  affix?: ItemAffix;
  position: Position;
  armed: boolean;
};

export type MapState = {
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

export type CombatAction =
  | { type: "attack"; mode: "melee" }
  | { type: "defend" }
  | { type: "dodge"; direction: "left" | "right" }
  | { type: "ranged"; itemId: ItemId }
  | { type: "useItem"; itemId: ItemId };

export type TutorialInput =
  | "attack"
  | "defend"
  | "dodge-left"
  | "dodge-right"
  | AdvantagePressChoice
  | "persuade";

export type TutorialStepId =
  | "enemy1-guard"
  | "enemy1-direction-guard"
  | "enemy1-dodge"
  | "enemy1-invest-tempo"
  | "enemy1-kill"
  | "enemy2-intel"
  | "enemy2-persuade";

export type TutorialScenarioState = {
  active: boolean;
  stepId: TutorialStepId;
  allowedInputs: TutorialInput[];
  highlightedInput?: TutorialInput;
  enemyIds: string[];
  openingLoadoutDeferred: boolean;
  tempoInvested: number;
  requiredDodge?: "left" | "right";
};

export type AdvantageOwner = "player" | "enemy" | null;

export type AdvantageState = {
  owner: AdvantageOwner;
  source: "vision" | "defend" | "dodge" | "heavyWound" | "trap" | "item" | "forced" | null;
  bonusAvailable: boolean;
  playerPoints: number;
  enemyPoints: number;
};

export type EncounterPhase = "chooseAction" | "advantageWindow";

export type CombatLogEntry = {
  round: number;
  text: string;
};

export type ActiveEffectStat =
  | "strength"
  | "intellect"
  | "damage"
  | "speed"
  | "dodge"
  | "flee"
  | "heavyThreshold"
  | "tieStrength"
  | "incomingDamage"
  | "heavyPenalty"
  | "dot"
  | "persuasion"
  | "mark"
  | "critChance"
  | "burn"
  | "poison"
  | "bleed"
  | "freeze"
  | "healOnMeleeHit";

export type ActiveEffectTrigger =
  | "round"
  | "nextMeleeHit"
  | "nextIncomingDamage"
  | "nextDodge"
  | "nextFlee"
  | "persuasion"
  | "passive";

export type ActiveEffect = {
  id: string;
  ownerId: string;
  sourceItemId: ItemId;
  label: string;
  stat: ActiveEffectStat;
  amount: number;
  remainingRounds: number;
  trigger: ActiveEffectTrigger;
  targetActorId?: string;
  stackPolicy?: "max" | "add";
};

export type StatusEffect = {
  id: string;
  ownerId: string;
  targetActorId: string;
  type: StatusEffectType;
  stacks: number;
  remainingRounds: number;
  delayRounds?: number;
};

export type EncounterState = {
  enemyId: string;
  enemyName: string;
  round: number;
  phase: EncounterPhase;
  visibility: {
    playerToEnemy: VisibilityLevel;
    enemyToPlayer: VisibilityLevel;
  };
  advantage: AdvantageState;
  visionLeadOwner?: AdvantageOwner;
  playerBonus?: {
    target: "speed" | "damage" | "dodge" | "intel";
    amount: number;
  };
  playerBonusPool?: Partial<Record<"speed" | "damage" | "dodge" | "intel", number>>;
  enemyBonus?: {
    target: "speed" | "damage" | "dodge" | "intel";
    amount: number;
  };
  enemyBonusPool?: Partial<Record<"speed" | "damage" | "dodge" | "intel", number>>;
  firstAttackUsed: Record<string, boolean>;
  combatItemUseRound: Record<string, number>;
  pressChoicesUsed: Record<string, boolean>;
  attackDirectionIndex: Record<string, number>;
  attackDirections: Record<string, "left" | "right">;
  activeEffects: ActiveEffect[];
  statusEffects: StatusEffect[];
  triggerChainCount: number;
  rangedAmbushUsed: boolean;
  combatCounted: boolean;
  log: CombatLogEntry[];
};

export type RunOutcome = "inProgress" | "extracted" | "failed";

export type GameOutcome = {
  kind: RunOutcome;
  title: string;
  body: string;
};

export type FeedbackTone = "neutral" | "advantage" | "danger" | "intel";

export type FeedbackEvent = {
  id: string;
  kind:
    | "encounter"
    | "combat-round"
    | "loot-drop"
    | "persuasion-intel"
    | "enemy-flee"
    | "enemy-defeated"
    | "advantage-press"
    | "item-heal"
    | "item-use"
    | "item-reload"
    | "echo-pulse"
    | "gunshot"
    | "tutorial";
  title: string;
  body: string;
  tone: FeedbackTone;
  turn: number;
  round?: number;
  durationMs: number;
  origin?: Position;
  target?: Position;
  positions?: Position[];
  itemId?: ItemId;
};

export type ProfileStatBandId = "baseline" | "trained" | "hardened";

export type MapTierId = "tier-1" | "tier-2" | "tier-3" | "tier-4" | "tier-5";

export type RarityWeights = Record<ItemRarity, number>;

export type MapTierDefinition = {
  id: MapTierId;
  name: string;
  rank: number;
  entryFee: number;
  deploymentValueCap: number;
  enemyStatTotalRange: [number, number];
  enemyStatMax: number;
  rarityWeights: RarityWeights;
  naturalAffixChance: number;
  mythicGemOfferChance: number;
  extractionBonusGold: number;
  lootGoldMultiplier: number;
  enemyStartsWithEnchantedItem: boolean;
  description: string;
};

export type ShopOffer = {
  id: string;
  slot: ProfileItemSlot;
  price: number;
  sold: boolean;
};

export type ShopState = {
  refreshIndex: number;
  offers: ShopOffer[];
};

export type RunSummary = {
  runId: string;
  tierId: MapTierId;
  outcome: RunOutcome;
  lootGold: number;
  itemsRecovered: number;
  itemsLost: number;
};

export type ProfileState = {
  id: string;
  gold: number;
  stats: StatBlock;
  statBandId: ProfileStatBandId;
  stash: ProfileItemSlot[];
  deployment: ProfileItemSlot[];
  selectedMapTierId: MapTierId;
  shop: ShopState;
  runsCompleted: number;
  nextInstanceSerial: number;
  lastRunSummary?: RunSummary;
};

export type MetagameState = {
  profile: ProfileState;
  mapTiers: MapTierDefinition[];
  activeRun: boolean;
  selectedMapTier: MapTierDefinition;
  deploymentValue: number;
  canStartRun: boolean;
  message?: string;
};

export type GameState = {
  seed: string;
  turn: number;
  turnLimit: number;
  loot: number;
  naturalAffixChance?: number;
  metagame?: {
    mapTierId: MapTierId;
    mapTierName: string;
    entryFee: number;
    deploymentValueCap: number;
  };
  rareItemAppearances: Partial<Record<ItemId, number>>;
  player: ActorState;
  inventory: InventorySlot[];
  intel: IntelEntry[];
  map: MapState;
  pendingPickupOffer?: {
    nodeId: string;
    itemIds: ItemId[];
  };
  tutorialScenario?: TutorialScenarioState;
  encounter?: EncounterState;
  playerHiddenUntilTurn?: number;
  feedbackEvents: FeedbackEvent[];
  outcome?: GameOutcome;
  log: string[];
};
