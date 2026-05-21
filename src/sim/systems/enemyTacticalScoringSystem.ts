import { ITEMS } from "../items";
import { distance } from "../map";
import { calculateDerivedStats } from "../stats";
import type { ActorState, GameState, ItemDefinition, ItemEffect, ItemId, LootNode, Position, StatKey } from "../types";
import { enemyBaseScoreForRarity, itemPowerScore } from "./itemBalanceSystem";
import { findSlot } from "./inventorySystem";
import { isManualSlotEquipped } from "./itemLimitSystem";
import { activeEffectAmount, canManuallyUseSlot } from "./itemRuntimeSystem";
import { canEnter, isOccupied } from "./movementSystem";
import { getVisibility } from "./visibilitySystem";

export type ItemCapability =
  | "burnSource"
  | "burnPayoff"
  | "poisonSource"
  | "poisonPayoff"
  | "bleedSource"
  | "bleedPayoff"
  | "freezeSource"
  | "freezePayoff"
  | "crit"
  | "defense"
  | "healing"
  | "intel"
  | "mobility"
  | "ranged"
  | "reload"
  | "control"
  | "advantage"
  | "damage";

export type TacticalPackage =
  | "BurnCrit"
  | "PoisonTempo"
  | "DodgeCounter"
  | "GuardIntel"
  | "AdvantagePress"
  | "RangedReload"
  | "RecoverEscape"
  | "LootHunter";

export type ScoreBreakdown = {
  itemId: ItemId;
  total: number;
  base: number;
  available: boolean;
  capabilities: ItemCapability[];
  packageScores: Partial<Record<TacticalPackage, number>>;
  reasons: string[];
};

export type LootTargetScore = {
  nodeId: string;
  target: Position;
  total: number;
  distance: number;
  risk: number;
  bestItemId: ItemId;
  bestItemScore: number;
};

export type EnemyMovementDecision = {
  aiState: ActorState["aiState"];
  target?: Position;
  score?: LootTargetScore;
};

const DEFAULT_UNKNOWN_STAT = 3;
const COMBAT_ITEM_SCORE_FLOOR = 8;

/**
 * Estimates a player stat from information an enemy can currently act on.
 * Hidden base stats intentionally collapse to the baseline value.
 */
export function estimatePlayerStatForEnemy(state: GameState, _enemy: ActorState, stat: StatKey): number {
  const publicBase = DEFAULT_UNKNOWN_STAT;
  if (stat === "strength" || stat === "speed" || stat === "intellect") {
    return publicBase + activeEffectAmount(state, state.player, stat, "both", "round");
  }
  return publicBase;
}

/**
 * Returns derived tactical capabilities for an item definition.
 */
export function itemCapabilities(item: ItemDefinition): ItemCapability[] {
  const capabilities = new Set<ItemCapability>();
  const key = item.effectKey;
  const effectStats = item.effects.map((effect) => effect.stat).filter(Boolean);
  const statusEffects = item.effects.map((effect) => effect.status).filter(Boolean);

  if (item.tags.includes("damage")) capabilities.add("damage");
  if (item.tags.includes("ranged") || item.effects.some((effect) => effect.kind === "rangedDamage")) capabilities.add("ranged");
  if (item.tags.includes("healing") || item.effects.some((effect) => effect.kind === "heal")) capabilities.add("healing");
  if (item.tags.includes("intel") || item.effects.some((effect) => effect.kind === "intel" || effect.kind === "globalIntel")) capabilities.add("intel");
  if (item.tags.includes("mobility") || effectStats.includes("speed") || effectStats.includes("flee")) capabilities.add("mobility");
  if (item.tags.includes("survival") || effectStats.includes("incomingDamage")) capabilities.add("defense");
  if (item.tags.includes("ammo") || item.effects.some((effect) => effect.kind === "ammo") || key.includes("ammo")) capabilities.add("reload");
  if (effectStats.includes("critChance")) capabilities.add("crit");
  if (effectStats.includes("dodge") || effectStats.includes("flee") || key.includes("penalty") || item.tags.includes("counter")) capabilities.add("control");
  if (item.ports.some((port) => port.requiresAdvantage) || key.startsWith("advantage-") || item.useContext === "combat") {
    if (key.includes("advantage")) capabilities.add("advantage");
  }

  addStatusCapabilities(capabilities, item, "burn", statusEffects, key);
  addStatusCapabilities(capabilities, item, "poison", statusEffects, key);
  addStatusCapabilities(capabilities, item, "bleed", statusEffects, key);
  addStatusCapabilities(capabilities, item, "freeze", statusEffects, key);

  return [...capabilities];
}

