import type { ActorState, InventorySlot, ItemDefinition, ItemId, ItemRarity } from "../types";

export const ACTIVE_ITEM_SLOT_LIMIT = 4;
export const PASSIVE_BUDGET_LIMIT = 5;

const RARITY_BUDGET_COST: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  mythic: 4
};

/**
 * Returns the effective budget cost for one passive item.
 */
export function passiveBudgetCost(item: Pick<ItemDefinition, "rarity">): number {
  return RARITY_BUDGET_COST[item.rarity];
}

/**
 * Returns true when a manual item slot is inside the actor's automatic active loadout.
 */
export function isManualSlotEquipped(actor: ActorState, slot: InventorySlot, activeSlotLimit = ACTIVE_ITEM_SLOT_LIMIT): boolean {
  if (slot.item.usage.manualLock === "none") return true;
  const activeSlots = actor.inventory.filter((candidate) => candidate.item.usage.manualLock !== "none");
  return activeSlots.indexOf(slot) >= 0 && activeSlots.indexOf(slot) < activeSlotLimit;
}

/**
 * Selects passive item ids that are equipped under the passive budget.
 */
export function equippedPassiveItemIds(
  actor: ActorState,
  eligibleItemIds: ReadonlySet<ItemId>,
  budgetLimit = PASSIVE_BUDGET_LIMIT
): Set<ItemId> {
  const equipped = new Set<ItemId>();
  let spent = 0;
  for (const slot of actor.inventory) {
    const item = slot.item;
    if (!eligibleItemIds.has(item.id)) continue;
    if (equipped.has(item.id)) continue;
    const cost = passiveBudgetCost(item);
    if (spent + cost > budgetLimit) continue;
    equipped.add(item.id);
    spent += cost;
  }
  return equipped;
}

/**
 * Finds rare active/reaction items that do not declare their own usage contract.
 */
export function rareActiveItemsMissingExplicitUsage(items: Record<string, ItemDefinition>): string[] {
  return Object.values(items)
    .filter((item) => item.rarity === "rare")
    .filter((item) => item.timing === "active" || item.timing === "reaction")
    .filter((item) => !item.usageAuthored)
    .map((item) => item.id);
}
