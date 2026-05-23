import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { canEnter, hasWallBetween } = require("../../.test-build/src/sim/systems/movementSystem.js");
const { hasLineOfSight } = require("../../.test-build/src/sim/systems/visibilitySystem.js");

function stateWithOnlyWalls(wallEdges) {
  const sim = new GameSimulation("edge-wall-seed");
  const state = sim.snapshot();
  state.map.wallEdges = new Set(wallEdges);
  return state;
}

test("map tiles no longer store wall or danger cells", () => {
  const state = new GameSimulation("edge-wall-seed").snapshot();

  assert.equal(state.map.width, 17);
  assert.equal(state.map.height, 13);
  assert.ok(state.map.wallEdges.size >= 110);
  assert.ok(state.map.tiles.flat().every((tile) => tile !== "wall"));
  assert.ok(state.map.tiles.flat().every((tile) => tile !== "danger"));
});

test("braided maze is deterministic per seed and varies across seeds", () => {
  const first = wallKeyList(new GameSimulation("braid-seed-a").snapshot());
  const same = wallKeyList(new GameSimulation("braid-seed-a").snapshot());
  const different = wallKeyList(new GameSimulation("braid-seed-b").snapshot());

  assert.deepEqual(first, same);
  assert.notDeepEqual(first, different);
});

test("dense maze gives every cell a wall and no dead ends", () => {
  const state = new GameSimulation("edge-wall-seed").snapshot();
  const reachable = new Set(["1,1"]);
  const queue = [{ x: 1, y: 1 }];

  for (let y = 0; y < state.map.height; y += 1) {
    for (let x = 0; x < state.map.width; x += 1) {
      const position = { x, y };
      const open = openNeighbors(state, position);
      assert.ok(open.length >= 2, `${x},${y} should not be a dead end`);
      assert.ok(open.length <= 3, `${x},${y} should keep at least one wall`);
    }
  }

  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of openNeighbors(state, current)) {
      const key = `${next.x},${next.y}`;
      if (reachable.has(key)) continue;
      reachable.add(key);
      queue.push(next);
    }
  }

  assert.equal(reachable.size, state.map.width * state.map.height);
  assert.ok(maxStraightRun(state) <= 4);
});

test("edge walls block adjacent movement while open edges allow it", () => {
  const state = stateWithOnlyWalls(["v:2,1"]);

  assert.equal(hasWallBetween(state, { x: 1, y: 1 }, { x: 2, y: 1 }), true);
  assert.equal(canEnter(state, { x: 2, y: 1 }, { x: 1, y: 1 }), false);
  assert.equal(canEnter(state, { x: 1, y: 2 }, { x: 1, y: 1 }), true);
});

test("map boundary is treated as a wall without occupying a tile", () => {
  const state = stateWithOnlyWalls([]);

  assert.equal(canEnter(state, { x: -1, y: 1 }, { x: 0, y: 1 }), false);
  assert.equal(canEnter(state, { x: 17, y: 1 }, { x: 16, y: 1 }), false);
  assert.equal(hasWallBetween(state, { x: 0, y: 1 }, { x: -1, y: 1 }), true);
});

test("edge walls block horizontal and vertical line of sight", () => {
  let state = stateWithOnlyWalls(["v:2,1"]);
  assert.equal(hasLineOfSight(state, { x: 1, y: 1 }, { x: 3, y: 1 }), false);

  state = stateWithOnlyWalls(["h:1,2"]);
  assert.equal(hasLineOfSight(state, { x: 1, y: 1 }, { x: 1, y: 3 }), false);
});

test("diagonal one-corner peeking works with edge walls", () => {
  let state = stateWithOnlyWalls(["v:2,1"]);
  assert.equal(hasLineOfSight(state, { x: 1, y: 1 }, { x: 2, y: 2 }), true);

  state = stateWithOnlyWalls(["v:2,1", "h:1,2"]);
  assert.equal(hasLineOfSight(state, { x: 1, y: 1 }, { x: 2, y: 2 }), false);
});

function openNeighbors(state, position) {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 }
  ].filter((next) => canEnter(state, next, position));
}

function wallKeyList(state) {
  return [...state.map.wallEdges].sort();
}

function maxStraightRun(state) {
  let maxRun = 0;
  for (let y = 0; y < state.map.height; y += 1) {
    let run = 0;
    for (let x = 0; x < state.map.width - 1; x += 1) {
      if (!hasWallBetween(state, { x, y }, { x: x + 1, y })) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
  }
  for (let x = 0; x < state.map.width; x += 1) {
    let run = 0;
    for (let y = 0; y < state.map.height - 1; y += 1) {
      if (!hasWallBetween(state, { x, y }, { x, y: y + 1 })) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
  }
  return maxRun;
}
