import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ALL_ITEM_IDS, ITEMS } = require("../../.test-build/src/sim/items.js");
const {
  ITEM_POWER_SCORE_LIMIT,
  expectedRarityForScore,
  isPowerScoreInRarityBand,
  itemPowerScore,
  lootValueForItem,
  rarityWeight
} = require("../../.test-build/src/sim/systems/itemBalanceSystem.js");

const RARE_ITEMS = [
  "bandage",
  "bunker-prayer",
  "crush-salt",
  "echo",
  "emergency-syringe",
  "frost-nail",
  "last-ice",
  "last-match",
  "long-knife",
  "old-magazine",
  "overrun-chain",
  "photon-cut",
  "pistol",
  "signal-flare"
];
const MYTHIC_ITEMS = [
  "blood-enchant-gem",
  "burning-enchant-gem",
  "deadly-enchant-gem",
  "frost-enchant-gem",
  "radiant-enchant-gem",
  "venomous-enchant-gem"
];
const UNCOMMON_ITEMS = [
  "acid-vial",
  "adrenaline-shot",
  "ankle-line",
  "ankle-spring",
  "antidote-tablet",
  "ash-threshold",
  "barbed-line",
  "bell-wire",
  "black-cloth",
  "blood-knot",
  "blood-sponge",
  "bracer",
  "breakwater-splint",
  "caltrops",
  "chase-spur",
  "coal-beads",
  "cold-rivet",
  "counter-plate",
  "crit-hook",
  "fatigue-tax",
  "focus-thread",
  "folded-map",
  "frost-latch",
  "heat-pad",
  "hook-rope",
  "ice-awl",
  "insulation-cloth",
  "knuckle-core",
  "lens",
  "lens-thread",
  "long-fuse",
  "marked-coin",
  "mnemonic-plate",
  "panic-nail",
  "pilot-flame",
  "poison-needle",
  "pressure-bandage",
  "recoil-plate",
  "rib-hook",
  "runner-knot",
  "rust-cloud",
  "scent-powder",
  "second-sight",
  "servo-heel",
  "shatter-pin",
  "shield-spark",
  "slip-venom",
  "smoke-ball",
  "smoke-needle",
  "soot-hook",
  "spark-fuse",
  "splint",
  "stitch-kit",
  "thorn-plate",
  "throwing-knife",
  "tinder-vial",
  "toxic-focus",
  "toxin-skein",
  "tripwire-spool",
  "venom-saw",
  "venom-timer",
  "white-spark",
  "wood-shield"
];

test("item rarity supports common, uncommon, rare, and mythic bands", () => {
  assert.equal(ALL_ITEM_IDS.length, 141);
  assert.deepEqual(
    ALL_ITEM_IDS.filter((itemId) => ITEMS[itemId].rarity === "rare").sort(),
    RARE_ITEMS
  );
  assert.deepEqual(
    ALL_ITEM_IDS.filter((itemId) => ITEMS[itemId].rarity === "uncommon").sort(),
    UNCOMMON_ITEMS
  );
  assert.deepEqual(
    ALL_ITEM_IDS.filter((itemId) => ITEMS[itemId].rarity === "mythic").sort(),
    MYTHIC_ITEMS
  );
  assert.ok(ALL_ITEM_IDS.some((itemId) => ITEMS[itemId].rarity === "common"));
});

test("all item power scores match their rarity bands and stay under the cap", () => {
  for (const itemId of ALL_ITEM_IDS) {
    const item = ITEMS[itemId];
    const score = itemPowerScore(item);
    assert.ok(score <= ITEM_POWER_SCORE_LIMIT, `${itemId} score ${score} exceeds ${ITEM_POWER_SCORE_LIMIT}`);
    if (item.rarity !== "mythic") {
      assert.equal(expectedRarityForScore(score), item.rarity, `${itemId} score ${score} does not match ${item.rarity}`);
    }
    assert.equal(isPowerScoreInRarityBand(item), true, `${itemId} should fit its rarity band`);
  }
});

test("glass spike crit chance is modeled as expected damage, not raw percent", () => {
  assert.equal(ITEMS["glass-spike"].rarity, "common");
  assert.equal(itemPowerScore(ITEMS["glass-spike"]), 0.8);
});

test("rarity weights and loot values follow v0.8.2 defaults", () => {
  assert.deepEqual(
    ["common", "uncommon", "rare", "mythic"].map((rarity) => rarityWeight("map", rarity)),
    [72, 23, 5, 0]
  );
  assert.deepEqual(
    ["common", "uncommon", "rare", "mythic"].map((rarity) => rarityWeight("airdrop", rarity)),
    [45, 40, 15, 0]
  );
  assert.equal(lootValueForItem(ITEMS.bandage), 3);
  assert.equal(lootValueForItem(ITEMS["ice-awl"]), 2);
  assert.equal(lootValueForItem(ITEMS.pistol), 3);
  assert.equal(lootValueForItem(ITEMS["burning-enchant-gem"]), 5);
});
