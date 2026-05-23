import { ALL_ITEM_IDS, ITEMS, createInventorySlot } from "./items";
import { itemEnchantmentUiText, itemUiDescription } from "./itemText";
import { directionFromDelta, directionLabel, distance, isSamePosition, createMap } from "./map";
import type { SimulationListener, SimulationPort, Unsubscribe } from "./ports";
import { calculateDerivedStats, clampPercent, DEFAULT_PLAYER_STATS, STAT_KEYS } from "./stats";
import { bonusTargetForPressChoice, calculateFleeChance, calculatePersuasionScore } from "./systems/advantageSystem";
import { canUsePistol as canUsePistolForState } from "./systems/combatSystem";
import { resolveEnemyCivilWars as resolveEnemyCivilWarsForState } from "./systems/enemyCivilWarSystem";
import { chooseEnemyAction as chooseEnemyActionForState, moveAiUnits as moveAiUnitsForState } from "./systems/enemySystem";
import {
  carrierTemplateForItem,
  createGemAffix,
  enchantedItemName,
  enchantmentAdjective,
  enchantmentPower,
  frostEnchantmentStacks,
  isEnchantableSlot,
  isEnchantmentGem,
  setEnchantmentPrep
} from "./systems/enchantmentSystem";
import { itemPowerScore, lootValueForItem } from "./systems/itemBalanceSystem";
import { resolveEnemyCombatItemEffect, resolvePlayerCombatItemEffect, type CombatItemEffectSpec } from "./systems/itemEffectSystem";
import { PASSIVE_ITEM_RULES, passiveRulesForTrigger, type PassiveItemRule, type PassiveTrigger } from "./systems/passiveItemSystem";
import {
  activeEffectAmount as activeEffectAmountForState,
  canManuallyUseSlot,
  markManualSlotUsed,
  recordTriggerChainStep,
  resolveStackedEffectAmount,
  resetTriggerChain
} from "./systems/itemRuntimeSystem";
import { equippedPassiveItemIds, isManualSlotEquipped } from "./systems/itemLimitSystem";
import {
  addItemToActor as addItemToActorForState,
  addSlotToActor as addSlotToActorForState,
  consumeItem as consumeItemForState,
  findSlot as findSlotForActor,
  hasItem as hasItemForActor,
  spendItemUse as spendItemUseForState
} from "./systems/inventorySystem";
import { createGlobalIntelLine } from "./systems/intelTemplateSystem";
import {
  collectEnemyDrops as collectEnemyDropsForEnemy,
  collectEnemyLootNodes as collectEnemyLootNodesForState,
  offerPlayerPickup as offerPlayerPickupForState
} from "./systems/lootSystem";
import {
  canEnter as canEnterState,
  moveActorAway as moveActorAwayInState,
  stepToward as stepTowardInState
} from "./systems/movementSystem";
import { attackDirection as attackDirectionForActor, rollPercent as rollPercentForState } from "./systems/randomSystem";
import { applyStatusEffect, decrementStatusDurations, resolveBleedOnAction, resolveRoundStartStatuses } from "./systems/statusEffectSystem";
import {
  getVisibility as getVisibilityForState,
  hasLineOfSight as hasLineOfSightForState,
  updateVisibilityState
} from "./systems/visibilitySystem";
import {
  TUTORIAL_ENEMY_ONE_ID,
  TUTORIAL_ENEMY_TWO_ID,
  configureTutorialStep,
  createTutorialScenarioState,
  isTutorialEnemyId,
  tutorialInputFromCombatAction
} from "./systems/tutorialSystem";
import type {
  ActiveEffect,
  ActiveEffectStat,
  AdvantageOwner,
  AdvantagePressChoice,
  AdvantageState,
  ActorState,
  CombatAction,
  Direction,
  EnchantmentKind,
  FeedbackEvent,
  FeedbackTone,
  GameState,
  IntelEntry,
  InventorySlot,
  ItemAffix,
  ItemId,
  Position,
  StatKey,
  StatusEffectType,
  TutorialInput,
  TutorialStepId,
  VisibilityLevel
} from "./types";
const TURN_LIMIT = 72;
const DEFENSE_DAMAGE_TAKEN_RATE = 0.4;
const DEFENSE_HEAVY_WOUND_THRESHOLD_BONUS = 2;
const SOFT_CLOSURE_START_ROUND = 3;
const SIGNIFICANT_DAMAGE_THRESHOLD = 6;
const PASSIVE_RULE_ITEM_IDS = new Set<ItemId>(PASSIVE_ITEM_RULES.map((rule) => rule.itemId));
const DIRECT_ENCHANTMENT_ATTACK_ITEM_IDS = new Set<ItemId>(["pistol", "photon-cut", "long-knife", "throwing-knife"]);

type CombatSide = "player" | "enemy";

type DefenseOutcome = {
  effective: boolean;
  reducedDamage: number;
  preventedHeavyWound: boolean;
  triggeredEffect: boolean;
};

type CombatHitResult = {
  text: string;
  dodged: boolean;
  heavyWound: boolean;
  damage: number;
  defense?: DefenseOutcome;
};

type RangedHitResult = CombatHitResult & {
  resolved: boolean;
};

type EnchantmentSource = {
  sourceItemId: ItemId;
  enchantment: EnchantmentKind;
};

const STAT_LABELS: Record<StatKey, string> = {
  spirit: "精神",
  intellect: "智力",
  strength: "力量",
  speed: "速度",
  constitution: "体质"
};

const HEALING_ITEM_RULES: Partial<
  Record<
    ItemId,
    {
      amount: number;
      fieldOnly?: boolean;
      combatOnly?: boolean;
      requiresAdvantage?: boolean;
      clearStatuses?: StatusEffectType[];
      shieldAmount?: number;
      healOnMeleeHit?: number;
      consumesAdvantage?: boolean;
    }
  >
> = {
  bandage: { amount: 3, fieldOnly: true },
  "salve-tin": { amount: 1 },
  "field-ration": { amount: 2, fieldOnly: true },
  "charcoal-tablet": { amount: 1, clearStatuses: ["poison"] },
  "coagulation-powder": { amount: 1, clearStatuses: ["burn", "poison", "bleed"] },
  "antidote-tablet": { amount: 1, clearStatuses: ["poison"] },
  "pressure-bandage": { amount: 3, combatOnly: true, requiresAdvantage: true, consumesAdvantage: true },
  "heat-pad": { amount: 1, combatOnly: true, shieldAmount: 1 },
  "blood-sponge": { amount: 0, combatOnly: true, healOnMeleeHit: 1 }
};

export class GameSimulation implements SimulationPort {
  private state: GameState;
  private listeners = new Set<SimulationListener>();
  private revealBoost = 0;
  private signalFlareTurns = 0;
  private trapCounter = 0;
  private feedbackCounter = 0;
  private effectCounter = 0;
  private passiveAdvantageOwner: "player" | "enemy" | null = null;
  private lastCombatItemSpentAdvantage = false;
  private ambushedEnemyIds = new Set<string>();
  private droppedEnemyIds = new Set<string>();

  constructor(private seed: string) {
    this.state = this.createInitialState();
    this.updateVisibility();
  }

  /** Returns the current simulation state for read-only presentation. */
  snapshot(): GameState {
    return this.state;
  }