/**
 * Scores one combat item for an enemy without mutating game state.
 */
export function scoreEnemyCombatItem(state: GameState, enemy: ActorState, itemId: ItemId): ScoreBreakdown {
  const item = ITEMS[itemId];
  const slot = findSlot(enemy, itemId);
  const capabilities = itemCapabilities(item);
  const unavailable = unavailableReason(state, enemy, item, slot);
  if (unavailable) {
    return { itemId, total: Number.NEGATIVE_INFINITY, base: 0, available: false, capabilities, packageScores: {}, reasons: [unavailable] };
  }

  const packageScores: Partial<Record<TacticalPackage, number>> = {};
  const reasons: string[] = [];
  const context = tacticalContext(state, enemy);
  let total = enemyBaseScoreForRarity(item.rarity) + itemPowerScore(item);

  total += addPackage(packageScores, reasons, "BurnCrit", burnPackageScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "PoisonTempo", poisonPackageScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "DodgeCounter", dodgeCounterScore(enemy, capabilities, context));
  total += addPackage(packageScores, reasons, "GuardIntel", guardIntelScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "AdvantagePress", advantagePressScore(capabilities, context));
  total += addPackage(packageScores, reasons, "RangedReload", rangedReloadScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "RecoverEscape", recoverEscapeScore(capabilities, context));

  if (capabilities.includes("control") && context.estimatedPlayerSpeed > enemy.stats.speed) {
    total += 3;
    reasons.push("public-speed-counter");
  }
  if (capabilities.includes("damage") && state.player.hp <= 5) {
    total += 2;
    reasons.push("visible-low-player-hp");
  }

  return {
    itemId,
    total: Math.round(total * 100) / 100,
    base: Math.round((enemyBaseScoreForRarity(item.rarity) + itemPowerScore(item)) * 100) / 100,
    available: true,
    capabilities,
    packageScores,
    reasons
  };
}

/**
 * Ranks all currently usable enemy combat items by tactical score.
 */
export function rankEnemyCombatItems(state: GameState, enemy: ActorState): ScoreBreakdown[] {
  const seen = new Set<ItemId>();
  return enemy.inventory
    .map((slot) => slot.item.id)
    .filter((itemId) => {
      if (seen.has(itemId)) return false;
      seen.add(itemId);
      return itemId !== "pistol";
    })
    .map((itemId) => scoreEnemyCombatItem(state, enemy, itemId))
    .filter((score) => score.available)
    .sort((a, b) => b.total - a.total || a.itemId.localeCompare(b.itemId));
}

/**
 * Chooses the best tactical combat item, if its score clears the action floor.
 */
export function chooseEnemyTacticalCombatItem(state: GameState, enemy: ActorState): ItemId | undefined {
  const best = rankEnemyCombatItems(state, enemy)[0];
  if (!best || best.total < COMBAT_ITEM_SCORE_FLOOR) return undefined;
  return best.itemId;
}

/**
 * Scores an item as a pickup candidate for an enemy build.
 */
export function scoreEnemyPickupItem(enemy: ActorState, itemId: ItemId): ScoreBreakdown {
  const item = ITEMS[itemId];
  const capabilities = itemCapabilities(item);
  const packageScores: Partial<Record<TacticalPackage, number>> = {};
  const reasons: string[] = [];
  let total = enemyBaseScoreForRarity(item.rarity) + itemPowerScore(item);

  total += addPackage(packageScores, reasons, "BurnCrit", burnPackageScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "PoisonTempo", poisonPackageScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "DodgeCounter", dodgeCounterScore(enemy, capabilities, { lowHealth: false, hasAdvantageMomentum: false, estimatedPlayerSpeed: DEFAULT_UNKNOWN_STAT }));
  total += addPackage(packageScores, reasons, "GuardIntel", guardIntelScore(enemy, capabilities));
  total += addPackage(packageScores, reasons, "RangedReload", rangedReloadScore(enemy, capabilities));

  if (capabilities.includes("ranged") && enemy.stats.spirit >= 4) {
    total += 3;
    reasons.push("spirit-ranged-fit");
  }
  if (capabilities.includes("damage") && enemy.stats.strength >= 4) {
    total += 2;
    reasons.push("strength-damage-fit");
  }
  if (capabilities.includes("mobility") && enemy.stats.speed <= 2) {
    total += 2;
    reasons.push("speed-gap");
  }
  if (capabilities.includes("defense") && enemy.stats.constitution <= 2) {
    total += 2;
    reasons.push("constitution-gap");
  }
  if (capabilities.includes("intel") && enemy.stats.intellect >= 4) {
    total += 2;
    reasons.push("intellect-fit");
  }
  if (capabilities.includes("healing") && enemy.hp <= 6) {
    total += 3;
    reasons.push("wounded-pickup");
  }

  return { itemId, total: Math.round(total * 100) / 100, base: enemyBaseScoreForRarity(item.rarity), available: true, capabilities, packageScores, reasons };
}

