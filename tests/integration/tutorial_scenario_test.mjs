import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");

function statTotal(stats) {
  return Object.values(stats).reduce((sum, value) => sum + value, 0);
}

function tutorialEnemy(state, id) {
  return state.map.aiUnits.find((enemy) => enemy.id === id);
}

test("scripted tutorial spawns two stat-budget enemies before starter pickup", () => {
  const sim = new GameSimulation("tutorial-seed");
  sim.beginTutorialScenario();
  const state = sim.snapshot();

  assert.equal(state.pendingPickupOffer, undefined);
  assert.equal(state.tutorialScenario.active, true);
  assert.equal(state.tutorialScenario.stepId, "enemy1-guard");
  assert.deepEqual(state.tutorialScenario.enemyIds, ["tutorial-enemy-1", "tutorial-enemy-2"]);
  assert.equal(state.inventory.some((slot) => slot.item.id === "long-knife"), true);
  assert.equal(state.map.aiUnits.length, 2);
  assert.equal(statTotal(tutorialEnemy(state, "tutorial-enemy-1").stats), 10);
  assert.equal(statTotal(tutorialEnemy(state, "tutorial-enemy-2").stats), 10);
  assert.ok(state.encounter);
  assert.equal(state.encounter.enemyId, "tutorial-enemy-1");
});

test("scripted tutorial teaches guard, direction dodge, tempo spend, kill, and persuasion", () => {
  const sim = new GameSimulation("tutorial-flow-seed");
  sim.beginTutorialScenario();

  sim.playCombatAction({ type: "attack", mode: "melee" });
  assert.equal(sim.snapshot().tutorialScenario.stepId, "enemy1-guard");
  assert.equal(sim.snapshot().encounter.round, 0);

  sim.playCombatAction({ type: "defend" });
  let state = sim.snapshot();
  assert.equal(state.tutorialScenario.stepId, "enemy1-direction-guard");
  assert.ok(state.encounter.advantage.playerPoints >= 1);
  assert.ok(state.intel.some((intel) => intel.targetId === "tutorial-enemy-1" && intel.value.includes("= 1")));

  sim.playCombatAction({ type: "defend" });
  state = sim.snapshot();
  assert.equal(state.tutorialScenario.stepId, "enemy1-dodge");
  assert.equal(state.tutorialScenario.requiredDodge, "right");
  assert.ok(state.intel.some((intel) => intel.targetId === "tutorial-enemy-1" && intel.kind === "attackDirection"));

  sim.playCombatAction({ type: "dodge", direction: state.tutorialScenario.requiredDodge });
  state = sim.snapshot();
  assert.equal(state.tutorialScenario.stepId, "enemy1-invest-tempo");
  assert.ok(state.encounter.advantage.playerPoints >= 3);

  sim.continueFight("pressTempo");
  sim.continueFight("pressTempo");
  sim.continueFight("pressTempo");
  state = sim.snapshot();
  assert.equal(state.tutorialScenario.stepId, "enemy1-kill");

  for (let i = 0; i < 3 && sim.snapshot().encounter?.enemyId === "tutorial-enemy-1"; i += 1) {
    sim.playCombatAction({ type: "attack", mode: "melee" });
  }
  state = sim.snapshot();
  assert.equal(tutorialEnemy(state, "tutorial-enemy-1").defeated, true);
  assert.equal(state.encounter.enemyId, "tutorial-enemy-2");
  assert.equal(state.tutorialScenario.stepId, "enemy2-intel");

  sim.playCombatAction({ type: "defend" });
  state = sim.snapshot();
  assert.equal(state.tutorialScenario.stepId, "enemy2-persuade");
  assert.ok(state.intel.some((intel) => intel.targetId === "tutorial-enemy-2" && intel.value.includes("= 1")));

  sim.tryPersuade();
  state = sim.snapshot();
  assert.equal(state.tutorialScenario, undefined);
  assert.equal(state.pendingPickupOffer.nodeId, "starter");
  assert.deepEqual(state.pendingPickupOffer.itemIds, ["echo", "pistol", "bandage", "photon-cut"]);
});

test("scripted tutorial can be skipped back to formal starter pickup", () => {
  const sim = new GameSimulation("tutorial-skip-seed");
  sim.beginTutorialScenario();
  sim.skipTutorialScenario();
  const state = sim.snapshot();

  assert.equal(state.tutorialScenario, undefined);
  assert.equal(state.pendingPickupOffer.nodeId, "starter");
  assert.equal(state.map.aiUnits.length, 15);
});
