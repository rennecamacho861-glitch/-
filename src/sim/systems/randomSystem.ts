/**
 * Creates a deterministic unsigned hash for seeded simulation rolls.
 */
export function hashInput(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

/**
 * Rolls a deterministic 0-99 percentage value for the current run context.
 */
export function rollPercent(seed: string, label: string, turn: number, encounterRound = 0): number {
  return hashInput(`${seed}-${label}-${turn}-${encounterRound}`) % 100;
}

/**
 * Selects a deterministic attack side for dodge reads.
 */
export function attackDirection(actorId: string, turn: number, encounterRound = 0): "left" | "right" {
  return hashInput(`${actorId}-${turn}-${encounterRound}`) % 2 === 0 ? "left" : "right";
}
