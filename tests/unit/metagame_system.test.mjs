import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { MetagameSimulation } = require("../../.test-build/src/sim/metagame.js");
const { createMap } = require("../../.test-build/src/sim/map.js");
const { getMapTier } = require("../../.test-build/src/sim/systems/mapTierSystem.js");

function memoryStorage() {
  return {
    value: undefined,
    load() {
      return this.value;
    },
    save(profile) {
      this.value = profile;
    }
  };
}

test("metagame buy equip start and extract returns carried inventory to unlimited stash", () => {
  const sim = new MetagameSimulation("meta-extract-seed", memoryStorage());
  sim.selectMapTier("tier-1");
  let meta = sim.metaSnapshot();
  const offer = meta.profile.shop.offers.find((candidate) => !candidate.sold);
  assert.ok(offer);
  const startingGold = meta.profile.gold;

  sim.buyShopOffer(offer.id);
  meta = sim.metaSnapshot();
  assert.equal(meta.profile.stash.length, 1);
  assert.ok(meta.profile.gold < startingGold);

  const stashSlot = meta.profile.stash[0];
  sim.equipStashSlot(stashSlot.instanceId);
  meta = sim.metaSnapshot();
  assert.equal(meta.profile.stash.length, 0);
  assert.equal(meta.profile.deployment.length, 1);

  sim.startRun("meta-extract-run");
  assert.equal(sim.metaSnapshot().activeRun, true);
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy) => {
    enemy.defeated = true;
  });
  const exit = findExit(state);
  state.player.position = { x: exit.x - 1, y: exit.y };
  state.player.previousPosition = { ...state.player.position };
  state.loot = 2;

  sim.move(1, 0);

  meta = sim.metaSnapshot();
  assert.equal(meta.activeRun, false);
  assert.equal(meta.profile.lastRunSummary.outcome, "extracted");
  assert.equal(meta.profile.lastRunSummary.itemsRecovered >= 1, true);
  assert.equal(meta.profile.stash.length >= 1, true);
  assert.equal(meta.profile.gold > startingGold - offer.price, true);
});

test("metagame failure loses deployed and run-acquired items instead of returning them to stash", () => {
  const sim = new MetagameSimulation("meta-fail-seed", memoryStorage());
  const offer = sim.metaSnapshot().profile.shop.offers[0];
  sim.buyShopOffer(offer.id);
  const slot = sim.metaSnapshot().profile.stash[0];
  sim.equipStashSlot(slot.instanceId);
  sim.startRun("meta-fail-run");
  assert.equal(sim.snapshot().inventory.length, 1);

  sim.reset("after-fail");

  const meta = sim.metaSnapshot();
  assert.equal(meta.activeRun, false);
  assert.equal(meta.profile.lastRunSummary.outcome, "failed");
  assert.equal(meta.profile.lastRunSummary.itemsLost, 1);
  assert.equal(meta.profile.stash.length, 0);
  assert.equal(meta.profile.deployment.length, 0);
});

test("tiered map generation uses tier enemy stat budgets without changing default map contract", () => {
  const defaultMap = createMap("default-contract").map;
  assert.ok(defaultMap.aiUnits.every((enemy) => statTotal(enemy) === 15));

  const tierTwo = getMapTier("tier-2");
  const tierMap = createMap("tier-two-contract", { mapTier: tierTwo }).map;
  assert.ok(tierMap.aiUnits.every((enemy) => statTotal(enemy) >= 10 && statTotal(enemy) <= 20));
  assert.ok(tierMap.aiUnits.some((enemy) => statTotal(enemy) !== 15));
});

function findExit(state) {
  for (let y = 0; y < state.map.height; y += 1) {
    for (let x = 0; x < state.map.width; x += 1) {
      if (state.map.tiles[y][x] === "exit") return { x, y };
    }
  }
  throw new Error("exit missing");
}

function statTotal(enemy) {
  return Object.values(enemy.stats).reduce((sum, value) => sum + value, 0);
}
