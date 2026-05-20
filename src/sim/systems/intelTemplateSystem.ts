import { ITEMS } from "../items";
import type { GameState } from "../types";

export type GlobalIntelTemplateId = "enemy-average-speed" | "enemy-average-strength" | "most-equipped-actor";

/**
 * Creates a runtime-calculated global intel line. Templates may contain prose,
 * but all numbers and actor/item names are read from the current GameState.
 */
export function createGlobalIntelLine(state: GameState, templateId: GlobalIntelTemplateId): string {
  const enemies = state.map.aiUnits.filter((enemy) => !enemy.defeated);
  if (templateId === "enemy-average-speed") return `全场敌人平均速度 = ${average(enemies.map((enemy) => enemy.stats.speed))}`;
  if (templateId === "enemy-average-strength") return `全场敌人平均力量 = ${average(enemies.map((enemy) => enemy.stats.strength))}`;
  const actors = [state.player, ...enemies];
  const richest = actors.sort((a, b) => b.inventory.length - a.inventory.length)[0];
  const topItem = richest.inventory[0]?.item.id;
  const suffix = topItem ? `，首件道具 = ${ITEMS[topItem].name}` : "";
  return `当前携带道具最多角色 = ${richest.name}，道具数 = ${richest.inventory.length}${suffix}`;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 10) / 10;
}