/**
 * Chooses a movement target without mutating the enemy or map state.
 */
export function chooseEnemyMovementTarget(state: GameState, enemy: ActorState): EnemyMovementDecision {
  const lowHealth = enemy.hp <= calculateDerivedStats(enemy.stats).heavyWoundThreshold;
  const visibility = getVisibility(state, enemy, state.player);
  if (lowHealth) return { aiState: "recover", target: bestRecoverStep(state, enemy) };
  if (visibility === "visible" || enemy.awareness.level === "aware") {
    return { aiState: "huntPlayer", target: enemy.awareness.lastKnownPosition ?? state.player.position };
  }

  const lootTarget = chooseEnemyLootTarget(state, enemy);
  if (lootTarget) return { aiState: "seekLoot", target: lootTarget.target, score: lootTarget };
  return { aiState: "patrol" };
}

/**
 * Scores reachable loot nodes and returns the highest-value movement target.
 */
export function chooseEnemyLootTarget(state: GameState, enemy: ActorState): LootTargetScore | undefined {
  const candidates = state.map.lootNodes
    .filter((node) => !node.depleted && !isPlayerOnNode(state, node.position))
    .map((node) => scoreLootNodeTarget(state, enemy, node))
    .filter((score): score is LootTargetScore => Boolean(score))
    .sort((a, b) => b.total - a.total || a.distance - b.distance);
  return candidates[0];
}

function scoreLootNodeTarget(state: GameState, enemy: ActorState, node: LootNode): LootTargetScore | undefined {
  const pathDistance = reachableDistance(state, enemy, node.position);
  if (pathDistance === undefined) return undefined;
  const offerScores = node.offerItemIds.map((itemId) => scoreEnemyPickupItem(enemy, itemId));
  const best = offerScores.sort((a, b) => b.total - a.total)[0];
  const risk = lootRisk(state, enemy, node.position);
  return {
    nodeId: node.id,
    target: { ...node.position },
    total: Math.round((best.total - pathDistance * 0.85 - risk) * 100) / 100,
    distance: pathDistance,
    risk,
    bestItemId: best.itemId,
    bestItemScore: best.total
  };
}

function tacticalContext(state: GameState, enemy: ActorState): { lowHealth: boolean; hasAdvantageMomentum: boolean; estimatedPlayerSpeed: number } {
  return {
    lowHealth: enemy.hp <= 4 + Math.floor(enemy.stats.constitution / 2),
    hasAdvantageMomentum:
      (state.encounter?.advantage.enemyPoints ?? (state.encounter?.advantage.owner === "enemy" ? 1 : 0)) > 0 || Boolean(state.encounter?.enemyBonus),
    estimatedPlayerSpeed: estimatePlayerStatForEnemy(state, enemy, "speed")
  };
}

function unavailableReason(state: GameState, enemy: ActorState, item: ItemDefinition, slot: ReturnType<typeof findSlot>): string | undefined {
  if (!slot) return "not-held";
  if (item.timing === "passive") return "passive-not-manual";
  if (item.id === "pistol") return "pistol-uses-ranged-action";
  if (item.id === "old-magazine") return "field-reload-only";
  if (item.useContext === "field" || item.useContext === "passive") return "not-combat-context";
  if (!isManualSlotEquipped(enemy, slot)) return "outside-active-slots";
  const manual = canManuallyUseSlot(state, slot);
  if (!manual.ok) return manual.reason ?? "manual-lock";
  if ((slot.charges ?? 1) <= 0 && item.usage.mode !== "unlimited") return "empty";
  return undefined;
}

function addStatusCapabilities(
  capabilities: Set<ItemCapability>,
  item: ItemDefinition,
  status: "burn" | "poison" | "bleed" | "freeze",
  statusEffects: Array<ItemEffect["status"]>,
  effectKey: string
): void {
  const source = `${status}Source` as ItemCapability;
  const payoff = `${status}Payoff` as ItemCapability;
  if (statusEffects.includes(status) || (item.timing !== "passive" && effectKey.includes(status))) capabilities.add(source);
  if (item.timing === "passive" && effectKey.includes(status)) capabilities.add(payoff);
}

