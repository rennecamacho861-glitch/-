import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { attackDirection, rollPercent } = require("../../.test-build/src/sim/systems/randomSystem.js");
const { getVisibility } = require("../../.test-build/src/sim/systems/visibilitySystem.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = state.player.inventory.filter((slot) => slot.item.id !== "echo");
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function isolateEnemy(state, enemyIndex = 0) {
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== enemyIndex;
  });
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.map.wallEdges.clear();
  state.player.inventory = [];
  state.inventory = state.player.inventory;
  state.playerHiddenUntilTurn = undefined;
  return state.map.aiUnits[enemyIndex];
}

function setupAdjacentEncounter(seed) {
  const sim = new GameSimulation(seed);
  const state = sim.snapshot();
  const enemy = isolateEnemy(state);
  state.player.position = { x: 4, y: 4 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats = { spirit: 3, intellect: 3, strength: 3, speed: 6, constitution: 3 };
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

function findReliableDodgeSeed() {
  for (let index = 0; index < 2000; index += 1) {
    const seed = `story-002-dodge-intel-${index}`;
    const { state, enemy } = setupAdjacentEncounter(seed);
    const roll = rollPercent(seed, `${enemy.id}-attack-${state.turn}`, state.turn, 1);
    if (roll <= 85) return seed;
  }
  throw new Error("No deterministic successful dodge seed found.");
}

function assertCombatIntelIsRestricted(entries) {
  for (const intel of entries) {
    assert.ok(["statExact", "item", "attackDirection"].includes(intel.kind));
    assert.ok(["confirmed", "suspected"].includes(intel.certainty));
    if (intel.kind === "attackDirection") {
      assert.ok(["left", "right"].includes(intel.value));
      assert.equal(intel.value, intel.attackDirection);
    }
  }
}

test("player vision lead opens combat with advantage and structured sight intel", () => {
  const sim = new GameSimulation("story-002-vision-lead-seed");
  const state = sim.snapshot();
  const enemy = isolateEnemy(state);
  state.player.position = { x: 4, y: 4 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats = { spirit: 6, intellect: 5, strength: 3, speed: 3, constitution: 3 };
  state.playerHiddenUntilTurn = state.turn;
  enemy.position = { x: 6, y: 4 };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  enemy.patrolIndex = 0;
  enemy.stats = { spirit: 1, intellect: 2, strength: 4, speed: 2, constitution: 6 };
  enemy.inventory = [createInventorySlot("pistol")];

  assert.equal(getVisibility(state, state.player, enemy), "visible");
  assert.equal(getVisibility(state, enemy, state.player), "unseen");

  sim.checkEncounter();

  assert.ok(state.encounter);
  assert.equal(state.encounter.enemyId, enemy.id);
  assert.equal(state.encounter.visibility.playerToEnemy, "visible");
  assert.equal(state.encounter.visibility.enemyToPlayer, "unseen");
  assert.equal(state.encounter.advantage.owner, "player");
  assert.equal(state.encounter.advantage.source, "vision");
  assert.equal(state.encounter.phase, "chooseAction");
  assert.equal(state.encounter.advantage.playerPoints, 1);

  const sightIntel = state.intel.filter((entry) => entry.targetId === enemy.id && entry.source === "sight" && entry.certainty === "confirmed");
  assert.ok(sightIntel.length >= 1);
  assertCombatIntelIsRestricted(sightIntel);
  assert.ok(sightIntel.every((entry) => ["statExact", "item"].includes(entry.kind)));
});

test("successful dodge grants traceable combat intel", () => {
  const seed = findReliableDodgeSeed();
  const { sim, state, enemy } = setupAdjacentEncounter(seed);
  const direction = attackDirection(enemy.id, state.turn, 0);

  sim.resolveActionRound({ type: "dodge", direction }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.player.hp, 12);
  const dodgeIntel = state.intel.filter((entry) => entry.targetId === enemy.id && entry.source === "dodge");
  assert.ok(dodgeIntel.length >= 1);
  assertCombatIntelIsRestricted(dodgeIntel);
});

test("attack direction intel uses the real next direction and expires after that attack", () => {
  const { sim, state, enemy } = setupAdjacentEncounter("story-002-direction-expiry-seed");
  state.player.stats.intellect = 1;
  state.player.inventory = [createInventorySlot("lens")];
  state.inventory = state.player.inventory;

  sim.useItem("lens");

  const directionIntel = state.intel.find((entry) => entry.targetId === enemy.id && entry.kind === "attackDirection");
  assert.ok(directionIntel);
  assert.equal(directionIntel.attackDirectionIndex, 0);
  assert.equal(directionIntel.attackDirection, attackDirection(enemy.id, state.turn, 0));

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.intel.some((entry) => entry.targetId === enemy.id && entry.kind === "attackDirection"), false);
});

test("combat intel never exposes old tendency labels", () => {
  const { sim, state, enemy } = setupAdjacentEncounter("story-002-intel-restriction-seed");
  state.player.stats.intellect = 8;

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  const combatIntel = state.intel.filter((entry) => entry.targetId === enemy.id);
  assert.ok(combatIntel.length >= 1);
  assertCombatIntelIsRestricted(combatIntel);
  assert.ok(combatIntel.every((entry) => !/倾向|擅长|速度压制|硬守/.test(entry.value)));
});

test("unseen ranged damage records a source prompt instead of silent hp loss", () => {
  const sim = new GameSimulation("story-002-unseen-ranged-source-seed");
  const state = sim.snapshot();
  const hunter = isolateEnemy(state, 1);
  state.player.position = { x: 1, y: 3 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats = { spirit: 1, intellect: 3, strength: 3, speed: 3, constitution: 3 };
  state.player.hp = 12;
  hunter.position = { x: 5, y: 3 };
  hunter.previousPosition = { ...hunter.position };
  hunter.patrol = [{ ...hunter.position }];
  hunter.patrolIndex = 0;
  hunter.stats = { spirit: 6, intellect: 2, strength: 2, speed: 3, constitution: 2 };
  hunter.inventory = [createInventorySlot("pistol")];

  assert.equal(getVisibility(state, hunter, state.player), "visible");
  assert.equal(getVisibility(state, state.player, hunter), "unseen");

  sim.resolveEnemyRangedAmbushes();

  assert.equal(state.player.hp, 9);
  assert.ok(state.map.hints.some((hint) => hint.x === hunter.position.x && hint.y === hunter.position.y));
  const feedback = state.feedbackEvents[state.feedbackEvents.length - 1];
  assert.equal(feedback.kind, "gunshot");
  assert.deepEqual(feedback.origin, hunter.position);
  assert.deepEqual(feedback.target, state.player.position);
  assert.ok(state.log[state.log.length - 1].includes(hunter.name));
});
