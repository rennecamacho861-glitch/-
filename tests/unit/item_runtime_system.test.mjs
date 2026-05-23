import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { canManuallyUseSlot, markManualSlotUsed, recordTriggerChainStep, resetTriggerChain, resolveStackedEffectAmount } =
  require("../../.test-build/src/sim/systems/itemRuntimeSystem.js");

test("manual item lock is per item slot and resets by round key", () => {
  const sim = new GameSimulation("manual-lock-seed");
  const state = sim.snapshot();
  const pistol = createInventorySlot("pistol", 1, { charges: 2 });
  const iceAwl = createInventorySlot("ice-awl");

  assert.equal(canManuallyUseSlot(state, pistol).ok, true);
  markManualSlotUsed(state, pistol);

  assert.equal(canManuallyUseSlot(state, pistol).ok, false);
  assert.equal(canManuallyUseSlot(state, iceAwl).ok, true);

  state.turn += 1;
  assert.equal(canManuallyUseSlot(state, pistol).ok, true);
});

test("non-rare active items receive finite charges while rare long-term items can be unlimited", () => {
  const common = createInventorySlot("salve-tin");
  const uncommon = createInventorySlot("ice-awl");
  const reusableFieldRare = createInventorySlot("bandage");
  const reusableAmmoRare = createInventorySlot("old-magazine");
  const reusableRare = createInventorySlot("long-knife");

  assert.equal(common.item.usage.mode, "charges-destroy");
  assert.equal(common.charges, 2);
  assert.equal(uncommon.item.usage.mode, "charges-destroy");
  assert.equal(uncommon.charges, 3);
  assert.equal(reusableFieldRare.item.usage.mode, "unlimited");
  assert.equal(reusableFieldRare.charges, undefined);
  assert.equal(reusableAmmoRare.item.usage.mode, "unlimited");
  assert.equal(reusableAmmoRare.charges, undefined);
  assert.equal(reusableRare.item.usage.mode, "unlimited");
  assert.equal(reusableRare.charges, undefined);
});

test("active effect stacking defaults to strongest, additive effects opt in", () => {
  const effects = [
    { amount: 1, stackPolicy: "max" },
    { amount: 3, stackPolicy: "max" },
    { amount: 2, stackPolicy: "add" },
    { amount: -1, stackPolicy: "add" }
  ];

  assert.equal(resolveStackedEffectAmount(effects), 4);
});

test("combat trigger chain stops after five automatic trigger steps", () => {
  const sim = new GameSimulation("chain-limit-seed");
  const state = sim.snapshot();
  state.encounter = {
    enemyId: "enemy-1",
    enemyName: "敌人",
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

  resetTriggerChain(state);
  const results = Array.from({ length: 6 }, () => recordTriggerChainStep(state));
  assert.deepEqual(results, [true, true, true, true, true, false]);
});
