import { cloneInventorySlot } from "../items";
import { distance, keyOf } from "../map";
import type { ActorState, GameState, InventorySlot } from "../types";
import { addSlotToActor } from "./inventorySystem";
import { isDroppable, scoreItemForEnemy, trimEnemyInventory } from "./lootSystem";
import { rollPercent } from "./randomSystem";
import { getVisibility, hasLineOfSight } from "./visibilitySystem";

/**
 * Resolves one automatic civil-war exchange for each visible adjacent enemy pair.
 */
export function resolveEnemyCivilWars(state: GameState, droppedEnemyIds: Set<string>): string[] {
  const logs: string[] = [];
  const resolvedPairs = new Set<string>();
  for (let i = 0; i < state.map.aiUnits.length; i += 1) {
    for (let j = i + 1; j < state.map.aiUnits.length; j += 1) {
      const a = state.map.aiUnits[i];
      const b = state.map.aiUnits[j];
      if (!canDuel(state, a, b)) continue;
      const pairKey = [a.id, b.id].sort().join(":");
      if (resolvedPairs.has(pairKey)) continue;
      resolvedPairs.add(pairKey);
      const result = resolveDuel(state, a, b, droppedEnemyIds);
      if (result) logs.push(result);
    }
  }
  return logs;
}

function canDuel(state: GameState, a: ActorState, b: ActorState): boolean {
  if (a.defeated || b.defeated) return false;
  if (distance(a.position, b.position) > 2) return false;
  return getVisibility(state, a, b) !== "unseen" || getVisibility(state, b, a) !== "unseen" || hasLineOfSight(state, a.position, b.position);
}

function resolveDuel(state: GameState, a: ActorState, b: ActorState, droppedEnemyIds: Set<string>): string | undefined {
  a.aiState = "duel";
  b.aiState = "duel";
  a.combatCount += 1;
  b.combatCount += 1;

  const damageToB = civilDamage(a);
  const damageToA = civilDamage(b);
  a.hp = Math.max(0, a.hp - damageToA);
  b.hp = Math.max(0, b.hp - damageToB);

  let winner: ActorState | undefined;
  let loser: ActorState | undefined;
  if (a.hp <= 0 && b.hp <= 0) {
    winner = duelTieBreaker(state, a, b);
    loser = winner.id === a.id ? b : a;
    winner.hp = 1;
    loser.hp = 0;
  } else if (a.hp <= 0) {
    winner = b;
    loser = a;
  } else if (b.hp <= 0) {
    winner = a;
    loser = b;
  }

  const observed = state.map.visible.has(keyOf(a.position)) || state.map.visible.has(keyOf(b.position));
  if (!winner || !loser) {
    return observed ? `${a.name}与${b.name}短兵相接，各自受伤。` : "远处传来短促打斗声。";
  }

  loser.defeated = true;
  droppedEnemyIds.add(loser.id);
  const spoils = takeCivilWarSpoils(state, winner, loser);
  if (observed) {
    const lootText = spoils.length > 0 ? `，夺走${spoils.map((slot) => slot.item.name).join("、")}` : "，未发现可用遗物";
    return `${winner.name}击败${loser.name}${lootText}。`;
  }
  return "远处的打斗声停了下来，有人拖走了遗物。";
}

function civilDamage(actor: ActorState): number {
  const weaponBonus = actor.inventory.some((slot) => slot.item.id === "long-knife") ? 1 : 0;
  return Math.max(1, Math.floor(actor.stats.strength / 2) + weaponBonus);
}

function duelTieBreaker(state: GameState, a: ActorState, b: ActorState): ActorState {
  const aScore = a.stats.speed + a.stats.strength + (rollPercent(state.seed, `${a.id}-civil-tie`, state.turn, 0) % 3);
  const bScore = b.stats.speed + b.stats.strength + (rollPercent(state.seed, `${b.id}-civil-tie`, state.turn, 0) % 3);
  return aScore >= bScore ? a : b;
}

function takeCivilWarSpoils(state: GameState, winner: ActorState, loser: ActorState): InventorySlot[] {
  const candidates = loser.inventory
    .filter((slot) => isDroppable(slot))
    .sort((a, b) => scoreItemForEnemy(winner, b.item.id) - scoreItemForEnemy(winner, a.item.id));
  const cap = winner.enemyTier === "elite" ? 5 : 4;
  const availableSlots = Math.max(0, cap - winner.inventory.length);
  const picked = candidates.slice(0, Math.max(1, availableSlots || 1)).slice(0, 2);
  for (const slot of picked) addSlotToActor(state, winner, cloneInventorySlot(slot));
  trimEnemyInventory(winner);
  return picked.map((slot) => cloneInventorySlot(slot));
}
