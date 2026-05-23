import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

test("HUD forwards item rarity to DOM and CSS owns rarity border colors", () => {
  const mainSource = fs.readFileSync(path.join(process.cwd(), "src", "main.ts"), "utf8");
  const styleSource = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.ok(mainSource.includes('data-rarity="${slot.item.rarity}"'));
  assert.ok(mainSource.includes('data-rarity="${ITEMS[itemId].rarity}"'));
  assert.ok(mainSource.includes('data-rarity="${item.rarity}"'));

  for (const rarity of ["common", "uncommon", "rare", "mythic"]) {
    assert.ok(styleSource.includes(`[data-rarity="${rarity}"]`), `${rarity} should have a rarity selector`);
  }
  assert.ok(styleSource.includes("--rarity-common"));
  assert.ok(styleSource.includes("--rarity-uncommon"));
  assert.ok(styleSource.includes("--rarity-rare"));
  assert.ok(styleSource.includes("--rarity-mythic"));
});

test("combat round log is scrollable so long battles do not cover action buttons", () => {
  const mainSource = fs.readFileSync(path.join(process.cwd(), "src", "main.ts"), "utf8");
  const styleSource = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.ok(styleSource.includes(".battle-panel"));
  assert.ok(styleSource.includes("max-height: min(760px, calc(100vh - 152px))"));
  assert.ok(styleSource.includes(".rounds"));
  assert.ok(styleSource.includes("overflow-y: auto"));
  assert.ok(styleSource.includes("overscroll-behavior: contain"));
  assert.ok(mainSource.includes('querySelector<HTMLOListElement>(".rounds")'));
  assert.ok(mainSource.includes("roundLog.scrollTop = roundLog.scrollHeight"));
});
