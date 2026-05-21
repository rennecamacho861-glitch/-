import { cloneInventorySlot, ITEMS } from "../items";
import { isSamePosition } from "../map";
import { calculateDerivedStats } from "../stats";
import type { ActorState, GameState, InventorySlot, ItemId } from "../types";
import { enchantedItemName } from "./enchantmentSystem";
import { addItemToActor, hasItem } from "./inventorySystem";
import { RARE_ITEM_DROP_CHANCE } from "./itemBalanceSystem";
import { rollPercent } from "./randomSystem";
import { scoreEnemyPickupItem } from "./enemyTacticalScoringSystem";

/**
 * Creates a pending player pickup offer when the player enters an uncleared loot node.
 */
export function offerPlayerPickup(state: GameState): boolean {
  const node = state.map.lootNodes.find((candidate) => !candidate.depleted && isSamePosition(candidate.position, state.player.position));
  if (!node) return false;
  state.pendingPickupOffer = { nodeId: node.id, itemIds: [...node.offerItemIds] };
  return true;
}

/**
 * Lets enemies automatically loot nodes they step onto, returning visible pickup logs.
 */
export function collectEnemyLootNodes(state: GameState): string[] {
  const logs: string[] = [];
  for (const enemy of state.map.aiUnits) {
    if (enemy.defeated) continue;
    const node = state.map.lootNodes.find((candidate) => !candidate.depleted && isSamePosition(candidate.position, enemy.position));
    if (!node) continue;
    if (isSamePosition(node.position, state.player.position)) continue;
    const itemId = chooseEnemyPickup(enemy, node.offerItemIds);
    const slot = addItemToActor(state, enemy, itemId);
    trimEnemyInventory(enemy);
    node.depleted = true;
    if (state.map.visible.has(`${enemy.position.x},${enemy.position.y}`)) {
      logs.push(`${enemy.name} picked ${enchantedItemName(slot)}.`);
    }
  }
  return logs;
}

/**
 * Chooses the highest-scoring item from a three-choice loot offer for an enemy.
 */
export function chooseEnemyPickup(enemy: ActorState, offers: [ItemId, ItemId, ItemId]): ItemId {
  return [...offers].sort((a, b) => scoreItemForEnemy(enemy, b) - scoreItemForEnemy(enemy, a))[0];
}

/**
 * Scores item usefulness from enemy stats, health, and current loadout.
 */
export function scoreItemForEnemy(enemy: ActorState, itemId: ItemId): number {
  let score = scoreEnemyPickupItem(enemy, itemId).total;
  if (ITEMS[itemId].tags.includes("healing") && enemy.hp <= calculateDerivedStats(enemy.stats).heavyWoundThreshold) score += 5;
  if (itemId === "old-magazine" && hasItem(enemy, "pistol")) score += 3;
  if (itemId === "old-magazine" && !hasItem(enemy, "pistol")) score -= 6;
  return score;
}

/**
 * Enforces enemy inventory caps by removing the lowest-value slots.
 */
export function trimEnemyInventory(enemy: ActorState): void {
  const cap = enemy.enemyTier === "elite" ? 5 : 4;
  while (enemy.inventory.length > cap) {
    const ranked = enemy.inventory
      .map((slot, index) => ({
        index,
        score: (slot.charges !== undefined && slot.charges <= 0 ? -10 : 0) + scoreItemForEnemy(enemy, slot.item.id)
      }))
      .sort((a, b) => a.score - b.score);
    enemy.inventory.splice(ranked[0].index, 1);
  }
}

/**
 * Rolls enemy equipment drops while preserving per-slot state.
 */
export function collectEnemyDrops(state: GameState, enemy: ActorState, droppedEnemyIds: Set<string>): InventorySlot[] {
  if (droppedEnemyIds.has(enemy.id)) return [];
  droppedEnemyIds.add(enemy.id);
  const candidates = enemy.inventory.filter((slot) => isDroppable(slot));
  if (candidates.length === 0) return [];
  const round = state.encounter?.round ?? 0;
  const maxDrops = 2 + (rollPercent(state.seed, `${enemy.id}-extra-drop`, state.turn, round) < 5 ? 1 : 0);
  const playerDropBonus = calculateDerivedStats(state.player.stats).lootDropBonus;
  const drops: InventorySlot[] = [];
  const rareCandidates = candidates.filter((slot) => slot.item.rarity === "rare");
  const nonRareCandidates = candidates.filter((slot) => slot.item.rarity !== "rare");

  let guaranteedNonRare: InventorySlot | undefined;
  if (nonRareCandidates.length > 0) {
    guaranteedNonRare = nonRareCandidates[rollPercent(state.seed, `${enemy.id}-drop-guarantee`, state.turn, round) % nonRareCandidates.length];
    drops.push(cloneInventorySlot(guaranteedNonRare));
  }

  for (const slot of nonRareCandidates) {
    if (drops.length >= maxDrops) break;
    if (slot === guaranteedNonRare) continue;
    if (rollPercent(state.seed, `${enemy.id}-drop-${slot.item.id}`, state.turn, round) < 35 + playerDropBonus) drops.push(cloneInventorySlot(slot));
  }

  for (const slot of rareCandidates) {
    if (drops.length >= maxDrops) break;
    if (rollPercent(state.seed, `${enemy.id}-drop-rare-${slot.item.id}`, state.turn, round) < RARE_ITEM_DROP_CHANCE + Math.floor(playerDropBonus / 2)) {
      drops.push(cloneInventorySlot(slot));
    }
  }
  return drops;
}

/**
 * Returns whether a slot can drop after an enemy is defeated.
 */
export function isDroppable(slot: InventorySlot): boolean {
  if (slot.count <= 0) return false;
  if (slot.charges !== undefined && slot.charges <= 0 && slot.item.usage.mode !== "unlimited") return false;
  if (slot.durability !== undefined && slot.durability <= 0) return false;
  if (slot.usedFlags?.broken) return false;
  return true;
}