  /** Subscribes to simulation changes and returns an unsubscribe function. */
  onChange(listener: SimulationListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /** Resets the run to its initial seeded state. */
  reset(seed?: string): void {
    if (seed) this.seed = seed;
    this.resetRuntimeCounters();
    this.state = this.createInitialState();
    this.updateVisibility();
    this.emit();
  }

  /** Starts the authored tutorial scenario before the formal starter pickup. */
  beginTutorialScenario(): void {
    this.resetRuntimeCounters();
    this.state = this.createTutorialState();
    this.updateVisibility();
    this.checkEncounter();
    this.pushLog("教程开始：请跟随高亮动作完成训练照面。");
    this.emit();
  }

  /** Skips the authored tutorial and returns to the normal starter pickup. */
  skipTutorialScenario(): void {
    if (!this.state.tutorialScenario?.active) return;
    this.resetToStarterAfterTutorial("教程已跳过", "正式开局四选一已经恢复。");
    this.emit();
  }

  private resetRuntimeCounters(): void {
    this.revealBoost = 0;
    this.signalFlareTurns = 0;
    this.trapCounter = 0;
    this.feedbackCounter = 0;
    this.effectCounter = 0;
    this.ambushedEnemyIds.clear();
    this.droppedEnemyIds.clear();
  }

  private emptyAdvantage(): AdvantageState {
    return { owner: null, source: null, bonusAvailable: false, playerPoints: 0, enemyPoints: 0 };
  }

  private createAdvantage(owner: AdvantageOwner, source: AdvantageState["source"]): AdvantageState {
    const advantage = this.emptyAdvantage();
    if (owner === "player") advantage.playerPoints = 1;
    if (owner === "enemy") advantage.enemyPoints = 1;
    advantage.owner = owner;
    advantage.source = owner ? source : null;
    advantage.bonusAvailable = advantage.playerPoints + advantage.enemyPoints > 0;
    return advantage;
  }

  private normalizeAdvantage(advantage: AdvantageState): AdvantageState {
    const legacy = advantage as Partial<AdvantageState>;
    if (legacy.playerPoints === undefined) legacy.playerPoints = legacy.owner === "player" ? 1 : 0;
    if (legacy.enemyPoints === undefined) legacy.enemyPoints = legacy.owner === "enemy" ? 1 : 0;
    legacy.bonusAvailable = (legacy.playerPoints ?? 0) + (legacy.enemyPoints ?? 0) > 0;
    return advantage;
  }

  private advantagePoints(owner: Exclude<AdvantageOwner, null>): number {
    const advantage = this.state.encounter?.advantage;
    if (!advantage) return 0;
    this.normalizeAdvantage(advantage);
    return owner === "player" ? advantage.playerPoints : advantage.enemyPoints;
  }

  private gainAdvantage(owner: Exclude<AdvantageOwner, null>, source: AdvantageState["source"], amount = 1): void {
    const advantage = this.state.encounter?.advantage;
    if (!advantage || amount <= 0) return;
    this.normalizeAdvantage(advantage);
    if (owner === "player") advantage.playerPoints += amount;
    else advantage.enemyPoints += amount;
    advantage.owner = owner;
    advantage.source = source;
    advantage.bonusAvailable = true;
  }

  private spendAdvantage(owner: Exclude<AdvantageOwner, null>, amount = 1): boolean {
    const advantage = this.state.encounter?.advantage;
    if (!advantage || amount <= 0) return false;
    this.normalizeAdvantage(advantage);
    const key = owner === "player" ? "playerPoints" : "enemyPoints";
    if (advantage[key] < amount) return false;
    advantage[key] -= amount;
    if (advantage.playerPoints + advantage.enemyPoints <= 0) {
      advantage.owner = null;
      advantage.source = null;
      advantage.bonusAvailable = false;
      return true;
    }
    if (advantage.owner === owner && advantage[key] <= 0) {
      advantage.owner = advantage.playerPoints > 0 ? "player" : "enemy";
    }
    advantage.bonusAvailable = true;
    return true;
  }

  /** Attempts to move the player by one grid delta and advances the run when legal. */
  move(dx: number, dy: number): void {
    if (this.state.pendingPickupOffer || this.state.encounter || this.state.outcome) return;
    if (this.state.tutorialScenario?.active) {
      this.pushLog("教程中请先完成当前提示动作。");
      this.emit();
      return;
    }
    const next = {
      x: this.state.player.position.x + dx,
      y: this.state.player.position.y + dy
    };

    this.state.player.facing = directionFromDelta(dx, dy);

    if (!this.canEnter(next)) {
      this.pushLog("你摸到一堵冷墙。");
      this.emit();
      return;
    }

    this.state.player.previousPosition = { ...this.state.player.position };
    this.state.player.position = next;
    this.advanceTurn();
    if (this.state.outcome) {
      this.emit();
      return;
    }

    const tile = this.state.map.tiles[next.y][next.x];
    if (tile === "exit") {
      this.extract();
    } else if (this.offerPlayerPickup()) {
      this.pushLog("你踩到一处道具节点，三件可用物只来得及带走一件。");
    } else {
      this.checkEncounter();
    }
    this.emit();
  }

  /** Resolves the pending three-choice pickup offer without advancing time. */
  choosePickup(itemId: ItemId | null): void {
    const offer = this.state.pendingPickupOffer;
    if (!offer || this.state.outcome) return;
    const isStarterOffer = offer.nodeId === "starter";
    if (isStarterOffer && (!itemId || !offer.itemIds.includes(itemId))) return;
    const node = this.state.map.lootNodes.find((candidate) => candidate.id === offer.nodeId);
    if (node) node.depleted = true;
    this.state.pendingPickupOffer = undefined;

    if (itemId && offer.itemIds.includes(itemId)) {
      const slot = this.addItemToActor(this.state.player, itemId);
      if (!isStarterOffer) this.state.loot += lootValueForItem(ITEMS[itemId]);
      const enchantmentText = itemEnchantmentUiText(slot);
      this.pushLog(`你选择 ${enchantedItemName(slot)}。${itemUiDescription(itemId)}${enchantmentText ? ` ${enchantmentText}` : ""}`);
    } else {
      this.pushLog("你放弃了这处道具节点。");
    }

    this.checkEncounter();
    this.emit();
  }

  /** Uses a carried item through the simulation's item rules. */
  useItem(itemId: ItemId): void {
    const slot = this.findSlot(this.state.player, itemId);
    if (!slot || this.state.pendingPickupOffer || this.state.outcome) return;
    if (this.state.tutorialScenario?.active) {
      this.pushLog("教程战斗暂时锁定道具使用，请按提示学习基础动作。");
      this.emit();
      return;
    }
    if (!isManualSlotEquipped(this.state.player, slot)) {
      this.pushLog(`${slot.item.name}没有装入当前主动槽。`);
      this.emit();
      return;
    }
    const manualCheck = canManuallyUseSlot(this.state, slot);
    if (!manualCheck.ok) {
      this.pushLog(manualCheck.reason ?? "本回合这件道具不能再次使用。");
      this.emit();
      return;
    }

    let used = false;
    let advancedTurn = false;
    const wasInEncounter = Boolean(this.state.encounter);
    if (itemId === "glow" && !this.state.encounter) {
      this.revealBoost = 3;
      this.spendItemUse(this.state.player, itemId);
      this.updateVisibility();
      this.pushLog("照明棒亮起，迷宫短暂露出更多边角。");
      used = true;
    } else if (itemId === "signal-flare" && !this.state.encounter) {
      this.signalFlareTurns = 2;
      this.spendItemUse(this.state.player, itemId);
      this.updateVisibility();
      this.state.map.hints.push({ ...this.state.player.position });
      this.pushLog("信号火炸亮，周围短暂清晰，同时你的位置也被红光标出。");
      used = true;
    } else if (itemId === "echo" && !this.state.encounter) {
      used = this.useEchoNeedle();
    } else if (isEnchantmentGem(itemId) && !this.state.encounter) {
      used = this.useEnchantmentGem(itemId);
    } else if (itemId === "folded-map" && !this.state.encounter) {
      this.spendItemUse(this.state.player, itemId);
      const template = this.pickFromList(["enemy-average-speed", "enemy-average-strength", "most-equipped-actor"] as const, "folded-map-global-intel");
      this.pushLog(`折叠地图提供全场情报：${createGlobalIntelLine(this.state, template)}。`);
      used = true;
    } else if (itemId === "red-compass" && !this.state.encounter) {
      used = this.useRedCompass();
    } else if (itemId === "signal-mirror" && !this.state.encounter) {
      const target = this.findVisibleEnemyInRange(6);
      if (target) {
        this.spendItemUse(this.state.player, itemId);
        this.revealEnemyItem(target, "item");
        this.pushLog(`信号镜晃过 ${target.name}，记录 1 条道具情报。`);
        used = true;
      } else {
        this.pushLog("视野内没有可被信号镜照到的敌人。");
      }
    } else if (itemId === "runner-knot" && !this.state.encounter) {
      used = this.useRunnerKnot();
      advancedTurn = used;
    } else if ((itemId === "trap" || itemId === "caltrops" || itemId === "bell-wire" || itemId === "tripwire-spool") && !this.state.encounter) {
      this.placeTrap(itemId);
      this.consumeItem(this.state.player, itemId);
      this.advanceTurn();
      advancedTurn = true;
      if (!this.state.outcome) this.checkEncounter();
      used = true;
    } else if (itemId === "black-cloth" && !this.state.encounter) {
      this.state.playerHiddenUntilTurn = this.state.turn + 2;
      this.spendItemUse(this.state.player, itemId);
      this.updateVisibility();
      this.pushLog("黑布遮住灯影，接下来 2 回合敌人看见你的距离 -1；攻击会立刻失效。");
      used = true;
    } else if (itemId === "voice-whistle" && !this.state.encounter) {
      used = this.useVoiceWhistle();
      advancedTurn = used;
    } else if (this.isHealingItem(itemId)) {
      used = this.useHealingItem(this.state.player, itemId);
    } else if (itemId === "stitch-kit") {
      used = this.useStitchKit(this.state.player);
    } else if (itemId === "antidote-tablet") {
      used = this.useAntidoteTablet();
    } else if (itemId === "old-magazine") {
      used = this.useOldMagazine();
      advancedTurn = used;
    } else if (itemId === "pistol" && !this.state.encounter) {
      const target = this.findVisibleEnemyInRange(4);
      if (target) used = this.usePistol(this.state.player, target, true);
      else this.pushLog("你没有看见能被手枪命中的目标。");
    } else if ((itemId === "throwing-knife" || itemId === "long-knife") && !this.state.encounter) {
      const target = this.findVisibleEnemyInRange(2);
      if (target) used = this.throwKnife(this.state.player, target, itemId);
      else this.pushLog("你没有看见能被投掷命中的目标。");
    } else if (this.state.encounter) {
      used = this.usePlayerCombatItem(slot);
    } else {
      this.pushLog(`${slot.item.name}当前没有可手动触发的端口，会在满足条件时自动生效。`);
    }

    if (used) {
      this.prepareEnchantmentFromUsedItem(this.state.player, slot);
      markManualSlotUsed(this.state, slot);
      if (
        !wasInEncounter &&
        !advancedTurn &&
        (slot.item.useContext === "field" || slot.item.useContext === "both" || itemId === "pistol" || itemId === "throwing-knife" || itemId === "long-knife")
      ) {
        this.advanceTurnPreservingHints();
        advancedTurn = true;
        if (!this.state.outcome) this.checkEncounter();
      }
    }
    this.emit();
  }

  /** Plays one combat action when the encounter is waiting for player input. */
  playCombatAction(action: CombatAction): void {
    const encounter = this.state.encounter;
    if (!encounter || this.state.outcome || encounter.phase !== "chooseAction") return;

    if (this.resolveTutorialCombatAction(action)) {
      this.emit();
      return;
    }

    const enemy = this.getEncounterEnemy();
    const aiAction = this.chooseEnemyAction(enemy);
    this.resolveActionRound(action, aiAction, enemy);
    this.emit();
  }

  /** Attempts to spend a player-owned advantage window on escape. */
  tryFlee(): void {
    const encounter = this.state.encounter;
    if (!encounter || this.advantagePoints("player") < 1) {
      this.pushLog("逃跑需要支付 1 点优势。");
      this.emit();
      return;
    }
    this.spendAdvantage("player");

    const enemy = this.getEncounterEnemy();
    const softBonus = this.consumePassiveFlag(this.state.player, "soft-shoes", "mobility") ? 10 : 0;
    const itemBonus =
      this.consumeEffectAmount(this.state.player, "flee", "owned", "nextFlee") +
      this.consumeEffectAmount(this.state.player, "flee", "targeted", "nextFlee") +
      this.effectAmount(this.state.player, "flee", "owned", "round") +
      this.effectAmount(this.state.player, "flee", "targeted", "round");
    const playerSpeed = this.state.player.stats.speed + this.effectAmount(this.state.player, "speed", "both", "round");
    const enemySpeed = enemy.stats.speed + this.effectAmount(enemy, "speed", "both", "round");
    const chance = calculateFleeChance(playerSpeed - enemySpeed, softBonus + itemBonus);
    if (softBonus || itemBonus) this.pushLog(`逃跑修正生效：${softBonus + itemBonus >= 0 ? "+" : ""}${softBonus + itemBonus}%。`);
    if (this.rollPercent("flee") <= chance) {
      this.moveActorAway(this.state.player, enemy.position);
      this.endEncounter("你抓住空隙拉开一格，脱离照面。");
    } else {
      encounter.phase = "chooseAction";
      encounter.enemyBonus = { target: "speed", amount: 1 };
      this.pushLog("你想走，但对方已经封住退路。对方下一次进攻更快。");
    }
    this.emit();
  }

  /** Converts a player-owned advantage window into a one-shot combat bonus. */
  continueFight(choice: AdvantagePressChoice = "pressTempo"): void {
    if (this.state.tutorialScenario?.active) {
      this.resolveTutorialContinueFight(choice);
      this.emit();
      return;
    }
    const encounter = this.state.encounter;
    if (!encounter || this.advantagePoints("player") < 1) return;
    const bonusTarget = bonusTargetForPressChoice(choice);
    this.spendAdvantage("player");
    const nextAmount = (encounter.playerBonusPool?.[bonusTarget] ?? 0) + 1;
    encounter.playerBonusPool = { ...(encounter.playerBonusPool ?? {}), [bonusTarget]: nextAmount };
    encounter.playerBonus = { target: bonusTarget, amount: nextAmount };
    encounter.phase = "chooseAction";
    this.pushLog(`你支付 1 点优势，把压注叠到下一次${this.bonusLabel(bonusTarget)}（+${encounter.playerBonus.amount}）。`);
    this.pushFeedback({
      kind: "advantage-press",
      title: "续战压注",
      body: bonusTarget === "damage" ? `你把优势压进下一动作回合：近战伤害 +${encounter.playerBonus.amount}。` : `你把优势压进下一动作回合：速度 +${encounter.playerBonus.amount}。`,
      tone: "advantage",
      round: encounter.round,
      durationMs: 1000
    });
    this.emit();
  }

  /** Attempts to spend a player-owned advantage window on persuasion. */
  tryPersuade(): void {
    if (this.state.tutorialScenario?.active) {
      this.resolveTutorialPersuade();
      this.emit();
      return;
    }
    const encounter = this.state.encounter;
    if (!encounter || this.advantagePoints("player") < 1) {
      this.pushLog("说服需要支付 1 点优势，让对方愿意听你的条件。");
      this.emit();
      return;
    }
    this.spendAdvantage("player");

    const enemy = this.getEncounterEnemy();
    const knownCount = this.state.intel.filter((intel) => intel.targetId === enemy.id && intel.certainty === "confirmed").length;
    const paymentModifier = Math.min(2, Math.floor(this.state.loot / 2));
    const itemPayment = this.consumeEffectAmount(this.state.player, "persuasion", "owned", "persuasion");
    const situationModifier = enemy.hp <= calculateDerivedStats(enemy.stats).heavyWoundThreshold ? 2 : 0;
    const persuasion = calculatePersuasionScore({
      intellect: this.effectiveIntellect(this.state.player),
      confirmedIntelCount: knownCount,
      paymentModifier,
      itemModifier: itemPayment,
      situationModifier,
      hostilityModifier: 0,
      target: 8
    });
    if (paymentModifier) this.state.loot -= paymentModifier * 2;
    if (paymentModifier) this.pushLog(`你支付了 ${paymentModifier} 份战利筹码，说服修正 +${paymentModifier}。`);
    if (persuasion.item) this.pushLog(`说服道具修正 +${persuasion.item}。`);
    if (situationModifier) this.pushLog(`对方状态动摇，说服局势修正 +${situationModifier}。`);

    if (persuasion.score >= persuasion.target) {
      enemy.neutralUntilTurn = this.state.turn + 6;
      const intelStart = this.state.intel.length;
      this.revealEnemyItem(enemy, "persuasion");
      this.revealEnemyStat(enemy, "persuasion");
      const gained = this.state.intel
        .slice(intelStart)
        .filter((intel) => intel.targetId === enemy.id)
        .map((intel) => intel.value);
      this.pushFeedback({
        kind: "persuasion-intel",
        title: "说服成功",
        body: gained.length > 0 ? gained.join("；") : "未见新的属性或道具情报",
        tone: "intel",
        durationMs: 1000
      });
      this.endEncounter("你把已知信息压上桌，对方收手让路。");
    } else {
      this.pushLog("话术没有生效，对方更确定你在虚张声势。");
      encounter.phase = "chooseAction";
    }
    this.emit();
  }

  private createInitialState(options: { starterOffer?: boolean } = {}): GameState {
    const { map, playerStart, rareItemAppearances } = createMap(this.seed);
    const player: ActorState = {
      id: "player",
      name: "玩家",
      faction: "player",
      position: { ...playerStart },
      previousPosition: { ...playerStart },
      facing: "east",
      stats: { ...DEFAULT_PLAYER_STATS },
      hp: calculateDerivedStats(DEFAULT_PLAYER_STATS).maxHp,
      combatCount: 0,
      inventory: [],
      defeated: false,
      awareness: { level: "visible" }
    };

    return {
      seed: this.seed,
      turn: 0,
      turnLimit: TURN_LIMIT,
      loot: 0,
      rareItemAppearances,
      player,
      inventory: player.inventory,
      intel: [],
      map,
      pendingPickupOffer: options.starterOffer === false ? undefined : { nodeId: "starter", itemIds: ["echo", "pistol", "bandage", "photon-cut"] },
      feedbackEvents: [],
      log: ["你在牌桌般安静的迷宫里醒来。"]
    };
  }

  private createTutorialState(): GameState {
    const state = this.createInitialState({ starterOffer: false });
    state.tutorialScenario = createTutorialScenarioState();
    state.loot = 0;
    state.intel = [];
    state.feedbackEvents = [];
    state.log = ["训练开始：这不是正式局。完成教程后才会进入开局四选一。"];
    state.map.hints = [];
    state.map.traps = [];
    state.map.lootNodes = state.map.lootNodes.map((node) => ({ ...node, depleted: true }));
    state.map.aiUnits = [];
    state.player.inventory = [createInventorySlot("long-knife")];
    state.inventory = state.player.inventory;
    state.player.hp = calculateDerivedStats(state.player.stats).maxHp;
    state.player.previousPosition = { ...state.player.position };

    const firstEnemyPosition = this.findTutorialSpawn(state, state.player.position, 1, 1, []);
    const secondEnemyPosition = this.findTutorialSpawn(state, state.player.position, 1, 1, [firstEnemyPosition]);
    state.map.aiUnits = [
      this.createTutorialEnemy(
        TUTORIAL_ENEMY_ONE_ID,
        "高速重击训练敌",
        firstEnemyPosition,
        { spirit: 1, intellect: 1, strength: 4, speed: 3, constitution: 1 },
        ["long-knife"],
        state.player.position
      ),
      this.createTutorialEnemy(
        TUTORIAL_ENEMY_TWO_ID,
        "低智谈判训练敌",
        secondEnemyPosition,
        { spirit: 2, intellect: 1, strength: 2, speed: 2, constitution: 3 },
        [],
        state.player.position
      )
    ];
    return state;
  }

  private createTutorialEnemy(id: string, name: string, position: Position, stats: ActorState["stats"], itemIds: ItemId[], playerPosition: Position): ActorState {
    return {
      id,
      name,
      faction: "enemy",
      position: { ...position },
      previousPosition: { ...position },
      facing: "west",
      stats,
      hp: calculateDerivedStats(stats).maxHp,
      combatCount: 0,
      inventory: itemIds.map((itemId) => createInventorySlot(itemId)),
      defeated: false,
      enemyTier: "normal",
      patrol: [{ ...position }],
      patrolIndex: 0,
      awareness: { level: "aware", lastKnownPosition: { ...playerPosition }, source: "memory" },
      aiState: "duel"
    };
  }

  private findTutorialSpawn(state: GameState, origin: Position, minDistance: number, maxDistance: number, occupied: Position[]): Position {
    const candidates: Position[] = [];
    for (let radius = minDistance; radius <= maxDistance; radius += 1) {
      for (let y = 0; y < state.map.height; y += 1) {
        for (let x = 0; x < state.map.width; x += 1) {
          const position = { x, y };
          if (distance(position, origin) !== radius) continue;
          if (occupied.some((used) => isSamePosition(used, position))) continue;
          if (isSamePosition(position, origin)) continue;
          if (!canEnterState(state, position)) continue;
          if (radius === 1 && !canEnterState(state, position, origin)) continue;
          candidates.push(position);
        }
      }
      if (candidates.length > 0) return { ...candidates[0] };
    }
    if (maxDistance < 5) return this.findTutorialSpawn(state, origin, minDistance, 5, occupied);
    return { x: Math.min(state.map.width - 1, origin.x + 1), y: origin.y };
  }

  private resetToStarterAfterTutorial(title: string, body: string): void {
    this.resetRuntimeCounters();
    this.state = this.createInitialState();
    this.updateVisibility();
    this.pushFeedback({
      kind: "tutorial",
      title,
      body,
      tone: "intel",
      durationMs: 1400
    });
    this.pushLog(`${title}：${body}`);
  }

  private advanceTurn(): void {
    this.state.turn += 1;
    if (this.state.tutorialScenario?.active) {
      this.updateVisibility();
      return;
    }
    this.moveAiUnits();
    this.collectEnemyLootNodes();
    this.updateVisibility();
    this.resolveEnemyCivilWars();
    this.triggerTraps();
    this.resolveEnemyRangedAmbushes();
    if (this.revealBoost > 0) this.revealBoost -= 1;
    if (this.signalFlareTurns > 0) this.signalFlareTurns -= 1;
    if (this.state.player.hp <= 0) this.failRun("被迫离桌", "最后一手失算，你失去了这局的大部分收获。");
  }

  private advanceTurnPreservingHints(): void {
    const hints = this.state.map.hints.map((hint) => ({ ...hint }));
    this.advanceTurn();
    for (const hint of hints) {
      if (!this.state.map.hints.some((existing) => isSamePosition(existing, hint))) this.state.map.hints.push(hint);
    }
  }

  private offerPlayerPickup(): boolean {
    return offerPlayerPickupForState(this.state);
  }

  private collectEnemyLootNodes(): void {
    for (const log of collectEnemyLootNodesForState(this.state)) this.pushLog(log);
  }

  private resolveEnemyCivilWars(): void {
    for (const log of resolveEnemyCivilWarsForState(this.state, this.droppedEnemyIds)) this.pushLog(log);
  }




  private updateVisibility(): void {
    updateVisibilityState(this.state, this.revealBoost + (this.signalFlareTurns > 0 ? 4 : 0), (enemy) => this.revealBasicIntel(enemy));
  }

  private getVisibility(viewer: ActorState, target: ActorState): VisibilityLevel {
    return getVisibilityForState(this.state, viewer, target);
  }

  private hasLineOfSight(from: Position, to: Position): boolean {
    return hasLineOfSightForState(this.state, from, to);
  }



  private moveAiUnits(): void {
    moveAiUnitsForState(this.state);
  }




  private triggerTraps(): void {
    for (const trap of this.state.map.traps) {
      if (!trap.armed) continue;
      const enemy = this.state.map.aiUnits.find((unit) => !unit.defeated && isSamePosition(unit.position, trap.position));
      if (!enemy) continue;
      trap.armed = false;
      enemy.awareness = { level: "aware", lastKnownPosition: { ...this.state.player.position }, source: "trap" };
      this.state.map.hints.push({ ...enemy.position });
      const itemId = trap.itemId ?? "trap";
      if (itemId === "tripwire-spool") {
        const notes: string[] = [];
        enemy.hp = Math.max(0, enemy.hp - 1);
        this.applyTrapEnchantment(trap.affix, this.state.player, enemy, 1, notes);
        this.revealEnemyStat(enemy, "trap");
        this.pushLog(`${enemy.name}触发绊线卷，受到 1 点伤害并暴露 1 条属性数值情报${notes.length ? `；${notes.join("；")}` : ""}。`);
        if (enemy.hp <= 0) {
          enemy.defeated = true;
          this.collectEnemyDrops(enemy);
        }
        continue;
      }
      if (itemId === "caltrops") {
        const notes: string[] = [];
        enemy.hp = Math.max(0, enemy.hp - 1);
        this.applyTrapEnchantment(trap.affix, this.state.player, enemy, 1, notes);
        this.revealEnemyStat(enemy, "trap", "speed");
        this.pushLog(`${enemy.name}踩中铁蒺藜，受到 1 点伤害，并暴露当前位置${notes.length ? `；${notes.join("；")}` : ""}。`);
        if (enemy.hp <= 0) {
          enemy.defeated = true;
          this.collectEnemyDrops(enemy);
        }
      } else if (itemId === "bell-wire") {
        const notes: string[] = [];
        this.applyTrapEnchantment(trap.affix, this.state.player, enemy, 1, notes);
        this.revealEnemyItem(enemy, "trap");
        this.pushLog(`${enemy.name}触发铜铃线，方向被红光标出，并暴露 1 件道具情报${notes.length ? `；${notes.join("；")}` : ""}。`);
      } else {
        const notes: string[] = [];
        this.applyTrapEnchantment(trap.affix, this.state.player, enemy, 1, notes);
        this.revealEnemyItem(enemy, "trap");
        this.revealEnemyStat(enemy, "trap");
        this.pushLog(`${enemy.name}触发陷阱，方向被红光标出，并暴露 1 条数值/道具情报${notes.length ? `；${notes.join("；")}` : ""}。`);
      }
    }
  }

  private resolveEnemyRangedAmbushes(): void {
    if (this.state.encounter || this.state.outcome) return;
    for (const enemy of this.state.map.aiUnits) {
      if (enemy.defeated || (enemy.neutralUntilTurn ?? 0) > this.state.turn) continue;
      if (this.ambushedEnemyIds.has(enemy.id)) continue;
      if (this.getVisibility(enemy, this.state.player) !== "visible") continue;
      if (this.getVisibility(this.state.player, enemy) === "visible") continue;
      if (!this.canUsePistol(enemy, this.state.player)) continue;
      enemy.combatCount += 1;
      this.usePistol(enemy, this.state.player, false);
      this.ambushedEnemyIds.add(enemy.id);
      const direction = directionLabel(directionFromDelta(enemy.position.x - this.state.player.position.x, enemy.position.y - this.state.player.position.y));
      this.state.map.hints.push({ ...enemy.position });
      this.pushLog(`${direction}侧有枪声，你被未见的${enemy.name}击中。`);
      break;
    }
  }

  private checkEncounter(): void {
    if (this.state.encounter || this.state.outcome) return;
    const enemy = this.state.map.aiUnits.find((unit) => {
      if (unit.defeated || (unit.neutralUntilTurn ?? 0) > this.state.turn) return false;
      const adjacent = distance(unit.position, this.state.player.position) <= 1;
      const playerToEnemy = this.getVisibility(this.state.player, unit);
      const enemyToPlayer = this.getVisibility(unit, this.state.player);
      if (adjacent) return playerToEnemy !== "unseen" || enemyToPlayer !== "unseen" || unit.awareness.level === "aware";
      return playerToEnemy === "visible" && enemyToPlayer !== "visible";
    });
    if (!enemy) return;
    const playerToEnemy = this.getVisibility(this.state.player, enemy);
    const enemyToPlayer = this.getVisibility(enemy, this.state.player);
    const owner = playerToEnemy === "visible" && enemyToPlayer !== "visible" ? "player" : enemyToPlayer === "visible" && playerToEnemy !== "visible" ? "enemy" : null;
    this.state.encounter = {
      enemyId: enemy.id,
      enemyName: enemy.name,
      round: 0,
      phase: "chooseAction",
      visibility: { playerToEnemy, enemyToPlayer },
      advantage: this.createAdvantage(owner, owner ? "vision" : null),
      visionLeadOwner: owner,
      firstAttackUsed: {},
      combatItemUseRound: {},
      pressChoicesUsed: {},
      attackDirectionIndex: {},
      attackDirections: {},
      activeEffects: [],
      statusEffects: [],
      triggerChainCount: 0,
      rangedAmbushUsed: false,
      combatCounted: false,
      log: []
    };
    this.applyCombatStartPassives(this.state.player, enemy);
    this.applyCombatStartPassives(enemy, this.state.player);
    if (owner === "player") this.gainIntel(enemy, 2, "sight");
    this.pushLog(owner === "player" ? `你先看见${enemy.name}，占到照面优势。` : `你和${enemy.name}照面了。`);
    this.pushFeedback({
      kind: "encounter",
      title: "照面",
      body: this.encounterFeedbackBody(enemy, owner, playerToEnemy, enemyToPlayer),
      tone: this.feedbackToneForOwner(owner),
      durationMs: 1200
    });
    if (owner === "enemy") this.applyEnemyAdvantage(enemy);
  }

  private resolveActionRound(playerAction: CombatAction, enemyAction: CombatAction, enemy: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    this.markEncounterCombatStarted(enemy);
    encounter.round += 1;
    resetTriggerChain(this.state);
    this.passiveAdvantageOwner = null;
    this.lastCombatItemSpentAdvantage = false;
    const roundLogStart = encounter.log.length;
    encounter.log.push({ round: encounter.round, text: `你选择${this.actionLabel(playerAction)}，${enemy.name}选择${this.actionLabel(enemyAction)}。` });
    this.applyRoundTimingPassives(this.state.player, enemy);
    this.applyRoundTimingPassives(enemy, this.state.player);
    if (playerAction.type === "attack" || playerAction.type === "ranged") this.state.playerHiddenUntilTurn = undefined;
    const statusStart = resolveRoundStartStatuses(encounter, [this.state.player, enemy]);
    for (const text of statusStart.logs) encounter.log.push({ round: encounter.round, text });
    const playerFrozen = statusStart.skippedActorIds.has(this.state.player.id);
    const enemyFrozen = statusStart.skippedActorIds.has(enemy.id);
    if (!playerFrozen) {
      for (const text of resolveBleedOnAction(encounter, this.state.player, playerAction.type)) encounter.log.push({ round: encounter.round, text });
    }
    if (!enemyFrozen) {
      for (const text of resolveBleedOnAction(encounter, enemy, enemyAction.type)) encounter.log.push({ round: encounter.round, text });
    }

    const playerDefending = !playerFrozen && playerAction.type === "defend";
    const enemyDefending = !enemyFrozen && enemyAction.type === "defend";
    const playerDodge = !playerFrozen && playerAction.type === "dodge" ? playerAction.direction : undefined;
    const enemyDodge = !enemyFrozen && enemyAction.type === "dodge" ? enemyAction.direction : undefined;
    let advantageOwner: "player" | "enemy" | null = null;
    let advantageSource: "defend" | "dodge" | "heavyWound" | "item" | "forced" | null = null;
    let effectiveDefenseOwner: CombatSide | null = null;
    let successfulDodgeOwner: CombatSide | null = null;
    let significantDamage: { owner: CombatSide; amount: number } | null = null;
    const effectiveDefenseActors = new Set<string>();
    const defensiveReadActors = new Set<string>();
    const defenseNoAdvantageActors = new Set<string>();

    const recordAttackResult = (attacker: ActorState, defender: ActorState, result: CombatHitResult): void => {
      if (result.defense && defender.faction === "player" && attacker.faction === "enemy" && !defensiveReadActors.has(defender.id)) {
        defensiveReadActors.add(defender.id);
        this.gainIntel(attacker, 2, "defend");
      }
      if (
        result.defense &&
        !result.defense.effective &&
        defender.faction === "player" &&
        attacker.faction === "enemy" &&
        !defenseNoAdvantageActors.has(defender.id)
      ) {
        defenseNoAdvantageActors.add(defender.id);
        this.pushDefenseNoAdvantageFeedback(attacker, result.defense, result.heavyWound);
      }
      if (result.dodged) {
        successfulDodgeOwner = defender.faction;
        return;
      }
      if (result.defense?.effective) {
        this.awardEffectiveDefense(defender, attacker, effectiveDefenseActors);
        effectiveDefenseOwner = defender.faction;
        return;
      }
      if (result.damage < SIGNIFICANT_DAMAGE_THRESHOLD) return;
      if (!significantDamage || result.damage > significantDamage.amount) {
        significantDamage = { owner: attacker.faction, amount: result.damage };
      } else if (result.damage === significantDamage.amount && significantDamage.owner !== attacker.faction) {
        significantDamage = null;
      }
    };

    if (!playerFrozen && playerAction.type === "ranged") {
      const result = this.resolveRangedAttack(this.state.player, enemy, {
        defenderDodge: enemyDodge,
        defenderDefending: enemyDefending
      });
      encounter.log.push({ round: encounter.round, text: result.text });
      this.triggerDamageEvents(this.state.player, enemy, result.damage, result.heavyWound);
      if (!result.resolved) {
        advantageOwner = null;
      } else if (result.dodged) {
        advantageOwner = "enemy";
        advantageSource = "dodge";
        successfulDodgeOwner = "enemy";
      } else if (result.defense?.effective) {
        recordAttackResult(this.state.player, enemy, result);
        advantageOwner = "enemy";
        advantageSource = "defend";
      } else {
        recordAttackResult(this.state.player, enemy, result);
        advantageOwner = "player";
        advantageSource = result.heavyWound ? "heavyWound" : "item";
      }
    }
    if (!enemyFrozen && enemyAction.type === "ranged") {
      const result = this.resolveRangedAttack(enemy, this.state.player, {
        defenderDodge: playerDodge,
        defenderDefending: playerDefending
      });
      encounter.log.push({ round: encounter.round, text: result.text });
      this.triggerDamageEvents(enemy, this.state.player, result.damage, result.heavyWound);
      if (!result.resolved) {
        // No advantage change.
      } else if (result.dodged) {
        advantageOwner = "player";
        advantageSource = "dodge";
        successfulDodgeOwner = "player";
      } else if (result.defense?.effective) {
        recordAttackResult(enemy, this.state.player, result);
        if (!advantageOwner) {
          advantageOwner = "player";
          advantageSource = "defend";
        }
      } else if (!advantageOwner) {
        recordAttackResult(enemy, this.state.player, result);
        advantageOwner = "enemy";
        advantageSource = result.heavyWound ? "heavyWound" : "item";
      } else {
        recordAttackResult(enemy, this.state.player, result);
      }
    }
    if (!enemyFrozen && enemyAction.type === "useItem" && this.isHealingItem(enemyAction.itemId)) {
      const usedHealing = this.useHealingItem(enemy, enemyAction.itemId);
      const enemyHealingSlot = this.findSlot(enemy, enemyAction.itemId);
      if (enemyHealingSlot) markManualSlotUsed(this.state, enemyHealingSlot);
      if (usedHealing) encounter.log.push({ round: encounter.round, text: `${enemy.name} uses ${ITEMS[enemyAction.itemId].name}.` });
    } else if (!enemyFrozen && enemyAction.type === "useItem" && enemyAction.itemId === "old-magazine") {
      if (this.useOldMagazine(enemy)) encounter.log.push({ round: encounter.round, text: `${enemy.name} reloads a pistol.` });
    } else if (!enemyFrozen && enemyAction.type === "useItem" && enemyAction.itemId === "stitch-kit") {
      if (this.useStitchKit(enemy)) encounter.log.push({ round: encounter.round, text: `${enemy.name} uses ${ITEMS[enemyAction.itemId].name}.` });
    } else if (!enemyFrozen && enemyAction.type === "useItem" && (enemyAction.itemId === "long-knife" || enemyAction.itemId === "throwing-knife")) {
      if (this.throwKnife(enemy, this.state.player, enemyAction.itemId)) {
        encounter.log.push({ round: encounter.round, text: `${enemy.name} throws ${ITEMS[enemyAction.itemId].name}.` });
        advantageOwner = "enemy";
        advantageSource = "item";
      }
    } else if (!enemyFrozen && enemyAction.type === "useItem" && this.useEnemyCombatItem(enemy, enemyAction.itemId)) {
      if (!this.lastCombatItemSpentAdvantage) {
        advantageOwner = "enemy";
        advantageSource = "item";
      }
    }
    if (this.state.outcome || !this.state.encounter) {
      this.pushCombatRoundFeedback(encounter, roundLogStart, "danger");
      return;
    }

    const attacks: Array<{ actor: ActorState; target: ActorState; action: CombatAction; defenderDodge?: "left" | "right"; defenderDefending: boolean }> = [];
    if (!playerFrozen && playerAction.type === "attack") {
      attacks.push({ actor: this.state.player, target: enemy, action: playerAction, defenderDodge: enemyDodge, defenderDefending: enemyDefending });
    }
    if (!enemyFrozen && enemyAction.type === "attack") {
      attacks.push({ actor: enemy, target: this.state.player, action: enemyAction, defenderDodge: playerDodge, defenderDefending: playerDefending });
    }

    attacks.sort((a, b) => this.getActionSpeed(b.actor, b.action) - this.getActionSpeed(a.actor, a.action) || this.getTieStrength(b.actor) - this.getTieStrength(a.actor));

    for (const attack of attacks) {
      if (attack.actor.defeated || attack.actor.hp <= 0) continue;
      const result = this.resolveMeleeAttack(attack.actor, attack.target, {
        defenderDodge: attack.defenderDodge,
        defenderDefending: attack.defenderDefending
      });
      encounter.log.push({ round: encounter.round, text: result.text });
      this.triggerDamageEvents(attack.actor, attack.target, result.damage, result.heavyWound);
      if (result.dodged) {
        advantageOwner = attack.target.faction;
        advantageSource = "dodge";
        successfulDodgeOwner = attack.target.faction;
        if (attack.target.faction === "player") this.revealFromGlasses(enemy);
      }
      if (!result.dodged && result.defense?.effective && !result.heavyWound && !advantageOwner) {
        recordAttackResult(attack.actor, attack.target, result);
        advantageOwner = attack.target.faction;
        advantageSource = "defend";
      } else {
        recordAttackResult(attack.actor, attack.target, result);
      }
      if (result.heavyWound && !result.defense?.effective) {
        advantageOwner = attack.actor.faction;
        advantageSource = "heavyWound";
        if (attack.target.faction === "enemy" && attack.target.hp <= 0) attack.target.defeated = true;
        if (attack.target.faction === "player" && attack.target.hp <= 0) {
          this.pushCombatRoundFeedback(encounter, roundLogStart, "danger", "你被重伤击倒。");
          this.failRun("被迫离桌", "你被重伤击倒，失去了这局的大部分收获。");
          return;
        }
        break;
      }
    }

    if (enemy.defeated || enemy.hp <= 0) {
      enemy.defeated = true;
      if (this.handleTutorialEnemyDefeated(enemy, encounter, roundLogStart)) return;
      this.state.loot += 2;
      this.pushCombatRoundFeedback(encounter, roundLogStart, "advantage", `你击败${enemy.name}。`);
      this.pushEnemyDefeatedFeedback(enemy);
      this.collectEnemyDrops(enemy);
      this.endEncounter(`你击败${enemy.name}，对方把路和物资都让了出来。`);
      return;
    }

    if (this.state.player.hp <= 0) {
      this.pushCombatRoundFeedback(encounter, roundLogStart, "danger", "你倒在这一轮之后。");
      this.failRun("被迫离桌", "最后一手失算，你失去了这局的大部分收获。");
      return;
    }

    this.tryBreathCordIntel(enemy);
    this.tickActiveEffects();
    for (const text of decrementStatusDurations(encounter)) encounter.log.push({ round: encounter.round, text });

    if (!advantageOwner && this.passiveAdvantageOwner) {
      advantageOwner = this.passiveAdvantageOwner;
      advantageSource = "item";
    }
    this.passiveAdvantageOwner = null;

    if (!advantageOwner && encounter.round >= SOFT_CLOSURE_START_ROUND) {
      const significantDamageOwner = (significantDamage as { owner: CombatSide; amount: number } | null)?.owner ?? null;
      const closureOwner = this.softClosureOwner(enemy, effectiveDefenseOwner, successfulDodgeOwner, significantDamageOwner);
      if (!closureOwner) {
        this.moveActorAway(this.state.player, enemy.position);
        this.moveActorAway(enemy, this.state.player.position);
        this.pushLog("第三手后仍无人占优，你们同时后撤。");
        this.pushCombatRoundFeedback(encounter, roundLogStart, "neutral", "照面没有形成窗口，双方后撤脱战。");
        this.endEncounter("第三手后仍无人占优，双方脱战。");
        return;
      }
      advantageOwner = closureOwner;
      advantageSource = closureOwner === effectiveDefenseOwner ? "defend" : closureOwner === successfulDodgeOwner ? "dodge" : "forced";
      this.pushLog("第三手后照面进入软收束。");
    }

    if (advantageOwner) {
      this.gainAdvantage(advantageOwner, advantageSource);
      encounter.phase = "chooseAction";
      this.pushLog(
        advantageOwner === "player"
          ? `你抓到了 1 点优势（当前 ${encounter.advantage.playerPoints}）。`
          : `${enemy.name}抢到 1 点优势（当前 ${encounter.advantage.enemyPoints}）。`
      );
      this.pushCombatRoundFeedback(encounter, roundLogStart, this.feedbackToneForOwner(advantageOwner));
      if (advantageOwner === "enemy") this.applyEnemyAdvantage(enemy);
    } else {
      encounter.phase = "chooseAction";
      this.pushLog("这一轮没有人真正占到便宜。");
      this.pushCombatRoundFeedback(encounter, roundLogStart, "neutral");
    }
  }

  private resolveMeleeAttack(
    attacker: ActorState,
    defender: ActorState,
    options: { defenderDodge?: "left" | "right"; defenderDefending: boolean }
  ): CombatHitResult {
    const attackDirection = this.attackDirection(attacker);
    this.consumeAttackDirection(attacker);
    if (options.defenderDodge) {
      const correct = options.defenderDodge === attackDirection;
      const speedDiff = defender.stats.speed - attacker.stats.speed + this.consumeBonus(defender, "dodge");
      const softShoes = this.consumePassiveFlag(defender, "soft-shoes", "mobility") ? 10 : 0;
      const itemModifier = this.effectAmount(defender, "dodge", "owned", "round") + this.effectAmount(defender, "dodge", "targeted", "round");
      const chance = correct
        ? clampPercent(75 + speedDiff * 8 + softShoes + itemModifier, 55, 95)
        : clampPercent(10 + speedDiff * 3 + softShoes + itemModifier, 5, 30);
      const roll = this.rollPercent(`${attacker.id}-attack-${this.state.turn}`);
      const tutorialGuaranteedDodge =
        this.state.tutorialScenario?.active &&
        defender.faction === "player" &&
        attacker.id === TUTORIAL_ENEMY_ONE_ID &&
        correct;
      if (tutorialGuaranteedDodge || roll <= chance) {
        if (defender.faction === "player" && attacker.faction === "enemy") this.gainIntel(attacker, 1, "dodge");
        const wasted = this.discardNextMeleeHitEffects(attacker);
        const dodgeEffectText = this.resolveSuccessfulDodgeItemEffects(defender, attacker);
        this.applyPassiveRules("onDodgeSuccess", defender, attacker);
        const effectText = wasted.length > 0 ? ` ${attacker.name}的${wasted.map((label) => label.split("：")[0]).join("、")}落空。` : "";
        return {
          text: `${defender.name}向${options.defenderDodge === "left" ? "左" : "右"}闪开，避过了攻击。${effectText}${dodgeEffectText}`,
          dodged: true,
          heavyWound: false,
          damage: 0
        };
      }
      if (correct && defender.faction === "player" && attacker.faction === "enemy") {
        this.pushCorrectDodgeFailedFeedback(options.defenderDodge, chance, roll);
      }
    }

    const weaponSlot = this.findSlot(attacker, "long-knife");
    const weaponBonus = weaponSlot ? 1 : 0;
    const effectiveStrength = Math.max(1, attacker.stats.strength + this.effectAmount(attacker, "strength", "both", "round"));
    const baseDamage = calculateDerivedStats({ ...attacker.stats, strength: effectiveStrength }, { weaponDamageBonus: weaponBonus }).meleeDamage;
    const bonusDamage =
      this.consumeBonus(attacker, "damage") +
      this.effectAmount(attacker, "damage", "owned", "round") +
      Math.max(0, this.consumeEffectAmount(attacker, "damage", "owned", "nextMeleeHit"));
    const gripBonus = !options.defenderDefending && this.consumePassiveFlag(attacker, "weighted-grip", "first-hit") ? 1 : 0;
    const rawDamage = baseDamage + bonusDamage + gripBonus;
    let damage = options.defenderDefending ? Math.ceil(rawDamage * DEFENSE_DAMAGE_TAKEN_RATE) : rawDamage;
    const notes: string[] = [];
    let defenseTriggeredEffect = false;
    if (bonusDamage) notes.push(`临时伤害 +${bonusDamage}`);
    if (gripBonus) notes.push("配重握柄 +1");
    if (options.defenderDefending && this.consumePassiveFlag(defender, "bracer", "first-defend")) {
      damage = Math.max(0, damage - 1);
      defenseTriggeredEffect = true;
      notes.push("护臂 -1");
      if (defender.faction === "player" && attacker.faction === "enemy") this.gainIntel(attacker, 1, "defend");
    }
    if (!options.defenderDefending && this.consumePassiveFlag(defender, "thick-cloth", "first-melee")) {
      damage = Math.max(0, damage - 1);
      notes.push("厚布衣 -1");
    }
    const shieldReduction = this.consumeIncomingDamageReduction(defender, false);
    if (shieldReduction) {
      damage = Math.max(0, damage - shieldReduction);
      if (options.defenderDefending) defenseTriggeredEffect = true;
      notes.push(`木盾片 -${shieldReduction}`);
    }
    const critChance = clampPercent(this.effectAmount(attacker, "critChance", "owned", "round"), 0, 95);
    if (damage > 0 && critChance > 0 && this.rollPercent(`${attacker.id}-crit-${this.state.turn}`) < critChance) {
      damage += 1;
      notes.push("暴击 +1");
      this.triggerCritItemSynergies(attacker, defender, notes);
    }
    const enchantmentResult =
      damage > 0
        ? this.applyEnchantmentPayload(attacker, defender, Math.max(1, damage), notes, this.consumeEnchantmentSources(attacker, weaponSlot))
        : { bonusDamage: 0, immediateDamage: 0 };
    damage += enchantmentResult.bonusDamage;
    const heavyModifier = this.consumeEffectAmount(attacker, "heavyThreshold", "owned", "nextMeleeHit");
    if (heavyModifier && !options.defenderDefending) notes.push(`重伤阈值 ${heavyModifier}`);
    if (heavyModifier && options.defenderDefending) notes.push("防御压掉刀油");
    defender.hp = Math.max(0, defender.hp - damage);
    if (damage > 0) this.resolveIncomingHitItemEffects(defender, attacker, notes);
    if (damage > 0 && options.defenderDefending) this.triggerDefendedHitItemSynergies(attacker, defender, notes);
    let statusImmediateDamage = 0;
    const dotDamage = Math.max(0, this.consumeEffectAmount(attacker, "dot", "owned", "nextMeleeHit"));
    if (dotDamage) {
      statusImmediateDamage += this.applyMeleeStatus(attacker, defender, "poison", dotDamage, notes);
    }
    statusImmediateDamage += this.applyMeleeStatus(attacker, defender, "burn", Math.max(0, this.consumeEffectAmount(attacker, "burn", "owned", "nextMeleeHit")), notes);
    statusImmediateDamage += this.applyMeleeStatus(attacker, defender, "poison", Math.max(0, this.consumeEffectAmount(attacker, "poison", "owned", "nextMeleeHit")), notes);
    statusImmediateDamage += this.applyMeleeStatus(attacker, defender, "bleed", Math.max(0, this.consumeEffectAmount(attacker, "bleed", "owned", "nextMeleeHit")), notes);
    statusImmediateDamage += this.applyMeleeStatus(attacker, defender, "freeze", Math.max(0, this.consumeEffectAmount(attacker, "freeze", "owned", "nextMeleeHit")), notes);
    const baseThreshold = calculateDerivedStats(defender.stats).heavyWoundThreshold;
    const threshold = Math.max(
      1,
      baseThreshold +
        (options.defenderDefending ? DEFENSE_HEAVY_WOUND_THRESHOLD_BONUS : heavyModifier)
    );
    const totalDamage = damage + statusImmediateDamage + enchantmentResult.immediateDamage;
    if (totalDamage > 0) {
      const hitHeal = Math.max(0, this.consumeEffectAmount(attacker, "healOnMeleeHit", "owned", "nextMeleeHit"));
      const healed = this.healActor(attacker, hitHeal);
      if (healed > 0) notes.push(`血吸垫回复 ${healed}`);
    }
    const wouldHeavyWithoutDefense = options.defenderDefending && rawDamage + statusImmediateDamage >= Math.max(1, baseThreshold + heavyModifier);
    const heavyWound = totalDamage >= threshold;
    const defense: DefenseOutcome | undefined = options.defenderDefending
      ? {
          reducedDamage: Math.max(0, rawDamage - damage),
          preventedHeavyWound: wouldHeavyWithoutDefense && !heavyWound,
          triggeredEffect: defenseTriggeredEffect,
          effective: false
        }
      : undefined;
    if (defense) {
      defense.effective = true;
    }
    if (heavyWound && defender.faction === "player") {
      const prevention = Math.abs(this.consumeEffectAmount(defender, "heavyPenalty", "owned", "round"));
      const extraDamage = Math.max(0, 1 - prevention);
      if (extraDamage > 0) defender.hp = Math.max(0, defender.hp - extraDamage);
      notes.push(prevention ? "止痛/夹板抵消重伤惩罚" : "重伤额外 -1");
    }
    this.triggerEmergencySyringe(defender, notes);
    return {
      text: `${attacker.name}造成 ${totalDamage} 点伤害${heavyWound ? "，形成重伤" : ""}${notes.length ? `（${notes.join("，")}）` : ""}。`,
      dodged: false,
      heavyWound,
      damage: totalDamage,
      defense
    };
  }

  private resolveRangedAttack(
    attacker: ActorState,
    defender: ActorState,
    options: { defenderDodge?: "left" | "right"; defenderDefending: boolean }
  ): RangedHitResult {
    if (!this.canUsePistol(attacker, defender)) {
      return { text: `${attacker.name}没有清晰射线，远程攻击没有发生。`, dodged: false, heavyWound: false, resolved: false, damage: 0 };
    }

    const slot = this.findSlot(attacker, "pistol");
    if (slot) slot.charges = Math.max(0, (slot.charges ?? ITEMS.pistol.maxCharges ?? 0) - 1);
    const attackDirection = this.attackDirection(attacker);
    this.consumeAttackDirection(attacker);

    if (options.defenderDodge) {
      const correct = options.defenderDodge === attackDirection;
      const speedDiff = defender.stats.speed - attacker.stats.speed + this.consumeBonus(defender, "dodge");
      const softShoes = this.consumePassiveFlag(defender, "soft-shoes", "mobility") ? 10 : 0;
      const itemModifier = this.effectAmount(defender, "dodge", "owned", "round") + this.effectAmount(defender, "dodge", "targeted", "round");
      const chance = correct
        ? clampPercent(75 + speedDiff * 8 + softShoes + itemModifier, 55, 95)
        : clampPercent(10 + speedDiff * 3 + softShoes + itemModifier, 5, 30);
      const roll = this.rollPercent(`${attacker.id}-ranged-${this.state.turn}`);
      if (roll <= chance) {
        this.pushGunshotFeedback(attacker, defender, 0, true);
        if (defender.faction === "player") this.gainIntel(attacker, 1, "dodge");
        this.applyPassiveRules("onDodgeSuccess", defender, attacker);
        return { text: `${defender.name}向${options.defenderDodge === "left" ? "左" : "右"}闪开，避过了枪线。`, dodged: true, heavyWound: false, resolved: true, damage: 0 };
      }
      if (correct && defender.faction === "player" && attacker.faction === "enemy") {
        this.pushCorrectDodgeFailedFeedback(options.defenderDodge, chance, roll, true);
      }
    }

    const rawDamage = 3;
    let damage = rawDamage;
    const notes: string[] = [];
    let defenseTriggeredEffect = false;
    const shieldReduction = this.consumeIncomingDamageReduction(defender, true);
    if (shieldReduction) {
      damage = Math.max(0, damage - shieldReduction);
      if (options.defenderDefending) defenseTriggeredEffect = true;
      notes.push(`木盾片 -${shieldReduction}`);
    }
    const critChance = clampPercent(this.effectAmount(attacker, "critChance", "owned", "round"), 0, 95);
    if (damage > 0 && critChance > 0 && this.rollPercent(`${attacker.id}-ranged-crit-${this.state.turn}`) < critChance) {
      damage += 1;
      notes.push("暴击 +1");
      this.triggerCritItemSynergies(attacker, defender, notes);
    }
    const unseenRanged = !this.state.encounter || this.state.encounter.visibility.playerToEnemy !== "visible";
    if (unseenRanged && defender.faction === "player" && this.consumePassiveFlag(defender, "steady-charm", "ranged-ambush")) {
      damage = Math.max(0, damage - 1);
      notes.push("稳心符 -1，并给出方向提示");
      this.state.map.hints.push({ ...attacker.position });
    }
    const enchantmentResult =
      damage > 0
        ? this.applyEnchantmentPayload(attacker, defender, Math.max(1, damage), notes, this.consumeEnchantmentSources(attacker, slot))
        : { bonusDamage: 0, immediateDamage: 0 };
    damage += enchantmentResult.bonusDamage;
    defender.hp = Math.max(0, defender.hp - damage);
    const baseThreshold = calculateDerivedStats(defender.stats).heavyWoundThreshold;
    const totalDamage = damage + enchantmentResult.immediateDamage;
    this.pushGunshotFeedback(attacker, defender, totalDamage, false);
    const heavyWound = totalDamage >= baseThreshold;
    const defense: DefenseOutcome | undefined = options.defenderDefending
      ? {
          reducedDamage: Math.max(0, rawDamage - damage),
          preventedHeavyWound: false,
          triggeredEffect: defenseTriggeredEffect,
          effective: false
        }
      : undefined;
    if (defense) {
      defense.effective =
        !heavyWound &&
        (defense.reducedDamage > 0 || defense.preventedHeavyWound || defense.triggeredEffect);
    }
    this.triggerEmergencySyringe(defender, notes);
    return {
      text: `${attacker.name}远程命中，造成 ${totalDamage} 点伤害${notes.length ? `（${notes.join("，")}）` : ""}。`,
      dodged: false,
      heavyWound,
      resolved: true,
      damage: totalDamage,
      defense
    };
  }

  private applyMeleeStatus(attacker: ActorState, defender: ActorState, type: StatusEffectType, stacks: number, notes: string[]): number {
    if (stacks <= 0) return 0;
    const encounter = this.state.encounter;
    if (!encounter) return 0;
    if (!recordTriggerChainStep(this.state)) {
      notes.push("本回合道具触发链达到上限，状态未继续追加");
      return 0;
    }
    const before = defender.hp;
    const remainingRounds = type === "poison" || type === "bleed" ? 3 : type === "freeze" ? 2 : 1;
    const delayRounds = type === "poison" ? 1 : undefined;
    for (const text of applyStatusEffect(encounter, { ownerId: attacker.id, target: defender, type, stacks, remainingRounds, delayRounds })) {
      notes.push(text);
    }
    this.triggerStatusItemSynergies(attacker, defender, type, notes);
    return Math.max(0, before - defender.hp);
  }

  private consumeEnchantmentSources(actor: ActorState, directSlot?: InventorySlot): EnchantmentSource[] {
    const sources: EnchantmentSource[] = [];
    if (actor.enchantmentPrep) {
      sources.push({ sourceItemId: actor.enchantmentPrep.sourceItemId, enchantment: actor.enchantmentPrep.enchantment });
      actor.enchantmentPrep = undefined;
    }
    if (directSlot?.affix?.kind === "enchantment") {
      sources.push({ sourceItemId: directSlot.item.id, enchantment: directSlot.affix.enchantment });
    }
    return sources;
  }

  private applyEnchantmentPayload(
    attacker: ActorState,
    defender: ActorState,
    payloadAmount: number,
    notes: string[],
    sources: EnchantmentSource[]
  ): { bonusDamage: number; immediateDamage: number } {
    if (sources.length === 0 || payloadAmount <= 0 || defender.hp <= 0) return { bonusDamage: 0, immediateDamage: 0 };
    let bonusDamage = 0;
    let immediateDamage = 0;
    for (const source of sources) {
      const power = enchantmentPower(payloadAmount);
      const label = enchantmentAdjective(source.enchantment);
      if (source.enchantment === "burning") {
        const dealt = this.applyMeleeStatus(attacker, defender, "burn", power, notes);
        immediateDamage += dealt;
        if (dealt > 0) notes.push(`${label}附魔触发`);
      } else if (source.enchantment === "venomous") {
        this.applyMeleeStatus(attacker, defender, "poison", power, notes);
        notes.push(`${label}附魔触发`);
      } else if (source.enchantment === "frost") {
        this.applyMeleeStatus(attacker, defender, "freeze", frostEnchantmentStacks(power), notes);
        notes.push(`${label}附魔触发`);
      } else if (source.enchantment === "blood") {
        this.applyMeleeStatus(attacker, defender, "bleed", power, notes);
        notes.push(`${label}附魔触发`);
      } else if (source.enchantment === "deadly") {
        if (this.rollPercent(`${attacker.id}-${defender.id}-${source.sourceItemId}-deadly-${this.state.turn}`) < 50) {
          bonusDamage += 1;
          notes.push(`${label}附魔暴击 +1`);
        } else {
          notes.push(`${label}附魔未暴击`);
        }
      } else if (source.enchantment === "radiant") {
        bonusDamage += power;
        notes.push(`${label}附魔追加 ${power}`);
      }
    }
    return { bonusDamage, immediateDamage };
  }

  private applyTrapEnchantment(affix: ItemAffix | undefined, owner: ActorState, target: ActorState, payloadAmount: number, notes: string[]): void {
    if (affix?.kind !== "enchantment") return;
    const result = this.applyEnchantmentPayload(owner, target, payloadAmount, notes, [{ sourceItemId: "trap", enchantment: affix.enchantment }]);
    if (result.bonusDamage > 0) target.hp = Math.max(0, target.hp - result.bonusDamage);
  }

  private prepareEnchantmentFromUsedItem(actor: ActorState, slot: InventorySlot): void {
    if (slot.affix?.kind !== "enchantment") return;
    if (DIRECT_ENCHANTMENT_ATTACK_ITEM_IDS.has(slot.item.id)) return;
    const template = carrierTemplateForItem(slot.item.id);
    if (!template || template === "TRAP" || template === "AMMO") return;
    setEnchantmentPrep(actor, slot.item.id, slot.affix.enchantment);
    this.pushEffectLog(`${actor.name}的${enchantedItemName(slot)}预备了${enchantmentAdjective(slot.affix.enchantment)}附魔。`);
  }

  private pickEnchantmentTarget(actor: ActorState, _affix: ItemAffix): InventorySlot | undefined {
    return actor.inventory
      .filter((slot) => isEnchantableSlot(slot))
      .sort((a, b) => itemPowerScore(b.item) - itemPowerScore(a.item))[0];
  }

  private resolveSuccessfulDodgeItemEffects(defender: ActorState, attacker: ActorState): string {
    const encounter = this.state.encounter;
    if (!encounter) return "";
    const notes: string[] = [];
    if (this.hasItem(defender, "lens-thread") && this.consumePassiveFlag(defender, "lens-thread", "dodge")) {
      if (defender.faction === "player" && attacker.faction === "enemy") this.revealEnemyItem(attacker, "dodge");
      this.addActiveEffect(defender, "lens-thread", "镜线牵住破绽：下个动作回合暴击率 +10%。", "critChance", 10, 2, "round");
      notes.push("镜线触发。");
    }
    if (this.hasItem(defender, "mercy-thread") && defender.hp < calculateDerivedStats(defender.stats).maxHp && this.consumePassiveFlag(defender, "mercy-thread", "dodge-heal")) {
      const healed = this.healActor(defender, 1);
      if (healed > 0) notes.push(`缓息线回复 ${healed}。`);
    }
    const poisonStacks = Math.max(0, this.consumeEffectAmount(defender, "poison", "owned", "nextDodge"));
    if (poisonStacks > 0) {
      if (recordTriggerChainStep(this.state)) {
        for (const text of applyStatusEffect(encounter, {
          ownerId: defender.id,
          target: attacker,
          type: "poison",
          stacks: poisonStacks,
          remainingRounds: 3,
          delayRounds: 1
        })) {
          notes.push(text);
        }
        this.triggerStatusItemSynergies(defender, attacker, "poison", notes);
      } else {
        notes.push("本回合道具触发链达到上限，烟针未继续追加中毒。");
      }
    }
    return notes.length > 0 ? ` ${notes.join("")}` : "";
  }

  private resolveIncomingHitItemEffects(defender: ActorState, attacker: ActorState, notes: string[]): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    const bleedStacks = Math.max(0, this.consumeEffectAmount(defender, "bleed", "owned", "nextIncomingDamage"));
    if (bleedStacks <= 0) return;
    if (!recordTriggerChainStep(this.state)) {
      notes.push("本回合道具触发链达到上限，刺片未继续追加流血");
      return;
    }
    for (const text of applyStatusEffect(encounter, {
      ownerId: defender.id,
      target: attacker,
      type: "bleed",
      stacks: bleedStacks,
      remainingRounds: 3
    })) {
      notes.push(text);
    }
    this.triggerStatusItemSynergies(defender, attacker, "bleed", notes);
    notes.push("刺片反扎");
  }

