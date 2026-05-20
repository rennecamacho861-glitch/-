import Phaser from "phaser";
import { keyOf } from "../sim/map";
import { calculateDerivedStats } from "../sim/stats";
import type { EdgeKey, FeedbackEvent, Position } from "../sim/types";
import type { SimulationReadPort } from "../sim/ports";
import { gridDungeonAssetKey, preloadGridDungeonAssets, type GridDungeonAssetId } from "./gridDungeonAssets";

const TILE = 36;
const OFFSET_X = 72;
const OFFSET_Y = 78;

export class GameScene extends Phaser.Scene {
  private backgroundGraphics?: Phaser.GameObjects.Graphics;
  private overlayGraphics?: Phaser.GameObjects.Graphics;
  private worldLayer?: Phaser.GameObjects.Container;
  private lastFeedbackId?: string;

  constructor(private readonly simulation: SimulationReadPort) {
    super("game");
  }

  preload(): void {
    preloadGridDungeonAssets(this);
  }

  create(): void {
    this.backgroundGraphics = this.add.graphics().setDepth(0);
    this.worldLayer = this.add.container(0, 0).setDepth(1);
    this.overlayGraphics = this.add.graphics().setDepth(2);
    this.input.keyboard?.on("keydown", () => this.draw());
    this.simulation.onChange(() => this.draw());
    this.draw();
  }

  private draw(): void {
    const background = this.backgroundGraphics;
    const overlay = this.overlayGraphics;
    const worldLayer = this.worldLayer;
    if (!background || !overlay || !worldLayer) return;
    const state = this.simulation.snapshot();
    background.clear();
    overlay.clear();
    worldLayer.removeAll(true);

    background.fillStyle(0x050607, 1);
    background.fillRect(0, 0, 960, 640);

    for (let y = 0; y < state.map.height; y += 1) {
      for (let x = 0; x < state.map.width; x += 1) {
        const screenX = OFFSET_X + x * TILE;
        const screenY = OFFSET_Y + y * TILE;
        const positionKey = keyOf({ x, y });
        const explored = state.map.explored.has(positionKey);
        const visible = state.map.visible.has(positionKey);
        const tile = state.map.tiles[y][x];

        if (!explored) continue;

        const tileAsset: GridDungeonAssetId = tile === "exit"
            ? "floor-exit"
            : visible
              ? "floor-lit"
              : "floor-memory";
        const alpha = visible ? 1 : 0.52;
        this.addWorldImage(tileAsset, screenX, screenY, TILE, TILE, alpha);
      }
    }

    this.drawDecorations(state.map.explored, state.map.visible);
    this.drawWalls(state.map.wallEdges, state.map.visible, state.map.explored, state.map.width, state.map.height);

    for (const point of state.map.lootNodes) {
      if (point.depleted || !state.map.explored.has(keyOf(point.position))) continue;
      const screenX = OFFSET_X + point.position.x * TILE;
      const screenY = OFFSET_Y + point.position.y * TILE;
      this.addWorldImage("prop-cache-box", screenX + 5, screenY + 3, 28, 28, state.map.visible.has(keyOf(point.position)) ? 0.96 : 0.52);
    }

    for (const trap of state.map.traps) {
      if (!trap.armed || !state.map.explored.has(keyOf(trap.position))) continue;
      const screenX = OFFSET_X + trap.position.x * TILE;
      const screenY = OFFSET_Y + trap.position.y * TILE;
      this.addWorldImage("item-trap", screenX + 7, screenY + 7, 22, 22, 0.9);
    }

    for (const hint of state.map.hints) {
      const screenX = OFFSET_X + hint.x * TILE;
      const screenY = OFFSET_Y + hint.y * TILE;
      this.addWorldImage("actor-enemy-hint", screenX, screenY, TILE, TILE, 0.72);
    }

    for (const unit of state.map.aiUnits) {
      const visible = state.map.visible.has(keyOf(unit.position));
      const hinted = state.map.hints.some((hint) => hint.x === unit.position.x && hint.y === unit.position.y);
      if (unit.defeated || (!visible && !hinted)) continue;
      const screenX = OFFSET_X + unit.position.x * TILE;
      const screenY = OFFSET_Y + unit.position.y * TILE;
      const close = Math.abs(unit.position.x - state.player.position.x) + Math.abs(unit.position.y - state.player.position.y) <= state.player.stats.spirit + 1;
      if (visible) {
        const enemy = this.addActorImage("actor-enemy", screenX + TILE / 2, screenY + TILE + 5, 34, 68, close ? 1 : 0.58);
        if (!close) enemy.setTint(0x8f7078);
      } else {
        this.addWorldImage("actor-enemy-hint", screenX, screenY, TILE, TILE, 0.42);
      }
    }

    const px = OFFSET_X + state.player.position.x * TILE;
    const py = OFFSET_Y + state.player.position.y * TILE;
    this.addActorImage("actor-player", px + TILE / 2, py + TILE + 5, 34, 68, 1);

    overlay.lineStyle(2, 0xd6c28a, 0.18);
    overlay.strokeCircle(px + TILE / 2, py + TILE / 2, TILE * calculateDerivedStats(state.player.stats).brightVisionRadius);

    overlay.fillStyle(0x050607, state.encounter ? 0.55 : 0.12);
    overlay.fillRect(0, 0, 960, 640);

    const latestFeedback = state.feedbackEvents[state.feedbackEvents.length - 1];
    if (latestFeedback && latestFeedback.id !== this.lastFeedbackId) {
      this.lastFeedbackId = latestFeedback.id;
      this.playFeedbackCue(latestFeedback);
    }
  }

