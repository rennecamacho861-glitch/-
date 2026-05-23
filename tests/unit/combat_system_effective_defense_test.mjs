import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = [];
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function setupAdjacentCombat(seed, enemyStats, playerStats = { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 }) {
  const sim = new GameSimulation(seed);
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  state.player.stats = { ...playerStats };
  state.player.hp = 12;
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { ...enemyStats };
  enemy.hp = 20;
  enemy.inventory = [];

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  state.encounter.advantage = { owner: null, source: null, bonusAvailable: false };
  state.encounter.playerBonus = undefined;
  state.encounter.enemyBonus = undefined;
  return { sim, state, enemy };
}

test("test_small_defense_reduction_creates_advantage", () => {
  const { sim, state, enemy } = setupAdjacentCombat("small-defense-reduction-seed", {
    spirit: 1,
    intellect: 1,
    strength: 2,
    speed: 1,
    constitution: 1
  });

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.player.hp, 10);
  assert.equal(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.advantage.source, "defend");
  assert.equal(state.encounter?.phase, "chooseAction");
});

test("test_defense_without_incoming_attack_does_not_create_advantage", () => {
  const { sim, state, enemy } = setupAdjacentCombat("no-incoming-defense-seed", {
    spirit: 3,
    intellect: 3,
    strength: 3,
    speed: 3,
    constitution: 3
  });
  enemy.hp = state.player.hp;
  state.encounter.round = 2;

  sim.resolveActionRound({ type: "defend" }, { type: "defend" }, enemy);

  assert.notEqual(state.encounter?.advantage.owner, "player");
  assert.notEqual(state.encounter?.advantage.owner, "enemy");
});

test("test_effective_defense_reduced_damage_wins_over_mitigated_attack", () => {
  const { sim, state, enemy } = setupAdjacentCombat("effective-defense-reduction-seed", {
    spirit: 1,
    intellect: 1,
    strength: 6,
    speed: 1,
    constitution: 1
  });
  state.encounter.round = 2;

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.player.hp, 10);
  assert.equal(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.advantage.source, "defend");
});

test("test_effective_defense_prevents_heavy_wound", () => {
  const { sim, state, enemy } = setupAdjacentCombat(
    "effective-defense-heavy-prevent-seed",
    { spirit: 1, intellect: 1, strength: 5, speed: 1, constitution: 1 },
    { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 1 }
  );
  state.encounter.round = 2;

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.player.hp, 10);
  assert.equal(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.advantage.source, "defend");
  assert.equal(state.encounter?.log.some((entry) => entry.text.includes("形成重伤")), false);
});

test("test_attack_into_defense_gives_defender_advantage_even_when_damage_lands", () => {
  const { sim, state, enemy } = setupAdjacentCombat("enemy-stable-defense-seed", {
    spirit: 1,
    intellect: 1,
    strength: 2,
    speed: 1,
    constitution: 1
  });
  state.encounter.round = 2;

  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "defend" }, enemy);

  assert.ok(enemy.hp < 20);
  assert.notEqual(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.enemyBonus?.target, "speed");
  assert.ok(state.log.some((entry) => entry.includes("把优势压成下一次速度")));
});

test("test_basic_attack_into_defense_keeps_defender_advantage_even_on_heavy_wound", () => {
  const { sim, state, enemy } = setupAdjacentCombat("heavy-into-defense-still-defender-seed", {
    spirit: 1,
    intellect: 1,
    strength: 6,
    speed: 1,
    constitution: 1
  });
  state.player.hp = 40;
  state.encounter.round = 2;
  state.encounter.activeEffects.push({
    id: "test-heavy-into-defense",
    ownerId: enemy.id,
    sourceItemId: "rib-hook",
    label: "测试高伤",
    stat: "damage",
    amount: 20,
    remainingRounds: 1,
    trigger: "round"
  });

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.encounter?.log.some((entry) => entry.text.includes("形成重伤")), true);
  assert.equal(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.advantage.source, "defend");
});

test("test_soft_closure_keeps_effective_small_mitigated_defense", () => {
  const { sim, state, enemy } = setupAdjacentCombat("small-mitigated-soft-closure-seed", {
    spirit: 1,
    intellect: 1,
    strength: 2,
    speed: 1,
    constitution: 1
  });
  enemy.hp = 10;
  state.encounter.round = 2;

  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.player.hp, 10);
  assert.equal(state.encounter?.advantage.owner, "player");
  assert.equal(state.encounter?.advantage.source, "defend");
});