  private triggerStatusItemSynergies(attacker: ActorState, defender: ActorState, type: StatusEffectType, notes: string[]): void {
    if (type === "burn" && this.hasItem(attacker, "soot-hook")) {
      if (recordTriggerChainStep(this.state)) {
        this.addActiveEffect(attacker, "soot-hook", "煤钩借灼烧牵制：目标下个动作回合躲闪 -10%。", "dodge", -10, 2, "round", defender.id);
      } else {
        notes.push("本回合道具触发链达到上限，煤钩未触发");
      }
    }
    if (type === "poison" && this.hasItem(attacker, "venom-saw")) {
      if (recordTriggerChainStep(this.state)) {
        this.addActiveEffect(attacker, "venom-saw", "毒锯片借中毒开口：下一次近战命中伤害 +1。", "damage", 1, 2, "nextMeleeHit");
      } else {
        notes.push("本回合道具触发链达到上限，毒锯片未触发");
      }
    }
    if (type === "bleed" && this.hasItem(attacker, "blood-knot")) {
      if (recordTriggerChainStep(this.state)) {
        this.addActiveEffect(attacker, "blood-knot", "血结绳被拉紧：下个动作回合速度 +1。", "speed", 1, 2, "round");
      } else {
        notes.push("本回合道具触发链达到上限，血结绳未触发");
      }
    }
    if (type === "freeze" && this.hasItem(attacker, "frost-latch")) {
      if (recordTriggerChainStep(this.state)) {
        this.addActiveEffect(attacker, "frost-latch", "霜扣锁住节奏：下一次受到伤害 -1。", "incomingDamage", -1, 2, "nextIncomingDamage");
      } else {
        notes.push("本回合道具触发链达到上限，霜扣未触发");
      }
    }
    if (type === "burn" && this.hasItem(attacker, "coal-beads")) {
      if (recordTriggerChainStep(this.state)) {
        this.addPassiveEffect(attacker, "coal-beads", "灼烧牵亮煤珠：下个动作回合暴击率 +10%。", "critChance", 10, 2, "round");
      } else {
        notes.push("本回合道具触发链达到上限，煤珠串未触发");
      }
    }
    if (type === "poison" && this.hasItem(attacker, "toxin-skein")) {
      if (recordTriggerChainStep(this.state)) {
        this.addPassiveEffect(attacker, "toxin-skein", "毒丝束缠住步点：目标下个动作回合速度 -1。", "speed", -1, 2, "round", defender.id);
      } else {
        notes.push("本回合道具触发链达到上限，毒丝束未触发");
      }
    }
    if (type === "freeze" && this.hasItem(attacker, "cold-rivet")) {
      if (recordTriggerChainStep(this.state)) {
        this.addPassiveEffect(attacker, "cold-rivet", "冷铆钉吃住破绽：下一次近战命中伤害 +1。", "damage", 1, 2, "nextMeleeHit");
      } else {
        notes.push("本回合道具触发链达到上限，冷铆钉未触发");
      }
    }
    if (type === "burn") this.applyPassiveRules("onBurnApplied", attacker, defender);
    if (type === "poison") this.applyPassiveRules("onPoisonApplied", attacker, defender);
    if (type === "freeze") this.applyPassiveRules("onFreezeApplied", attacker, defender);
  }

