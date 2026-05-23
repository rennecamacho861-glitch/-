import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const {
  bonusTargetForPressChoice,
  calculateFleeChance,
  calculatePersuasionScore
} = require("../../.test-build/src/sim/systems/advantageSystem.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = state.player.inventory.filter((slot) => slot.item.id !== "echo");
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function setupAdvantageEncounter(seed) {
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
  state.player.stats = { spirit: 3, intellect: 3, strength: 1, speed: 6, constitution: 3 };
  state.player.hp = 12;

  const enemy = state.map.aiUnits[0];
  enemy.position = { x: 5, y: 4 };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  enemy.patrolIndex = 0;
  enemy.inventory = [];
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 6 };
  enemy.hp = 12;

  sim.checkEncounter();
  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "dodge", bonusAvailable: true };
  state.encounter.playerBonus = undefined;
  state.encounter.enemyBonus = undefined;
  return { sim, state, enemy };
}

test("test_press_power_grants_damage_only_for_next_action_round", () => {
  const { sim, state, enemy } = setupAdvantageEncounter("press-power-seed");

  sim.continueFight("pressPower");

  assert.equal(bonusTargetForPressChoice("pressPower"), "damage");
  assert.deepEqual(state.encounter.playerBonus, { target: "damage", amount: 1 });
  assert.equal(state.encounter.phase, "chooseAction");
  assert.equal(state.feedbackEvents.at(-1).kind, "advantage-press");
  assert.match(state.feedbackEvents.at(-1).body, /近战伤害 \+1/);

  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(enemy.hp, 9);
  assert.equal(state.encounter.playerBonus, undefined);
});

test("test_press_tempo_grants_speed_only_without_damage_bonus", () => {
  const { sim, state, enemy } = setupAdvantageEncounter("press-tempo-seed");

  sim.continueFight("pressTempo");

  assert.equal(bonusTargetForPressChoice("pressTempo"), "speed");
  assert.deepEqual(state.encounter.playerBonus, { target: "speed", amount: 1 });
  assert.equal(state.encounter.phase, "chooseAction");

  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(enemy.hp, 10);
  assert.equal(state.encounter.playerBonus, undefined);
});

test("test_same_press_choice_can_be_triggered_again_after_new_advantage", () => {
  const { sim, state, enemy } = setupAdvantageEncounter("press-repeat-seed");

  sim.continueFight("pressPower");
  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "defend" }, enemy);

  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "forced", bonusAvailable: true };
  state.encounter.playerBonus = undefined;
  sim.continueFight("pressPower");

  assert.deepEqual(state.encounter.playerBonus, { target: "damage", amount: 1 });
  assert.equal(state.encounter.phase, "chooseAction");
  assert.equal(state.encounter.advantage.owner, null);
  assert.equal(state.feedbackEvents.at(-1).kind, "advantage-press");
});

test("test_flee_formula_clamps_speed_difference_and_final_chance", () => {
  assert.equal(calculateFleeChance(-5), 31);
  assert.equal(calculateFleeChance(5), 79);
  assert.equal(calculateFleeChance(3, 50), 90);
  assert.equal(calculateFleeChance(-3, -50), 25);
});

test("test_persuasion_formula_caps_intel_payment_and_item_modifiers", () => {
  const result = calculatePersuasionScore({
    intellect: 3,
    confirmedIntelCount: 5,
    paymentModifier: 5,
    itemModifier: 5,
    situationModifier: 1,
    hostilityModifier: 1
  });

  assert.equal(result.intel, 3);
  assert.equal(result.payment, 2);
  assert.equal(result.item, 2);
  assert.equal(result.target, 8);
  assert.equal(result.score, 10);
});