function addPackage(
  packageScores: Partial<Record<TacticalPackage, number>>,
  reasons: string[],
  packageName: TacticalPackage,
  score: number
): number {
  if (score <= 0) return 0;
  packageScores[packageName] = score;
  reasons.push(packageName);
  return score;
}

function burnPackageScore(enemy: ActorState, capabilities: ItemCapability[]): number {
  if (capabilities.includes("burnSource") && inventoryHasCapability(enemy, "burnPayoff")) return 8;
  if (capabilities.includes("burnPayoff") && inventoryHasCapability(enemy, "burnSource")) return 5;
  return 0;
}

function poisonPackageScore(enemy: ActorState, capabilities: ItemCapability[]): number {
  if (capabilities.includes("poisonSource") && inventoryHasCapability(enemy, "poisonPayoff")) return 8;
  if (capabilities.includes("poisonPayoff") && inventoryHasCapability(enemy, "poisonSource")) return 5;
  return 0;
}

function dodgeCounterScore(
  enemy: ActorState,
  capabilities: ItemCapability[],
  context: { lowHealth: boolean; hasAdvantageMomentum: boolean; estimatedPlayerSpeed: number }
): number {
  if (!capabilities.includes("control") && !capabilities.includes("defense")) return 0;
  let score = 0;
  if (enemy.stats.speed >= 4 || context.estimatedPlayerSpeed > enemy.stats.speed) score += 3;
  if (context.lowHealth) score += 3;
  return score;
}

function guardIntelScore(enemy: ActorState, capabilities: ItemCapability[]): number {
  if (!capabilities.includes("intel") && !capabilities.includes("defense")) return 0;
  return enemy.stats.intellect >= 4 || enemy.stats.constitution >= 4 ? 4 : 0;
}

function advantagePressScore(capabilities: ItemCapability[], context: { hasAdvantageMomentum: boolean }): number {
  if (!context.hasAdvantageMomentum) return 0;
  if (capabilities.includes("advantage") || capabilities.includes("damage") || capabilities.includes("control")) return 6;
  return 0;
}

function rangedReloadScore(enemy: ActorState, capabilities: ItemCapability[]): number {
  if (!capabilities.includes("reload")) return 0;
  const pistol = findSlot(enemy, "pistol");
  if (!pistol) return 0;
  const current = pistol.charges ?? 0;
  const max = pistol.item.maxCharges ?? 6;
  return current < max ? 10 : 0;
}

function recoverEscapeScore(capabilities: ItemCapability[], context: { lowHealth: boolean }): number {
  if (!context.lowHealth) return 0;
  if (capabilities.includes("healing") || capabilities.includes("defense") || capabilities.includes("mobility")) return 8;
  return 0;
}

function inventoryHasCapability(enemy: ActorState, capability: ItemCapability): boolean {
  return enemy.inventory.some((slot) => itemCapabilities(slot.item).includes(capability) && (slot.charges ?? 1) > 0);
}

function bestRecoverStep(state: GameState, enemy: ActorState): Position | undefined {
  return neighbors(enemy.position)
    .filter((position) => canEnter(state, position, enemy.position))
    .filter((position) => !isOccupied(state, position, enemy.id))
    .sort((a, b) => distance(b, state.player.position) - distance(a, state.player.position))[0];
}

function reachableDistance(state: GameState, enemy: ActorState, target: Position): number | undefined {
  const targetOccupied = isOccupied(state, target, enemy.id);
  const seen = new Set<string>([`${enemy.position.x},${enemy.position.y}`]);
  const queue: Array<{ position: Position; distance: number }> = [{ position: { ...enemy.position }, distance: 0 }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    if (current.position.x === target.x && current.position.y === target.y && !targetOccupied) return current.distance;
    if (targetOccupied && distance(current.position, target) <= 1) return current.distance;
    for (const next of neighbors(current.position)) {
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      if (!canEnter(state, next, current.position)) continue;
      if (isOccupied(state, next, enemy.id) && !(next.x === target.x && next.y === target.y)) continue;
      seen.add(key);
      queue.push({ position: next, distance: current.distance + 1 });
    }
  }
  return undefined;
}

function lootRisk(state: GameState, enemy: ActorState, position: Position): number {
  let risk = 0;
  if (state.map.visible.has(`${position.x},${position.y}`)) risk += 2;
  if (distance(position, state.player.position) <= 2) risk += 5;
  if (enemy.hp <= 5 && distance(position, state.player.position) <= distance(enemy.position, state.player.position)) risk += 3;
  return risk;
}

function isPlayerOnNode(state: GameState, position: Position): boolean {
  return state.player.position.x === position.x && state.player.position.y === position.y;
}

function neighbors(position: Position): Position[] {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 }
  ];
}
