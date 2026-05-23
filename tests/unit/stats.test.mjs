import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { calculateDerivedStats, DEFAULT_PLAYER_STATS } = require("../../.test-build/src/sim/stats.js");

test("v0.5 default player stats derive expected values", () => {
  const derived = calculateDerivedStats(DEFAULT_PLAYER_STATS);
  assert.equal(derived.maxHp, 12);
  assert.equal(derived.visionRadius, 3);
  assert.equal(derived.brightVisionRadius, 1);
  assert.equal(derived.meleeDamage, 3);
  assert.equal(derived.heavyWoundThreshold, 5);
  assert.equal(derived.basePersuasion, 3);
});

test("derived stat boundaries follow rulebook formulas", () => {
  const low = calculateDerivedStats({ spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 });
  assert.equal(low.maxHp, 8);
  assert.equal(low.visionRadius, 2);
  assert.equal(low.brightVisionRadius, 1);
  assert.equal(low.meleeDamage, 2);
  assert.equal(low.heavyWoundThreshold, 4);

  const high = calculateDerivedStats(
    { spirit: 6, intellect: 6, strength: 6, speed: 6, constitution: 6 },
    { weaponDamageBonus: 1, confirmedIntelCount: 2 }
  );
  assert.equal(high.maxHp, 18);
  assert.equal(high.visionRadius, 5);
  assert.equal(high.brightVisionRadius, 2);
  assert.equal(high.meleeDamage, 6);
  assert.equal(high.heavyWoundThreshold, 7);
  assert.equal(high.basePersuasion, 8);
});
