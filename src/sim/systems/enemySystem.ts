import { calculateDerivedStats } from "../stats";
import type { ActorState, CombatAction, GameState, Position } from "../types";
import { distance } from "../map";
import { canEnter, isOccupied } from "./movementSystem";
import { rollPercent } from "./randomSystem";
import { chooseEnemyMovementTarget, chooseEnemyTacticalCombatItem } from "./enemyTacticalScoringSystem";

type WeightedAction = {
  action: CombatAction;
  weight: number;
};

/**
 * Advances all enemy movement based on visibility, memory, health, loot desire, and patrol data.
 */
export function moveAiUnits(state: GameState): void {
  for (const unit of state.map.aiUnits) {
    if (unit.defeated || (unit.neutralUntilTurn ?? 0) > state.turn) continue;
    unit.previousPosition = { ...unit.position };
    const decision = chooseEnemyMovementTarget(state, unit);
    unit.aiState = decision.aiState;
    if (decision.target) {
      stepTowardReachable(state, unit, decision.target);
    } else if (decision.aiState === "patrol") {
      followPatrol(state, unit);
    }
  }
}

/**
 * Chooses one enemy combat action from a deterministic weighted state machine.
 */
export function chooseEnemyAction(state: GameState, enemy: ActorState, canUsePistol: (attacker: ActorState, target: ActorState) => boolean): CombatAction {
  const threshold = calculateDerivedStats(enemy.stats).heavyWoundThreshold;
  const lowHealth = enemy.hp <= threshold;
  const hasAdvantage = state.encounter?.advantage.owner === "enemy";
  const canRanged = canUsePistol(enemy, state.player);
  const stateLabel = chooseCombatState(enemy, lowHealth, canRanged, hasAdvantage);
  const tacticalItem = chooseEnemyTacticalCombatItem(state, enemy);
  if (tacticalItem) return { type: "useItem", itemId: tacticalItem };

  const actions: WeightedAction[] = [
    { action: { type: "attack", mode: "melee" }, weight: 24 + enemy.stats.strength * 5 + (stateLabel === "advantagePress" ? 16 : 0) },
    { action: { type: "defend" }, weight: 16 + enemy.stats.constitution * 4 + enemy.stats.intellect * 2 + (stateLabel === "guarded" || stateLabel === "recover" ? 18 : 0) },
    { action: { type: "dodge", direction: dodgeDirection(state, enemy) }, weight: 12 + enemy.stats.speed * 5 + (stateLabel === "skirmish" || stateLabel === "recover" ? 12 : 0) }
  ];

  if (canRanged) {
    actions.push({
      action: { type: "ranged", itemId: "pistol" },
      weight: 18 + enemy.stats.spirit * 5 + (stateLabel === "rangedPressure" ? 20 : 0) + (hasAdvantage ? 10 : 0)
    });
  }

  return weightedPick(actions, state, enemy);
}

function chooseCombatState(enemy: ActorState, lowHealth: boolean, canRanged: boolean, hasAdvantage: boolean): string {
  if (lowHealth) return "recover";
  if (canRanged) return "rangedPressure";
  if (hasAdvantage) return "advantagePress";
  if (enemy.stats.speed >= 4) return "skirmish";
  if (enemy.stats.constitution >= 4 || enemy.stats.intellect >= 4) return "guarded";
  return "default";
}

function weightedPick(actions: WeightedAction[], state: GameState, enemy: ActorState): CombatAction {
  const total = actions.reduce((sum, item) => sum + Math.max(0, item.weight), 0);
  let roll = rollPercent(state.seed, `enemy-action-${enemy.id}`, state.turn, state.encounter?.round ?? 0) % Math.max(1, total);
  for (const item of actions) {
    roll -= Math.max(0, item.weight);
    if (roll < 0) return item.action;
  }
  return actions[0].action;
}

function dodgeDirection(state: GameState, enemy: ActorState): "left" | "right" {
  return rollPercent(state.seed, `enemy-dodge-${enemy.id}`, state.turn, state.encounter?.round ?? 0) < 50 ? "left" : "right";
}

function neighbors(position: Position): Position[] {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 }
  ];
}

function followPatrol(state: GameState, unit: ActorState): void {
  if (!unit.patrol || unit.patrol.length === 0) return;
  unit.patrolIndex = ((unit.patrolIndex ?? 0) + 1) % unit.patrol.length;
  const next = unit.patrol[unit.patrolIndex];
  if (distance(unit.position, next) <= 1) {
    if (canEnter(state, next, unit.position)) unit.position = { ...next };
  } else {
    stepTowardReachable(state, unit, next);
  }
}

function stepTowardReachable(state: GameState, unit: ActorState, target: Position): void {
  const next = findNextReachableStep(state, unit, target);
  if (next) unit.position = next;
}

function findNextReachableStep(state: GameState, unit: ActorState, target: Position): Position | undefined {
  const targetOccupied = isOccupied(state, target, unit.id);
  const startKey = `${unit.position.x},${unit.position.y}`;
  const seen = new Set<string>([startKey]);
  const queue: Array<{ position: Position; first?: Position }> = [{ position: { ...unit.position } }];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const reachedTarget = current.first && current.position.x === target.x && current.position.y === target.y;
    const reachedAdjacentOccupiedTarget = targetOccupied && current.first && distance(current.position, target) <= 1;
    if ((reachedTarget && !targetOccupied) || reachedAdjacentOccupiedTarget) return current.first;

    for (const next of neighbors(current.position)) {
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      if (!canEnter(state, next, current.position)) continue;
      if (isOccupied(state, next, unit.id) && !(next.x === target.x && next.y === target.y && !targetOccupied)) continue;
      seen.add(key);
      queue.push({ position: next, first: current.first ?? next });
    }
  }

  return undefined;
}