  private triggerCritItemSynergies(attacker: ActorState, defender: ActorState, notes: string[]): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    if (this.hasItem(attacker, "crit-hook")) {
      if (!recordTriggerChainStep(this.state)) {
        notes.push("本回合道具触发链达到上限，裂口钩未触发");
      } else {
        for (const text of applyStatusEffect(encounter, {
          ownerId: attacker.id,
          target: defender,
          type: "bleed",
          stacks: 1,
          remainingRounds: 3
        })) {
          notes.push(text);
        }
        this.triggerStatusItemSynergies(attacker, defender, "bleed", notes);
        notes.push("裂口钩追加流血");
      }
    }
    this.applyPassiveRules("onCrit", attacker, defender);
  }

  private triggerDefendedHitItemSynergies(attacker: ActorState, defender: ActorState, notes: string[]): void {
    if (this.hasItem(attacker, "guard-breaker")) {
      if (!recordTriggerChainStep(this.state)) {
        notes.push("本回合道具触发链达到上限，破挡楔未触发");
      } else {
        this.addPassiveEffect(attacker, "guard-breaker", "破挡楔咬住架势：下一次近战命中伤害 +1。", "damage", 1, 2, "nextMeleeHit");
        notes.push("破挡楔触发");
      }
    }
    this.applyPassiveRules("onDefendedHit", attacker, defender);
  }

  private getActionSpeed(actor: ActorState, action: CombatAction): number {
    const speedEffects = this.effectAmount(actor, "speed", "both", "round");
    if (action.type !== "attack") return actor.stats.speed + speedEffects;
    let speed = actor.stats.speed + speedEffects + this.consumeBonus(actor, "speed");
    const encounter = this.state.encounter;
    if (encounter && !encounter.firstAttackUsed[actor.id]) {
      if (encounter.visionLeadOwner === actor.faction) speed += 2;
      if (this.hasItem(actor, "long-knife")) speed += 2;
      encounter.firstAttackUsed[actor.id] = true;
    }
    return speed;
  }

  private getTieStrength(actor: ActorState): number {
    return actor.stats.strength + this.effectAmount(actor, "strength", "both", "round") + this.effectAmount(actor, "tieStrength", "owned", "round");
  }

  private effectiveIntellect(actor: ActorState): number {
    return actor.stats.intellect + this.effectAmount(actor, "intellect", "both", "round");
  }

  private consumeBonus(actor: ActorState, target: "speed" | "damage" | "dodge" | "intel"): number {
    const encounter = this.state.encounter;
    if (!encounter) return 0;
    const key = actor.faction === "player" ? "playerBonus" : "enemyBonus";
    const poolKey = actor.faction === "player" ? "playerBonusPool" : "enemyBonusPool";
    const pool = encounter[poolKey];
    const pooledAmount = pool?.[target] ?? 0;
    if (pooledAmount > 0) {
      delete pool?.[target];
      if (encounter[key]?.target === target) encounter[key] = undefined;
      return pooledAmount;
    }
    const bonus = encounter[key];
    if (bonus?.target !== target) return 0;
    encounter[key] = undefined;
    return bonus.amount;
  }

  private resolveTutorialCombatAction(action: CombatAction): boolean {
    const scenario = this.state.tutorialScenario;
    if (!scenario?.active) return false;
    const encounter = this.state.encounter;
    if (!encounter) {
      this.pushTutorialFeedback("教程等待", "请先按当前教程提示完成训练照面。");
      return true;
    }
    const enemy = this.getEncounterEnemy();
    if (!isTutorialEnemyId(enemy.id)) return false;
    const input = tutorialInputFromCombatAction(action);
    if (!input || !scenario.allowedInputs.includes(input)) {
      this.pushTutorialBlockedInput(input);
      return true;
    }

    if (scenario.stepId === "enemy1-guard") {
      if (input === "attack") {
        this.pushTutorialFeedback(
          "鲁莽进攻演示",
          "这名敌人速度很快、伤害很高。若你第一手直接进攻，它会先砍中并造成重伤，让你的后手攻击丢失。先防御能减伤、读数值并拿优势。"
        );
        encounter.log.push({ round: encounter.round + 1, text: "教学提示：直接进攻会被高速重击压制。本步请改选防御。" });
        return true;
      }
      this.setTutorialEnemyAttackDirection(enemy, "left");
      this.resolveActionRound(action, { type: "attack", mode: "melee" }, enemy);
      if (!this.state.encounter) return true;
      this.revealEnemyStat(enemy, "defend", "constitution");
      this.ensurePlayerAdvantageAtLeast(1);
      this.setTutorialStep("enemy1-direction-guard");
      this.pushTutorialFeedback("防御的收益", "防御会稳定减免伤害，并把敌人的弱点读出来。体质很低意味着血量和重伤承受都弱，后续可以准备击杀。");
      return true;
    }

    if (scenario.stepId === "enemy1-direction-guard") {
      this.setTutorialEnemyAttackDirection(enemy, "left");
      this.resolveActionRound(action, { type: "attack", mode: "melee" }, enemy);
      if (!this.state.encounter) return true;
      this.setTutorialEnemyAttackDirection(enemy, "right");
      this.revealEnemyAttackDirection(enemy, "defend");
      this.ensurePlayerAdvantageAtLeast(1);
      this.setTutorialStep("enemy1-dodge", "right");
      this.pushTutorialFeedback("方向情报", "这次防御读到了下一刀来自右侧。闪避不是纯数值按钮，猜对方向才容易躲开并获得更大的优势窗口。");
      return true;
    }

    if (scenario.stepId === "enemy1-dodge") {
      if (input !== `dodge-${scenario.requiredDodge}`) {
        this.pushTutorialFeedback("方向不对", `当前已知敌人下次攻击来自${scenario.requiredDodge === "right" ? "右" : "左"}侧。请按情报选择对应方向闪避。`);
        return true;
      }
      this.setTutorialEnemyAttackDirection(enemy, scenario.requiredDodge ?? "right");
      this.resolveActionRound(action, { type: "attack", mode: "melee" }, enemy);
      if (!this.state.encounter) return true;
      this.ensurePlayerAdvantageAtLeast(3);
      this.setTutorialStep("enemy1-invest-tempo");
      this.pushTutorialFeedback("优势变成资源", "正确闪避让你把优势攒到 3 点。接下来把 3 点全部投入速度，确保下一轮攻击能抢在高速敌人前面。");
      return true;
    }

    if (scenario.stepId === "enemy1-kill") {
      this.ensurePlayerSpeedBonusAtLeast(3);
      this.resolveActionRound(action, { type: "attack", mode: "melee" }, enemy);
      if (this.state.encounter && !enemy.defeated && enemy.hp > 0) {
        this.ensurePlayerSpeedBonusAtLeast(3);
        this.pushTutorialFeedback("继续追击", "你已经抢到先手并造成重伤。再进攻一次，结束这名低体质敌人。");
      }
      return true;
    }

    if (scenario.stepId === "enemy2-intel") {
      this.resolveActionRound(action, { type: "attack", mode: "melee" }, enemy);
      if (!this.state.encounter) return true;
      this.revealEnemyStat(enemy, "defend", "intellect");
      this.ensurePlayerAdvantageAtLeast(1);
      this.setTutorialStep("enemy2-persuade");
      this.pushTutorialFeedback("说服窗口", "这名敌人智力很低。你已经有 1 点优势，可以支付优势尝试说服，让对方休战并让路。");
      return true;
    }

    this.pushTutorialBlockedInput(input);
    return true;
  }

  private resolveTutorialContinueFight(choice: AdvantagePressChoice): void {
    const scenario = this.state.tutorialScenario;
    const encounter = this.state.encounter;
    if (!scenario?.active || !encounter) return;
    if (scenario.stepId !== "enemy1-invest-tempo" || choice !== "pressTempo") {
      this.pushTutorialBlockedInput(choice);
      return;
    }
    this.ensurePlayerAdvantageAtLeast(1);
    if (!this.spendAdvantage("player")) {
      this.pushTutorialFeedback("优势不足", "本步需要支付 1 点优势投入速度。");
      return;
    }
    scenario.tempoInvested += 1;
    const nextAmount = (encounter.playerBonusPool?.speed ?? 0) + 1;
    encounter.playerBonusPool = { ...(encounter.playerBonusPool ?? {}), speed: nextAmount };
    encounter.playerBonus = { target: "speed", amount: nextAmount };
    encounter.phase = "chooseAction";
    this.pushFeedback({
      kind: "advantage-press",
      title: "速度下注",
      body: `你把 1 点优势投入速度。教学进度 ${scenario.tempoInvested}/3，下一次动作速度 +${nextAmount}。`,
      tone: "advantage",
      round: encounter.round,
      durationMs: 1000
    });
    this.pushLog(`教程：你投入第 ${scenario.tempoInvested} 点优势到速度。`);
    if (scenario.tempoInvested >= 3) {
      this.setTutorialStep("enemy1-kill");
      this.pushTutorialFeedback("抢先手", "3 点速度下注已经完成。现在进攻，你会先手命中并压掉敌人的后手。");
    } else {
      this.setTutorialStep("enemy1-invest-tempo");
    }
  }

  private resolveTutorialPersuade(): void {
    const scenario = this.state.tutorialScenario;
    const encounter = this.state.encounter;
    if (!scenario?.active || !encounter) return;
    const enemy = this.getEncounterEnemy();
    if (scenario.stepId !== "enemy2-persuade" || enemy.id !== TUTORIAL_ENEMY_TWO_ID) {
      this.pushTutorialBlockedInput("persuade");
      return;
    }
    this.ensurePlayerAdvantageAtLeast(1);
    this.spendAdvantage("player");
    enemy.neutralUntilTurn = this.state.turn + 99;
    this.resetToStarterAfterTutorial("战斗教学完成", "下面在整个迷宫中找到出口，带着道具逃离吧。确认后进入开局选择。");
  }

  private chooseTutorialEnemyAction(enemy: ActorState): CombatAction {
    if (enemy.id === TUTORIAL_ENEMY_TWO_ID) return { type: "attack", mode: "melee" };
    return { type: "attack", mode: "melee" };
  }

  private handleTutorialEnemyDefeated(enemy: ActorState, encounter: { round: number; log: Array<{ text: string }> }, roundLogStart: number): boolean {
    const scenario = this.state.tutorialScenario;
    if (!scenario?.active || !isTutorialEnemyId(enemy.id)) return false;
    this.pushCombatRoundFeedback(encounter, roundLogStart, "advantage", `训练击倒：${enemy.name}。`);
    if (enemy.id === TUTORIAL_ENEMY_ONE_ID) {
      this.endEncounter("第一名训练敌人倒下。下一名敌人用于学习说服。");
      const secondEnemy = this.state.map.aiUnits.find((unit) => unit.id === TUTORIAL_ENEMY_TWO_ID);
      if (secondEnemy) {
        const nextPosition = this.findTutorialSpawn(this.state, this.state.player.position, 1, 1, []);
        secondEnemy.position = { ...nextPosition };
        secondEnemy.previousPosition = { ...nextPosition };
        secondEnemy.awareness = { level: "aware", lastKnownPosition: { ...this.state.player.position }, source: "memory" };
        this.setTutorialStep("enemy2-intel");
        this.checkEncounter();
        this.pushTutorialFeedback("第二名敌人", "现在练习另一种出口：先防御拿情报和优势，然后用优势支付说服。");
      }
    } else {
      this.resetToStarterAfterTutorial("战斗教学完成", "下面在整个迷宫中找到出口，带着道具逃离吧。确认后进入开局选择。");
    }
    return true;
  }

  private setTutorialStep(stepId: TutorialStepId, requiredDodge?: "left" | "right"): void {
    const scenario = this.state.tutorialScenario;
    if (!scenario?.active) return;
    configureTutorialStep(scenario, stepId, requiredDodge);
  }

  private setTutorialEnemyAttackDirection(enemy: ActorState, direction: "left" | "right"): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    const attackIndex = encounter.attackDirectionIndex[enemy.id] ?? 0;
    encounter.attackDirections[`${enemy.id}:${attackIndex}`] = direction;
  }

  private ensurePlayerAdvantageAtLeast(amount: number): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    this.normalizeAdvantage(encounter.advantage);
    encounter.advantage.playerPoints = Math.max(encounter.advantage.playerPoints, amount);
    encounter.advantage.owner = "player";
    encounter.advantage.source = "forced";
    encounter.advantage.bonusAvailable = true;
  }

  private ensurePlayerSpeedBonusAtLeast(amount: number): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    encounter.playerBonusPool = { ...(encounter.playerBonusPool ?? {}), speed: Math.max(encounter.playerBonusPool?.speed ?? 0, amount) };
    encounter.playerBonus = { target: "speed", amount: encounter.playerBonusPool.speed ?? amount };
  }

  private pushTutorialBlockedInput(input: TutorialInput | undefined): void {
    const scenario = this.state.tutorialScenario;
    const current = scenario?.highlightedInput ? this.tutorialInputLabel(scenario.highlightedInput) : "高亮动作";
    this.pushTutorialFeedback("当前步骤不需要这个动作", `请先使用：${current}。教程会把每个行为的意义拆开演示。`);
  }

  private tutorialInputLabel(input: TutorialInput): string {
    if (input === "attack") return "进攻";
    if (input === "defend") return "防御";
    if (input === "dodge-left") return "左闪";
    if (input === "dodge-right") return "右闪";
    if (input === "pressPower") return "续战·力量";
    if (input === "pressTempo") return "续战·节奏";
    return "说服";
  }

  private pushTutorialFeedback(title: string, body: string): void {
    this.pushFeedback({
      kind: "tutorial",
      title,
      body,
      tone: "intel",
      durationMs: 1300
    });
  }

  private chooseEnemyAction(enemy: ActorState): CombatAction {
    if (this.state.tutorialScenario?.active && isTutorialEnemyId(enemy.id)) return this.chooseTutorialEnemyAction(enemy);
    return chooseEnemyActionForState(this.state, enemy, (attacker, target) => this.canUsePistol(attacker, target));
  }

  private markEncounterCombatStarted(enemy: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter || encounter.combatCounted) return;
    enemy.combatCount += 1;
    encounter.combatCounted = true;
  }

  private awardEffectiveDefense(defender: ActorState, attacker: ActorState, awardedActors: Set<string>): void {
    if (awardedActors.has(defender.id)) return;
    awardedActors.add(defender.id);
    this.applyPassiveRules("onDefendSuccess", defender, attacker);
  }

  private pushDefenseNoAdvantageFeedback(attacker: ActorState, defense: DefenseOutcome, heavyWound: boolean): void {
    const reason = heavyWound
      ? `${attacker.name}这次不是可被普通防御稳定克制的基础近战，且伤害仍形成重伤。`
      : defense.reducedDamage <= 0
        ? `${attacker.name}这次不是可被普通防御稳定克制的基础近战；左轮枪线或特殊伤害需要墙体、正确闪避或盾类道具处理。`
        : `${attacker.name}这次属于远程或特殊压制，普通防御只提供减伤，不保证优势。`;
    this.pushFeedback({
      kind: "tutorial",
      title: "防御没有形成优势",
      body: `${reason} 基础近战打进防御时会稳定给你优势。`,
      tone: "intel",
      durationMs: 1800
    });
  }

  private pushCorrectDodgeFailedFeedback(direction: "left" | "right", chance: number, roll: number, ranged = false): void {
    this.pushFeedback({
      kind: "tutorial",
      title: "读向正确，但闪避未过",
      body: `你选对了${direction === "left" ? "左" : "右"}闪，本次${ranged ? "枪线" : "攻击"}闪避率为 ${chance}%，判定值 ${roll} 未通过。速度差、道具修正和负面状态仍会影响结果。`,
      tone: "intel",
      durationMs: 2000
    });
  }

  private softClosureOwner(
    enemy: ActorState,
    effectiveDefenseOwner: CombatSide | null,
    successfulDodgeOwner: CombatSide | null,
    significantDamageOwner: CombatSide | null
  ): CombatSide | null {
    if (effectiveDefenseOwner) return effectiveDefenseOwner;
    if (successfulDodgeOwner) return successfulDodgeOwner;
    if (significantDamageOwner) return significantDamageOwner;
    if (this.state.player.hp > enemy.hp) return "player";
    if (enemy.hp > this.state.player.hp) return "enemy";
    const playerSpeed = this.state.player.stats.speed + this.effectAmount(this.state.player, "speed", "both", "round");
    const enemySpeed = enemy.stats.speed + this.effectAmount(enemy, "speed", "both", "round");
    if (playerSpeed > enemySpeed) return "player";
    if (enemySpeed > playerSpeed) return "enemy";
    return null;
  }

  private applyEnemyAdvantage(enemy: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    if (this.advantagePoints("enemy") < 1) return;
    this.spendAdvantage("enemy");
    if (enemy.hp <= calculateDerivedStats(enemy.stats).heavyWoundThreshold && this.rollPercent("enemy-flee") < 65) {
      this.moveActorAway(enemy, this.state.player.position);
      this.pushFeedback({
        kind: "enemy-flee",
        title: "敌人逃跑",
        body: `${enemy.name}借优势后撤，照面中断。`,
        tone: "danger",
        durationMs: 1000
      });
      this.endEncounter(`${enemy.name}借优势后撤，照面中断。`);
      return;
    }
    encounter.enemyBonus = { target: "speed", amount: 1 };
    encounter.phase = "chooseAction";
    this.pushLog(`${enemy.name}把优势压成下一次速度。`);
  }

  private forceCombatExit(enemy: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    if (this.state.player.hp > enemy.hp) {
      this.gainAdvantage("player", "forced");
      encounter.phase = "chooseAction";
      this.pushLog("僵持到第四轮，你凭剩余状态拿到最后窗口。");
    } else if (enemy.hp > this.state.player.hp || enemy.stats.speed > this.state.player.stats.speed) {
      this.gainAdvantage("enemy", "forced");
      this.applyEnemyAdvantage(enemy);
    } else {
      this.moveActorAway(this.state.player, enemy.position);
      this.moveActorAway(enemy, this.state.player.position);
      this.pushLog("僵持无果，你们同时后撤。");
      this.endEncounter("四轮未分胜负，双方脱战。");
    }
  }

  private usePistol(attacker: ActorState, target: ActorState, fromPlayer: boolean): boolean {
    if (!this.canUsePistol(attacker, target)) {
      if (fromPlayer) this.pushLog("你没有清晰视野，手枪不能开火。");
      return false;
    }
    if (attacker.faction === "player") this.state.playerHiddenUntilTurn = undefined;
    const slot = this.findSlot(attacker, "pistol");
    if (!slot) return false;
    if (fromPlayer && target.faction === "enemy" && !this.state.encounter) target.combatCount += 1;
    slot.charges = Math.max(0, (slot.charges ?? ITEMS.pistol.maxCharges ?? 0) - 1);
    let damage = 3;
    const notes: string[] = [];
    if (target.faction === "player" && this.consumePassiveFlag(target, "steady-charm", "ranged-ambush")) {
      damage = Math.max(0, damage - 1);
      this.state.map.hints.push({ ...attacker.position });
      notes.push("稳心符 -1");
    }
    const enchantmentResult =
      damage > 0
        ? this.applyEnchantmentPayload(attacker, target, Math.max(1, damage), notes, this.consumeEnchantmentSources(attacker, slot))
        : { bonusDamage: 0, immediateDamage: 0 };
    damage += enchantmentResult.bonusDamage;
    target.hp = Math.max(0, target.hp - damage);
    if (target.faction === "player") target.awareness = { level: "aware", lastKnownPosition: { ...attacker.position }, source: "damage" };
    const totalDamage = damage + enchantmentResult.immediateDamage;
    this.pushGunshotFeedback(attacker, target, totalDamage, false);
    this.pushLog(`${attacker.name}开火造成 ${totalDamage} 点伤害${notes.length ? `（${notes.join("，")}）` : ""}。`);
    if (this.state.encounter && fromPlayer) {
      this.gainAdvantage("player", "item");
      this.state.encounter.phase = "chooseAction";
    }
    if (target.hp <= 0) {
      if (target.faction === "enemy") {
        target.defeated = true;
        this.state.loot += 2;
        this.pushEnemyDefeatedFeedback(target);
        this.collectEnemyDrops(target);
        if (this.state.encounter) this.endEncounter(`${target.name}被击倒。`);
      } else {
        this.failRun("被迫离桌", "枪声之后，你没能再站起来。");
      }
    }
    return true;
  }

  private pushGunshotFeedback(attacker: ActorState, target: ActorState, damage: number, dodged: boolean): void {
    this.pushFeedback({
      kind: "gunshot",
      title: "枪响",
      body: dodged ? `${attacker.name}开火，弹道擦过。` : `${attacker.name}开火，造成 ${damage} 点伤害。`,
      tone: attacker.faction === "player" ? "advantage" : "danger",
      origin: { ...attacker.position },
      target: { ...target.position },
      itemId: "pistol",
      durationMs: 900
    });
  }

  private canUsePistol(attacker: ActorState, target: ActorState): boolean {
    return canUsePistolForState(this.state, attacker, target);
  }

  private findVisibleEnemyInRange(range: number): ActorState | undefined {
    return this.state.map.aiUnits.find(
      (enemy) =>
        !enemy.defeated &&
        distance(enemy.position, this.state.player.position) <= range &&
        this.getVisibility(this.state.player, enemy) === "visible" &&
        this.hasLineOfSight(this.state.player.position, enemy.position)
    );
  }

  private throwKnife(attacker: ActorState, target: ActorState, itemId: ItemId): boolean {
    if (distance(attacker.position, target.position) > 2 || this.getVisibility(attacker, target) !== "visible" || !this.hasLineOfSight(attacker.position, target.position)) {
      this.pushLog(`距离或视野不够，${ITEMS[itemId].name}不能掷出。`);
      return false;
    }
    if (attacker.faction === "player") this.state.playerHiddenUntilTurn = undefined;
    const slot = this.findSlot(attacker, itemId);
    this.consumeItem(attacker, itemId);
    const notes: string[] = [];
    let damage = 2;
    const enchantmentResult = this.applyEnchantmentPayload(attacker, target, damage, notes, this.consumeEnchantmentSources(attacker, slot));
    damage += enchantmentResult.bonusDamage;
    target.hp = Math.max(0, target.hp - damage);
    const lossText = itemId === "long-knife" ? "，长刀装备效果消失" : "";
    this.pushLog(`${attacker.name}掷出${ITEMS[itemId].name}，造成 ${damage + enchantmentResult.immediateDamage} 点伤害${lossText}${notes.length ? `（${notes.join("，")}）` : ""}。`);
    if (target.hp <= 0 && target.faction === "enemy") {
      target.defeated = true;
      this.state.loot += 2;
      this.pushEnemyDefeatedFeedback(target);
      this.collectEnemyDrops(target);
      this.endEncounter(`${target.name}被飞刀击倒。`);
      return true;
    }
    if (target.hp <= 0 && target.faction === "player") {
      this.failRun("被迫离桌", "飞刃结束了这次照面。");
      return true;
    }
    if (this.state.encounter) {
      this.gainAdvantage(attacker.faction, "item");
      this.state.encounter.phase = "chooseAction";
    }
    return true;
  }

  private usePhotonCut(attacker: ActorState, target: ActorState): boolean {
    const points = this.advantagePoints(attacker.faction);
    if (points < 1) {
      if (attacker.faction === "player") this.pushLog("长刀·光子切需要至少 1 点优势。");
      return false;
    }
    const slot = this.findSlot(attacker, "photon-cut");
    if (!slot) return false;
    const spent = points >= 3 ? points : 1;
    if (!this.spendAdvantage(attacker.faction, spent)) return false;
    this.lastCombatItemSpentAdvantage = true;
    let damage = spent >= 3 ? spent * 3 : 2;
    const notes: string[] = [];
    const enchantmentResult = this.applyEnchantmentPayload(attacker, target, damage, notes, this.consumeEnchantmentSources(attacker, slot));
    damage += enchantmentResult.bonusDamage;
    target.hp = Math.max(0, target.hp - damage);
    const totalDamage = damage + enchantmentResult.immediateDamage;
    this.triggerDamageEvents(attacker, target, totalDamage, totalDamage >= calculateDerivedStats(target.stats).heavyWoundThreshold);
    this.pushLog(`${attacker.name}释放${ITEMS["photon-cut"].name}，消耗 ${spent} 点优势，造成 ${totalDamage} 点伤害${notes.length ? `（${notes.join("，")}）` : ""}。`);
    if (target.hp <= 0 && target.faction === "enemy") {
      target.defeated = true;
      this.state.loot += 2;
      this.pushEnemyDefeatedFeedback(target);
      this.collectEnemyDrops(target);
      this.endEncounter(`${target.name}被光子切击倒。`);
      return true;
    }
    if (target.hp <= 0 && target.faction === "player") {
      this.failRun("被迫离桌", "光子刃切断了最后一次机会。");
      return true;
    }
    if (this.state.encounter) this.state.encounter.phase = "chooseAction";
    return true;
  }

  private useOldMagazine(actor: ActorState = this.state.player): boolean {
    if (this.state.encounter) {
      if (actor.faction === "player") this.pushLog("旧弹夹只能在战斗外安全换弹。");
      return false;
    }
    const pistol = this.findSlot(actor, "pistol");
    if (!pistol) {
      if (actor.faction === "player") this.pushLog("没有手枪，旧弹夹无法启动。");
      return false;
    }
    const magazine = this.findSlot(actor, "old-magazine");
    const maxCharges = ITEMS.pistol.maxCharges ?? 6;
    const beforeCharges = pistol.charges ?? 0;
    if (beforeCharges >= maxCharges) {
      if (actor.faction === "player") this.pushLog("手枪已经满弹，旧弹夹暂时不用打开。");
      return false;
    }

    this.pushFeedback({
      kind: "item-reload",
      title: "换弹中",
      body: "旧弹夹咬住弹匣井。换弹需要 2 回合，期间照面会让换弹失败。",
      tone: "intel",
      origin: { ...actor.position },
      itemId: "old-magazine",
      durationMs: 1100
    });
    this.pushLog(`${actor.name}开始用旧弹夹换弹，第一回合被花掉。`);
    this.advanceTurnPreservingHints();
    if (!this.state.outcome) this.checkEncounter();
    if (this.state.encounter || this.state.outcome) {
      this.pushReloadInterruptedFeedback(actor);
      return true;
    }

    this.pushLog(`${actor.name}继续压入旧弹夹，第二回合被花掉。`);
    this.advanceTurnPreservingHints();
    if (!this.state.outcome) this.checkEncounter();
    if (this.state.encounter || this.state.outcome) {
      this.pushReloadInterruptedFeedback(actor);
      return true;
    }

    pistol.charges = Math.min(maxCharges, beforeCharges + 2);
    this.spendItemUse(actor, "old-magazine");
    if (magazine?.affix?.kind === "enchantment") {
      setEnchantmentPrep(actor, "old-magazine", magazine.affix.enchantment);
      this.pushEffectLog(`${enchantedItemName(magazine)}把${enchantmentAdjective(magazine.affix.enchantment)}效果压进下一次伤害。`);
    }
    this.pushFeedback({
      kind: "item-reload",
      title: "换弹完成",
      body: `手枪弹药 ${beforeCharges} → ${pistol.charges}。旧弹夹仍可继续使用。`,
      tone: "advantage",
      origin: { ...actor.position },
      itemId: "old-magazine",
      durationMs: 1100
    });
    this.pushLog(`${actor.name}完成换弹，手枪剩余 ${pistol.charges} 发。`);
    return true;
  }

  private pushReloadInterruptedFeedback(actor: ActorState): void {
    this.pushFeedback({
      kind: "item-reload",
      title: "换弹失败",
      body: "照面打断了换弹；旧弹夹没有补进任何子弹。",
      tone: "danger",
      origin: { ...actor.position },
      itemId: "old-magazine",
      durationMs: 1200
    });
    this.pushLog(`${actor.name}的换弹被照面打断，手枪没有补弹。`);
  }

  private usePlayerCombatItem(slot: InventorySlot): boolean {
    const encounter = this.state.encounter;
    if (!encounter) return false;
    if (this.hasUsedCombatItemThisRound(this.state.player)) {
      this.pushLog("本回合已经主动使用过一件战斗道具。");
      return false;
    }
    const enemy = this.getEncounterEnemy();
    const itemId = slot.item.id;
    let used = false;

    if (itemId === "pistol") used = this.usePistol(this.state.player, enemy, true);
    else if (itemId === "photon-cut") used = this.usePhotonCut(this.state.player, enemy);
    else if (itemId === "long-knife" || itemId === "throwing-knife") used = this.throwKnife(this.state.player, enemy, itemId);
    else if (itemId === "coagulation-powder") used = this.useCoagulationPowder();
    else if (itemId === "stitch-kit") used = this.useStitchKit(this.state.player);
    else if (itemId === "antidote-tablet") used = this.useAntidoteTablet();
    else if (itemId === "insulation-cloth") used = this.useInsulationCloth();
    else if (itemId === "lens") used = this.useLens(enemy);
    else if (itemId === "scent-powder") used = this.useScentPowder(enemy);
    else {
      const resolution = resolvePlayerCombatItemEffect(itemId, enemy.id, this.hasPlayerAdvantageWindow());
      if (resolution.type === "effect") used = this.consumeResolvedEffect(this.state.player, resolution.effect);
      else if (resolution.type === "blocked") this.pushLog(resolution.message);
      else this.pushLog(`${slot.item.name}当前仍是场外或后续阶段道具，本轮不会在战斗中触发完整效果。`);
    }

    if (used) {
      this.markCombatItemUse(this.state.player);
    }
    return used;
  }

  private useEnemyCombatItem(enemy: ActorState, itemId: ItemId): boolean {
    const slot = this.findSlot(enemy, itemId);
    if (!slot) return false;
    if (!isManualSlotEquipped(enemy, slot)) return false;
    if (this.hasUsedCombatItemThisRound(enemy)) return false;
    const manualCheck = canManuallyUseSlot(this.state, slot);
    if (!manualCheck.ok) return false;
    if (itemId === "stitch-kit") {
      const used = this.useStitchKit(enemy);
      if (used) {
        this.prepareEnchantmentFromUsedItem(enemy, slot);
        markManualSlotUsed(this.state, slot);
        this.markCombatItemUse(enemy);
      }
      return used;
    }
    if (itemId === "photon-cut") {
      const used = this.usePhotonCut(enemy, this.state.player);
      if (used) {
        markManualSlotUsed(this.state, slot);
        this.markCombatItemUse(enemy);
      }
      return used;
    }
    const resolution = resolveEnemyCombatItemEffect(itemId, this.state.player.id, this.enemyHasAdvantageMomentum(enemy));
    if (resolution.type !== "effect") return false;
    const used = this.consumeResolvedEffect(enemy, resolution.effect);
    if (used) {
      this.prepareEnchantmentFromUsedItem(enemy, slot);
      markManualSlotUsed(this.state, slot);
      this.markCombatItemUse(enemy);
    }
    return used;
  }

  private enemyHasAdvantageMomentum(enemy: ActorState): boolean {
    const encounter = this.state.encounter;
    if (!encounter || encounter.enemyId !== enemy.id) return false;
    return this.advantagePoints("enemy") > 0 || Boolean(encounter.enemyBonus);
  }

  private consumeForEffect(
    actor: ActorState,
    itemId: ItemId,
    label: string,
    stat: ActiveEffectStat,
    amount: number,
    remainingRounds: number,
    trigger: ActiveEffect["trigger"],
    targetActorId?: string,
    stackPolicy?: "max" | "add"
  ): boolean {
    this.spendItemUse(actor, itemId);
    this.addActiveEffect(actor, itemId, label, stat, amount, remainingRounds, trigger, targetActorId, stackPolicy);
    return true;
  }

  private consumeResolvedEffect(actor: ActorState, effect: CombatItemEffectSpec): boolean {
    if (effect.requiresAdvantage) {
      if (!this.spendAdvantage(actor.faction)) {
        if (actor.faction === "player") this.pushLog(`${ITEMS[effect.itemId].name}需要支付 1 点优势。`);
        return false;
      }
      this.lastCombatItemSpentAdvantage = true;
    }
    if (effect.itemId === "smoke-ball" && actor.faction === "enemy" && this.consumePassiveFlag(this.state.player, "polarized-lens", "smoke")) {
      this.pushEffectLog("偏光片生效：你免疫了这次烟雾造成的视野惩罚。");
    }
    return this.consumeForEffect(
      actor,
      effect.itemId,
      effect.label,
      effect.stat,
      effect.amount,
      effect.remainingRounds,
      effect.trigger,
      effect.targetActorId,
      effect.stackPolicy
    );
  }

  private isHealingItem(itemId: ItemId): boolean {
    return Boolean(HEALING_ITEM_RULES[itemId]);
  }

  private useHealingItem(actor: ActorState, itemId: ItemId): boolean {
    const rule = HEALING_ITEM_RULES[itemId];
    if (!rule) return false;
    if (!this.findSlot(actor, itemId)) return false;
    const inCombat = Boolean(this.state.encounter);
    if (rule.fieldOnly && inCombat) {
      if (actor.faction === "player") this.pushLog(`${ITEMS[itemId].name}只能在战斗外使用。`);
      return false;
    }
    if (rule.combatOnly && !inCombat) {
      if (actor.faction === "player") this.pushLog(`${ITEMS[itemId].name}只能在战斗中使用。`);
      return false;
    }
    if (rule.requiresAdvantage && inCombat && !this.actorHasAdvantageForHealing(actor)) {
      if (actor.faction === "player") this.pushLog(`${ITEMS[itemId].name}需要支付 1 点优势。`);
      return false;
    }
    if (rule.consumesAdvantage && inCombat && !this.spendAdvantage(actor.faction)) {
      if (actor.faction === "player") this.pushLog(`${ITEMS[itemId].name}需要支付 1 点优势。`);
      return false;
    }

    const cleared = this.clearActorStatuses(actor, rule.clearStatuses ?? []);
    const healed = this.healActor(actor, rule.amount);
    const canAddShield = Boolean(rule.shieldAmount && inCombat);
    const canAddHealOnHit = Boolean(rule.healOnMeleeHit && inCombat);
    if (healed <= 0 && cleared <= 0 && !canAddShield && !canAddHealOnHit) {
      if (actor.faction === "player") this.pushLog(`${ITEMS[itemId].name}暂时没有可处理的伤口。`);
      return false;
    }

    this.spendItemUse(actor, itemId);
    if (canAddShield) {
      this.addActiveEffect(actor, itemId, `${ITEMS[itemId].name}贴住伤处：下一次受到伤害 -${rule.shieldAmount}。`, "incomingDamage", -Math.abs(rule.shieldAmount ?? 1), 2, "nextIncomingDamage");
    }
    if (canAddHealOnHit) {
      this.addActiveEffect(actor, itemId, `${ITEMS[itemId].name}吸住掌心：下一次近战命中回复 ${rule.healOnMeleeHit} 点生命。`, "healOnMeleeHit", rule.healOnMeleeHit ?? 1, 2, "nextMeleeHit");
    }
    if (rule.consumesAdvantage && this.state.encounter) this.state.encounter.phase = "chooseAction";
    this.pushEffectLog(`${actor.name}使用${ITEMS[itemId].name}${healed > 0 ? `，回复 ${healed} 点生命` : ""}${cleared > 0 ? `，清除 ${cleared} 个状态` : ""}。`);
    if (actor.faction === "player" && itemId === "bandage") {
      this.pushFeedback({
        kind: "item-heal",
        title: "绷带",
        body: `回复 ${healed} 点生命，并花费 1 个探索回合。`,
        tone: "advantage",
        origin: { ...actor.position },
        itemId,
        durationMs: 1100
      });
    }
    return true;
  }

  private actorHasAdvantageForHealing(actor: ActorState): boolean {
    const encounter = this.state.encounter;
    if (!encounter) return false;
    return this.advantagePoints(actor.faction) > 0;
  }

  private healActor(actor: ActorState, amount: number): number {
    if (amount <= 0) return 0;
    const before = actor.hp;
    const maxHp = calculateDerivedStats(actor.stats).maxHp;
    actor.hp = Math.min(maxHp, actor.hp + amount);
    return actor.hp - before;
  }

  private clearActorStatuses(actor: ActorState, types: StatusEffectType[]): number {
    const encounter = this.state.encounter;
    if (!encounter || types.length === 0) return 0;
    const before = encounter.statusEffects.length;
    encounter.statusEffects = encounter.statusEffects.filter((effect) => !(effect.targetActorId === actor.id && types.includes(effect.type)));
    return before - encounter.statusEffects.length;
  }

  private triggerEmergencySyringe(actor: ActorState, notes: string[]): void {
    const slot = this.findSlot(actor, "emergency-syringe");
    if (!slot || slot.usedFlags?.broken || actor.hp <= 0) return;
    const threshold = calculateDerivedStats(actor.stats).heavyWoundThreshold;
    if (actor.hp > threshold) return;
    slot.usedFlags = { ...(slot.usedFlags ?? {}), broken: true };
    const healed = this.healActor(actor, 4);
    if (healed > 0) notes.push(`急救针触发，回复 ${healed}`);
  }

  private useCoagulationPowder(): boolean {
    const encounter = this.state.encounter;
    if (!encounter) return false;
    const before = this.state.player.hp;
    const maxHp = calculateDerivedStats(this.state.player.stats).maxHp;
    this.state.player.hp = Math.min(maxHp, this.state.player.hp + 1);
    encounter.activeEffects = encounter.activeEffects.filter((effect) => !(effect.targetActorId === this.state.player.id && effect.stat === "dot"));
    encounter.statusEffects = encounter.statusEffects.filter(
      (effect) => !(effect.targetActorId === this.state.player.id && (effect.type === "burn" || effect.type === "poison" || effect.type === "bleed"))
    );
    this.spendItemUse(this.state.player, "coagulation-powder");
    const healed = this.state.player.hp - before;
    this.pushEffectLog(`凝血粉生效：${healed > 0 ? "回复 1 点生命" : "没有可回复生命"}，并清除轻微持续伤害。`);
    return true;
  }

  private useStitchKit(actor: ActorState): boolean {
    const encounter = this.state.encounter;
    const maxHp = calculateDerivedStats(actor.stats).maxHp;
    const beforeHp = actor.hp;
    let cleared = 0;
    if (encounter) {
      const beforeCount = encounter.statusEffects.length;
      encounter.statusEffects = encounter.statusEffects.filter((effect) => {
        const clears =
          effect.targetActorId === actor.id && (effect.type === "burn" || effect.type === "poison" || effect.type === "bleed");
        return !clears;
      });
      cleared = beforeCount - encounter.statusEffects.length;
    }

    this.spendItemUse(actor, "stitch-kit");
    if (cleared > 0 && encounter) {
      this.addActiveEffect(actor, "stitch-kit", "缝合包把负面状态转成下一次近战伤害 +1。", "damage", 1, 2, "nextMeleeHit");
    } else {
      actor.hp = Math.min(maxHp, actor.hp + 1);
    }
    const healed = actor.hp - beforeHp;
    this.pushEffectLog(
      cleared > 0
        ? `${actor.name}使用缝合包，清除 ${cleared} 个持续状态。`
        : `${actor.name}使用缝合包${healed > 0 ? "，回复 1 点生命" : "，但没有可处理的伤口"}。`
    );
    return true;
  }

  private useAntidoteTablet(): boolean {
    const encounter = this.state.encounter;
    const before = this.state.player.hp;
    const maxHp = calculateDerivedStats(this.state.player.stats).maxHp;
    this.state.player.hp = Math.min(maxHp, this.state.player.hp + 1);
    if (encounter) {
      encounter.statusEffects = encounter.statusEffects.filter((effect) => !(effect.targetActorId === this.state.player.id && effect.type === "poison"));
    }
    this.spendItemUse(this.state.player, "antidote-tablet");
    const healed = this.state.player.hp - before;
    this.pushEffectLog(`解毒片生效：清除中毒${healed > 0 ? "，回复 1 点生命" : ""}。`);
    return true;
  }

  private useInsulationCloth(): boolean {
    const encounter = this.state.encounter;
    if (!encounter) return false;
    encounter.statusEffects = encounter.statusEffects.filter(
      (effect) => !(effect.targetActorId === this.state.player.id && (effect.type === "burn" || effect.type === "freeze"))
    );
    return this.consumeForEffect(this.state.player, "insulation-cloth", "绝缘布生效：清除灼烧/冻结，下一次受到伤害 -1。", "incomingDamage", -1, 2, "nextIncomingDamage");
  }

  private useLens(enemy: ActorState): boolean {
    this.spendItemUse(this.state.player, "lens");
    this.revealEnemyAttackDirection(enemy, "item");
    this.pushEffectLog(`镜片碎裂前锁定方向：${enemy.name}下一次攻击方向被记录。`);
    return true;
  }

  private useScentPowder(enemy: ActorState): boolean {
    this.spendItemUse(this.state.player, "scent-powder");
    this.state.map.hints.push({ ...enemy.position });
    this.addActiveEffect(this.state.player, "scent-powder", "气味粉标记：5 回合内显示目标大致方向。", "mark", 0, 5, "round", enemy.id);
    this.revealEnemyItem(enemy, "item");
    return true;
  }

  private hasPlayerAdvantageWindow(): boolean {
    return this.advantagePoints("player") > 0;
  }

  private triggerDamageEvents(attacker: ActorState, defender: ActorState, damage: number, heavyWound: boolean): void {
    if (damage <= 0) return;
    this.applyPassiveRules("onDamageTaken", defender, attacker);
    if (damage >= 5) this.applyPassiveRules("onHighDamageDealt", attacker, defender);
    if (heavyWound) {
      this.applyPassiveRules("onHeavyWoundDealt", attacker, defender);
      if (defender.hp > 0) this.applyPassiveRules("onHeavyWoundTaken", defender, attacker);
    }
    if (defender.hp === 1) this.applyPassiveRules("onOneHp", defender, attacker);
  }

  private applyPassiveRules(trigger: PassiveTrigger, actor: ActorState, opponent: ActorState): void {
    const equippedPassiveIds = equippedPassiveItemIds(actor, PASSIVE_RULE_ITEM_IDS);
    for (const rule of passiveRulesForTrigger(trigger)) {
      if (!equippedPassiveIds.has(rule.itemId)) continue;
      if (rule.onceFlag && !this.consumePassiveFlag(actor, rule.itemId, rule.onceFlag)) continue;
      if (rule.chainLimited && !recordTriggerChainStep(this.state)) {
        this.pushEffectLog(`本回合道具触发链达到上限，${ITEMS[rule.itemId].name}未触发。`);
        continue;
      }
      this.applyPassiveRule(actor, opponent, rule);
    }
  }

  private applyPassiveRule(actor: ActorState, opponent: ActorState, rule: PassiveItemRule): void {
    const effect = rule.effect;
    const target = "target" in effect && effect.target === "opponent" ? opponent : actor;
    if (effect.kind === "active") {
      this.addPassiveEffect(
        actor,
        rule.itemId,
        rule.label,
        effect.stat,
        effect.amount,
        effect.remainingRounds,
        effect.activeTrigger,
        effect.target === "opponent" ? opponent.id : undefined,
        effect.stackPolicy
      );
      return;
    }
    if (effect.kind === "status") {
      const encounter = this.state.encounter;
      if (!encounter || target.defeated || target.hp <= 0) return;
      const remainingRounds = effect.remainingRounds ?? (effect.status === "poison" ? 3 : effect.status === "freeze" ? 2 : 1);
      const delayRounds = effect.status === "poison" ? 1 : undefined;
      const notes: string[] = [];
      for (const text of applyStatusEffect(encounter, {
        ownerId: actor.id,
        target,
        type: effect.status,
        stacks: effect.stacks,
        remainingRounds,
        delayRounds
      })) {
        notes.push(text);
      }
      this.pushEffectLog(`${actor.name}的${ITEMS[rule.itemId].name}触发：${rule.label}${notes.length ? ` ${notes.join(" ")}` : ""}`);
      this.triggerStatusItemSynergies(actor, target, effect.status, notes);
      return;
    }
    if (effect.kind === "damage") {
      if (target.defeated || target.hp <= 0) return;
      target.hp = Math.max(0, target.hp - effect.amount);
      this.pushEffectLog(`${actor.name}的${ITEMS[rule.itemId].name}触发：${rule.label}`);
      return;
    }
    if (effect.kind === "heal") {
      if (target.defeated || target.hp <= 0) return;
      const healed = this.healActor(target, effect.amount);
      if (healed > 0) this.pushEffectLog(`${actor.name}的${ITEMS[rule.itemId].name}触发：${rule.label}`);
      return;
    }
    if (effect.kind === "intel") {
      if (actor.faction === "player" && opponent.faction === "enemy") {
        this.revealNextIntel(opponent, "item");
      }
      this.pushEffectLog(`${actor.name}的${ITEMS[rule.itemId].name}触发：${rule.label}`);
      return;
    }
    if (effect.kind === "advantage") {
      this.passiveAdvantageOwner = actor.faction;
      this.pushEffectLog(`${actor.name}的${ITEMS[rule.itemId].name}触发：${rule.label}`);
    }
  }

  private applyCombatStartPassives(actor: ActorState, opponent: ActorState): void {
    if (this.hasItem(actor, "lead-wrap")) {
      this.addPassiveEffect(actor, "lead-wrap", "铅缠带压住手腕：本场力量 +1。", "strength", 1, 99, "round");
    }
    if (this.hasItem(actor, "ankle-spring")) {
      this.addPassiveEffect(actor, "ankle-spring", "踝簧顶开步点：本场速度 +1。", "speed", 1, 99, "round");
    }
    if (this.hasItem(actor, "cracked-scope")) {
      this.addPassiveEffect(actor, "cracked-scope", "裂准镜校出要害：本场暴击率 +8%。", "critChance", 8, 99, "round");
    }
    this.applyPassiveRules("combatStart", actor, opponent);
  }

  private applyRoundTimingPassives(actor: ActorState, opponent: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    if (encounter.round === 1 && this.hasItem(actor, "spark-fuse")) {
      this.addPassiveEffect(actor, "spark-fuse", "火星引线燃起：下一次近战命中附加灼烧。", "burn", 1, 2, "nextMeleeHit");
    }
    if (encounter.round === 2 && this.hasItem(actor, "second-breath")) {
      this.addPassiveEffect(actor, "second-breath", "二息带稳住呼吸：本回合躲闪 +15%。", "dodge", 15, 1, "round");
    }
    if (encounter.round >= 3 && this.hasItem(actor, "rust-cloud")) {
      this.addPassiveEffect(actor, "rust-cloud", "锈粉囊散开：目标本回合躲闪 -10%。", "dodge", -10, 1, "round", opponent.id);
    }
    if (encounter.round === 1) this.applyPassiveRules("firstRound", actor, opponent);
    if (encounter.round === 2) this.applyPassiveRules("secondRound", actor, opponent);
    if (encounter.round >= 3) this.applyPassiveRules("thirdRoundPlus", actor, opponent);
  }

  private addActiveEffect(
    actor: ActorState,
    itemId: ItemId,
    label: string,
    stat: ActiveEffectStat,
    amount: number,
    remainingRounds: number,
    trigger: ActiveEffect["trigger"],
    targetActorId?: string,
    stackPolicy?: "max" | "add"
  ): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    this.effectCounter += 1;
    encounter.activeEffects.push({
      id: `${actor.id}-${itemId}-${this.effectCounter}`,
      ownerId: actor.id,
      sourceItemId: itemId,
      label,
      stat,
      amount,
      remainingRounds,
      trigger,
      targetActorId,
      stackPolicy
    });
    this.pushEffectLog(`${actor.name}使用${ITEMS[itemId].name}。${label}`);
  }

  private addPassiveEffect(
    actor: ActorState,
    itemId: ItemId,
    label: string,
    stat: ActiveEffectStat,
    amount: number,
    remainingRounds: number,
    trigger: ActiveEffect["trigger"],
    targetActorId?: string,
    stackPolicy?: "max" | "add"
  ): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    this.effectCounter += 1;
    encounter.activeEffects.push({
      id: `${actor.id}-${itemId}-passive-${this.effectCounter}`,
      ownerId: actor.id,
      sourceItemId: itemId,
      label,
      stat,
      amount,
      remainingRounds,
      trigger,
      targetActorId,
      stackPolicy
    });
    this.pushEffectLog(`${actor.name}的${ITEMS[itemId].name}触发：${label}`);
  }

  private pushEffectLog(text: string): void {
    const encounter = this.state.encounter;
    if (encounter) encounter.log.push({ round: encounter.round, text });
    this.pushLog(text);
  }

  private effectAmount(
    actor: ActorState,
    stat: ActiveEffectStat,
    mode: "owned" | "targeted" | "both" = "owned",
    trigger?: ActiveEffect["trigger"]
  ): number {
    return activeEffectAmountForState(this.state, actor, stat, mode, trigger);
  }

  private consumeEffectAmount(
    actor: ActorState,
    stat: ActiveEffectStat,
    mode: "owned" | "targeted" | "both",
    trigger: ActiveEffect["trigger"]
  ): number {
    const encounter = this.state.encounter;
    if (!encounter) return 0;
    const matches: ActiveEffect[] = [];
    const consumed: string[] = [];
    encounter.activeEffects = encounter.activeEffects.filter((effect) => {
      const applies =
        effect.stat === stat &&
        effect.trigger === trigger &&
        (mode === "owned"
          ? effect.ownerId === actor.id
          : mode === "targeted"
            ? effect.targetActorId === actor.id
            : effect.ownerId === actor.id || effect.targetActorId === actor.id);
      if (!applies) return true;
      matches.push(effect);
      consumed.push(effect.label);
      return false;
    });
    const amount = resolveStackedEffectAmount(matches);
    for (const label of consumed) this.pushEffectLog(`道具效果触发：${label}`);
    return amount;
  }

  private discardNextMeleeHitEffects(actor: ActorState): string[] {
    const encounter = this.state.encounter;
    if (!encounter) return [];
    const discarded: string[] = [];
    encounter.activeEffects = encounter.activeEffects.filter((effect) => {
      if (effect.ownerId === actor.id && effect.trigger === "nextMeleeHit") {
        discarded.push(effect.label);
        return false;
      }
      return true;
    });
    return discarded;
  }

  private tickActiveEffects(): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    for (const effect of encounter.activeEffects) {
      effect.remainingRounds -= 1;
    }
    const expired = encounter.activeEffects.filter((effect) => effect.remainingRounds <= 0);
    encounter.activeEffects = encounter.activeEffects.filter((effect) => effect.remainingRounds > 0);
    for (const effect of expired) this.pushEffectLog(`道具效果结束：${effect.label}`);
  }

  private consumePassiveFlag(actor: ActorState, itemId: ItemId, flag: string): boolean {
    const slot = this.findSlot(actor, itemId);
    if (!slot) return false;
    const encounterKey = this.state.encounter?.enemyId ?? "run";
    const key = `${encounterKey}-${flag}`;
    if (slot.usedFlags?.[key]) return false;
    slot.usedFlags = { ...(slot.usedFlags ?? {}), [key]: true };
    return true;
  }

  private consumeIncomingDamageReduction(defender: ActorState, ranged: boolean): number {
    const reduction = Math.abs(this.consumeEffectAmount(defender, "incomingDamage", "owned", "nextIncomingDamage"));
    if (reduction <= 0) return 0;
    return ranged ? Math.min(1, reduction) : reduction;
  }

  private hasUsedCombatItemThisRound(actor: ActorState): boolean {
    const encounter = this.state.encounter;
    if (!encounter) return false;
    return encounter.combatItemUseRound[actor.id] === encounter.round;
  }

  private markCombatItemUse(actor: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    encounter.combatItemUseRound[actor.id] = encounter.round;
  }

  private useRunnerKnot(): boolean {
    let moved = 0;
    for (let step = 0; step < 2; step += 1) {
      const next = this.adjacentPosition(this.state.player.position, this.state.player.facing);
      if (!canEnterState(this.state, next, this.state.player.position)) break;
      if (this.state.map.aiUnits.some((unit) => !unit.defeated && isSamePosition(unit.position, next))) break;
      this.state.player.previousPosition = { ...this.state.player.position };
      this.state.player.position = next;
      moved += 1;
    }
    if (moved === 0) {
      this.pushLog("跑绳结被墙线或单位卡住，没有成功拉开距离。");
      return false;
    }
    this.spendItemUse(this.state.player, "runner-knot");
    this.pushLog(`跑绳结拉动你向前移动 ${moved} 格。`);
    this.advanceTurnPreservingHints();
    if (this.state.outcome) return true;
    const tile = this.state.map.tiles[this.state.player.position.y][this.state.player.position.x];
    if (tile === "exit") this.extract();
    else if (!this.offerPlayerPickup()) this.checkEncounter();
    return true;
  }

  private useRedCompass(): boolean {
    const candidates = this.state.map.lootNodes
      .filter((node) => !node.depleted && node.offerItemIds.some((itemId) => ITEMS[itemId].rarity !== "common"))
      .map((node) => {
        const bestRarity = node.offerItemIds.some((itemId) => ITEMS[itemId].rarity === "rare") ? "rare" : "uncommon";
        return { node, bestRarity, distance: distance(this.state.player.position, node.position) };
      })
      .sort((a, b) => a.distance - b.distance || a.node.id.localeCompare(b.node.id));
    const target = candidates[0];
    if (!target) {
      this.pushLog("红针罗盘没有找到含较高稀有度道具的未清空拾取点。");
      return false;
    }
    this.spendItemUse(this.state.player, "red-compass");
    this.state.map.hints.push({ ...target.node.position });
    const direction = directionLabel(directionFromDelta(target.node.position.x - this.state.player.position.x, target.node.position.y - this.state.player.position.y));
    this.pushLog(`红针罗盘指向${direction}侧 ${target.distance} 格：最近的高价值拾取点含 ${target.bestRarity} 道具。`);
    return true;
  }

  private useVoiceWhistle(): boolean {
    const lureTarget = this.adjacentPosition(this.state.player.position, this.state.player.facing);
    const enemy = this.state.map.aiUnits
      .filter((unit) => !unit.defeated && (unit.neutralUntilTurn ?? 0) <= this.state.turn && distance(unit.position, this.state.player.position) <= 5)
      .sort((a, b) => distance(a.position, lureTarget) - distance(b.position, lureTarget))[0];
    if (!enemy) {
      this.pushLog("假声哨没有引到任何敌人。");
      return false;
    }

    this.spendItemUse(this.state.player, "voice-whistle");
    if (enemy.stats.intellect >= 5 && this.rollPercent(`voice-whistle-resist-${enemy.id}`) < 45) {
      this.state.map.hints.push({ ...enemy.position });
      this.pushLog(`${enemy.name}识破了假声哨，只暴露了当前位置。`);
      this.advanceTurnPreservingHints();
      if (!this.state.outcome) this.checkEncounter();
      return true;
    }

    const before = { ...enemy.position };
    stepTowardInState(this.state, enemy, lureTarget);
    this.state.map.hints.push({ ...enemy.position });
    const moved = !isSamePosition(before, enemy.position);
    this.pushLog(moved ? `${enemy.name}被假声哨引动，向指定邻格移动了一步。` : `${enemy.name}听见假声哨，但被墙线或单位卡住。`);
    this.advanceTurnPreservingHints();
    if (!this.state.outcome) this.checkEncounter();
    return true;
  }

  private useEnchantmentGem(itemId: ItemId): boolean {
    const affix = createGemAffix(itemId);
    if (!affix || affix.kind !== "enchantment") return false;
    const target = this.pickEnchantmentTarget(this.state.player, affix);
    if (!target) {
      this.pushLog("你手上没有可写入附魔的道具。");
      return false;
    }
    target.affix = affix;
    this.spendItemUse(this.state.player, itemId);
    this.pushFeedback({
      kind: "item-use",
      title: "附魔写入",
      body: `${enchantmentAdjective(affix.enchantment)}力量写入 ${target.item.name}。`,
      tone: "advantage",
      origin: { ...this.state.player.position },
      itemId: target.item.id,
      durationMs: 1200
    });
    this.pushLog(`你消耗${ITEMS[itemId].name}，将${target.item.name}改造成${enchantedItemName(target)}。`);
    return true;
  }

  private useBandage(slot: InventorySlot): boolean {
    const inCombat = Boolean(this.state.encounter);
    const hasAdvantage = this.advantagePoints("player") > 0;
    if (inCombat && !hasAdvantage) {
      this.pushLog("战斗中必须支付 1 点优势，才能稳住手包扎。");
      return false;
    }
    const maxHp = calculateDerivedStats(this.state.player.stats).maxHp;
    this.state.player.hp = Math.min(maxHp, this.state.player.hp + 3);
    this.spendItemUse(this.state.player, slot.item.id);
    if (this.state.encounter) {
      this.spendAdvantage("player");
      this.state.encounter.phase = "chooseAction";
    }
    this.pushLog("你用绷带压住伤口，回复 3 点生命。");
    return true;
  }

  private placeTrap(itemId: ItemId = "trap"): void {
    const target = this.adjacentPosition(this.state.player.position, this.state.player.facing);
    const position = this.canEnter(target) ? target : { ...this.state.player.position };
    const slot = this.findSlot(this.state.player, itemId);
    this.state.map.traps.push({
      id: `trap-${this.trapCounter++}`,
      ownerId: this.state.player.id,
      itemId,
      position,
      armed: true,
      affix: slot?.affix ? { ...slot.affix } : undefined
    });
    this.pushLog(`你在${directionLabel(this.state.player.facing)}侧布下${ITEMS[itemId].name}。`);
  }

  private adjacentPosition(position: Position, direction: Direction): Position {
    if (direction === "north") return { x: position.x, y: position.y - 1 };
    if (direction === "south") return { x: position.x, y: position.y + 1 };
    if (direction === "west") return { x: position.x - 1, y: position.y };
    return { x: position.x + 1, y: position.y };
  }

  private extract(): void {
    this.state.outcome = {
      kind: "extracted",
      title: "撤离成功",
      body: `你带着 ${this.state.loot} 点战利离开。桌局还在身后继续。`
    };
  }

  private failRun(title: string, body: string): void {
    this.state.outcome = { kind: "failed", title, body };
  }

  private endEncounter(message: string): void {
    this.state.encounter = undefined;
    this.pushLog(message);
    this.updateVisibility();
  }

  private pushEnemyDefeatedFeedback(enemy: ActorState): void {
    this.pushFeedback({
      kind: "enemy-defeated",
      title: "敌人击杀",
      body: `${enemy.name}倒下，正在回收其身上可用装备。`,
      tone: "advantage",
      durationMs: 1000
    });
  }

  private collectEnemyDrops(enemy: ActorState): void {
    if (isTutorialEnemyId(enemy.id)) return;
    const drops = collectEnemyDropsForEnemy(this.state, enemy, this.droppedEnemyIds);
    if (drops.length === 0) {
      const body = "未发现可回收道具";
      this.pushLog(`${enemy.name}：${body}。`);
      this.pushFeedback({
        kind: "loot-drop",
        title: "掉落",
        body,
        tone: "neutral",
        durationMs: 1000
      });
      return;
    }
    for (const drop of drops) this.addSlotToActor(this.state.player, drop);
    const names = drops.map((slot) => `${enchantedItemName(slot)}${slot.charges !== undefined ? `(${slot.charges})` : ""}`).join(", ");
    this.pushLog(`${enemy.name}掉落 ${names}。`);
    this.pushFeedback({
      kind: "loot-drop",
      title: "掉落",
      body: `${enemy.name}：${names}`,
      tone: "intel",
      durationMs: 1000
    });
  }


  private addItemToActor(actor: ActorState, itemId: ItemId): InventorySlot {
    return addItemToActorForState(this.state, actor, itemId);
  }

  private addSlotToActor(actor: ActorState, incoming: InventorySlot): InventorySlot {
    return addSlotToActorForState(this.state, actor, incoming);
  }

  private consumeItem(actor: ActorState, itemId: ItemId): void {
    consumeItemForState(this.state, actor, itemId);
  }

  private spendItemUse(actor: ActorState, itemId: ItemId): void {
    spendItemUseForState(this.state, actor, itemId);
  }

  private findSlot(actor: ActorState, itemId: ItemId): InventorySlot | undefined {
    return findSlotForActor(actor, itemId);
  }

  private hasItem(actor: ActorState, itemId: ItemId): boolean {
    return hasItemForActor(actor, itemId);
  }

  private getEncounterEnemy(): ActorState {
    const enemy = this.state.map.aiUnits.find((unit) => unit.id === this.state.encounter?.enemyId);
    if (!enemy) throw new Error("Encounter enemy missing");
    return enemy;
  }

  private gainIntel(enemy: ActorState, sourceBonus: number, source: IntelEntry["source"]): void {
    const bonus = this.consumeBonus(this.state.player, "intel");
    const score = this.effectiveIntellect(this.state.player) + sourceBonus + bonus;
    const count = score >= 10 ? 3 : score >= 7 ? 2 : score >= 4 ? 1 : 0;
    for (let i = 0; i < count; i += 1) this.revealNextIntel(enemy, source);
  }

  private revealBasicIntel(enemy: ActorState): void {
    if (!this.state.intel.some((intel) => intel.targetId === enemy.id && intel.certainty === "suspected" && intel.source === "sight")) {
      this.revealSuspectedIntel(enemy, "sight");
    }
    const spirit = this.state.player.stats.spirit;
    const guaranteedSightIntel = spirit >= 6 ? 2 : spirit >= 5 ? 1 : 0;
    const confirmedSightIntel = this.state.intel.filter((intel) => intel.targetId === enemy.id && intel.certainty === "confirmed" && intel.source === "sight").length;
    for (let i = confirmedSightIntel; i < guaranteedSightIntel; i += 1) this.revealNextIntel(enemy, "sight");
  }

  private revealNextIntel(enemy: ActorState, source: IntelEntry["source"]): void {
    const kinds: IntelEntry["kind"][] = source === "defend" || source === "dodge" ? ["statExact", "item", "attackDirection"] : ["statExact", "item"];
    for (const kind of this.shuffledIntelKinds(enemy, source, kinds)) {
      const before = this.state.intel.length;
      this.revealIntelOfKind(enemy, source, kind);
      if (this.state.intel.length > before) return;
    }
  }

  private shuffledIntelKinds(enemy: ActorState, source: IntelEntry["source"], kinds: IntelEntry["kind"][]): IntelEntry["kind"][] {
    return [...kinds].sort(
      (a, b) =>
        this.rollPercent(`intel-kind-${enemy.id}-${source}-${a}-${this.state.intel.length}`) -
        this.rollPercent(`intel-kind-${enemy.id}-${source}-${b}-${this.state.intel.length}`)
    );
  }

  private revealIntelOfKind(enemy: ActorState, source: IntelEntry["source"], kind: IntelEntry["kind"]): void {
    if (kind === "attackDirection") {
      this.revealEnemyAttackDirection(enemy, source);
      return;
    }
    if (kind === "item") {
      this.revealEnemyItem(enemy, source);
      return;
    }
    this.revealEnemyStat(enemy, source);
  }

  private revealFromGlasses(enemy: ActorState): void {
    if (!this.hasItem(this.state.player, "glasses")) return;
    this.revealEnemyItem(enemy, "item");
  }

  private revealEnemyItem(enemy: ActorState, source: IntelEntry["source"]): void {
    const slot =
      enemy.inventory.find((candidate) => !this.state.intel.some((intel) => intel.targetId === enemy.id && intel.kind === "item" && intel.itemId === candidate.item.id)) ??
      enemy.inventory[0];
    if (!slot) {
      this.addIntel(enemy, "item", "未见道具", "confirmed", source);
      return;
    }
    const charges = slot.charges !== undefined && this.hasItem(this.state.player, "counting-beads") ? `，剩余 ${slot.charges}` : "";
    this.addIntel(enemy, "item", `拥有${enchantedItemName(slot)}${charges}`, "confirmed", source, slot.item.id);
  }

  private revealEnemyStat(enemy: ActorState, source: IntelEntry["source"], preferredStat?: StatKey): void {
    const unknownStats = STAT_KEYS.filter(
      (stat) => !this.state.intel.some((intel) => intel.targetId === enemy.id && intel.kind === "statExact" && intel.value.startsWith(`${STAT_LABELS[stat]} =`))
    );
    const stat = preferredStat ?? this.pickFromList(unknownStats.length > 0 ? unknownStats : STAT_KEYS, `stat-${enemy.id}-${source}-${this.state.intel.length}`);
    this.addIntel(enemy, "statExact", `${STAT_LABELS[stat]} = ${enemy.stats[stat]}`, "confirmed", source);
  }

  private revealEnemyAttackDirection(enemy: ActorState, source: IntelEntry["source"]): void {
    const encounter = this.state.encounter;
    if (!encounter || encounter.enemyId !== enemy.id) return;
    const attackIndex = this.nextAttackDirectionIndex(enemy);
    const direction = this.attackDirectionForIndex(enemy, attackIndex);
    this.addIntel(enemy, "attackDirection", direction, "confirmed", source, undefined, undefined, direction, encounter.round + 1, attackIndex);
  }

  private revealSuspectedIntel(enemy: ActorState, source: IntelEntry["source"]): void {
    const confidence = clampPercent(45 + this.state.player.stats.intellect * 8, 45, 85);
    const isTrue = this.rollPercent(`suspect-truth-${enemy.id}-${source}-${this.state.intel.length}`) < confidence;
    const useItem = enemy.inventory.length > 0 && this.rollPercent(`suspect-kind-${enemy.id}-${source}-${this.state.intel.length}`) < 45;
    if (useItem) {
      const itemId = isTrue ? this.pickFromList(enemy.inventory.map((slot) => slot.item.id), `suspect-true-item-${enemy.id}`) : this.pickFalseItem(enemy);
      this.addIntel(enemy, "item", `拥有${ITEMS[itemId].name}`, "suspected", source, itemId, confidence);
      return;
    }

    const stat = this.pickFromList(STAT_KEYS, `suspect-stat-${enemy.id}-${source}-${this.state.intel.length}`);
    const trueValue = enemy.stats[stat];
    let value = trueValue;
    if (!isTrue) {
      value = (this.rollPercent(`suspect-false-stat-${enemy.id}-${stat}-${source}`) % 6) + 1;
      if (value === trueValue) value = (value % 6) + 1;
    }
    this.addIntel(enemy, "statExact", `${STAT_LABELS[stat]} = ${value}`, "suspected", source, undefined, confidence);
  }

  private addIntel(
    enemy: ActorState,
    kind: IntelEntry["kind"],
    value: string,
    certainty: IntelEntry["certainty"],
    source: IntelEntry["source"],
    itemId?: ItemId,
    confidence?: number,
    attackDirection?: "left" | "right",
    attackDirectionRound?: number,
    attackDirectionIndex?: number
  ): void {
    if (!this.isAllowedIntel(kind, value)) return;
    if (
      this.state.intel.some(
        (intel) =>
          intel.targetId === enemy.id &&
          intel.kind === kind &&
          intel.value === value &&
          intel.itemId === itemId &&
          intel.attackDirectionRound === attackDirectionRound &&
          intel.attackDirectionIndex === attackDirectionIndex
      )
    ) {
      return;
    }
    if (kind === "attackDirection") {
      this.state.intel = this.state.intel.filter((intel) => !(intel.targetId === enemy.id && intel.kind === "attackDirection"));
    }
    this.state.intel.push({
      targetId: enemy.id,
      kind,
      value,
      certainty,
      source,
      itemId,
      confidence,
      attackDirection,
      attackDirectionRound,
      attackDirectionIndex
    });
    this.pushLog(`你得到情报：${enemy.name}，${this.intelValueLabel(kind, value)}。`);
    this.tryNotebookIntel(enemy, source, kind);
    if (this.state.encounter) {
      this.applyPassiveRules("onIntelGain", this.state.player, enemy);
    }
  }

  private tryNotebookIntel(enemy: ActorState, source: IntelEntry["source"], triggeringKind: IntelEntry["kind"]): void {
    if (triggeringKind === "statExact") return;
    if (!this.consumePassiveFlag(this.state.player, "notebook", `intel-${enemy.id}`)) return;
    this.revealEnemyStat(enemy, source);
  }

  private tryBreathCordIntel(enemy: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter || encounter.round < 2) return;
    if (!this.consumePassiveFlag(this.state.player, "breath-cord", "round-two")) return;
    const chance = clampPercent(35 + this.state.player.stats.intellect * 10, 45, 90);
    if (this.rollPercent(`breath-cord-${enemy.id}-${encounter.round}`) < chance) this.revealSuspectedIntel(enemy, "item");
  }

  private isAllowedIntel(kind: IntelEntry["kind"], value: string): boolean {
    if (kind === "statExact") return /^(精神|智力|力量|速度|体质) = [1-6]$/.test(value);
    if (kind === "item") return value === "未见道具" || /^拥有.+/.test(value);
    return value === "left" || value === "right";
  }

  private intelValueLabel(kind: IntelEntry["kind"], value: string): string {
    if (kind === "attackDirection") return `下次攻击方向 = ${value === "left" ? "左" : "右"}`;
    return value;
  }

  private expireAttackDirectionIntel(enemy: ActorState, consumedAttackIndex: number): void {
    this.state.intel = this.state.intel.filter(
      (intel) => !(intel.targetId === enemy.id && intel.kind === "attackDirection" && (intel.attackDirectionIndex ?? -1) <= consumedAttackIndex)
    );
  }

  private pickFalseItem(enemy: ActorState): ItemId {
    const owned = new Set(enemy.inventory.map((slot) => slot.item.id));
    const candidates = ALL_ITEM_IDS.filter((itemId) => !owned.has(itemId));
    return this.pickFromList(candidates.length > 0 ? candidates : ALL_ITEM_IDS, `suspect-false-item-${enemy.id}-${this.state.intel.length}`);
  }

  private pickFromList<T>(items: T[], label: string): T {
    return items[this.rollPercent(label) % items.length];
  }

  private attackDirection(attacker: ActorState): "left" | "right" {
    return this.attackDirectionForIndex(attacker, this.nextAttackDirectionIndex(attacker));
  }

  private nextAttackDirectionIndex(attacker: ActorState): number {
    return this.state.encounter?.attackDirectionIndex[attacker.id] ?? 0;
  }

  private attackDirectionForIndex(attacker: ActorState, attackIndex: number): "left" | "right" {
    const encounter = this.state.encounter;
    if (!encounter) return attackDirectionForActor(attacker.id, this.state.turn, attackIndex);
    const key = `${attacker.id}:${attackIndex}`;
    encounter.attackDirections[key] ??= attackDirectionForActor(attacker.id, this.state.turn, attackIndex);
    return encounter.attackDirections[key];
  }

  private consumeAttackDirection(attacker: ActorState): void {
    const encounter = this.state.encounter;
    if (!encounter) return;
    const attackIndex = encounter.attackDirectionIndex[attacker.id] ?? 0;
    encounter.attackDirectionIndex[attacker.id] = attackIndex + 1;
    this.expireAttackDirectionIntel(attacker, attackIndex);
  }

  private rollPercent(label: string): number {
    return rollPercentForState(this.seed, label, this.state.turn, this.state.encounter?.round ?? 0);
  }


  private moveActorAway(actor: ActorState, threat: Position): void {
    moveActorAwayInState(this.state, actor, threat);
  }

  private canEnter(position: Position): boolean {
    return canEnterState(this.state, position, this.state.player.position);
  }


  private useEchoNeedle(): boolean {
    this.spendItemUse(this.state.player, "echo");
    const target = this.findNearestSignalTarget();
    const positions = target ? this.echoClusterContaining(target.position) : [];
    for (const position of positions) {
      if (!this.state.map.hints.some((hint) => isSamePosition(hint, position))) {
        this.state.map.hints.push({ ...position });
      }
    }
    this.pushFeedback({
      kind: "echo-pulse",
      title: "回声针",
      body: target ? "声波扩散，花费 1 个探索回合；四格回响区被标出，目标在其中一格。" : "声波扩散，花费 1 个探索回合；但没有形成可标记回响。",
      tone: "intel",
      origin: { ...this.state.player.position },
      positions,
      itemId: "echo",
      durationMs: 1200
    });
    this.pushLog(target ? "回声针标出一片四格回响区。" : "回声针没有听见可用目标。");
    return true;
  }

  private findNearestSignalTarget(): { position: Position; dist: number } | undefined {
    const player = this.state.player.position;
    const points = this.state.map.lootNodes
      .filter((point) => !point.depleted)
      .map((point) => ({ position: point.position, dist: distance(player, point.position) }));
    const enemies = this.state.map.aiUnits
      .filter((unit) => !unit.defeated)
      .map((unit) => ({ position: unit.position, dist: distance(player, unit.position) }));
    return [...points, ...enemies].sort((a, b) => a.dist - b.dist)[0];
  }

  private echoClusterContaining(position: Position): Position[] {
    const leftCandidates = [position.x - 1, position.x].filter((x) => x >= 0 && x < this.state.map.width - 1);
    const topCandidates = [position.y - 1, position.y].filter((y) => y >= 0 && y < this.state.map.height - 1);
    const left = leftCandidates[this.rollPercent(`echo-cluster-x-${position.x}-${position.y}`) % leftCandidates.length] ?? 0;
    const top = topCandidates[this.rollPercent(`echo-cluster-y-${position.x}-${position.y}`) % topCandidates.length] ?? 0;
    return [
      { x: left, y: top },
      { x: left + 1, y: top },
      { x: left, y: top + 1 },
      { x: left + 1, y: top + 1 }
    ];
  }

  private actionLabel(action: CombatAction): string {
    if (action.type === "attack") return "进攻";
    if (action.type === "defend") return "防御";
    if (action.type === "dodge") return action.direction === "left" ? "左躲闪" : "右躲闪";
    if (action.type === "ranged") return "远程攻击";
    return ITEMS[action.itemId].name;
  }

  private bonusLabel(target: "speed" | "damage" | "dodge" | "intel"): string {
    return target === "speed" ? "速度" : target === "damage" ? "伤害" : target === "dodge" ? "躲闪" : "信息获取";
  }

  private encounterFeedbackBody(
    enemy: ActorState,
    owner: "player" | "enemy" | null,
    playerToEnemy: VisibilityLevel,
    enemyToPlayer: VisibilityLevel
  ): string {
    const sight = `你：${this.visibilityShortLabel(playerToEnemy)} / 对方：${this.visibilityShortLabel(enemyToPlayer)}`;
    if (owner === "player") return `你先看见${enemy.name}，照面优势成立。${sight}`;
    if (owner === "enemy") return `${enemy.name}先锁定了你，敌方抢到照面优势。${sight}`;
    return `你和${enemy.name}在一格距离内同时照面。${sight}`;
  }

  private visibilityShortLabel(level: VisibilityLevel): string {
    if (level === "visible") return "看见";
    if (level === "aware") return "察觉";
    return "未见";
  }

  private feedbackToneForOwner(owner: "player" | "enemy" | null): FeedbackTone {
    if (owner === "player") return "advantage";
    if (owner === "enemy") return "danger";
    return "neutral";
  }

  private pushCombatRoundFeedback(
    encounter: { round: number; log: Array<{ text: string }> },
    startIndex: number,
    tone: FeedbackTone,
    extra?: string
  ): void {
    const lines = encounter.log.slice(startIndex).map((entry) => entry.text);
    if (extra) lines.push(extra);
    const body = lines.join(" ");
    this.pushFeedback({
      kind: "combat-round",
      title: `回合 ${encounter.round} 结果`,
      body: body.length > 180 ? `${body.slice(0, 177)}...` : body,
      tone,
      round: encounter.round,
      durationMs: tone === "danger" ? 1200 : 1000
    });
  }

  private pushFeedback(input: {
    kind: FeedbackEvent["kind"];
    title: string;
    body: string;
    tone: FeedbackTone;
    round?: number;
    durationMs?: number;
    origin?: Position;
    target?: Position;
    positions?: Position[];
    itemId?: ItemId;
  }): void {
    this.feedbackCounter += 1;
    const event = {
      id: `${this.state.turn}-${input.round ?? this.state.encounter?.round ?? 0}-${this.feedbackCounter}`,
      kind: input.kind,
      title: input.title,
      body: input.body,
      tone: input.tone,
      turn: this.state.turn,
      round: input.round,
      durationMs: input.durationMs ?? 1000,
      origin: input.origin ? { ...input.origin } : undefined,
      target: input.target ? { ...input.target } : undefined,
      positions: input.positions?.map((position) => ({ ...position })),
      itemId: input.itemId
    };
    this.state.feedbackEvents.push(event);
    this.state.feedbackEvents = this.state.feedbackEvents.slice(-8);
  }

  private pushLog(message: string): void {
    this.state.log.push(message);
    this.state.log = this.state.log.slice(-24);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}


