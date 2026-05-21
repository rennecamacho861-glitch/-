import { createInventorySlot, ITEMS, PICKUP_ITEM_POOL } from "./items";
import {
  RARE_ITEM_MAX_APPEARANCES,
  createWeightedItemOffer,
  registerItemAppearance,
  type LootOfferSource,
  type RareItemAppearanceCounts
} from "./systems/itemBalanceSystem";
import { rollNaturalItemAffix } from "./systems/enchantmentSystem";
import { hashInput } from "./systems/randomSystem";
import type { ActorState, Direction, EdgeKey, InventorySlot, ItemId, LootNode, MapState, Position, StatBlock, TileKind } from "./types";

const LAYOUT = [
  ".................",
  ".P...............",
  ".................",
  ".................",
  ".................",
  ".................",
  ".................",
  ".................",
  ".................",
  ".................",
  ".................",
  "...............E.",
  "................."
];

const LOOT_POSITIONS: Position[] = [
  { x: 12, y: 3 },
  { x: 5, y: 1 },
  { x: 14, y: 1 },
  { x: 2, y: 2 },
  { x: 8, y: 2 },
  { x: 15, y: 2 },
  { x: 3, y: 3 },
  { x: 7, y: 3 },
  { x: 1, y: 4 },
  { x: 10, y: 4 },
  { x: 15, y: 4 },
  { x: 4, y: 5 },
  { x: 8, y: 5 },
  { x: 12, y: 5 },
  { x: 2, y: 6 },
  { x: 6, y: 6 },
  { x: 11, y: 6 },
  { x: 15, y: 6 },
  { x: 3, y: 7 },
  { x: 9, y: 7 },
  { x: 13, y: 7 },
  { x: 1, y: 8 },
  { x: 5, y: 8 },
  { x: 10, y: 8 },
  { x: 15, y: 8 },
  { x: 4, y: 9 },
  { x: 8, y: 9 },
  { x: 12, y: 9 },
  { x: 6, y: 11 },
  { x: 13, y: 11 }
];

type InternalEdge = {
  key: EdgeKey;
  from: Position;
  to: Position;
  axis: "horizontal" | "vertical";
};

const MAX_STRAIGHT_OPEN_EDGES = 4;
const ENEMY_SURNAMES = ["陈", "林", "赵", "沈", "顾", "许", "周", "宋", "唐", "韩", "陆", "秦"];
const ENEMY_GIVEN = ["岚", "朔", "栀", "烬", "砚", "舟", "临", "照", "衡", "隼", "棠", "珩", "霁", "峤", "隅", "澈"];

const STARTER_RARE_ITEMS: ItemId[] = ["echo", "pistol", "bandage", "photon-cut"];

/** Creates the fixed prototype map with tile contents, edge-wall blockers, and rare generation counts. */
export function createMap(seed: string): { map: MapState; playerStart: Position; rareItemAppearances: RareItemAppearanceCounts } {
  const tiles: TileKind[][] = [];
  let playerStart: Position = { x: 1, y: 1 };
  const wallEdges = createWallEdges(seed);
  const rareItemAppearances = createStarterRareItemAppearances();
  const aiUnits = createEnemies(seed, wallEdges, rareItemAppearances);
  const lootNodes = createLootNodes(seed, rareItemAppearances);

  for (let y = 0; y < LAYOUT.length; y += 1) {
    const row: TileKind[] = [];
    for (let x = 0; x < LAYOUT[y].length; x += 1) {
      const char = LAYOUT[y][x];
      if (char === "E") row.push("exit");
      else row.push("floor");

      if (char === "P") playerStart = { x, y };
    }
    tiles.push(row);
  }

  return {
    playerStart,
    map: {
      width: LAYOUT[0].length,
      height: LAYOUT.length,
      tiles,
      wallEdges,
      explored: new Set<string>(),
      visible: new Set<string>(),
      lootNodes,
      aiUnits,
      traps: [],
      hints: []
    },
    rareItemAppearances
  };
}

