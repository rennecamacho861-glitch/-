import Phaser from "phaser";
import type { SimulationReadPort } from "../sim/ports";
import { GameScene } from "./GameScene";

/**
 * Starts the Phaser playfield against the read-only simulation port.
 *
 * Keeping this bootstrap out of `main.ts` lets the DOM HUD and simulation load
 * without putting Phaser in the initial application chunk.
 */
export function startPhaserGame(simulation: SimulationReadPort): Phaser.Game {
  return new Phaser.Game({
    type: Phaser.AUTO,
    parent: "game-root",
    width: 960,
    height: 640,
    backgroundColor: "#0c0f12",
    pixelArt: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [new GameScene(simulation)]
  });
}
