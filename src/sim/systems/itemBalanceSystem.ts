import type { ItemDefinition, ItemId, ItemRarity } from "../types";
import { hashInput } from "./randomSystem";
import { rollMythicGemItem } from "./enchantmentSystem";

export type LootOfferSource = "map" | "airdrop";
export type RareItemAppearanceCounts = Partial<Record<ItemId, number>>;
export type ItemOfferOptions = {
  rarityWeights?: Partial<Record<ItemRarity, number>>;
  mythicGemChance?: number;
};

export const RARE_ITEM_MAX_APPEARANCES = 2;
export const RARE_ITEM_DROP_CHANCE = 8;

export const ITEM_POWER_SCORE_LIMIT = 6.0;

export const ITEM_POWER_THRESHOLDS = {
  uncommonMin: 2.5,
  rareMin: 4.5
} as const;

export const RARITY_PICKUP_WEIGHTS: Record<LootOfferSource, Record<ItemRarity, number>> = {
  map: { common: 72, uncommon: 23, rare: 5, mythic: 0 },
  airdrop: { common: 45, uncommon: 40, rare: 15, mythic: 0 }
};

export const RARITY_LOOT_VALUE: Record<ItemRarity, number> = {
  common: 1,
  uncommon: 2,
  rare: 3,
  mythic: 5
};

export const RARITY_ENEMY_BASE_SCORE: Record<ItemRarity, number> = {
  common: 2,
  uncommon: 3,
  rare: 4,
  mythic: 6
};

const EFFECT_KEY_POWER: Record<string, number> = {
  "ranged-shot": 5.5,
  "heal-3": 4.5,
  "first-attack-and-throw": 5.0,
  "alarm-trap": 2.2,
  "reveal-item-on-dodge": 1.8,
  "vision-boost": 2.2,
  "nearest-signal": 4.5,
  "first-hit-damage": 1.8,
  "heavy-threshold-minus": 1.9,
  "dodge-penalty": 2.0,
  "short-throw": 3.2,
  "tie-strength": 1.6,
  "temporary-melee-damage": 3.0,
  "speed-trap": 2.8,
  "flee-penalty": 3.0,
  "minor-dot": 3.0,
  "pistol-ammo": 4.6,
  "first-melee-reduce": 1.8,
  "first-defend-bonus": 2.7,
  "smoke-flee": 3.1,
  "ignore-heavy-wound": 1.9,
  "cleanse-or-heal-1": 1.5,
  "breakable-damage-reduce": 3.0,
  "first-dodge-flee": 2.2,
  "ambush-reduce": 1.6,
  "temporary-speed": 3.0,
  "debuff-duration-reduce": 2.8,
  "reveal-speed-stat": 2.6,
  "next-attack-direction": 3.0,
  "reveal-charges": 1.2,
  "extra-stat-intel": 1.7,
  "mark-enemy": 2.6,
  "visibility-reduce": 2.8,
  "equipment-alarm": 2.7,
  "smoke-flash-immunity": 1.2,
  "persuasion-payment": 2.6,
  "lure-step": 2.0,
  "advantage-next-melee-damage": 3.0,
  "advantage-photon-cut": 5.8,
  "advantage-dodge-penalty": 3.1,
  "advantage-speed": 3.0,
  "advantage-incoming-reduce": 2.6,
  "advantage-flee-penalty": 2.8,
  "advantage-dodge-boost": 2.9,
  "round-two-stat-or-item": 1.9,
  "next-melee-damage": 2.0,
  "round-crit": 0.8,
  "next-hit-burn": 2.8,
  "next-hit-poison": 3.2,
  "next-hit-bleed": 3.2,
  "next-hit-freeze": 4.7,
  "cleanse-poison-heal": 2.6,
  "charcoal-cleanse-heal": 2.2,
  "cleanse-burn-freeze-shield": 2.8,
  "visible-item-intel": 2.0,
  "global-intel": 2.8,
  "two-step-move": 3.2,
  "flare-vision": 4.5,
  "burn-dodge-synergy": 2.8,
  "poison-damage-synergy": 3.0,
  "bleed-speed-synergy": 2.8,
  "freeze-guard-synergy": 3.1,
  "dodge-crit-intel": 3.0,
  "cleanse-status-to-damage": 3.2,
  "bleed-trap-intel": 3.0,
  "rare-loot-signal": 2.0,
  "dodge-poison-counter": 3.1,
  "thorn-counter-bleed": 2.9,
  "heal-1": 2.0,
  "field-heal-2": 2.2,
  "advantage-heal-3": 3.2,
  "heal-shield": 3.0,
  "next-hit-heal": 2.8,
  "dodge-heal": 2.2,
  "emergency-heal": 4.8,
  "passive-strength": 2.2,
  "passive-speed": 3.0,
  "passive-crit": 1.8,
  "first-round-burn": 3.0,
  "second-round-dodge": 2.0,
  "third-round-dodge-down": 3.0,
  "burn-crit-synergy": 2.8,
  "poison-speed-synergy": 3.0,
  "freeze-damage-synergy": 3.0,
  "crit-bleed": 3.1,
  "guard-hit-damage": 2.0,
  "grid-common-stat": 2.0,
  "grid-common-intel": 1.8,
  "grid-common-heal": 2.0,
  "grid-common-damage": 2.1,
  "grid-common-persuasion": 2.0,
  "grid-common-dodge": 2.0,
  "grid-common-flee": 2.0,
  "grid-common-crit": 2.1,
  "grid-uncommon-stat": 3.0,
  "grid-uncommon-status": 3.2,
  "grid-uncommon-crit": 2.8,
  "grid-uncommon-threshold": 3.0,
  "grid-uncommon-damage": 3.0,
  "grid-uncommon-heal": 3.2,
  "grid-rare-heal-loop": 4.8,
  "grid-rare-freeze": 4.7,
  "grid-rare-advantage": 4.8,
  "grid-rare-last-stand": 4.7
};

