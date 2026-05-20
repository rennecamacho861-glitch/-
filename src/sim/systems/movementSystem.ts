import { distance, edgeKeyBetween, isSamePosition } from "../map";
import type { ActorState, GameState, Position } from "../types";

/**
 * Returns whether a grid position is inside the map.
 */
export function isInBounds(state: GameState, position: Position): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < state.map.width && position.y < state.map.height;
}

/**
 * Returns whether adjacent grid cells are separated by an edge wall or the map boundary.
 */
export function hasWallBetween(state: GameState, from: Position, to: Position): boolean {
  if (!isInBounds(state, from) || !isInBounds(state, to)) return true;
  const edgeKey = edgeKeyBetween(from, to);
  return edgeKey === undefined || state.map.wallEdges.has(edgeKey);
}

/**
 * Returns whether an actor may enter a grid position.
 */
export function canEnter(state: GameState, position: Position, from?: Position): boolean {
  const tile = state.map.tiles[position.y]?.[position.x];
  if (tile === undefined) return false;
  return from ? !hasWallBetween(state, from, position) : true;
}

/**
 * Returns whether a living actor occupies a position.
 */
export function isOccupied(state: GameState, position: Position, exceptActorId?: string): boolean {
  if (state.player.id !== exceptActorId && isSamePosition(state.player.position, position)) return true;
  return state.map.aiUnits.some((unit) => unit.id !== exceptActorId && !unit.defeated && isSamePosition(unit.position, position));
}

/**
 * Orders adjacent step candidates either toward or away from a target.
 */
export function orderedSteps(from: Position, target: Position, toward: boolean): Position[] {
  const steps = [
    { x: from.x + Math.sign(target.x - from.x), y: from.y },
    { x: from.x, y: from.y + Math.sign(target.y - from.y) },
    { x: from.x - Math.sign(target.x - from.x), y: from.y },
    { x: from.x, y: from.y - Math.sign(target.y - from.y) }
  ].filter((position) => !isSamePosition(position, from));
  return steps.sort((a, b) => (toward ? distance(a, target) - distance(b, target) : distance(b, target) - distance(a, target)));
}

/**
 * Moves an actor one legal step toward a target when possible.
 */
export function stepToward(state: GameState, actor: ActorState, target: Position): void {
  const next = orderedSteps(actor.position, target, true).find(
    (position) => canEnter(state, position, actor.position) && !isOccupied(state, position, actor.id)
  );
  if (next) actor.position = next;
}

/**
 * Moves an actor one legal step away from a target when possible.
 */
export function stepAwayFrom(state: GameState, actor: ActorState, target: Position): void {
  const next = orderedSteps(actor.position, target, false).find(
    (position) => canEnter(state, position, actor.position) && !isOccupied(state, position, actor.id)
  );
  if (next) actor.position = next;
}

/**
 * Shared escape reposition helper used by player and AI combat exits.
 */
export function moveActorAway(state: GameState, actor: ActorState, threat: Position): void {
  stepAwayFrom(state, actor, threat);
}
