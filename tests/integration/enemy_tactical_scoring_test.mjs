import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { chooseEnemyAction } = require("../../.test-build/src/sim/systems/enemySystem.js");
const {
  chooseEnemyMovementTarget,
  estimatePlayerStatForEnemy,
  rankEnemyCombatItems,
  scoreEnemyCombatItem
} = require("../../.test-build/src/sim/systems/enemyTacticalScoringSystem.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = state.player.inventory.filter((slot) => slot.item.id !== "echo");
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function setupEncounter(seed) {
  const sim = new GameSimulation(seed);
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  state.player.position = { x: 4, y: 4 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats = { spirit: 3, intellect: 3, strength: 3, speed: 6, constitution: 3 };
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: 5, y: 4 };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  enemy.patrolIndex = 0;
  enemy.inventory = [];
  enemy.stats = { spirit: 3, intellect: 3, strength: 3, speed: 2, constitution: 3 };
  enemy.hp = 12;
  sim.checkEncounter();
  return { sim, state, enemy };
}

test("enemy tactical scoring does not read hidden player speed until it is public", () => {
  const { state, enemy } = setupEncounter("enemy-hidden-speed-seed");
  enemy.stats.speed = 3;
  enemy.inventory = [createInventorySlot("lime-powder")];

  const hiddenEstimate = estimatePlayerStatForEnemy(state, enemy, "speed");
  const hiddenScore = scoreEnemyCombatItem(state, enemy, "lime-powder").total;

  state.encounter.activeEffects.push({
    id: "public-speed-burst",
    ownerId: state.player.id,
    sourceItemId: "adrenaline-shot",
    label: "public speed burst",
    stat: "speed",
    amount: 3,
    remainingRounds: 1,
    trigger: "round"
  });

  const publicEstimate = estimatePlayerStatForEnemy(state, enemy, "speed");
  const publicScore = scoreEnemyCombatItem(state, enemy, "lime-powder").total;

  assert.equal(hiddenEstimate, 3);
  assert.equal(publicEstimate, 6);
  assert.ok(publicScore > hiddenScore + 2);
});

test("enemy combat item choice is driven by tactical package scoring", () => {
  const { state, enemy } = setupEncounter("enemy-burn-package-seed");
  enemy.inventory = [createInventorySlot("soot-hook"), createInventorySlot("tinder-vial"), createInventorySlot("glass-spike")];

  const ranked = rankEnemyCombatItems(state, enemy);
  const tinderScore = ranked.find((entry) => entry.itemId === "tinder-vial");
  const glassScore = ranked.find((entry) => entry.itemId === "glass-spike");
  const action = chooseEnemyAction(state, enemy, () => false);

  assert.ok(tinderScore.total > glassScore.total);
  assert.equal(tinderScore.packageScores.BurnCrit > 0, true);
  assert.deepEqual(action, { type: "useItem", itemId: "tinder-vial" });
});

test("enemy loot target uses value distance risk and build gap instead of nearest only", () => {
  const sim = new GameSimulation("enemy-loot-target-score-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((unit, index) => {
    unit.defeated = index !== 0;
  });
  state.map.lootNodes.forEach((node, index) => {
    node.depleted = index > 1;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: 1, y: 1 };
  enemy.previousPosition = { ...enemy.position };
  enemy.awareness = { level: "unseen" };
  enemy.inventory = [createInventorySlot("pistol", 1, { charges: 0 })];
  state.player.position = { x: 10, y: 8 };
  state.map.lootNodes[0].position = { x: 2, y: 1 };
  state.map.lootNodes[0].offerItemIds = ["trap", "glow", "soft-shoes"];
  state.map.lootNodes[1].position = { x: 5, y: 1 };
  state.map.lootNodes[1].offerItemIds = ["old-magazine", "bandage", "echo"];

  const decision = chooseEnemyMovementTarget(state, enemy);

  assert.equal(decision.aiState, "seekLoot");
  assert.deepEqual(decision.target, state.map.lootNodes[1].position);
  assert.equal(decision.score?.bestItemId, "old-magazine");
});

test("enemy action scoring returns an action without mutating combat state", () => {
  const { state, enemy } = setupEncounter("enemy-action-purity-seed");
  enemy.inventory = [createInventorySlot("venom-saw"), createInventorySlot("poison-needle")];
  const before = JSON.stringify({
    hp: enemy.hp,
    playerHp: state.player.hp,
    effects: state.encounter.activeEffects,
    inventory: enemy.inventory.map((slot) => ({ id: slot.item.id, charges: slot.charges, lastManualUseRound: slot.lastManualUseRound }))
  });

  const action = chooseEnemyAction(state, enemy, () => false);
  const after = JSON.stringify({
    hp: enemy.hp,
    playerHp: state.player.hp,
    effects: state.encounter.activeEffects,
    inventory: enemy.inventory.map((slot) => ({ id: slot.item.id, charges: slot.charges, lastManualUseRound: slot.lastManualUseRound }))
  });

  assert.equal(action.type, "useItem");
  assert.equal(action.itemId, "poison-needle");
  assert.equal(after, before);
});

test("enemy tactical scoring ignores empty or round locked combat items", () => {
  const { state, enemy } = setupEncounter("enemy-item-usage-lock-seed");
  const locked = createInventorySlot("tinder-vial");
  locked.lastManualUseRound = state.encounter.round;
  const empty = createInventorySlot("poison-needle", 1, { charges: 0 });
  enemy.inventory = [locked, empty, createInventorySlot("glass-spike")];

  assert.equal(scoreEnemyCombatItem(state, enemy, "tinder-vial").available, false);
  assert.equal(scoreEnemyCombatItem(state, enemy, "poison-needle").available, false);
  assert.equal(rankEnemyCombatItems(state, enemy)[0].itemId, "glass-spike");
});
