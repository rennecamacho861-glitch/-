import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { attackDirection, rollPercent } = require("../../.test-build/src/sim/systems/randomSystem.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = [];
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function setupAdjacentEncounter(seed) {
  const sim = new GameSimulation(seed);
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[0];
  state.map.aiUnits.forEach((unit, index) => {
    unit.defeated = index !== 0;
  });
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.map.wallEdges.clear();
  state.player.position = { x: 4, y: 4 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats = { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 };
  state.player.hp = 12;
  enemy.position = { x: 5, y: 4 };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  enemy.patrolIndex = 0;
  enemy.inventory = [];
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 3 };
  enemy.hp = 12;
  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  return { sim, state, enemy };
}

function findCorrectDodgeFailureSeed() {
  for (let index = 0; index < 2000; index += 1) {
    const seed = `clarity-dodge-fail-${index}`;
    const { state, enemy } = setupAdjacentEncounter(seed);
    state.player.stats.speed = 1;
    enemy.stats.speed = 6;
    const roll = rollPercent(seed, `${enemy.id}-attack-${state.turn}`, state.turn, 1);
    if (roll > 55) return seed;
  }
  throw new Error("No deterministic correct-dodge failure seed found.");
}

test("low damage blocked by defense still grants player advantage", () => {
  const { sim, state, enemy } = setupAdjacentEncounter("clarity-effective-defense-low-damage");
  enemy.stats.strength = 1;

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.encounter.advantage.owner, "player");
  assert.equal(state.encounter.advantage.source, "defend");
  assert.equal(state.encounter.advantage.playerPoints, 1);
  assert.equal(state.player.hp, 11);
});

test("defending an undefended gunline explains why no advantage was gained", () => {
  const { sim, state, enemy } = setupAdjacentEncounter("clarity-defense-no-advantage-gunline");
  enemy.inventory = [createInventorySlot("pistol")];

  sim.resolveActionRound({ type: "defend" }, { type: "ranged" }, enemy);

  assert.ok(
    state.feedbackEvents.some(
      (event) => event.kind === "tutorial" && event.title === "防御没有形成优势" && event.body.includes("普通防御")
    )
  );
});

test("correct dodge direction failure reports the probability roll", () => {
  const seed = findCorrectDodgeFailureSeed();
  const { sim, state, enemy } = setupAdjacentEncounter(seed);
  state.player.stats.speed = 1;
  enemy.stats.speed = 6;
  const direction = attackDirection(enemy.id, state.turn, 0);

  sim.resolveActionRound({ type: "dodge", direction }, { type: "attack", mode: "melee" }, enemy);

  assert.ok(state.player.hp < 12);
  assert.ok(
    state.feedbackEvents.some(
      (event) => event.kind === "tutorial" && event.title === "读向正确，但闪避未过" && event.body.includes("55%")
    )
  );
});
