import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { resolveEnemyCombatItemEffect, resolvePlayerCombatItemEffect } = require("../../.test-build/src/sim/systems/itemEffectSystem.js");

test("player combat item effects resolve without touching simulation state", () => {
  const iceAwl = resolvePlayerCombatItemEffect("ice-awl", "enemy-1", false);
  assert.equal(iceAwl.type, "effect");
  assert.equal(iceAwl.effect.sourceItemId ?? iceAwl.effect.itemId, "ice-awl");
  assert.equal(iceAwl.effect.stat, "damage");
  assert.equal(iceAwl.effect.amount, 1);
  assert.equal(iceAwl.effect.targetActorId, undefined);

  const ankleLine = resolvePlayerCombatItemEffect("ankle-line", "enemy-1", true);
  assert.equal(ankleLine.type, "effect");
  assert.equal(ankleLine.effect.targetActorId, "enemy-1");
  assert.equal(ankleLine.effect.stat, "dodge");
});

test("advantage-gated combat item effects report blocked instead of mutating", () => {
  const blocked = resolvePlayerCombatItemEffect("hook-rope", "enemy-1", false);
  assert.equal(blocked.type, "blocked");
  assert.ok(blocked.message.includes("优势"));
  assert.ok(blocked.message.includes("1 点"));

  const enemyBlocked = resolveEnemyCombatItemEffect("rib-hook", "player", false);
  assert.equal(enemyBlocked.type, "blocked");
});

test("enemy item effect resolver shares the player combat item surface", () => {
  const shared = resolveEnemyCombatItemEffect("ice-awl", "player", true);
  assert.equal(shared.type, "effect");
  assert.equal(shared.effect.itemId, "ice-awl");

  const supported = resolveEnemyCombatItemEffect("rib-hook", "player", true);
  assert.equal(supported.type, "effect");
  assert.equal(supported.effect.itemId, "rib-hook");
});

test("v0.8.3 cross-port combat items resolve to deferred triggers", () => {
  const smokeNeedle = resolvePlayerCombatItemEffect("smoke-needle", "enemy-1", false);
  assert.equal(smokeNeedle.type, "effect");
  assert.equal(smokeNeedle.effect.stat, "poison");
  assert.equal(smokeNeedle.effect.trigger, "nextDodge");

  const thornPlate = resolveEnemyCombatItemEffect("thorn-plate", "player", false);
  assert.equal(thornPlate.type, "effect");
  assert.equal(thornPlate.effect.stat, "bleed");
  assert.equal(thornPlate.effect.trigger, "nextIncomingDamage");
});
