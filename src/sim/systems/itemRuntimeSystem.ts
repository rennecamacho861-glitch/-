import type { ActiveEffect, ActiveEffectStat, ActorState, GameState, InventorySlot } from "../types";

export type ManualUseCheck = {
  ok: boolean;
  reason?: string;
};

/**
 * Returns the action round used by item instance manual-use locks.
 */
export function currentManualUseRound(state: GameState): number {
  return state.encounter?.round ?? state.turn;
}

/**
 * Checks whether an item instance can be manually clicked in the current round.
 */
export function canManuallyUseSlot(state: GameState, slot: InventorySlot): ManualUseCheck {
  if (slot.item.usage.manualLock === "none") return { ok: true };
  if (slot.lastManualUseRound === currentManualUseRound(state)) {
    return { ok: false, reason: "本回合这件道具已经使用过。" };
  }
  if (slot.charges !== undefined && slot.charges <= 0 && slot.item.usage.mode !== "unlimited") {
    return { ok: false, reason: "道具次数已经耗尽。" };
  }
  return { ok: true };
}

/**
 * Marks an item instance as manually used for this round.
 */
export function markManualSlotUsed(state: GameState, slot: InventorySlot): void {
  if (slot.item.usage.manualLock === "none") return;
  slot.lastManualUseRound = currentManualUseRound(state);
}

/**
 * Returns true when an actor can manually use the slot and marks it used.
 */
export function reserveManualItemUse(state: GameState, _actor: ActorState, slot: InventorySlot): ManualUseCheck {
  const check = canManuallyUseSlot(state, slot);
  if (!check.ok) return check;
  markManualSlotUsed(state, slot);
  return { ok: true };
}

/**
 * Resolves a stack of active effects. Default policy takes the strongest absolute value;
 * effects explicitly marked as additive are summed.
 */
export function resolveStackedEffectAmount(effects: ActiveEffect[]): number {
  let additive = 0;
  let strongest: ActiveEffect | undefined;
  for (const effect of effects) {
    if (effect.stackPolicy === "add") {
      additive += effect.amount;
      continue;
    }
    if (!strongest || Math.abs(effect.amount) > Math.abs(strongest.amount)) strongest = effect;
  }
  return additive + (strongest?.amount ?? 0);
}

/**
 * Filters and resolves active effects for an actor/stat pair.
 */
export function activeEffectAmount(
  state: GameState,
  actor: ActorState,
  stat: ActiveEffectStat,
  mode: "owned" | "targeted" | "both" = "owned",
  trigger?: ActiveEffect["trigger"]
): number {
  const encounter = state.encounter;
  if (!encounter) return 0;
  const matches = encounter.activeEffects
    .filter((effect) => effect.stat === stat)
    .filter((effect) => !trigger || effect.trigger === trigger || effect.trigger === "round")
    .filter((effect) => {
      if (mode === "owned") return effect.ownerId === actor.id;
      if (mode === "targeted") return effect.targetActorId === actor.id;
      return effect.ownerId === actor.id || effect.targetActorId === actor.id;
    });
  return resolveStackedEffectAmount(matches);
}

/**
 * Records one automatic item trigger and returns whether the chain may continue.
 */
export function recordTriggerChainStep(state: GameState): boolean {
  const encounter = state.encounter;
  if (!encounter) return true;
  encounter.triggerChainCount += 1;
  return encounter.triggerChainCount <= 5;
}

/**
 * Resets the automatic trigger-chain counter for a new combat round.
 */
export function resetTriggerChain(state: GameState): void {
  if (state.encounter) state.encounter.triggerChainCount = 0;
}
