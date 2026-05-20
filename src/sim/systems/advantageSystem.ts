import { clampPercent } from "../stats";
import type { AdvantagePressChoice } from "../types";

export type PressBonusTarget = "damage" | "speed";

export type PersuasionBreakdown = {
  intellect: number;
  intel: number;
  payment: number;
  item: number;
  situation: number;
  hostility: number;
  score: number;
  target: number;
};

/**
 * Converts the advantage-window continue-fight choice into its one-shot combat bonus.
 */
export function bonusTargetForPressChoice(choice: AdvantagePressChoice): PressBonusTarget {
  return choice === "pressPower" ? "damage" : "speed";
}

/**
 * Calculates flee chance from the v0.8.12 combat-system formula.
 */
export function calculateFleeChance(speedDiff: number, itemModifier = 0): number {
  const boundedSpeedDiff = Math.max(-3, Math.min(3, speedDiff));
  return clampPercent(55 + boundedSpeedDiff * 8 + itemModifier, 25, 90);
}

/**
 * Calculates persuasion score while preserving each cap in the authored formula.
 */
export function calculatePersuasionScore(input: {
  intellect: number;
  confirmedIntelCount?: number;
  paymentModifier?: number;
  itemModifier?: number;
  situationModifier?: number;
  hostilityModifier?: number;
  target?: number;
}): PersuasionBreakdown {
  const intellect = input.intellect;
  const intel = Math.min(Math.max(input.confirmedIntelCount ?? 0, 0), 3);
  const payment = Math.min(Math.max(input.paymentModifier ?? 0, 0), 2);
  const item = Math.min(Math.max(input.itemModifier ?? 0, 0), 2);
  const situation = input.situationModifier ?? 0;
  const hostility = input.hostilityModifier ?? 0;
  const target = input.target ?? 8;
  return {
    intellect,
    intel,
    payment,
    item,
    situation,
    hostility,
    score: intellect + intel + payment + item + situation - hostility,
    target
  };
}
