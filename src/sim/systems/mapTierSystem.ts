import type { MapTierDefinition, MapTierId, ProfileStatBandId, RarityWeights, StatBlock, StatKey } from "../types";
import { hashInput } from "./randomSystem";

export const PROFILE_STAT_BANDS: Record<
  ProfileStatBandId,
  { label: string; range: [number, number]; rerollCost: number; upgradeCost?: number; statMax: number }
> = {
  baseline: { label: "拾荒者", range: [10, 12], rerollCost: 20, upgradeCost: 180, statMax: 5 },
  trained: { label: "熟手", range: [12, 15], rerollCost: 55, upgradeCost: 560, statMax: 6 },
  hardened: { label: "硬牌", range: [15, 20], rerollCost: 120, statMax: 8 }
};

export const MAP_TIERS: MapTierDefinition[] = [
  {
    id: "tier-1",
    name: "一档：废灯外圈",
    rank: 1,
    entryFee: 0,
    deploymentValueCap: 18,
    enemyStatTotalRange: [8, 12],
    enemyStatMax: 5,
    rarityWeights: { common: 90, uncommon: 10, rare: 0, mythic: 0 },
    naturalAffixChance: 0,
    mythicGemOfferChance: 0,
    extractionBonusGold: 10,
    lootGoldMultiplier: 4,
    enemyStartsWithEnchantedItem: false,
    description: "只稳定产出白色道具，小概率蓝色；适合回本和熟悉路线。"
  },
  {
    id: "tier-2",
    name: "二档：断线牌桌",
    rank: 2,
    entryFee: 15,
    deploymentValueCap: 32,
    enemyStatTotalRange: [10, 20],
    enemyStatMax: 6,
    rarityWeights: { common: 76, uncommon: 22, rare: 2, mythic: 0 },
    naturalAffixChance: 0,
    mythicGemOfferChance: 0,
    extractionBonusGold: 18,
    lootGoldMultiplier: 5,
    enemyStartsWithEnchantedItem: false,
    description: "当前原型难度基准。敌人数值波动大，橙色极少出现。"
  },
  {
    id: "tier-3",
    name: "三档：红光内圈",
    rank: 3,
    entryFee: 45,
    deploymentValueCap: 48,
    enemyStatTotalRange: [15, 24],
    enemyStatMax: 7,
    rarityWeights: { common: 54, uncommon: 34, rare: 12, mythic: 0 },
    naturalAffixChance: 10,
    mythicGemOfferChance: 0,
    extractionBonusGold: 35,
    lootGoldMultiplier: 7,
    enemyStartsWithEnchantedItem: false,
    description: "橙色开始成为正常收益，场上物件有 10% 概率自然附魔。"
  },
  {
    id: "tier-4",
    name: "四档：回声深层",
    rank: 4,
    entryFee: 95,
    deploymentValueCap: 68,
    enemyStatTotalRange: [20, 28],
    enemyStatMax: 8,
    rarityWeights: { common: 40, uncommon: 36, rare: 24, mythic: 0 },
    naturalAffixChance: 20,
    mythicGemOfferChance: 0,
    extractionBonusGold: 70,
    lootGoldMultiplier: 10,
    enemyStartsWithEnchantedItem: false,
    description: "橙色权重提高，附魔概率提升到 20%，适合带战备冲收益。"
  },
  {
    id: "tier-5",
    name: "五档：赌命核心",
    rank: 5,
    entryFee: 180,
    deploymentValueCap: 92,
    enemyStatTotalRange: [24, 32],
    enemyStatMax: 9,
    rarityWeights: { common: 30, uncommon: 34, rare: 35, mythic: 1 },
    naturalAffixChance: 20,
    mythicGemOfferChance: 1,
    extractionBonusGold: 140,
    lootGoldMultiplier: 14,
    enemyStartsWithEnchantedItem: true,
    description: "附魔宝石进入掉落池；所有敌人起始必带一件附魔物品。"
  }
];

export function getMapTier(id: MapTierId | undefined): MapTierDefinition {
  return MAP_TIERS.find((tier) => tier.id === id) ?? MAP_TIERS[1];
}

export function nextProfileStatBand(current: ProfileStatBandId): ProfileStatBandId | undefined {
  if (current === "baseline") return "trained";
  if (current === "trained") return "hardened";
  return undefined;
}

export function rollProfileStats(seed: string, bandId: ProfileStatBandId, label = "profile"): StatBlock {
  const band = PROFILE_STAT_BANDS[bandId];
  return rollStatBlock(seed, label, band.range, band.statMax);
}

export function rollEnemyStats(seed: string, label: string, tier: MapTierDefinition): StatBlock {
  return rollStatBlock(seed, label, tier.enemyStatTotalRange, tier.enemyStatMax);
}

export function normalizeRarityWeights(weights: Partial<RarityWeights>): RarityWeights {
  return {
    common: weights.common ?? 0,
    uncommon: weights.uncommon ?? 0,
    rare: weights.rare ?? 0,
    mythic: weights.mythic ?? 0
  };
}

function rollStatBlock(seed: string, label: string, totalRange: [number, number], statMax: number): StatBlock {
  const keys: StatKey[] = ["spirit", "intellect", "strength", "speed", "constitution"];
  const minTotal = Math.max(keys.length, totalRange[0]);
  const maxTotal = Math.max(minTotal, totalRange[1]);
  const total = minTotal + (hashInput(`${seed}-${label}-total`) % (maxTotal - minTotal + 1));
  const stats = Object.fromEntries(keys.map((key) => [key, 1])) as StatBlock;
  let remaining = total - keys.length;
  let guard = 0;

  while (remaining > 0 && guard < 500) {
    const key = keys[hashInput(`${seed}-${label}-stat-${guard}`) % keys.length];
    if (stats[key] < statMax) {
      stats[key] += 1;
      remaining -= 1;
    }
    guard += 1;
  }

  return stats;
}
