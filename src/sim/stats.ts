import type { DerivedStats, StatBlock, StatKey } from "./types";

export const STAT_KEYS: StatKey[] = ["spirit", "intellect", "strength", "speed", "constitution"];

export const DEFAULT_PLAYER_STATS: StatBlock = {
  spirit: 3,
  intellect: 3,
  strength: 3,
  speed: 3,
  constitution: 3
};

export function calculateDerivedStats(
  stats: StatBlock,
  options: { weaponDamageBonus?: number; confirmedIntelCount?: number } = {}
): DerivedStats {
  const weaponDamageBonus = options.weaponDamageBonus ?? 0;
  const confirmedIntelCount = options.confirmedIntelCount ?? 0;
  const visionRadius = 2 + Math.floor(stats.spirit / 2);
  return {
    maxHp: 6 + stats.constitution * 2,
    visionRadius,
    brightVisionRadius: Math.max(1, Math.floor(visionRadius / 2)),
    meleeDamage: 2 + Math.floor(stats.strength / 2) + weaponDamageBonus,
    heavyWoundThreshold: 4 + Math.floor(stats.constitution / 2),
    basePersuasion: stats.intellect + confirmedIntelCount
  };
}

export function highestStat(stats: StatBlock): StatKey {
  return STAT_KEYS.reduce((best, key) => (stats[key] > stats[best] ? key : best), STAT_KEYS[0]);
}

export function lowestStat(stats: StatBlock): StatKey {
  return STAT_KEYS.reduce((worst, key) => (stats[key] < stats[worst] ? key : worst), STAT_KEYS[0]);
}

export function clampPercent(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
