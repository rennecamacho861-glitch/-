import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { GameSimulation: RawGameSimulation } = require("../../.test-build/src/sim/GameSimulation.js");
const { ALL_ITEM_IDS, ITEMS, PICKUP_ITEM_POOL, createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { createMap, createLootOffer, edgeKeyBetween } = require("../../.test-build/src/sim/map.js");
const { chooseEnemyPickup, scoreItemForEnemy } = require("../../.test-build/src/sim/systems/lootSystem.js");
const { canEnter, hasWallBetween } = require("../../.test-build/src/sim/systems/movementSystem.js");
const { PASSIVE_GRID_ITEM_IDS, PASSIVE_ITEM_RULES } = require("../../.test-build/src/sim/systems/passiveItemSystem.js");
const { attackDirection, rollPercent } = require("../../.test-build/src/sim/systems/randomSystem.js");
const { getVisibility, updateVisibilityState } = require("../../.test-build/src/sim/systems/visibilitySystem.js");

function GameSimulation(seed) {
  const sim = new RawGameSimulation(seed);
  if (sim.snapshot().pendingPickupOffer?.nodeId === "starter") sim.choosePickup("echo");
  const state = sim.snapshot();
  state.player.inventory = state.player.inventory.filter((slot) => slot.item.id !== "echo");
  state.inventory = state.player.inventory;
  state.loot = 0;
  return sim;
}

function disableEnemies(state) {
  for (const enemy of state.map.aiUnits) enemy.defeated = true;
}

test("new run starts with v0.5 player stat and loot node basics", () => {
  const sim = new RawGameSimulation("test-seed");
  const state = sim.snapshot();
  assert.equal(state.player.hp, 12);
  assert.equal(state.player.stats.spirit, 3);
  assert.equal(state.turnLimit, 72);
  assert.equal("danger" in state, false);
  assert.ok(state.map.tiles.flat().every((tile) => tile !== "wall"));
  assert.ok(state.map.tiles.flat().every((tile) => tile !== "danger"));
  assert.ok(state.map.wallEdges.size > 0);
  assert.equal(state.map.lootNodes.length, 30);
  assert.ok(state.map.lootNodes.every((node) => node.offerItemIds.length === 3));
  assert.equal(state.pendingPickupOffer?.nodeId, "starter");
  assert.deepEqual(state.pendingPickupOffer?.itemIds, ["echo", "pistol", "bandage", "photon-cut"]);
  assert.equal(state.map.aiUnits.length, 15);
  assert.equal(new Set(state.map.aiUnits.map((enemy) => enemy.id)).size, 15);
  assert.ok(state.map.aiUnits.every((enemy) => enemy.combatCount === 0));
  assert.ok(state.map.aiUnits.every((enemy) => /^[\u4e00-\u9fa5]{2}-\d{2}$/.test(enemy.name)));
  assert.ok(state.map.aiUnits.every((enemy) => Object.values(enemy.stats).reduce((sum, value) => sum + value, 0) === 15));
  assert.ok(state.map.aiUnits.filter((enemy) => enemy.inventory.some((slot) => slot.item.id === "pistol")).length <= 1);
  assert.ok(Object.values(state.rareItemAppearances).every((count) => count <= 2));
});

test("loot offers are weighted by rarity, unique, and seed-stable", () => {
  const first = createMap("weighted-loot-seed").map.lootNodes.map((node) => node.offerItemIds);
  const repeat = createMap("weighted-loot-seed").map.lootNodes.map((node) => node.offerItemIds);
  const different = createMap("weighted-loot-seed-2").map.lootNodes.map((node) => node.offerItemIds);
  assert.deepEqual(first, repeat);
  assert.notDeepEqual(first, different);
  assert.ok(first.every((offer) => new Set(offer).size === 3));

  const counts = { common: 0, uncommon: 0, rare: 0 };
  for (let seedIndex = 0; seedIndex < 240; seedIndex += 1) {
    for (let offerIndex = 0; offerIndex < 30; offerIndex += 1) {
      for (const itemId of createLootOffer(`weighted-loot-${seedIndex}`, offerIndex)) {
        counts[ITEMS[itemId].rarity] += 1;
      }
    }
  }

  assert.ok(counts.common > counts.uncommon, JSON.stringify(counts));
  assert.ok(counts.uncommon > counts.rare, JSON.stringify(counts));
});

test("pickup loot value follows item rarity", () => {
  for (const [itemId, expectedLoot] of [
    ["bandage", 3],
    ["ice-awl", 2],
    ["pistol", 3]
  ]) {
    const sim = new GameSimulation(`pickup-value-${itemId}`);
    const state = sim.snapshot();
    disableEnemies(state);
    state.map.lootNodes.forEach((node, index) => {
      node.depleted = index !== 0;
    });
    state.map.lootNodes[0].position = { ...state.player.position };
    state.map.lootNodes[0].offerItemIds = ["bandage", "ice-awl", "pistol"];

    sim.offerPlayerPickup();
    sim.choosePickup(itemId);

    assert.equal(state.loot, expectedLoot, `${itemId} should grant ${expectedLoot} loot`);
  }
});

test("stepping onto a loot node opens a free three-choice pickup", () => {
  const sim = new GameSimulation("test-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  const node = state.map.lootNodes[0];
  const step = stepInto(state, node.position);
  state.player.position = step.from;

  sim.move(step.dx, step.dy);

  const offerState = sim.snapshot();
  assert.equal(offerState.turn, 1);
  assert.deepEqual(offerState.pendingPickupOffer.itemIds, node.offerItemIds);

  const chosen = offerState.pendingPickupOffer.itemIds[1];
  sim.choosePickup(chosen);

  const afterPick = sim.snapshot();
  assert.equal(afterPick.turn, 1);
  assert.equal(afterPick.pendingPickupOffer, undefined);
  assert.equal(afterPick.map.lootNodes[0].depleted, true);
  assert.ok(afterPick.inventory.some((slot) => slot.item.id === chosen));
});

test("enemy stepping onto a loot node picks one item and clears it", () => {
  const sim = new GameSimulation("enemy-pickup-seed");
  const state = sim.snapshot();
  const node = state.map.lootNodes[0];
  const enemy = state.map.aiUnits[0];
  for (const other of state.map.aiUnits) {
    if (other.id !== enemy.id) other.defeated = true;
  }
  const enemyStep = stepInto(state, node.position);
  enemy.position = enemyStep.from;
  enemy.patrol = [{ ...node.position }];
  enemy.patrolIndex = -1;

  const playerStep = legalStepFrom(state, state.player.position);
  sim.move(playerStep.dx, playerStep.dy);

  assert.equal(sim.snapshot().map.lootNodes[0].depleted, true);
  assert.ok(enemy.inventory.some((slot) => node.offerItemIds.includes(slot.item.id)));
});

test("turn 72 no longer raises a global danger value or ends the run", () => {
  const sim = new GameSimulation("test-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  const step = legalStepFrom(state, state.player.position);
  for (let i = 0; i < 72; i += 1) {
    sim.move(i % 2 === 0 ? step.dx : -step.dx, i % 2 === 0 ? step.dy : -step.dy);
    if (sim.snapshot().pendingPickupOffer) sim.choosePickup(null);
  }
  const after = sim.snapshot();
  assert.equal(after.turn, 72);
  assert.equal("danger" in after, false);
  assert.equal(after.outcome, undefined);
});

test("adjacent visible enemy creates v0.5 encounter state", () => {
  const sim = new GameSimulation("test-seed");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[0];
  state.map.wallEdges.clear();
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.patrol = [enemy.position];
  sim.checkEncounter();
  const encounter = sim.snapshot().encounter;
  assert.ok(encounter);
  assert.equal(encounter.round, 0);
  assert.ok(["chooseAction", "advantageWindow"].includes(encounter.phase));
  assert.equal(encounter.enemyId, enemy.id);
  const feedback = sim.snapshot().feedbackEvents[sim.snapshot().feedbackEvents.length - 1];
  assert.equal(feedback.kind, "encounter");
  assert.equal(feedback.title, "照面");
  assert.ok(feedback.body.includes(enemy.name));
});

test("player bright vision is halved while enemy sight keeps base radius", () => {
  const sim = new GameSimulation("bright-vision-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.visible.clear();
  state.map.explored.clear();
  state.player.position = { x: 5, y: 5 };
  state.player.previousPosition = { ...state.player.position };
  state.player.stats.spirit = 3;
  state.map.aiUnits.forEach((unit, index) => {
    unit.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: 5, y: 8 };
  enemy.previousPosition = { ...enemy.position };
  enemy.stats.spirit = 3;
  enemy.awareness = { level: "unseen" };

  updateVisibilityState(state, 0);

  assert.equal(state.map.visible.has("5,6"), true);
  assert.equal(state.map.visible.has("5,7"), false);
  assert.equal(getVisibility(state, state.player, enemy), "unseen");
  assert.equal(getVisibility(state, enemy, state.player), "visible");
});

test("signal flare uses a fixed two-turn bright vision boost", () => {
  const sim = new GameSimulation("signal-flare-duration-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.wallEdges.clear();
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.player.position = { x: 1, y: 1 };
  state.player.previousPosition = { ...state.player.position };
  state.player.inventory = [createInventorySlot("signal-flare")];
  state.inventory = state.player.inventory;
  const farCell = "6,1";

  sim.updateVisibility();
  assert.equal(state.map.visible.has(farCell), false);

  sim.useItem("signal-flare");
  assert.equal(state.map.visible.has(farCell), true);

  sim.advanceTurn();
  assert.equal(state.map.visible.has(farCell), true);
  sim.advanceTurn();
  assert.equal(state.map.visible.has(farCell), false);
  sim.advanceTurn();
  assert.equal(state.map.visible.has(farCell), false);
});

test("unseen ranged ambush can only happen once per enemy", () => {
  const sim = new GameSimulation("ambush-seed");
  const state = sim.snapshot();
  state.player.stats.spirit = 1;
  state.player.position = { x: 1, y: 3 };
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 1;
  });
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  const hunter = state.map.aiUnits[1];
  hunter.position = { x: 7, y: 3 };
  hunter.patrol = [{ x: 6, y: 3 }];
  hunter.patrolIndex = -1;

  sim.move(1, 0);
  const afterFirst = sim.snapshot().player.hp;
  sim.move(-1, 0);

  assert.equal(afterFirst, 9);
  assert.equal(sim.snapshot().player.hp, afterFirst);
  assert.equal(hunter.combatCount, 1);
});

test("left revolver ignores defense reduction in combat", () => {
  const sim = new GameSimulation("ranged-defense-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 1;
  });
  const hunter = state.map.aiUnits[1];
  hunter.position = { x: state.player.position.x + 1, y: state.player.position.y };
  hunter.patrol = [{ ...hunter.position }];
  hunter.patrolIndex = 0;
  hunter.inventory = [createInventorySlot("pistol", 1, { charges: 6 })];

  sim.checkEncounter();
  sim.resolveActionRound({ type: "defend" }, { type: "ranged", itemId: "pistol" }, hunter);

  assert.equal(sim.snapshot().player.hp, 9);
  assert.equal(sim.snapshot().encounter?.advantage.owner, null);
  const feedback = sim.snapshot().feedbackEvents[sim.snapshot().feedbackEvents.length - 1];
  assert.equal(feedback.kind, "combat-round");
  assert.equal(feedback.round, 1);
  assert.equal(feedback.tone, "danger");
  assert.ok(feedback.body.includes("你选择防御"));
});

test("enemy combat count increments on first combat round but not pure persuasion", () => {
  const sim = new GameSimulation("combat-count-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.patrol = [{ ...enemy.position }];
  enemy.inventory = [];

  sim.checkEncounter();
  sim.playCombatAction({ type: "defend" });
  assert.equal(enemy.combatCount, 1);
  if (state.encounter?.phase === "chooseAction") sim.playCombatAction({ type: "defend" });
  assert.equal(enemy.combatCount, 1);

  const talkSim = new GameSimulation("persuasion-count-seed");
  const talkState = talkSim.snapshot();
  talkState.map.wallEdges.clear();
  talkState.map.aiUnits.forEach((unit, index) => {
    unit.defeated = index !== 0;
  });
  const talkEnemy = talkState.map.aiUnits[0];
  talkEnemy.position = { x: talkState.player.position.x + 1, y: talkState.player.position.y };
  talkEnemy.inventory = [];
  talkState.player.stats.intellect = 10;
  talkSim.checkEncounter();
  talkState.encounter.phase = "advantageWindow";
  talkState.encounter.advantage = { owner: "player", source: "vision", bonusAvailable: true };
  talkSim.tryPersuade();

  assert.equal(talkEnemy.combatCount, 0);
  const feedback = talkState.feedbackEvents[talkState.feedbackEvents.length - 1];
  assert.equal(feedback.kind, "persuasion-intel");
  assert.ok(talkState.intel.every((entry) => ["statExact", "item"].includes(entry.kind)));
});

test("left revolver defaults to six shots and spent charges are preserved on inventory slots", () => {
  assert.equal(ITEMS.pistol.maxCharges, 6);
  const sim = new GameSimulation("charge-seed");
  const state = sim.snapshot();
  const pistol = state.map.aiUnits[1].inventory.find((slot) => slot.item.id === "pistol");
  assert.equal(pistol.charges, 6);
  pistol.charges = 2;
  assert.equal(state.map.aiUnits[1].inventory.find((slot) => slot.item.id === "pistol").charges, 2);
});

test("enemy drop keeps remaining charges and ignores empty charged items", () => {
  const sim = new GameSimulation("drop-0");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[1];
  enemy.inventory = [createInventorySlot("salve-tin", 1, { charges: 1 })];

  sim.collectEnemyDrops(enemy);

  const droppedSalve = state.inventory.find((slot) => slot.item.id === "salve-tin");
  assert.equal(droppedSalve.charges, 1);

  const emptySim = new GameSimulation("drop-0");
  const emptyState = emptySim.snapshot();
  const emptyEnemy = emptyState.map.aiUnits[1];
  emptyEnemy.inventory = [createInventorySlot("salve-tin", 1, { charges: 0 })];
  emptySim.collectEnemyDrops(emptyEnemy);

  assert.equal(emptyState.inventory.some((slot) => slot.item.id === "salve-tin"), false);
});

test("enemy defeat guarantees one non-rare recoverable item and reports empty bodies", () => {
  const sim = new GameSimulation("drop-guarantee-seed");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[0];
  enemy.inventory = [createInventorySlot("bandage"), createInventorySlot("thick-cloth")];

  sim.collectEnemyDrops(enemy);

  assert.ok(state.inventory.some((slot) => slot.item.id === "thick-cloth"));
  let feedback = state.feedbackEvents[state.feedbackEvents.length - 1];
  assert.equal(feedback.kind, "loot-drop");
  assert.notEqual(feedback.body.includes("未发现可回收道具"), true);

  const emptySim = new GameSimulation("drop-empty-seed");
  const emptyState = emptySim.snapshot();
  const emptyEnemy = emptyState.map.aiUnits[0];
  emptyEnemy.inventory = [createInventorySlot("pistol", 1, { charges: 0 })];

  emptySim.collectEnemyDrops(emptyEnemy);

  feedback = emptyState.feedbackEvents[emptyState.feedbackEvents.length - 1];
  assert.equal(feedback.kind, "loot-drop");
  assert.ok(feedback.body.includes("未发现可回收道具"));
  assert.equal(emptyState.inventory.some((slot) => slot.item.id === "pistol"), false);
});

test("rare enemy equipment is not guaranteed to drop", () => {
  const sim = new GameSimulation("rare-drop-no-guarantee-seed");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[0];
  enemy.inventory = [createInventorySlot("bandage"), createInventorySlot("long-knife")];

  sim.collectEnemyDrops(enemy);

  assert.equal(state.inventory.some((slot) => slot.item.id === "bandage" || slot.item.id === "long-knife"), false);
  assert.equal(state.feedbackEvents.at(-1).kind, "loot-drop");
});

test("enemy movement state machine chases known player position", () => {
  const sim = new GameSimulation("enemy-move-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((other, index) => {
    other.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  state.player.position = { x: 1, y: 3 };
  enemy.position = { x: 5, y: 3 };
  enemy.previousPosition = { ...enemy.position };
  enemy.awareness = { level: "aware", lastKnownPosition: { x: 3, y: 3 }, source: "memory" };
  enemy.patrol = [];

  sim.moveAiUnits();

  assert.deepEqual(enemy.position, { x: 4, y: 3 });
});

test("enemy movement uses reachable pathing around edge walls instead of getting stuck", () => {
  const sim = new GameSimulation("enemy-path-around-wall-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.map.aiUnits.forEach((other, index) => {
    other.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  state.player.position = { x: 4, y: 2 };
  enemy.position = { x: 2, y: 2 };
  enemy.previousPosition = { ...enemy.position };
  enemy.hp = 12;
  enemy.awareness = { level: "aware", lastKnownPosition: { ...state.player.position }, source: "memory" };
  enemy.patrol = [];
  state.map.wallEdges.add(edgeKeyBetween({ x: 2, y: 2 }, { x: 3, y: 2 }));
  state.map.wallEdges.add(edgeKeyBetween({ x: 2, y: 2 }, { x: 1, y: 2 }));

  sim.moveAiUnits();

  assert.deepEqual(enemy.position, { x: 2, y: 3 });
});

test("enemy seekLoot moves toward reachable uncleared loot", () => {
  const sim = new GameSimulation("enemy-seek-loot-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((other, index) => {
    other.defeated = index !== 0;
  });
  state.map.lootNodes.forEach((node, index) => {
    node.depleted = index !== 0;
  });
  const node = state.map.lootNodes[0];
  const enemy = state.map.aiUnits[0];
  state.player.position = { x: 1, y: 1 };
  enemy.position = { x: node.position.x - 1, y: node.position.y };
  enemy.previousPosition = { ...enemy.position };
  enemy.awareness = { level: "unseen" };
  enemy.patrol = [];

  sim.moveAiUnits();

  assert.deepEqual(enemy.position, node.position);
  assert.equal(enemy.aiState, "seekLoot");
});

test("enemy civil war increments combat counts, causes defeat, and loots spoils", () => {
  const sim = new GameSimulation("civil-war-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index > 1;
  });
  const winner = state.map.aiUnits[0];
  const loser = state.map.aiUnits[1];
  winner.position = { x: 6, y: 6 };
  loser.position = { x: 7, y: 6 };
  winner.stats = { spirit: 3, intellect: 3, strength: 6, speed: 4, constitution: 5 };
  loser.stats = { spirit: 3, intellect: 3, strength: 1, speed: 1, constitution: 1 };
  winner.hp = 12;
  loser.hp = 1;
  winner.inventory = [];
  loser.inventory = [createInventorySlot("bandage")];

  sim.resolveEnemyCivilWars();

  assert.equal(winner.combatCount, 1);
  assert.equal(loser.combatCount, 1);
  assert.equal(loser.defeated, true);
  assert.ok(winner.inventory.some((slot) => slot.item.id === "bandage"));
});

test("enemy pickup scoring adapts to pistol loadout with old magazine", () => {
  const sim = new GameSimulation("enemy-pick-score-seed");
  const enemy = sim.snapshot().map.aiUnits[0];
  enemy.inventory = [createInventorySlot("pistol", 1, { charges: 0 })];

  const chosen = chooseEnemyPickup(enemy, ["old-magazine", "glow", "echo"]);

  assert.equal(chosen, "old-magazine");

  const noGunEnemy = sim.snapshot().map.aiUnits[2];
  noGunEnemy.inventory = [];
  assert.ok(scoreItemForEnemy(enemy, "old-magazine") > scoreItemForEnemy(noGunEnemy, "old-magazine") + 8);
});

test("old magazine cannot reload during combat", () => {
  const sim = new GameSimulation("enemy-reload-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 1;
  });
  const enemy = state.map.aiUnits[1];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.patrol = [{ ...enemy.position }];
  enemy.inventory = [createInventorySlot("pistol", 1, { charges: 0 }), createInventorySlot("old-magazine")];

  sim.checkEncounter();
  sim.playCombatAction({ type: "defend" });

  const pistol = enemy.inventory.find((slot) => slot.item.id === "pistol");
  assert.equal(pistol.charges, 0);
  assert.equal(enemy.inventory.some((slot) => slot.item.id === "old-magazine"), true);
});

test("old magazine reloads over two exploration turns and keeps the tool", () => {
  const sim = new GameSimulation("player-reload-complete-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.player.inventory = [createInventorySlot("pistol", 1, { charges: 1 }), createInventorySlot("old-magazine")];
  state.inventory = state.player.inventory;

  sim.useItem("old-magazine");

  const pistol = state.player.inventory.find((slot) => slot.item.id === "pistol");
  const magazine = state.player.inventory.find((slot) => slot.item.id === "old-magazine");
  assert.equal(state.turn, 2);
  assert.equal(pistol.charges, 3);
  assert.equal(magazine.charges, undefined);
  assert.equal(state.feedbackEvents.some((event) => event.kind === "item-reload" && event.title === "换弹完成"), true);
});

test("old magazine reload fails if an encounter starts during the reload turns", () => {
  const sim = new GameSimulation("player-reload-interrupt-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.inventory = [];
  enemy.position = { x: state.player.position.x + 2, y: state.player.position.y };
  enemy.previousPosition = { ...enemy.position };
  enemy.patrol = [{ ...enemy.position }];
  state.player.inventory = [createInventorySlot("pistol", 1, { charges: 1 }), createInventorySlot("old-magazine")];
  state.inventory = state.player.inventory;

  sim.useItem("old-magazine");

  const pistol = state.player.inventory.find((slot) => slot.item.id === "pistol");
  assert.equal(state.turn, 1);
  assert.equal(pistol.charges, 1);
  assert.ok(state.encounter);
  assert.equal(state.feedbackEvents.some((event) => event.kind === "item-reload" && event.title === "换弹失败"), true);
});

test("enemy can throw long knife from an advantage window", () => {
  const sim = new GameSimulation("enemy-knife-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 1;
  });
  const enemy = state.map.aiUnits[1];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.patrol = [{ ...enemy.position }];
  enemy.inventory = [createInventorySlot("long-knife")];

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  state.encounter.advantage = { owner: "enemy", source: "vision", bonusAvailable: true };
  sim.playCombatAction({ type: "defend" });

  assert.equal(state.player.hp, 10);
  assert.equal(enemy.inventory.some((slot) => slot.item.id === "long-knife"), false);
});

test("combat item effects enter encounter state and modify round damage", () => {
  const sim = new GameSimulation("combat-item-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 12;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("ice-awl")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.useItem("ice-awl");

  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "ice-awl"), true);

  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(enemy.hp, 8);
  assert.ok(state.encounter.log.some((entry) => entry.text.includes("临时伤害 +1")));
});

test("advantage combat items enter pickup pool and player advantage window", () => {
  const advantageItems = ["rib-hook", "ankle-line", "chase-spur", "counter-plate", "panic-nail", "focus-thread"];
  for (const itemId of advantageItems) assert.ok(ITEMS[itemId]);

  const sim = new GameSimulation("player-advantage-item-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 12;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("rib-hook")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "dodge", bonusAvailable: true };
  sim.useItem("rib-hook");

  assert.equal(state.player.inventory.some((slot) => slot.item.id === "rib-hook"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "rib-hook" && effect.ownerId === state.player.id), true);

  state.encounter.phase = "chooseAction";
  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(enemy.hp, 8);
});

test("enemy AI uses advantage-linked combat items when it has momentum", () => {
  const sim = new GameSimulation("enemy-advantage-item-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 2, intellect: 2, strength: 5, speed: 3, constitution: 3 };
  enemy.hp = 14;
  enemy.inventory = [createInventorySlot("rib-hook")];
  state.player.inventory = [];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  state.encounter.advantage = { owner: "enemy", source: "dodge", bonusAvailable: true, playerPoints: 0, enemyPoints: 1 };

  sim.playCombatAction({ type: "defend" });

  assert.equal(enemy.inventory.some((slot) => slot.item.id === "rib-hook"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "rib-hook" && effect.ownerId === enemy.id), true);
});

test("enemy item intel keeps item id metadata for HUD hover details", () => {
  const sim = new GameSimulation("intel-item-hover-seed");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[1];
  enemy.inventory = [createInventorySlot("pistol", 1, { charges: 2 })];
  state.player.inventory = [createInventorySlot("counting-beads")];
  state.inventory = state.player.inventory;

  sim.revealEnemyItem(enemy, "item");

  const itemIntel = state.intel.find((entry) => entry.kind === "item" && entry.targetId === enemy.id);
  assert.equal(itemIntel.itemId, "pistol");
  assert.ok(itemIntel.value.includes("左轮"));
  assert.ok(itemIntel.value.includes("2"));
});

test("suspected intel only uses stat or item formats with confidence", () => {
  const sim = new GameSimulation("suspected-intel-format-seed");
  const state = sim.snapshot();
  const enemy = state.map.aiUnits[0];

  sim.revealBasicIntel(enemy);

  const suspected = state.intel.find((entry) => entry.targetId === enemy.id && entry.certainty === "suspected");
  assert.ok(suspected);
  assert.ok(["statExact", "item"].includes(suspected.kind));
  assert.equal(typeof suspected.confidence, "number");
  assert.ok(/^(精神|智力|力量|速度|体质) = [1-6]$/.test(suspected.value) || /^拥有.+/.test(suspected.value));
  assert.equal(/硬守续战|速度压迫|读牌谈判|攻击方向|暴露/.test(suspected.value), false);
});

test("combat intel can reveal the real next attack direction as structured left or right", () => {
  const sim = new GameSimulation("attack-direction-intel-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  state.player.stats.intellect = 8;

  sim.checkEncounter();
  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  const directionIntel = state.intel.find((entry) => entry.targetId === enemy.id && entry.kind === "attackDirection");
  assert.ok(directionIntel);
  assert.equal(directionIntel.certainty, "confirmed");
  assert.equal(directionIntel.value, directionIntel.attackDirection);
  assert.equal(directionIntel.attackDirectionIndex, 1);
  assert.equal(directionIntel.attackDirectionRound, state.encounter.round + 1);
  assert.equal(directionIntel.attackDirection, attackDirection(enemy.id, state.turn, directionIntel.attackDirectionIndex));
});

test("combat intel type selection distributes stat, item, and attack direction across seeds", () => {
  const revealedKinds = new Set();
  for (let index = 0; index < 45 && revealedKinds.size < 3; index += 1) {
    const sim = new GameSimulation(`intel-kind-distribution-${index}`);
    const state = sim.snapshot();
    state.map.wallEdges.clear();
    state.map.aiUnits.forEach((enemy, enemyIndex) => {
      enemy.defeated = enemyIndex !== 0;
    });
    const enemy = state.map.aiUnits[0];
    enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
    enemy.inventory = [createInventorySlot("pistol")];
    state.player.stats.intellect = 2;

    sim.checkEncounter();
    sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

    const intel = state.intel.find((entry) => entry.targetId === enemy.id);
    if (intel) revealedKinds.add(intel.kind);
  }

  assert.deepEqual([...revealedKinds].sort(), ["attackDirection", "item", "statExact"].sort());
});

test("lens reveals next attack direction and is consumed as an authored one-use item", () => {
  const sim = new GameSimulation("lens-direction-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("lens")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  sim.useItem("lens");

  const directionIntel = state.intel.find((entry) => entry.targetId === enemy.id && entry.kind === "attackDirection");
  assert.equal(directionIntel.attackDirectionIndex, 0);
  assert.equal(directionIntel.attackDirection, attackDirection(enemy.id, state.turn, 0));
  assert.equal(state.player.inventory.some((slot) => slot.item.id === "lens"), false);
});

test("matching the revealed attack direction gives a much stronger dodge than the wrong side", () => {
  const seed = findSeedForDodgeRoll(40, 70);
  const correctSim = setupDodgeDirectionScenario(seed);
  const correctState = correctSim.snapshot();
  const correctEnemy = correctState.map.aiUnits[0];
  const direction = attackDirection(correctEnemy.id, correctState.turn, 0);
  correctSim.resolveActionRound({ type: "dodge", direction }, { type: "attack", mode: "melee" }, correctEnemy);
  assert.equal(correctState.player.hp, 12);

  const wrongSim = setupDodgeDirectionScenario(seed);
  const wrongState = wrongSim.snapshot();
  const wrongEnemy = wrongState.map.aiUnits[0];
  const wrongDirection = direction === "left" ? "right" : "left";
  wrongSim.resolveActionRound({ type: "dodge", direction: wrongDirection }, { type: "attack", mode: "melee" }, wrongEnemy);
  assert.ok(wrongState.player.hp < 12);
});

test("initial loot, enemies, and exit are reachable in the braided maze", () => {
  const sim = new GameSimulation("reachability-seed");
  const state = sim.snapshot();
  const reachable = reachableKeys(state);
  const exitKeys = [];

  for (let y = 0; y < state.map.height; y += 1) {
    for (let x = 0; x < state.map.width; x += 1) {
      if (state.map.tiles[y][x] === "exit") exitKeys.push(`${x},${y}`);
    }
  }

  assert.ok(state.map.lootNodes.every((node) => reachable.has(`${node.position.x},${node.position.y}`)));
  assert.ok(state.map.aiUnits.every((enemy) => reachable.has(`${enemy.position.x},${enemy.position.y}`)));
  assert.ok(exitKeys.every((key) => reachable.has(key)));
});

test("initial enemy patrol points follow open edges", () => {
  const sim = new GameSimulation("patrol-seed");
  const state = sim.snapshot();

  for (const enemy of state.map.aiUnits) {
    assert.ok(enemy.patrol.length >= 2);
    for (let i = 0; i < enemy.patrol.length; i += 1) {
      const from = enemy.patrol[i];
      const to = enemy.patrol[(i + 1) % enemy.patrol.length];
      assert.equal(Math.abs(from.x - to.x) + Math.abs(from.y - to.y), 1);
      assert.equal(hasWallBetween(state, from, to), false);
    }
  }
});

test("all v0.8 pickup items have runtime template ports and effects", () => {
  assert.equal(ALL_ITEM_IDS.length, 141);
  assert.equal(PICKUP_ITEM_POOL.length, 135);

  for (const itemId of PICKUP_ITEM_POOL) {
    const item = ITEMS[itemId];
    assert.ok(item.usage, `${itemId} missing usage`);
    assert.ok(item.ports.length > 0, `${itemId} missing ports`);
    assert.ok(item.effects.length > 0, `${itemId} missing effects`);
    assert.ok(item.counterplay.length > 0, `${itemId} missing counterplay`);
    assert.notEqual(item.effects.every((effect) => effect.kind === "log"), true, `${itemId} only has log effects`);
  }
});

test("v0.8.1 combat status and crit items resolve through the shared runtime", () => {
  const sim = new GameSimulation("new-combat-item-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 12;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("tinder-vial"), createInventorySlot("glass-spike")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.useItem("tinder-vial");

  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "tinder-vial" && effect.stat === "burn"), true);

  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "defend" }, enemy);

  assert.ok(enemy.hp <= 10);

  const critSim = new GameSimulation("new-combat-crit-item-seed");
  const critState = critSim.snapshot();
  critState.map.wallEdges.clear();
  critState.map.aiUnits.forEach((unit, index) => {
    unit.defeated = index !== 0;
  });
  const critEnemy = critState.map.aiUnits[0];
  critEnemy.position = { x: critState.player.position.x + 1, y: critState.player.position.y };
  critEnemy.inventory = [];
  critState.player.inventory = [createInventorySlot("glass-spike")];
  critState.inventory = critState.player.inventory;

  critSim.checkEncounter();
  critState.encounter.phase = "chooseAction";
  critSim.useItem("glass-spike");

  assert.equal(critState.encounter.activeEffects.some((effect) => effect.sourceItemId === "glass-spike" && effect.stat === "critChance"), true);
});

test("v0.8.3 status synergy items convert applied statuses into different effect ports", () => {
  const sim = new GameSimulation("cross-port-status-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 20;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("soot-hook"), createInventorySlot("venom-saw")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  const notes = [];
  sim.applyMeleeStatus(state.player, enemy, "burn", 1, notes);
  state.encounter.triggerChainCount = 0;
  sim.applyMeleeStatus(state.player, enemy, "poison", 1, notes);

  assert.equal(
    state.encounter.activeEffects.some((effect) => effect.sourceItemId === "soot-hook" && effect.stat === "dodge" && effect.targetActorId === enemy.id),
    true
  );
  assert.equal(
    state.encounter.activeEffects.some((effect) => effect.sourceItemId === "venom-saw" && effect.stat === "damage" && effect.ownerId === state.player.id),
    true
  );
});

test("v0.8.3 reaction item can turn incoming melee damage into a bleed counter", () => {
  const sim = new GameSimulation("thorn-plate-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 2, speed: 1, constitution: 1 };
  enemy.hp = 20;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("thorn-plate"), createInventorySlot("blood-knot")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.useItem("thorn-plate");
  sim.resolveActionRound({ type: "defend" }, { type: "attack", mode: "melee" }, enemy);

  assert.equal(state.encounter.statusEffects.some((effect) => effect.targetActorId === enemy.id && effect.type === "bleed"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "blood-knot" && effect.stat === "speed"), true);
});

test("v0.8.9 passive combat-start items apply real stat effects", () => {
  const sim = new GameSimulation("passive-combat-start-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  state.player.inventory = [
    createInventorySlot("lead-wrap"),
    createInventorySlot("ankle-spring"),
    createInventorySlot("cracked-scope")
  ];
  state.inventory = state.player.inventory;

  sim.checkEncounter();

  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "lead-wrap" && effect.stat === "strength"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "ankle-spring" && effect.stat === "speed"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "cracked-scope" && effect.stat === "critChance"), true);
});

test("v0.8.9 timing passive items trigger on first, second, and later rounds", () => {
  const sim = new GameSimulation("passive-timing-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 20;
  enemy.inventory = [createInventorySlot("rust-cloud")];
  state.player.inventory = [createInventorySlot("spark-fuse"), createInventorySlot("second-breath")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.resolveActionRound({ type: "attack", mode: "melee" }, { type: "defend" }, enemy);
  state.encounter.phase = "chooseAction";
  sim.resolveActionRound({ type: "defend" }, { type: "defend" }, enemy);
  state.encounter.phase = "chooseAction";
  sim.resolveActionRound({ type: "defend" }, { type: "defend" }, enemy);

  const passiveLog = state.encounter.log.map((entry) => entry.text).join("\n");
  assert.match(passiveLog, /火星引线/);
  assert.match(passiveLog, /二息带/);
  assert.match(passiveLog, /锈粉囊/);
});

test("v0.8.9 condition passive items respond to status, crit, and guarded hits", () => {
  const sim = new GameSimulation("passive-condition-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  state.player.inventory = [
    createInventorySlot("coal-beads"),
    createInventorySlot("toxin-skein"),
    createInventorySlot("cold-rivet"),
    createInventorySlot("crit-hook"),
    createInventorySlot("guard-breaker")
  ];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  const notes = [];
  sim.applyMeleeStatus(state.player, enemy, "burn", 1, notes);
  sim.applyMeleeStatus(state.player, enemy, "poison", 1, notes);
  state.encounter.triggerChainCount = 0;
  sim.applyMeleeStatus(state.player, enemy, "freeze", 1, notes);
  state.encounter.triggerChainCount = 0;
  sim.triggerCritItemSynergies(state.player, enemy, notes);
  state.encounter.triggerChainCount = 0;
  sim.triggerDefendedHitItemSynergies(state.player, enemy, notes);

  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "coal-beads" && effect.stat === "critChance"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "toxin-skein" && effect.stat === "speed" && effect.targetActorId === enemy.id), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "cold-rivet" && effect.stat === "damage"), true);
  assert.equal(state.encounter.statusEffects.some((effect) => effect.ownerId === state.player.id && effect.targetActorId === enemy.id && effect.type === "bleed"), true);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "guard-breaker" && effect.stat === "damage"), true);
});

test("v0.8.10 passive grid items cover new triggers and resolve real effects", () => {
  assert.equal(PASSIVE_GRID_ITEM_IDS.length, 50);
  assert.equal(PASSIVE_ITEM_RULES.length, 50);
  assert.equal(PASSIVE_GRID_ITEM_IDS.every((itemId) => PICKUP_ITEM_POOL.includes(itemId)), true);
  for (const trigger of [
    "combatStart",
    "firstRound",
    "secondRound",
    "thirdRoundPlus",
    "onDodgeSuccess",
    "onDefendSuccess",
    "onHeavyWoundDealt",
    "onBurnApplied",
    "onPoisonApplied",
    "onFreezeApplied",
    "onCrit",
    "onDamageTaken",
    "onHighDamageDealt",
    "onHeavyWoundTaken",
    "onOneHp",
    "onIntelGain"
  ]) {
    assert.equal(PASSIVE_ITEM_RULES.some((rule) => rule.trigger === trigger), true, `${trigger} should have at least one rule`);
  }

  const sim = new GameSimulation("passive-grid-v0810-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [createInventorySlot("pistol")];
  enemy.hp = 20;
  state.player.inventory = [createInventorySlot("mnemonic-plate")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "mnemonic-plate" && effect.stat === "intellect"), true);

  state.player.inventory = [createInventorySlot("opener-gear")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("firstRound", state.player, enemy);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "opener-gear" && effect.stat === "speed"), true);

  state.player.inventory = [createInventorySlot("second-gear")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("secondRound", state.player, enemy);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "second-gear" && effect.stat === "strength"), true);

  state.player.inventory = [createInventorySlot("long-fuse")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("thirdRoundPlus", state.player, enemy);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "long-fuse" && effect.stat === "burn"), true);

  state.player.inventory = [createInventorySlot("slip-venom")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("onDodgeSuccess", state.player, enemy);
  assert.equal(state.encounter.statusEffects.some((effect) => effect.ownerId === state.player.id && effect.targetActorId === enemy.id && effect.type === "poison"), true);

  state.player.inventory = [createInventorySlot("guard-lens")];
  state.inventory = state.player.inventory;
  const intelBefore = state.intel.length;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("onDefendSuccess", state.player, enemy);
  assert.ok(state.intel.length > intelBefore);

  state.player.inventory = [createInventorySlot("crush-salt")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("onHeavyWoundDealt", state.player, enemy);
  assert.equal(state.encounter.statusEffects.some((effect) => effect.ownerId === state.player.id && effect.targetActorId === enemy.id && effect.type === "freeze"), true);

  state.player.inventory = [createInventorySlot("overrun-chain")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("onHighDamageDealt", state.player, enemy);
  assert.equal(sim.passiveAdvantageOwner, "player");

  state.player.inventory = [createInventorySlot("data-spur")];
  state.inventory = state.player.inventory;
  state.encounter.triggerChainCount = 0;
  sim.applyPassiveRules("onIntelGain", state.player, enemy);
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "data-spur" && effect.stat === "critChance"), true);
});

