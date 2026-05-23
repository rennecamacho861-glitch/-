import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { applyStatusEffect, decrementStatusDurations, resolveBleedOnAction, resolveRoundStartStatuses } =
  require("../../.test-build/src/sim/systems/statusEffectSystem.js");

function actor(id, hp = 10) {
  return {
    id,
    name: id,
    faction: id === "player" ? "player" : "enemy",
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    facing: "east",
    stats: { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 },
    hp,
    combatCount: 0,
    inventory: [],
    defeated: false,
    awareness: { level: "visible" }
  };
}

function encounter() {
  return {
    enemyId: "enemy",
    enemyName: "enemy",
    round: 1,
    phase: "chooseAction",
    visibility: { playerToEnemy: "visible", enemyToPlayer: "visible" },
    advantage: { owner: null, source: null, bonusAvailable: false },
    firstAttackUsed: {},
    combatItemUseRound: {},
    pressChoicesUsed: {},
    activeEffects: [],
    statusEffects: [],
    triggerChainCount: 0,
    rangedAmbushUsed: false,
    combatCounted: false,
    log: []
  };
}

test("burn deals immediate short damage", () => {
  const target = actor("enemy", 10);
  const state = encounter();

  applyStatusEffect(state, { ownerId: "player", target, type: "burn", stacks: 2, remainingRounds: 1 });

  assert.equal(target.hp, 8);
  assert.equal(state.statusEffects[0].type, "burn");
  decrementStatusDurations(state);
  assert.equal(state.statusEffects.length, 0);
});

test("poison delays damage before ticking over time", () => {
  const target = actor("enemy", 10);
  const state = encounter();

  applyStatusEffect(state, { ownerId: "player", target, type: "poison", stacks: 1, remainingRounds: 3, delayRounds: 1 });
  resolveRoundStartStatuses(state, [target]);
  assert.equal(target.hp, 10);
  decrementStatusDurations(state);
  resolveRoundStartStatuses(state, [target]);
  assert.equal(target.hp, 9);
});

test("bleed hurts on attack or dodge and freeze skips one action round", () => {
  const target = actor("enemy", 10);
  const state = encounter();

  applyStatusEffect(state, { ownerId: "player", target, type: "bleed", stacks: 1, remainingRounds: 2 });
  resolveBleedOnAction(state, target, "attack");
  assert.equal(target.hp, 9);

  applyStatusEffect(state, { ownerId: "player", target, type: "freeze", stacks: 1, remainingRounds: 1 });
  const result = resolveRoundStartStatuses(state, [target]);
  assert.equal(result.skippedActorIds.has("enemy"), true);
});