/** Returns the configured loot value granted when a player picks an item. */
export function lootValueForItem(item: ItemDefinition): number {
  return RARITY_LOOT_VALUE[item.rarity];
}

/** Returns the AI pickup score baseline for a rarity before context modifiers. */
export function enemyBaseScoreForRarity(rarity: ItemRarity): number {
  return RARITY_ENEMY_BASE_SCORE[rarity];
}

/** Returns the weighted pickup chance for a rarity and offer source. */
export function rarityWeight(source: LootOfferSource, rarity: ItemRarity): number {
  return RARITY_PICKUP_WEIGHTS[source][rarity];
}

/** Returns whether creating a new visible item instance would respect rare caps. */
export function canCreateItemAppearance(
  counts: RareItemAppearanceCounts | undefined,
  items: Record<ItemId, ItemDefinition>,
  itemId: ItemId,
  maxRareAppearances = RARE_ITEM_MAX_APPEARANCES
): boolean {
  if (items[itemId].rarity !== "rare") return true;
  if (!counts) return true;
  return (counts[itemId] ?? 0) < maxRareAppearances;
}

/** Registers one newly generated visible item instance when rarity caps apply. */
export function registerItemAppearance(
  counts: RareItemAppearanceCounts | undefined,
  items: Record<ItemId, ItemDefinition>,
  itemId: ItemId,
  maxRareAppearances = RARE_ITEM_MAX_APPEARANCES
): boolean {
  if (items[itemId].rarity !== "rare") return true;
  if (!counts) return true;
  if (!canCreateItemAppearance(counts, items, itemId, maxRareAppearances)) return false;
  counts[itemId] = (counts[itemId] ?? 0) + 1;
  return true;
}

/** Classifies an item score into the expected rarity band. */
export function expectedRarityForScore(score: number): ItemRarity {
  if (score >= ITEM_POWER_THRESHOLDS.rareMin) return "rare";
  if (score >= ITEM_POWER_THRESHOLDS.uncommonMin) return "uncommon";
  return "common";
}

/** Returns a normalized strength score for balance reports and tests. */
export function itemPowerScore(item: ItemDefinition): number {
  const score = EFFECT_KEY_POWER[item.effectKey] ?? fallbackPowerScore(item);
  return Math.min(ITEM_POWER_SCORE_LIMIT, Math.round(score * 100) / 100);
}

/** Returns whether an item's authored rarity matches its strength score band. */
export function isPowerScoreInRarityBand(item: ItemDefinition): boolean {
  if (item.rarity === "mythic") return true;
  return expectedRarityForScore(itemPowerScore(item)) === item.rarity;
}