test("v0.8.3 field utility items mark high-rarity loot and tripwire exposes stat intel", () => {
  const sim = new GameSimulation("red-compass-tripwire-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  disableEnemies(state);
  const enemy = state.map.aiUnits[0];
  enemy.defeated = false;
  enemy.hp = 3;
  enemy.position = { x: state.player.position.x + 4, y: state.player.position.y };
  state.player.facing = "east";
  state.player.inventory = [createInventorySlot("red-compass"), createInventorySlot("tripwire-spool")];
  state.inventory = state.player.inventory;
  state.map.lootNodes.forEach((node, index) => {
    node.depleted = index !== 0;
  });
  state.map.lootNodes[0].position = { x: state.player.position.x + 2, y: state.player.position.y };
  state.map.lootNodes[0].offerItemIds = ["red-compass", "bandage", "ice-awl"];

  sim.useItem("red-compass");
  assert.ok(state.map.hints.some((hint) => hint.x === state.map.lootNodes[0].position.x && hint.y === state.map.lootNodes[0].position.y));

  sim.useItem("tripwire-spool");
  const trap = state.map.traps.find((candidate) => candidate.itemId === "tripwire-spool");
  assert.ok(trap);
  enemy.position = { ...trap.position };
  const hpBefore = enemy.hp;
  sim.triggerTraps();
  assert.ok(enemy.hp < hpBefore);
  assert.equal(state.intel.some((intel) => intel.targetId === enemy.id && intel.kind === "statExact"), true);
});

test("echo needle marks a two-by-two pulse cluster containing the nearest target", () => {
  const sim = new GameSimulation("echo-pulse-cluster-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.hints = [];
  state.map.lootNodes.forEach((node, index) => {
    node.depleted = index !== 0;
  });
  const target = { x: 6, y: 5 };
  state.map.lootNodes[0].position = target;
  state.player.inventory = [createInventorySlot("echo")];
  state.inventory = state.player.inventory;

  sim.useItem("echo");

  const feedback = state.feedbackEvents.at(-1);
  assert.equal(ITEMS.echo.rarity, "rare");
  assert.equal(state.player.inventory.find((slot) => slot.item.id === "echo").charges, undefined);
  assert.equal(state.turn, 1);
  assert.equal(feedback.kind, "echo-pulse");
  assert.equal(feedback.positions.length, 4);
  assert.ok(feedback.positions.some((position) => position.x === target.x && position.y === target.y));
  assert.equal(state.map.hints.length, 4);

  sim.useItem("echo");
  assert.equal(state.player.inventory.some((slot) => slot.item.id === "echo"), true);
  assert.equal(state.turn, 2);
});

test("v0.8.1 field items provide movement, visible item intel, and global intel", () => {
  const sim = new GameSimulation("new-field-item-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  disableEnemies(state);
  const enemy = state.map.aiUnits[0];
  enemy.defeated = false;
  enemy.position = { x: state.player.position.x + 3, y: state.player.position.y };
  enemy.neutralUntilTurn = 10;
  state.player.stats.spirit = 8;
  enemy.inventory = [createInventorySlot("pistol", 1, { charges: 3 })];
  state.player.facing = "east";
  state.player.inventory = [createInventorySlot("signal-mirror"), createInventorySlot("folded-map"), createInventorySlot("runner-knot")];
  state.inventory = state.player.inventory;

  sim.useItem("signal-mirror");
  assert.ok(state.intel.some((intel) => intel.targetId === enemy.id && intel.kind === "item" && intel.itemId === "pistol"));

  const logCount = state.log.length;
  sim.useItem("folded-map");
  assert.ok(state.log.length > logCount);

  enemy.defeated = true;
  const before = { ...state.player.position };
  sim.useItem("runner-knot");
  assert.equal(state.player.position.x, before.x + 2);
});

test("only one active combat item can be manually used in one combat round", () => {
  const sim = new GameSimulation("manual-round-integration-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 20;
  enemy.inventory = [];
  state.player.inventory = [createInventorySlot("pistol", 1, { charges: 2 }), createInventorySlot("ice-awl")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.useItem("pistol");
  const pistolSlot = state.player.inventory.find((slot) => slot.item.id === "pistol");
  assert.equal(pistolSlot.charges, 1);

  sim.useItem("pistol");
  assert.equal(pistolSlot.charges, 1);

  sim.useItem("ice-awl");
  assert.equal(state.encounter.activeEffects.some((effect) => effect.sourceItemId === "ice-awl"), false);
});

test("non-rare active healing item has finite field uses across turns", () => {
  const sim = new GameSimulation("limited-heal-field-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.player.hp = 5;
  state.player.inventory = [createInventorySlot("salve-tin")];
  state.inventory = state.player.inventory;

  sim.useItem("salve-tin");
  assert.equal(state.player.hp, 6);
  assert.equal(state.turn, 1);
  let salve = state.player.inventory.find((slot) => slot.item.id === "salve-tin");
  assert.equal(salve.charges, 1);

  state.player.hp = 5;
  sim.useItem("salve-tin");
  assert.equal(state.player.hp, 6);
  assert.equal(state.turn, 2);
  assert.equal(state.player.inventory.some((slot) => slot.item.id === "salve-tin"), false);
});

test("bandage is rare field-only healing and emits a heal feedback event", () => {
  const sim = new GameSimulation("bandage-field-vfx-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.player.hp = 5;
  state.player.inventory = [createInventorySlot("bandage")];
  state.inventory = state.player.inventory;

  sim.useItem("bandage");

  assert.equal(ITEMS.bandage.rarity, "rare");
  assert.equal(state.player.hp, 8);
  assert.equal(state.turn, 1);
  assert.equal(state.player.inventory.find((slot) => slot.item.id === "bandage").charges, undefined);
  assert.equal(state.feedbackEvents.at(-1).kind, "item-heal");
  assert.deepEqual(state.feedbackEvents.at(-1).origin, state.player.position);

  state.player.hp = 5;
  sim.useItem("bandage");
  assert.equal(state.player.hp, 8);
  assert.equal(state.turn, 2);
  assert.equal(state.player.inventory.some((slot) => slot.item.id === "bandage"), true);
});

test("bandage cannot be used during an encounter even with advantage", () => {
  const sim = new GameSimulation("bandage-combat-blocked-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  state.player.hp = 5;
  state.player.inventory = [createInventorySlot("bandage")];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "advantageWindow";
  state.encounter.advantage = { owner: "player", source: "vision", bonusAvailable: true };
  sim.useItem("bandage");

  assert.equal(state.player.hp, 5);
  assert.equal(state.player.inventory.some((slot) => slot.item.id === "bandage"), true);
});

test("charged healing item is removed only after its authored uses are spent", () => {
  const sim = new GameSimulation("charged-heal-field-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  state.map.lootNodes.forEach((node) => {
    node.depleted = true;
  });
  state.player.hp = 4;
  state.player.inventory = [createInventorySlot("field-ration")];
  state.inventory = state.player.inventory;

  sim.useItem("field-ration");
  const slot = state.player.inventory.find((candidate) => candidate.item.id === "field-ration");
  assert.equal(state.player.hp, 6);
  assert.equal(slot.charges, 1);

  state.player.hp = 4;
  sim.useItem("field-ration");
  assert.equal(state.player.hp, 6);
  assert.equal(state.player.inventory.some((candidate) => candidate.item.id === "field-ration"), false);
});

test("enemy AI can choose and use reusable healing items in combat", () => {
  const sim = new GameSimulation("enemy-ai-heal-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((other, index) => {
    other.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 1, constitution: 1 };
  enemy.hp = 1;
  enemy.inventory = [createInventorySlot("salve-tin")];
  state.player.inventory = [];
  state.inventory = state.player.inventory;

  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  sim.playCombatAction({ type: "defend" });

  assert.equal(enemy.hp, 2);
  assert.equal(enemy.inventory.some((slot) => slot.item.id === "salve-tin"), true);
});

test("field trap variants have distinct real effects when triggered", () => {
  const sim = new GameSimulation("trap-variant-seed");
  const state = sim.snapshot();
  disableEnemies(state);
  const enemy = state.map.aiUnits[0];
  enemy.defeated = false;
  enemy.hp = 2;
  enemy.inventory = [createInventorySlot("bandage")];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  state.map.traps.push({ id: "test-caltrops", ownerId: state.player.id, itemId: "caltrops", position: { ...enemy.position }, armed: true });

  assert.equal(state.map.traps.some((trap) => trap.itemId === "caltrops"), true);
  sim.triggerTraps();

  assert.ok(enemy.hp <= 1);
  assert.ok(state.intel.some((intel) => intel.targetId === enemy.id && intel.kind === "statExact"));
});

test("black cloth reduces enemy sight for two turns until the player attacks", () => {
  const sim = new GameSimulation("black-cloth-seed");
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  disableEnemies(state);
  const enemy = state.map.aiUnits[0];
  enemy.defeated = false;
  enemy.position = { x: state.player.position.x + 3, y: state.player.position.y };
  enemy.neutralUntilTurn = 10;
  enemy.stats = { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 };
  state.player.inventory = [createInventorySlot("black-cloth"), createInventorySlot("pistol", 1, { charges: 1 })];
  state.inventory = state.player.inventory;

  updateVisibilityState(state, 0);
  assert.equal(getVisibility(state, enemy, state.player), "visible");

  sim.useItem("black-cloth");
  assert.notEqual(getVisibility(state, enemy, state.player), "visible");

  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  sim.checkEncounter();
  sim.useItem("pistol");
  assert.equal(state.playerHiddenUntilTurn, undefined);
  assert.equal(state.feedbackEvents.at(-1).kind, "gunshot");
  assert.equal(state.feedbackEvents.at(-1).itemId, "pistol");
  assert.deepEqual(state.feedbackEvents.at(-1).origin, state.player.position);
});

function stepInto(state, target) {
  const from = openNeighbors(state, target)[0];
  assert.ok(from, `target ${target.x},${target.y} should have an open neighbor`);
  return { from, dx: target.x - from.x, dy: target.y - from.y };
}

function legalStepFrom(state, position) {
  const to = openNeighbors(state, position)[0];
  assert.ok(to, `position ${position.x},${position.y} should have a legal step`);
  return { to, dx: to.x - position.x, dy: to.y - position.y };
}

function openNeighbors(state, position) {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 }
  ].filter((next) => canEnter(state, next, position));
}

function reachableKeys(state) {
  const seen = new Set([`${state.player.position.x},${state.player.position.y}`]);
  const queue = [{ ...state.player.position }];
  while (queue.length > 0) {
    const current = queue.shift();
    for (const next of openNeighbors(state, current)) {
      const key = `${next.x},${next.y}`;
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return seen;
}

function setupDodgeDirectionScenario(seed) {
  const sim = new GameSimulation(seed);
  const state = sim.snapshot();
  state.map.wallEdges.clear();
  state.map.aiUnits.forEach((enemy, index) => {
    enemy.defeated = index !== 0;
  });
  const enemy = state.map.aiUnits[0];
  enemy.position = { x: state.player.position.x + 1, y: state.player.position.y };
  enemy.inventory = [];
  enemy.stats = { spirit: 1, intellect: 1, strength: 1, speed: 3, constitution: 1 };
  state.player.stats = { spirit: 3, intellect: 3, strength: 3, speed: 3, constitution: 3 };
  state.player.hp = 12;
  sim.checkEncounter();
  state.encounter.phase = "chooseAction";
  return sim;
}

function findSeedForDodgeRoll(minExclusive, maxExclusive) {
  for (let index = 0; index < 2000; index += 1) {
    const seed = `dodge-direction-roll-${index}`;
    const sim = setupDodgeDirectionScenario(seed);
    const state = sim.snapshot();
    const enemy = state.map.aiUnits[0];
    const roll = rollPercent(seed, `${enemy.id}-attack-${state.turn}`, state.turn, 1);
    if (roll > minExclusive && roll < maxExclusive) return seed;
  }
  throw new Error("No deterministic dodge test seed found.");
}