function createWallEdges(seed: string): Set<EdgeKey> {
  const wallEdges = new Set<EdgeKey>();
  const width = LAYOUT[0].length;
  const height = LAYOUT.length;
  const edges = createInternalEdges(width, height);

  reduceOpenRooms(wallEdges, edges, seed, width, height);
  breakLongRuns(wallEdges, edges, seed, width, height);
  reduceOpenRooms(wallEdges, edges, seed, width, height);
  tightenBraids(wallEdges, edges, seed, width, height);

  return wallEdges;
}

function createInternalEdges(width: number, height: number): InternalEdge[] {
  const edges: InternalEdge[] = [];
  for (let y = 0; y < height; y += 1) {
    for (let x = 1; x < width; x += 1) {
      edges.push({ key: verticalEdgeKey(x, y), from: { x: x - 1, y }, to: { x, y }, axis: "horizontal" });
    }
  }
  for (let y = 1; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      edges.push({ key: horizontalEdgeKey(x, y), from: { x, y: y - 1 }, to: { x, y }, axis: "vertical" });
    }
  }
  return edges;
}

function breakLongRuns(wallEdges: Set<EdgeKey>, edges: InternalEdge[], seed: string, width: number, height: number): void {
  for (let pass = 0; pass < 200; pass += 1) {
    const candidates = longRunBreakCandidates(wallEdges, seed, width, height);
    if (candidates.length === 0) return;
    const added = candidates.some((edge) => tryBreakRunWall(wallEdges, edges, edge, seed, width, height));
    if (!added) break;
  }

  for (const edge of seededOrder(edges, seed, "straight-fallback")) {
    if (maxStraightRun(wallEdges, width, height) <= MAX_STRAIGHT_OPEN_EDGES) return;
    tryBreakRunWall(wallEdges, edges, edge, seed, width, height);
  }
}

function reduceOpenRooms(wallEdges: Set<EdgeKey>, edges: InternalEdge[], seed: string, width: number, height: number): void {
  for (let pass = 0; pass < width * height; pass += 1) {
    const openRoom = findOpenRoom(wallEdges, width, height);
    if (!openRoom) return;
    const candidates = seededOrder(edges, seed, `open-room-${pass}`).filter(
      (edge) => isSamePosition(edge.from, openRoom) || isSamePosition(edge.to, openRoom)
    );
    const added = candidates.some((edge) => tryAddWall(wallEdges, edge, width, height));
    if (!added) return;
  }
}

function tightenBraids(wallEdges: Set<EdgeKey>, edges: InternalEdge[], seed: string, width: number, height: number): void {
  let changed = true;
  let pass = 0;
  while (changed && pass < 6) {
    changed = false;
    for (const edge of seededOrder(edges, seed, `tighten-${pass}`)) {
      if (tryAddWall(wallEdges, edge, width, height)) changed = true;
    }
    pass += 1;
  }
}

function tryAddWall(wallEdges: Set<EdgeKey>, edge: InternalEdge, width: number, height: number): boolean {
  if (wallEdges.has(edge.key)) return false;
  if (openDegree(wallEdges, edge.from, width, height) <= 2 || openDegree(wallEdges, edge.to, width, height) <= 2) return false;

  wallEdges.add(edge.key);
  if (!isFullyConnected(wallEdges, width, height)) {
    wallEdges.delete(edge.key);
    return false;
  }
  return true;
}