/** Creates a deterministic weighted three-choice offer without duplicate items. */
export function createWeightedItemOffer(
  pool: ItemId[],
  items: Record<ItemId, ItemDefinition>,
  seed: string,
  offerLabel: string,
  source: LootOfferSource = "map",
  rareItemAppearances?: RareItemAppearanceCounts,
  maxRareAppearances = RARE_ITEM_MAX_APPEARANCES,
  options: ItemOfferOptions = {}
): [ItemId, ItemId, ItemId] {
  if (pool.length < 3) throw new Error("Weighted loot offer requires at least three items.");
  const chosen: ItemId[] = [];
  for (let pickIndex = 0; pickIndex < 3; pickIndex += 1) {
    const mythicItem = rollMythicGemItem(seed, `${offerLabel}-${source}-${pickIndex}`, chosen, options.mythicGemChance);
    if (mythicItem && items[mythicItem] && !chosen.includes(mythicItem)) {
      chosen.push(mythicItem);
      continue;
    }
    const candidates = pool.filter(
      (itemId) =>
        !chosen.includes(itemId) &&
        canCreateItemAppearance(rareItemAppearances, items, itemId, maxRareAppearances)
    );
    if (candidates.length === 0) break;
    const availableRarities = (["common", "uncommon", "rare"] as ItemRarity[]).filter((rarity) =>
      candidates.some((itemId) => items[itemId].rarity === rarity)
    );
    const totalWeight = availableRarities.reduce((sum, rarity) => sum + offerRarityWeight(source, rarity, options), 0);
    let roll = hashInput(`${seed}-${offerLabel}-${source}-${pickIndex}-rarity`) % totalWeight;
    let selectedRarity = availableRarities[0];
    for (const rarity of availableRarities) {
      roll -= offerRarityWeight(source, rarity, options);
      if (roll < 0) {
        selectedRarity = rarity;
        break;
      }
    }
    const rarityCandidates = candidates.filter((itemId) => items[itemId].rarity === selectedRarity);
    const selected = rarityCandidates[hashInput(`${seed}-${offerLabel}-${source}-${pickIndex}-item`) % rarityCandidates.length];
    chosen.push(selected);
    registerItemAppearance(rareItemAppearances, items, selected, maxRareAppearances);
  }
  if (chosen.length < 3) {
    const fallback = pool.filter((itemId) => !chosen.includes(itemId) && items[itemId].rarity !== "rare");
    while (chosen.length < 3 && fallback.length > 0) {
      const selected = fallback[hashInput(`${seed}-${offerLabel}-${source}-${chosen.length}-fallback`) % fallback.length];
      chosen.push(selected);
      fallback.splice(fallback.indexOf(selected), 1);
    }
  }
  return chosen as [ItemId, ItemId, ItemId];
}

function offerRarityWeight(source: LootOfferSource, rarity: ItemRarity, options: ItemOfferOptions): number {
  return options.rarityWeights?.[rarity] ?? rarityWeight(source, rarity);
}

function fallbackPowerScore(item: ItemDefinition): number {
  return item.effects.reduce((sum, effect) => {
    if (effect.kind === "rangedDamage") return sum + Math.min(5.5, (effect.amount ?? 1) * 1.2);
    if (effect.kind === "heal") return sum + (effect.amount ?? 1) * 0.75;
    if (effect.kind === "status") return sum + (effect.status === "freeze" ? 4.0 : effect.status === "burn" ? 2.4 : 3.0);
    if (effect.kind === "stat") {
      if (effect.stat === "critChance") return sum + Math.abs(effect.amount ?? 0) / 100;
      if (effect.stat === "dodge" || effect.stat === "flee" || effect.stat === "persuasion") return sum + Math.abs(effect.amount ?? 0) / 8;
      return sum + Math.abs(effect.amount ?? 1) * 1.4;
    }
    if (effect.kind === "vision" || effect.kind === "movement" || effect.kind === "globalIntel") return sum + 2.8;
    if (effect.kind === "intel") return sum + 1.6;
    if (effect.kind === "trap") return sum + 2.2;
    if (effect.kind === "ammo") return sum + 4.0;
    return sum + 1.0;
  }, 0);
}
