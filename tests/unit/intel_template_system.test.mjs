import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { createGlobalIntelLine } = require("../../.test-build/src/sim/systems/intelTemplateSystem.js");

test("global intel templates read live game state values", () => {
  const sim = new GameSimulation("global-intel-seed");
  const state = sim.snapshot();
  state.map.aiUnits[0].stats.speed = 6;
  state.map.aiUnits[1].stats.speed = 2;
  state.map.aiUnits[0].inventory = [createInventorySlot("pistol"), createInventorySlot("bandage")];

  const speedLine = createGlobalIntelLine(state, "enemy-average-speed");
  const equippedLine = createGlobalIntelLine(state, "most-equipped-actor");

  assert.match(speedLine, /^全场敌人平均速度 = \d+(\.\d)?$/);
  assert.match(equippedLine, /^当前携带道具最多角色 = .+，道具数 = \d+(，首件道具 = .+)?$/);
  assert.equal(/意图|路线|性格|态势/.test(speedLine + equippedLine), false);
});
