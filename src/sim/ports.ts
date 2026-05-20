import type { AdvantagePressChoice, CombatAction, GameState, ItemId } from "./types";

export type SimulationListener = () => void;
export type Unsubscribe = () => void;

export type BonusTarget = "speed" | "damage" | "dodge" | "intel";

/**
 * Read-only surface for presentation layers.
 * Callers must treat the returned state as immutable and request changes through command ports.
 */
export interface SimulationReadPort {
  snapshot(): GameState;
  onChange(listener: SimulationListener): Unsubscribe;
}

/**
 * Player-facing command surface for HUD, input bindings, and tests.
 */
export interface SimulationCommandPort {
  reset(seed?: string): void;
  move(dx: number, dy: number): void;
  choosePickup(itemId: ItemId | null): void;
  useItem(itemId: ItemId): void;
  playCombatAction(action: CombatAction): void;
  tryFlee(): void;
  continueFight(choice?: AdvantagePressChoice): void;
  tryPersuade(): void;
}

/**
 * Full simulation port exposed by the current prototype runtime.
 */
export type SimulationPort = SimulationReadPort & SimulationCommandPort;