  private playFeedbackCue(event: FeedbackEvent): void {
    if (globalThis.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (event.kind === "echo-pulse") {
      this.playEchoPulse(event);
      this.cameras.main.flash(90, 92, 154, 184, false);
      return;
    }
    if (event.kind === "gunshot") {
      this.playGunshot(event);
      this.cameras.main.flash(90, 238, 190, 98, false);
      this.cameras.main.shake(90, 0.005);
      return;
    }
    if (event.kind === "item-heal") {
      this.playHealPulse(event);
      this.cameras.main.flash(110, 108, 184, 112, false);
      return;
    }
    if (event.tone === "danger") {
      this.cameras.main.flash(140, 184, 52, 52, false);
      this.cameras.main.shake(100, event.kind === "encounter" ? 0.006 : 0.004);
      return;
    }
    if (event.tone === "advantage") {
      this.cameras.main.flash(110, 218, 184, 92, false);
      this.cameras.main.shake(70, 0.002);
      return;
    }
    if (event.tone === "intel") {
      this.cameras.main.flash(90, 92, 154, 184, false);
      return;
    }
    this.cameras.main.flash(70, 140, 150, 158, false);
  }

  private playEchoPulse(event: FeedbackEvent): void {
    if (!event.origin) return;
    const origin = this.toScreenCenter(event.origin);
    for (let index = 0; index < 3; index += 1) {
      const ring = this.add.graphics().setDepth(5);
      this.tweens.addCounter({
        from: 0,
        to: 1,
        delay: index * 120,
        duration: 760,
        ease: "Sine.easeOut",
        onUpdate: (tween) => {
          const value = tween.getValue() ?? 0;
          ring.clear();
          ring.lineStyle(2, 0x70b8ad, 0.68 * (1 - value));
          ring.strokeCircle(origin.x, origin.y, TILE * (0.35 + value * 4.5));
        },
        onComplete: () => ring.destroy()
      });
    }

    if (!event.positions?.length) return;
    const marker = this.add.graphics().setDepth(4);
    marker.lineStyle(2, 0xd88430, 0.84);
    marker.fillStyle(0xd88430, 0.1);
    for (const position of event.positions) {
      const screen = this.toScreenTopLeft(position);
      marker.fillRect(screen.x + 3, screen.y + 3, TILE - 6, TILE - 6);
      marker.strokeRect(screen.x + 3, screen.y + 3, TILE - 6, TILE - 6);
    }
    this.tweens.add({
      targets: marker,
      alpha: 0,
      delay: 760,
      duration: 900,
      ease: "Sine.easeIn",
      onComplete: () => marker.destroy()
    });
  }

  private playGunshot(event: FeedbackEvent): void {
    if (!event.origin || !event.target) return;
    const origin = this.toScreenCenter(event.origin);
    const target = this.toScreenCenter(event.target);
    const shot = this.add.graphics().setDepth(6);
    shot.lineStyle(3, 0xf4cf80, 0.95);
    shot.lineBetween(origin.x, origin.y, target.x, target.y);
    shot.fillStyle(0xf4cf80, 0.92);
    shot.fillCircle(origin.x, origin.y, 6);
    shot.fillStyle(0xc95a4f, 0.76);
    shot.fillCircle(target.x, target.y, 5);
    this.tweens.add({
      targets: shot,
      alpha: 0,
      duration: 260,
      ease: "Quad.easeOut",
      onComplete: () => shot.destroy()
    });
  }

  private playHealPulse(event: FeedbackEvent): void {
    if (!event.origin) return;
    const center = this.toScreenCenter(event.origin);
    const pulse = this.add.graphics().setDepth(6);
    this.tweens.addCounter({
      from: 0,
      to: 1,
      duration: 720,
      ease: "Sine.easeOut",
      onUpdate: (tween) => {
        const value = tween.getValue() ?? 0;
        pulse.clear();
        pulse.lineStyle(3, 0x95c879, 0.78 * (1 - value));
        pulse.strokeCircle(center.x, center.y, TILE * (0.35 + value * 1.6));
        pulse.lineStyle(2, 0xf4cf80, 0.7 * (1 - value));
        pulse.lineBetween(center.x - 8, center.y, center.x + 8, center.y);
        pulse.lineBetween(center.x, center.y - 8, center.x, center.y + 8);
      },
      onComplete: () => pulse.destroy()
    });
  }

  private toScreenTopLeft(position: Position): Position {
    return {
      x: OFFSET_X + position.x * TILE,
      y: OFFSET_Y + position.y * TILE
    };
  }

  private toScreenCenter(position: Position): Position {
    return {
      x: OFFSET_X + position.x * TILE + TILE / 2,
      y: OFFSET_Y + position.y * TILE + TILE / 2
    };
  }

  private drawWalls(
    wallEdges: Set<EdgeKey>,
    visible: Set<string>,
    explored: Set<string>,
    width: number,
    height: number
  ): void {
    for (const edgeKey of wallEdges) {
      const edge = parseEdgeKey(edgeKey);
      const adjacent = adjacentCellsForEdge(edge);
      const exploredEdge = adjacent.some((position) => explored.has(keyOf(position)));
      if (!exploredEdge) continue;
      const visibleEdge = adjacent.some((position) => visible.has(keyOf(position)));
      const alpha = visibleEdge ? 0.95 : 0.38;
      this.drawWallSegment(edge.orientation, edge.x, edge.y, alpha);
    }

    for (let x = 0; x < width; x += 1) {
      const topAlpha = visible.has(keyOf({ x, y: 0 })) ? 0.85 : explored.has(keyOf({ x, y: 0 })) ? 0.36 : 0.16;
      const bottomAlpha = visible.has(keyOf({ x, y: height - 1 })) ? 0.85 : explored.has(keyOf({ x, y: height - 1 })) ? 0.36 : 0.16;
      this.drawWallSegment("h", x, 0, topAlpha);
      this.drawWallSegment("h", x, height, bottomAlpha);
    }
    for (let y = 0; y < height; y += 1) {
      const leftAlpha = visible.has(keyOf({ x: 0, y })) ? 0.85 : explored.has(keyOf({ x: 0, y })) ? 0.36 : 0.16;
      const rightAlpha = visible.has(keyOf({ x: width - 1, y })) ? 0.85 : explored.has(keyOf({ x: width - 1, y })) ? 0.36 : 0.16;
      this.drawWallSegment("v", 0, y, leftAlpha);
      this.drawWallSegment("v", width, y, rightAlpha);
    }
  }

  private drawWallSegment(orientation: "v" | "h", x: number, y: number, alpha: number): void {
    const x1 = OFFSET_X + x * TILE;
    const y1 = OFFSET_Y + y * TILE;
    if (orientation === "v") {
      this.addWorldImage("wall-vertical", x1 - 10, y1 - 4, 20, TILE + 8, alpha);
      return;
    }
    this.addWorldImage("wall-horizontal", x1 - 4, y1 - 10, TILE + 8, 20, alpha);
  }

  private drawDecorations(explored: Set<string>, visible: Set<string>): void {
    this.addDecorationIfExplored("prop-wall-lamp", { x: 7, y: 2 }, explored, visible, -18, -24, 72, 36);
    this.addDecorationIfExplored("prop-debris", { x: 2, y: 8 }, explored, visible, -10, 2, 72, 36);
    this.addDecorationIfExplored("prop-red-leak", { x: 14, y: 4 }, explored, visible, 0, 0, TILE, TILE);
  }

  private addDecorationIfExplored(
    id: GridDungeonAssetId,
    position: Position,
    explored: Set<string>,
    visible: Set<string>,
    offsetX: number,
    offsetY: number,
    width: number,
    height: number
  ): void {
    if (!explored.has(keyOf(position))) return;
    const alpha = visible.has(keyOf(position)) ? 0.72 : 0.32;
    this.addWorldImage(id, OFFSET_X + position.x * TILE + offsetX, OFFSET_Y + position.y * TILE + offsetY, width, height, alpha);
  }

  private addWorldImage(
    id: GridDungeonAssetId,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number
  ): Phaser.GameObjects.Image {
    const image = this.add.image(x, y, gridDungeonAssetKey(id)).setOrigin(0, 0).setDisplaySize(width, height).setAlpha(alpha);
    this.worldLayer?.add(image);
    return image;
  }

  private addActorImage(
    id: GridDungeonAssetId,
    x: number,
    y: number,
    width: number,
    height: number,
    alpha: number
  ): Phaser.GameObjects.Image {
    const image = this.add.image(x, y, gridDungeonAssetKey(id)).setOrigin(0.5, 1).setDisplaySize(width, height).setAlpha(alpha);
    this.worldLayer?.add(image);
    return image;
  }
}

function parseEdgeKey(edgeKey: EdgeKey): { orientation: "v" | "h"; x: number; y: number } {
  const [orientation, rest] = edgeKey.split(":") as ["v" | "h", string];
  const [x, y] = rest.split(",").map(Number);
  return { orientation, x, y };
}

function adjacentCellsForEdge(edge: { orientation: "v" | "h"; x: number; y: number }): Position[] {
  if (edge.orientation === "v") {
    return [
      { x: edge.x - 1, y: edge.y },
      { x: edge.x, y: edge.y }
    ];
  }
  return [
    { x: edge.x, y: edge.y - 1 },
    { x: edge.x, y: edge.y }
  ];
}