function longRunBreakCandidates(wallEdges: Set<EdgeKey>, seed: string, width: number, height: number): InternalEdge[] {
  const candidates: Array<InternalEdge & { runLength: number }> = [];

  for (let y = 0; y < height; y += 1) {
    let start = 0;
    for (let x = 0; x < width; x += 1) {
      const open = x < width - 1 && !wallEdges.has(verticalEdgeKey(x + 1, y));
      if (open) continue;
      const end = x - 1;
      const runLength = end - start + 1;
      if (runLength > MAX_STRAIGHT_OPEN_EDGES) {
        const center = start + Math.floor(runLength / 2);
        for (let breakX = start; breakX <= end; breakX += 1) {
          candidates.push({
            key: verticalEdgeKey(breakX + 1, y),
            from: { x: breakX, y },
            to: { x: breakX + 1, y },
            axis: "horizontal",
            runLength: runLength * 100 - Math.abs(center - breakX)
          });
        }
      }
      start = x + 1;
    }
  }

  for (let x = 0; x < width; x += 1) {
    let start = 0;
    for (let y = 0; y < height; y += 1) {
      const open = y < height - 1 && !wallEdges.has(horizontalEdgeKey(x, y + 1));
      if (open) continue;
      const end = y - 1;
      const runLength = end - start + 1;
      if (runLength > MAX_STRAIGHT_OPEN_EDGES) {
        const center = start + Math.floor(runLength / 2);
        for (let breakY = start; breakY <= end; breakY += 1) {
          candidates.push({
            key: horizontalEdgeKey(x, breakY + 1),
            from: { x, y: breakY },
            to: { x, y: breakY + 1 },
            axis: "vertical",
            runLength: runLength * 100 - Math.abs(center - breakY)
          });
        }
      }
      start = y + 1;
    }
  }

  return candidates.sort(
    (a, b) =>
      b.runLength - a.runLength ||
      hashInput(`${seed}-long-run-${a.key}`) - hashInput(`${seed}-long-run-${b.key}`)
  );
}

function tryBreakRunWall(
  wallEdges: Set<EdgeKey>,
  edges: InternalEdge[],
  edge: InternalEdge,
  seed: string,
  width: number,
  height: number
): boolean {
  if (tryAddWall(wallEdges, edge, width, height)) return true;
  if (wallEdges.has(edge.key)) return false;

  const opened: EdgeKey[] = [];
  for (const point of [edge.from, edge.to]) {
    if (openDegree(wallEdges, point, width, height) > 2) continue;
    const support = seededOrder(edges, seed, `support-${edge.key}-${keyOf(point)}`).find((candidate) => {
      if (!wallEdges.has(candidate.key) || candidate.key === edge.key) return false;
      if (!isSamePosition(candidate.from, point) && !isSamePosition(candidate.to, point)) return false;
      const other = isSamePosition(candidate.from, point) ? candidate.to : candidate.from;
      return openDegree(wallEdges, other, width, height) < 3;
    });
    if (!support) {
      for (const key of opened) wallEdges.add(key);
      return false;
    }
    wallEdges.delete(support.key);
    opened.push(support.key);
  }

  wallEdges.add(edge.key);
  if (!isFullyConnected(wallEdges, width, height) || hasOpenRoom(wallEdges, width, height)) {
    wallEdges.delete(edge.key);
    for (const key of opened) wallEdges.add(key);
    return false;
  }
  return true;
}

function findOpenRoom(wallEdges: Set<EdgeKey>, width: number, height: number): Position | undefined {
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const position = { x, y };
      if (openDegree(wallEdges, position, width, height) > 3) return position;
    }
  }
  return undefined;
}

function hasOpenRoom(wallEdges: Set<EdgeKey>, width: number, height: number): boolean {
  return findOpenRoom(wallEdges, width, height) !== undefined;
}

function openDegree(wallEdges: Set<EdgeKey>, position: Position, width: number, height: number): number {
  return openNeighborsForEdges(position, wallEdges, width, height).length;
}

function openNeighborsForEdges(position: Position, wallEdges: Set<EdgeKey>, width: number, height: number): Position[] {
  return [
    { x: position.x + 1, y: position.y },
    { x: position.x - 1, y: position.y },
    { x: position.x, y: position.y + 1 },
    { x: position.x, y: position.y - 1 }
  ].filter((next) => isInBounds(next, width, height) && !hasWallInSet(wallEdges, position, next));
}

function isFullyConnected(wallEdges: Set<EdgeKey>, width: number, height: number): boolean {
  const seen = new Set<string>(["0,0"]);
  const queue: Position[] = [{ x: 0, y: 0 }];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    for (const next of openNeighborsForEdges(current, wallEdges, width, height)) {
      const key = keyOf(next);
      if (seen.has(key)) continue;
      seen.add(key);
      queue.push(next);
    }
  }
  return seen.size === width * height;
}

