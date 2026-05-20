import { distance, keyOf } from "../map";
import { calculateDerivedStats } from "../stats";
import type { ActorState, GameState, Position, VisibilityLevel } from "../types";
import { hasWallBetween, isInBounds } from "./movementSystem";

/**
 * Recomputes visible/explored tiles and AI awareness from the current actor positions.
 */
export function updateVisibilityState(
  state: GameState,
  revealBoost: number,
  onPlayerSeesEnemy?: (enemy: ActorState) => void
): void {
  state.map.visible.clear();
  state.map.hints = [];
  const radius = calculateDerivedStats(state.player.stats).brightVisionRadius + revealBoost;

  for (let y = 0; y < state.map.height; y += 1) {
    for (let x = 0; x < state.map.width; x += 1) {
      const position = { x, y };
      if (distance(position, state.player.position) <= radius && hasLineOfSight(state, state.player.position, position)) {
        const key = keyOf(position);
        state.map.visible.add(key);
        state.map.explored.add(key);
      }
    }
  }

  for (const enemy of state.map.aiUnits) {
    if (enemy.defeated) continue;
    const playerToEnemy = getVisibility(state, state.player, enemy);
    const enemyToPlayer = getVisibility(state, enemy, state.player);
    if (playerToEnemy === "visible") onPlayerSeesEnemy?.(enemy);
    if (enemyToPlayer === "visible") {
      enemy.awareness = { level: "visible", lastKnownPosition: { ...state.player.position }, source: "sight" };
    } else if (enemy.awareness.level === "visible") {
      enemy.awareness = { level: "aware", lastKnownPosition: { ...state.player.position }, source: "memory" };
    }
  }
}

/**
 * Resolves actor-to-actor visibility from stats, grid distance, line of sight, and memory.
 */
export function getVisibility(state: GameState, viewer: ActorState, target: ActorState): VisibilityLevel {
  const derived = calculateDerivedStats(viewer.stats);
  let radius = viewer.faction === "player" ? derived.brightVisionRadius : derived.visionRadius;
  if (viewer.faction === "enemy" && target.faction === "player" && (state.playerHiddenUntilTurn ?? -1) >= state.turn) {
    radius = Math.max(1, radius - 1);
  }
  if (distance(viewer.position, target.position) <= radius && hasLineOfSight(state, viewer.position, target.position)) {
    return "visible";
  }
  if (viewer.awareness.lastKnownPosition && distance(viewer.awareness.lastKnownPosition, target.position) <= 1) return "aware";
  return "unseen";
}

/**
 * Resolves grid line of sight with one-corner peeking for non-axis-aligned targets.
 */
export function hasLineOfSight(state: GameState, from: Position, to: Position): boolean {
  if (!isInBounds(state, from) || !isInBounds(state, to)) return false;
  if (from.x === to.x) return clearVertical(state, from, to);
  if (from.y === to.y) return clearHorizontal(state, from, to);
  const cornerA = { x: to.x, y: from.y };
  const cornerB = { x: from.x, y: to.y };
  return (
    (isInBounds(state, cornerA) && clearHorizontal(state, from, cornerA) && clearVertical(state, cornerA, to)) ||
    (isInBounds(state, cornerB) && clearVertical(state, from, cornerB) && clearHorizontal(state, cornerB, to))
  );
}

function clearHorizontal(state: GameState, from: Position, to: Position): boolean {
  if (from.x === to.x) return true;
  const step = Math.sign(to.x - from.x);
  for (let x = from.x; x !== to.x; x += step) {
    const current = { x, y: from.y };
    const next = { x: x + step, y: from.y };
    if (hasWallBetween(state, current, next)) return false;
  }
  return true;
}

function clearVertical(state: GameState, from: Position, to: Position): boolean {
  if (from.y === to.y) return true;
  const step = Math.sign(to.y - from.y);
  for (let y = from.y; y !== to.y; y += step) {
    const current = { x: from.x, y };
    const next = { x: from.x, y: y + step };
    if (hasWallBetween(state, current, next)) return false;
  }
  return true;
}
