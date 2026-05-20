import { distance } from "../map";
import type { ActorState, GameState } from "../types";
import { findSlot } from "./inventorySystem";
import { getVisibility, hasLineOfSight } from "./visibilitySystem";

/**
 * Returns whether an actor can fire a pistol at a target under current vision and ammo rules.
 */
export function canUsePistol(state: GameState, attacker: ActorState, target: ActorState): boolean {
  const slot = findSlot(attacker, "pistol");
  if (!slot || (slot.charges ?? 0) <= 0) return false;
  return distance(attacker.position, target.position) <= 4 && getVisibility(state, attacker, target) === "visible" && hasLineOfSight(state, attacker.position, target.position);
}