function maxStraightRun(wallEdges: Set<EdgeKey>, width: number, height: number): number {
  let maxRun = 0;
  for (let y = 0; y < height; y += 1) {
    let run = 0;
    for (let x = 0; x < width - 1; x += 1) {
      if (!wallEdges.has(verticalEdgeKey(x + 1, y))) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
  }
  for (let x = 0; x < width; x += 1) {
    let run = 0;
    for (let y = 0; y < height - 1; y += 1) {
      if (!wallEdges.has(horizontalEdgeKey(x, y + 1))) {
        run += 1;
        maxRun = Math.max(maxRun, run);
      } else {
        run = 0;
      }
    }
  }
  return maxRun;
}

function seededOrder<T extends { key: string }>(items: T[], seed: string, label: string): T[] {
  return [...items].sort((a, b) => hashInput(`${seed}-${label}-${a.key}`) - hashInput(`${seed}-${label}-${b.key}`));
}

function hasWallInSet(wallEdges: Set<EdgeKey>, from: Position, to: Position): boolean {
  const edgeKey = edgeKeyBetween(from, to);
  return edgeKey === undefined || wallEdges.has(edgeKey);
}

function isInBounds(position: Position, width: number, height: number): boolean {
  return position.x >= 0 && position.y >= 0 && position.x < width && position.y < height;
}

function createLootNodes(seed: string, rareItemAppearances: RareItemAppearanceCounts): LootNode[] {
  return LOOT_POSITIONS.map((position, index) => ({
    id: `loot-${index}`,
    position: { ...position },
    depleted: false,
    offerItemIds: createLootOffer(seed, index, "map", rareItemAppearances)
  }));
}

/** Creates a deterministic three-choice loot offer from rarity weights. */
export function createLootOffer(
  seed: string,
  index: number,
  source: LootOfferSource = "map",
  rareItemAppearances?: RareItemAppearanceCounts
): [ItemId, ItemId, ItemId] {
  return createWeightedItemOffer(PICKUP_ITEM_POOL, ITEMS, seed, `loot-${index}`, source, rareItemAppearances);
}

function createEnemies(seed: string, wallEdges: Set<EdgeKey>, rareItemAppearances: RareItemAppearanceCounts): ActorState[] {
  const enemies = [
    createEnemy({
      id: "ai-1",
      name: "巡桌人",
      position: { x: 9, y: 3 },
      stats: { spirit: 3, intellect: 3, strength: 2, speed: 2, constitution: 5 },
      patrol: createPatrol(seed, "ai-1", { x: 9, y: 3 }, wallEdges),
      inventory: [createInitialEnemySlot("bandage", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-2",
      name: "扣牌客",
      position: { x: 5, y: 9 },
      stats: { spirit: 5, intellect: 3, strength: 2, speed: 4, constitution: 1 },
      patrol: createPatrol(seed, "ai-2", { x: 5, y: 9 }, wallEdges),
      inventory: [createInitialEnemySlot("pistol", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-3",
      name: "裂牌手",
      position: { x: 14, y: 3 },
      stats: { spirit: 2, intellect: 5, strength: 3, speed: 4, constitution: 1 },
      patrol: createPatrol(seed, "ai-3", { x: 14, y: 3 }, wallEdges),
      inventory: [createInitialEnemySlot("glow", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-4",
      name: "重拳客",
      position: { x: 3, y: 5 },
      stats: { spirit: 4, intellect: 2, strength: 5, speed: 2, constitution: 2 },
      patrol: createPatrol(seed, "ai-4", { x: 3, y: 5 }, wallEdges),
      inventory: [createInitialEnemySlot("thick-cloth", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-5",
      name: "守灯人",
      position: { x: 10, y: 6 },
      stats: { spirit: 2, intellect: 4, strength: 1, speed: 3, constitution: 5 },
      patrol: createPatrol(seed, "ai-5", { x: 10, y: 6 }, wallEdges),
      inventory: [createInitialEnemySlot("bandage", rareItemAppearances, "field-ration", seed)]
    }),
    createEnemy({
      id: "ai-6",
      name: "听墙者",
      position: { x: 15, y: 7 },
      stats: { spirit: 5, intellect: 2, strength: 3, speed: 3, constitution: 2 },
      patrol: createPatrol(seed, "ai-6", { x: 15, y: 7 }, wallEdges),
      inventory: [createInitialEnemySlot("echo", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-7",
      name: "快腿客",
      position: { x: 6, y: 10 },
      stats: { spirit: 3, intellect: 5, strength: 1, speed: 4, constitution: 2 },
      patrol: createPatrol(seed, "ai-7", { x: 6, y: 10 }, wallEdges),
      inventory: [createInitialEnemySlot("soft-shoes", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-8",
      name: "刀背人",
      position: { x: 11, y: 10 },
      stats: { spirit: 2, intellect: 2, strength: 5, speed: 4, constitution: 2 },
      patrol: createPatrol(seed, "ai-8", { x: 11, y: 10 }, wallEdges),
      inventory: [createInitialEnemySlot("long-knife", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-9",
      name: "硬壳客",
      position: { x: 2, y: 11 },
      stats: { spirit: 4, intellect: 3, strength: 2, speed: 1, constitution: 5 },
      patrol: createPatrol(seed, "ai-9", { x: 2, y: 11 }, wallEdges),
      inventory: [createInitialEnemySlot("bracer", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-10",
      name: "急袭者",
      position: { x: 14, y: 10 },
      stats: { spirit: 3, intellect: 2, strength: 4, speed: 5, constitution: 1 },
      patrol: createPatrol(seed, "ai-10", { x: 14, y: 10 }, wallEdges),
      inventory: [createInitialEnemySlot("throwing-knife", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-11",
      name: "临场者",
      position: { x: 7, y: 2 },
      stats: { spirit: 4, intellect: 4, strength: 2, speed: 3, constitution: 2 },
      patrol: createPatrol(seed, "ai-11", { x: 7, y: 2 }, wallEdges),
      inventory: [createInitialEnemySlot("stitch-kit", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-12",
      name: "绕行者",
      position: { x: 12, y: 4 },
      stats: { spirit: 2, intellect: 3, strength: 4, speed: 4, constitution: 2 },
      patrol: createPatrol(seed, "ai-12", { x: 12, y: 4 }, wallEdges),
      inventory: [createInitialEnemySlot("smoke-needle", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-13",
      name: "守伤者",
      position: { x: 4, y: 7 },
      stats: { spirit: 3, intellect: 2, strength: 2, speed: 3, constitution: 5 },
      patrol: createPatrol(seed, "ai-13", { x: 4, y: 7 }, wallEdges),
      inventory: [createInitialEnemySlot("salve-tin", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-14",
      name: "碎响者",
      position: { x: 8, y: 10 },
      stats: { spirit: 3, intellect: 5, strength: 3, speed: 2, constitution: 2 },
      patrol: createPatrol(seed, "ai-14", { x: 8, y: 10 }, wallEdges),
      inventory: [createInitialEnemySlot("glass-spike", rareItemAppearances, "glow", seed)]
    }),
    createEnemy({
      id: "ai-15",
      name: "伏线者",
      position: { x: 13, y: 8 },
      stats: { spirit: 4, intellect: 3, strength: 3, speed: 1, constitution: 4 },
      patrol: createPatrol(seed, "ai-15", { x: 13, y: 8 }, wallEdges),
      inventory: [createInitialEnemySlot("caltrops", rareItemAppearances, "glow", seed)]
    })
  ];
  enemies.forEach((enemy, index) => {
    enemy.name = createEnemyName(seed, index + 1);
  });
  return enemies;
}

function createStarterRareItemAppearances(): RareItemAppearanceCounts {
  const counts: RareItemAppearanceCounts = {};
  for (const itemId of STARTER_RARE_ITEMS) registerItemAppearance(counts, ITEMS, itemId, RARE_ITEM_MAX_APPEARANCES);
  return counts;
}

function createInitialEnemySlot(
  itemId: ItemId,
  rareItemAppearances: RareItemAppearanceCounts,
  fallbackItemId: ItemId = "glow",
  seed = "initial"
): InventorySlot {
  const selectedItemId = registerItemAppearance(rareItemAppearances, ITEMS, itemId, RARE_ITEM_MAX_APPEARANCES) ? itemId : fallbackItemId;
  if (selectedItemId !== itemId) registerItemAppearance(rareItemAppearances, ITEMS, selectedItemId, RARE_ITEM_MAX_APPEARANCES);
  return createInventorySlot(selectedItemId, 1, {
    affix: rollNaturalItemAffix(seed, `enemy-start-${selectedItemId}`, selectedItemId)
  });
}

function createEnemyName(seed: string, index: number): string {
  const surname = ENEMY_SURNAMES[hashInput(`${seed}-enemy-surname-${index}`) % ENEMY_SURNAMES.length];
  const given = ENEMY_GIVEN[hashInput(`${seed}-enemy-given-${index}`) % ENEMY_GIVEN.length];
  const number = String(hashInput(`${seed}-enemy-number-${index}`) % 100).padStart(2, "0");
  return `${surname}${given}-${number}`;
}

function createPatrol(seed: string, enemyId: string, origin: Position, wallEdges: Set<EdgeKey>): Position[] {
  const width = LAYOUT[0].length;
  const height = LAYOUT.length;
  const neighbors = openNeighborsForEdges(origin, wallEdges, width, height).sort(
    (a, b) => hashInput(`${seed}-${enemyId}-patrol-${keyOf(a)}`) - hashInput(`${seed}-${enemyId}-patrol-${keyOf(b)}`)
  );
  if (neighbors.length === 0) return [origin];
  if (neighbors.length === 1) return [origin, neighbors[0]];
  return [origin, neighbors[0], origin, neighbors[1]];
}

function createEnemy(input: {
  id: string;
  name: string;
  position: Position;
  stats: StatBlock;
  patrol: Position[];
  inventory: ActorState["inventory"];
  enemyTier?: "normal" | "elite";
}): ActorState {
  return {
    id: input.id,
    name: input.name,
    faction: "enemy",
    position: { ...input.position },
    previousPosition: { ...input.position },
    facing: "south",
    stats: input.stats,
    hp: 6 + input.stats.constitution * 2,
    combatCount: 0,
    inventory: input.inventory,
    defeated: false,
    enemyTier: input.enemyTier ?? "normal",
    patrol: input.patrol,
    patrolIndex: 0,
    awareness: { level: "unseen" },
    aiState: "patrol"
  };
}

/** Returns the stable set key for a grid position. */
export function keyOf(position: Position): string {
  return `${position.x},${position.y}`;
}

/** Returns a normalized vertical edge-wall key. */
export function verticalEdgeKey(x: number, y: number): EdgeKey {
  return `v:${x},${y}`;
}

/** Returns a normalized horizontal edge-wall key. */
export function horizontalEdgeKey(x: number, y: number): EdgeKey {
  return `h:${x},${y}`;
}

/** Returns the normalized edge key crossed by one adjacent step. */
export function edgeKeyBetween(from: Position, to: Position): EdgeKey | undefined {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  if (Math.abs(dx) + Math.abs(dy) !== 1) return undefined;
  if (dx !== 0) return verticalEdgeKey(Math.max(from.x, to.x), from.y);
  return horizontalEdgeKey(from.x, Math.max(from.y, to.y));
}

/** Returns whether two positions point to the same grid cell. */
export function isSamePosition(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

/** Returns Manhattan distance between two grid cells. */
export function distance(a: Position, b: Position): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

/** Converts a movement delta into the closest cardinal facing direction. */
export function directionFromDelta(dx: number, dy: number): Direction {
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? "east" : "west";
  if (dy !== 0) return dy > 0 ? "south" : "north";
  return "south";
}

/** Returns a short Chinese label for a cardinal direction. */
export function directionLabel(direction: Direction): string {
  return direction === "north" ? "北" : direction === "south" ? "南" : direction === "west" ? "西" : "东";
}
