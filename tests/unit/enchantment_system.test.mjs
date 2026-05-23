import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { PICKUP_ITEM_POOL, createInventorySlot } = require("../../.test-build/src/sim/items.js");
const {
  ENCHANTMENT_CARRIER_TEMPLATES,
  ENCHANTMENT_GEM_IDS,
  createGemAffix,
  isEnchantableSlot,
  rollNaturalItemAffix,
  rollMythicGemItem
} = require("../../.test-build/src/sim/systems/enchantmentSystem.js");

test("all pickup items have an enchantment carrier template", () => {
  assert.equal(PICKUP_ITEM_POOL.length, 135);
  for (const itemId of PICKUP_ITEM_POOL) {
    assert.ok(ENCHANTMENT_CARRIER_TEMPLATES[itemId], `${itemId} needs an enchantment carrier template`);
  }
});

test("enchantment gems create locked gem affixes and are not enchantable targets", () => {
  for (const gemId of ENCHANTMENT_GEM_IDS) {
    const gemSlot = createInventorySlot(gemId);
    const affix = createGemAffix(gemId);
    assert.equal(gemSlot.item.rarity, "mythic");
    assert.equal(affix.kind, "enchantment");
    assert.equal(affix.source, "gem");
    assert.equal(affix.locked, true);
    assert.equal(isEnchantableSlot(gemSlot), false);
  }
});

test("natural affix rolls are deterministic and exclude gems", () => {
  let affix;
  for (let i = 0; i < 1000; i += 1) {
    affix = rollNaturalItemAffix(`affix-seed-${i}`, "slot", "pistol");
    if (affix) break;
  }
  assert.equal(affix?.kind, "enchantment");
  assert.equal(rollNaturalItemAffix("same-seed", "same-label", "burning-enchant-gem"), undefined);
});

test("mythic gem offers can appear deterministically without entering the normal pickup pool", () => {
  let gemId;
  for (let i = 0; i < 2000; i += 1) {
    gemId = rollMythicGemItem(`gem-seed-${i}`, "offer");
    if (gemId) break;
  }
  assert.ok(ENCHANTMENT_GEM_IDS.includes(gemId), "a mythic gem should be found by deterministic brute force");
  assert.equal(PICKUP_ITEM_POOL.includes(gemId), false);
});
