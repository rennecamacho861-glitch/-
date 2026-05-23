import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { ITEMS, createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { activeEffectAmount } = require("../../.test-build/src/sim/systems/itemRuntimeSystem.js");
const {
  ACTIVE_ITEM_SLOT_LIMIT,
  PASSIVE_BUDGET_LIMIT,
  equippedPassiveItemIds,
  isManualSlotEquipped,
  rareActiveItemsMissingExplicitUsage
} = require("../../.test-build/src/sim/systems/itemLimitSystem.js");

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
  state.player.stats = { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 };
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: 5, y: 4 };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  enemy.patrolIndex = 0;
  enemy.inventory = [];
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 6 };
  enemy.hp = 12;
  sim.checkEncounter();
  return { sim, state, enemy };
}

test("one actor can actively use only one combat item per combat round", () => {
  const { sim, state } = setupEncounter("item-active-limit-seed");
  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "vision", bonusAvailable: true };
  state.player.inventory = [createInventorySlot("rib-hook"), createInventorySlot("ankle-line")];
  state.inventory = state.player.inventory;

  sim.useItem("rib-hook");
  sim.useItem("ankle-line");

  assert.equal(state.encounter.activeEffects.filter((effect) => effect.ownerId === state.player.id).length, 1);
  assert.equal(state.encounter.activeEffects[0].sourceItemId, "rib-hook");
  assert.equal(state.log.some((line) => line.includes("本回合已经主动使用过一件战斗道具")), true);
});

test("enemy active combat item use also obeys the one item per round limit", () => {
  const { sim, state, enemy } = setupEncounter("enemy-item-active-limit-seed");
  state.encounter.phase = "chooseAction";
  enemy.inventory = [createInventorySlot("tinder-vial"), createInventorySlot("poison-needle")];

  assert.equal(sim.useEnemyCombatItem(enemy, "tinder-vial"), true);
  assert.equal(sim.useEnemyCombatItem(enemy, "poison-needle"), false);
  assert.equal(state.encounter.activeEffects.filter((effect) => effect.ownerId === enemy.id).length, 1);
  assert.equal(state.encounter.activeEffects[0].sourceItemId, "tinder-vial");
});

test("manual items outside the active slot limit are not equipped for use", () => {
  const { sim, state } = setupEncounter("active-slot-limit-seed");
  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "vision", bonusAvailable: true };
  state.player.inventory = [
    createInventorySlot("rib-hook"),
    createInventorySlot("ankle-line"),
    createInventorySlot("counter-plate"),
    createInventorySlot("panic-nail"),
    createInventorySlot("lens")
  ];
  state.inventory = state.player.inventory;

  assert.equal(ACTIVE_ITEM_SLOT_LIMIT, 4);
  assert.equal(isManualSlotEquipped(state.player, state.player.inventory[3]), true);
  assert.equal(isManualSlotEquipped(state.player, state.player.inventory[4]), false);

  sim.useItem("lens");

  assert.equal(state.intel.some((entry) => entry.kind === "attackDirection"), false);
  assert.equal(state.log.some((line) => line.includes("没有装入当前主动槽")), true);
});

test("same stat modifiers in one round resolve to the strongest value", () => {
  const { state } = setupEncounter("same-stat-max-seed");
  state.encounter.activeEffects.push(
    {
      id: "speed-low",
      ownerId: state.player.id,
      sourceItemId: "opener-gear",
      label: "speed +1",
      stat: "speed",
      amount: 1,
      remainingRounds: 1,
      trigger: "round"
    },
    {
      id: "speed-high",
      ownerId: state.player.id,
      sourceItemId: "ankle-spring",
      label: "speed +2",
      stat: "speed",
      amount: 2,
      remainingRounds: 1,
      trigger: "round"
    }
  );

  assert.equal(activeEffectAmount(state, state.player, "speed", "owned", "round"), 2);
});

test("passive budget equips first affordable unique passives only", () => {
  const { sim, state } = setupEncounter("passive-budget-seed");
  const eligible = new Set(["servo-heel", "mnemonic-plate", "knuckle-core", "exit-charm"]);
  state.player.inventory = [
    createInventorySlot("servo-heel"),
    createInventorySlot("servo-heel"),
    createInventorySlot("mnemonic-plate"),
    createInventorySlot("knuckle-core"),
    createInventorySlot("exit-charm")
  ];
  state.inventory = state.player.inventory;

  const equipped = equippedPassiveItemIds(state.player, eligible);
  assert.equal(PASSIVE_BUDGET_LIMIT, 5);
  assert.deepEqual([...equipped], ["servo-heel", "mnemonic-plate", "exit-charm"]);

  sim.applyPassiveRules("combatStart", state.player, state.map.aiUnits[0]);

  assert.equal(state.encounter.activeEffects.filter((effect) => effect.sourceItemId === "servo-heel").length, 1);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "mnemonic-plate"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "exit-charm"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "knuckle-core"), false);
});

test("trigger chain stops after five automatic passive steps and logs the cap", () => {
  const { sim, state, enemy } = setupEncounter("trigger-chain-log-seed");
  state.player.inventory = [
    createInventorySlot("spring-step"),
    createInventorySlot("dust-kicker"),
    createInventorySlot("slip-venom"),
    createInventorySlot("dodge-reader")
  ];
  enemy.inventory = [
    createInventorySlot("guard-lens"),
    createInventorySlot("brace-piston"),
    createInventorySlot("calm-mouthpiece")
  ];

  sim.applyPassiveRules("onDodgeSuccess", state.player, enemy);
  sim.applyPassiveRules("onDefendSuccess", enemy, state.player);

  assert.equal(state.encounter.triggerChainCount > 5, true);
  assert.equal(state.encounter.log.some((entry) => entry.text.includes("触发链达到上限")), true);
});

test("rare active items all declare explicit usage contracts", () => {
  assert.deepEqual(rareActiveItemsMissingExplicitUsage(ITEMS), []);
});
