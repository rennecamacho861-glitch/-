import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ALL_ITEM_IDS } = require("../../.test-build/src/sim/items.js");

test("all item definitions resolve to produced grid dungeon icons", () => {
  const assetSource = fs.readFileSync(path.join(process.cwd(), "src", "render", "gridDungeonAssets.ts"), "utf8");

  for (const itemId of ALL_ITEM_IDS) {
    const keyPattern = itemId.includes("-") ? `"${itemId}"` : `(?:${itemId}|"${itemId}")`;
    const mappingPattern = new RegExp(`${keyPattern}: "([^"]+)"`);
    const mappingMatch = assetSource.match(mappingPattern);
    assert.ok(mappingMatch, `${itemId} should be mapped in ITEM_ICON_ASSETS`);

    const assetId = mappingMatch[1];
    const filePattern = new RegExp(`\\{ id: "${assetId}", file: "([^"]+)" \\}`);
    const fileMatch = assetSource.match(filePattern);
    assert.ok(fileMatch, `${assetId} should exist in GRID_DUNGEON_ASSETS`);

    const assetPath = path.join(process.cwd(), "public", "assets", "grid-dungeon", fileMatch[1]);
    assert.ok(fs.existsSync(assetPath), `${itemId} icon file should exist at ${assetPath}`);
  }
});
