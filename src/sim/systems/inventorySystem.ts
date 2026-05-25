import { cloneInventorySlot, createInventorySlot, ITEMS } from "../items";
import type { ActorState, GameState, InventorySlot, ItemId } from "../types";
import { rollNaturalItemAffix } from "./enchantmentSystem";

/**
 * Finds the first inventory slot for an item on an actor.
 */
export function findSlot(actor: ActorState, itemId: ItemId): InventorySlot | undefined {
  const slots = actor.inventory.filter((slot) => slot.item.id === itemId);
  const usableSlots = slots.filter(
    (slot) => slot.charges === undefined || slot.charges > 0 || slot.item.usage.mode === "unlimited" || slot.item.usage.mode === "charges-keep"
  );
  return usableSlots.find((slot) => slot.affix?.kind === "enchantment") ?? usableSlots[0] ?? slots.find((slot) => slot.affix?.kind === "enchantment") ?? slots[0];
}

/**
 * Returns whether an actor currently carries an item.
 */
export function hasItem(actor: ActorState, itemId: ItemId): boolean {
  return Boolean(findSlot(actor, itemId));
}

/**
 * Adds a fresh item instance to an actor inventory.
 */
export function addItemToActor(state: GameState, actor: ActorState, itemId: ItemId): InventorySlot {
  const affix = rollNaturalItemAffix(
    state.seed,
    `${actor.id}-${state.turn}-${actor.inventory.length}-${actor.inventory.reduce((sum, slot) => sum + slot.count, 0)}`,
    itemId,
    state.naturalAffixChance
  );
  const slot = findStackableSlot(actor, itemId, affix);
  if (slot) {
    slot.count += 1;
    const addedCharges = ITEMS[itemId].maxCharges ?? ITEMS[itemId].usage.maxUses;
    if (addedCharges) slot.charges = (slot.charges ?? 0) + addedCharges;
    syncPlayerInventory(state, actor);
    return slot;
  } else {
    const created = createInventorySlot(itemId, 1, { affix });
    actor.inventory.push(created);
    syncPlayerInventory(state, actor);
    return created;
  }
}

/**
 * Adds an existing inventory slot while preserving charges, durability, and used flags.
 */
export function addSlotToActor(state: GameState, actor: ActorState, incoming: InventorySlot): InventorySlot {
  const slot = findStackableSlot(actor, incoming.item.id, incoming.affix);
  if (slot) {
    slot.count += incoming.count;
    if (incoming.charges !== undefined) slot.charges = (slot.charges ?? 0) + incoming.charges;
    slot.usedFlags = { ...(slot.usedFlags ?? {}), ...(incoming.usedFlags ?? {}) };
    syncPlayerInventory(state, actor);
    return slot;
  } else {
    const created = cloneInventorySlot(incoming);
    actor.inventory.push(created);
    syncPlayerInventory(state, actor);
    return created;
  }
}

/**
 * Consumes one count of an item and removes empty slots.
 */
export function consumeItem(state: GameState, actor: ActorState, itemId: ItemId): void {
  const slot = findSlot(actor, itemId);
  if (!slot) return;
  slot.count -= 1;
  if (slot.count <= 0) actor.inventory = actor.inventory.filter((candidate) => candidate.item.id !== itemId);
  syncPlayerInventory(state, actor);
}

/**
 * Applies the usage cost for a manual item use without assuming every active item is consumed.
 */
export function spendItemUse(state: GameState, actor: ActorState, itemId: ItemId): void {
  const slot = findSlot(actor, itemId);
  if (!slot) return;
  const usage = slot.item.usage;
  if (usage.mode === "unlimited") {
    syncPlayerInventory(state, actor);
    return;
  }

  const hasChargePool = slot.charges !== undefined || slot.item.maxCharges !== undefined || usage.maxUses !== undefined;
  if (hasChargePool) {
    const current = slot.charges ?? slot.item.maxCharges ?? usage.maxUses ?? 1;
    slot.charges = Math.max(0, current - 1);
    if (usage.mode === "charges-destroy" && slot.charges <= 0) {
      slot.count -= 1;
      if (slot.count > 0) {
        slot.charges = slot.item.maxCharges ?? usage.maxUses;
      } else {
        actor.inventory = actor.inventory.filter((candidate) => candidate.item.id !== itemId);
      }
    }
    syncPlayerInventory(state, actor);
    return;
  }

  consumeItem(state, actor, itemId);
}

function syncPlayerInventory(state: GameState, actor: ActorState): void {
  if (actor.faction === "player") state.inventory = actor.inventory;
}

function findStackableSlot(actor: ActorState, itemId: ItemId, affix: InventorySlot["affix"]): InventorySlot | undefined {
  return actor.inventory.find((slot) => slot.item.id === itemId && sameAffix(slot.affix, affix));
}

function sameAffix(a: InventorySlot["affix"], b: InventorySlot["affix"]): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.kind !== b.kind) return false;
  if (a.kind === "enchantment" && b.kind === "enchantment") return a.enchantment === b.enchantment && a.source === b.source;
  if (a.kind === "curse" && b.kind === "curse") return a.curse === b.curse && a.source === b.source;
  return false;
}
