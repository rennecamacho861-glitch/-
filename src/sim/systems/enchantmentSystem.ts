import type { EnchantmentKind, EnchantmentPrep, InventorySlot, ItemAffix, ItemId } from "../types";
import { hashInput } from "./randomSystem";

export type EnchantmentCarrierTemplate = "HIT" | "PRIME" | "COUNTER" | "SUPPORT" | "TRAP" | "AMMO";

export const ENCHANTMENT_KINDS = ["burning", "venomous", "frost", "blood", "deadly", "radiant"] as const satisfies readonly EnchantmentKind[];

export const ENCHANTMENT_GEM_IDS = [
  "burning-enchant-gem",
  "venomous-enchant-gem",
  "frost-enchant-gem",
  "blood-enchant-gem",
  "deadly-enchant-gem",
  "radiant-enchant-gem"
] as const satisfies readonly ItemId[];

export const NATURAL_ENCHANTMENT_CHANCE = 10;
export const MYTHIC_GEM_OFFER_CHANCE = 1;

export const ENCHANTMENT_GEM_TO_KIND: Record<(typeof ENCHANTMENT_GEM_IDS)[number], EnchantmentKind> = {
  "burning-enchant-gem": "burning",
  "venomous-enchant-gem": "venomous",
  "frost-enchant-gem": "frost",
  "blood-enchant-gem": "blood",
  "deadly-enchant-gem": "deadly",
  "radiant-enchant-gem": "radiant"
};

export const ENCHANTMENT_CARRIER_TEMPLATES: Partial<Record<ItemId, EnchantmentCarrierTemplate>> = {
  bandage: "SUPPORT",
  trap: "TRAP",
  glasses: "SUPPORT",
  glow: "SUPPORT",
  echo: "SUPPORT",
  "weighted-grip": "PRIME",
  "blade-oil": "PRIME",
  "lime-powder": "COUNTER",
  "throwing-knife": "HIT",
  "sleeve-stone": "PRIME",
  "ice-awl": "PRIME",
  caltrops: "TRAP",
  "hook-rope": "COUNTER",
  "acid-vial": "HIT",
  "thick-cloth": "SUPPORT",
  bracer: "SUPPORT",
  "smoke-ball": "SUPPORT",
  painkiller: "SUPPORT",
  "coagulation-powder": "SUPPORT",
  "wood-shield": "COUNTER",
  "soft-shoes": "SUPPORT",
  "steady-charm": "SUPPORT",
  "adrenaline-shot": "SUPPORT",
  splint: "SUPPORT",
  lens: "SUPPORT",
  "counting-beads": "SUPPORT",
  notebook: "SUPPORT",
  "scent-powder": "SUPPORT",
  "black-cloth": "SUPPORT",
  "bell-wire": "TRAP",
  "polarized-lens": "SUPPORT",
  "marked-coin": "SUPPORT",
  "voice-whistle": "SUPPORT",
  "rib-hook": "PRIME",
  "ankle-line": "COUNTER",
  "chase-spur": "PRIME",
  "counter-plate": "COUNTER",
  "panic-nail": "COUNTER",
  "focus-thread": "SUPPORT",
  "breath-cord": "SUPPORT",
  "sharpening-stone": "PRIME",
  "glass-spike": "PRIME",
  "tinder-vial": "PRIME",
  "poison-needle": "PRIME",
  "barbed-line": "PRIME",
  "frost-nail": "PRIME",
  "antidote-tablet": "SUPPORT",
  "insulation-cloth": "COUNTER",
  "signal-mirror": "SUPPORT",
  "folded-map": "SUPPORT",
  "runner-knot": "SUPPORT",
  "signal-flare": "SUPPORT",
  "soot-hook": "COUNTER",
  "venom-saw": "COUNTER",
  "blood-knot": "PRIME",
  "frost-latch": "COUNTER",
  "lens-thread": "SUPPORT",
  "stitch-kit": "SUPPORT",
  "tripwire-spool": "TRAP",
  "red-compass": "SUPPORT",
  "smoke-needle": "COUNTER",
  "thorn-plate": "COUNTER",
  "salve-tin": "SUPPORT",
  "field-ration": "SUPPORT",
  "charcoal-tablet": "SUPPORT",
  "pressure-bandage": "SUPPORT",
  "heat-pad": "SUPPORT",
  "blood-sponge": "PRIME",
  "mercy-thread": "SUPPORT",
  "emergency-syringe": "SUPPORT",
  "lead-wrap": "PRIME",
  "ankle-spring": "SUPPORT",
  "cracked-scope": "PRIME",
  "spark-fuse": "PRIME",
  "second-breath": "SUPPORT",
  "rust-cloud": "COUNTER",
  "coal-beads": "COUNTER",
  "toxin-skein": "COUNTER",
  "cold-rivet": "COUNTER",
  "crit-hook": "PRIME",
  "guard-breaker": "PRIME",
  "servo-heel": "SUPPORT",
  "mnemonic-plate": "SUPPORT",
  "knuckle-core": "PRIME",
  "exit-charm": "SUPPORT",
  "opener-gear": "SUPPORT",
  "first-glint": "SUPPORT",
  "pilot-flame": "PRIME",
  "rawhide-guard": "SUPPORT",
  "second-gear": "PRIME",
  "coolant-breath": "SUPPORT",
  "second-sight": "SUPPORT",
  "venom-timer": "PRIME",
  "long-fuse": "PRIME",
  "fatigue-tax": "PRIME",
  "bunker-prayer": "SUPPORT",
  "escape-count": "SUPPORT",
  "spring-step": "SUPPORT",
  "dust-kicker": "HIT",
  "slip-venom": "COUNTER",
  "dodge-reader": "SUPPORT",
  "guard-lens": "SUPPORT",
  "brace-piston": "PRIME",
  "shield-spark": "COUNTER",
  "calm-mouthpiece": "SUPPORT",
  "wound-motor": "PRIME",
  "crack-reader": "SUPPORT",
  "crush-salt": "COUNTER",
  "ember-step": "SUPPORT",
  "heat-read": "SUPPORT",
  "ash-threshold": "PRIME",
  "toxic-focus": "PRIME",
  "bitter-mouth": "SUPPORT",
  "green-pulse": "SUPPORT",
  "ice-step": "SUPPORT",
  "cold-reader": "SUPPORT",
  "shatter-pin": "HIT",
  "crit-lens": "SUPPORT",
  "white-spark": "PRIME",
  "snap-sinew": "SUPPORT",
  "pain-wheel": "SUPPORT",
  "blood-map": "SUPPORT",
  "recoil-plate": "HIT",
  "overrun-chain": "COUNTER",
  "hard-receipt": "SUPPORT",
  "marrow-coin": "SUPPORT",
  "breakwater-splint": "SUPPORT",
  "trauma-scan": "SUPPORT",
  "last-ice": "COUNTER",
  "last-match": "COUNTER",
  "data-spur": "SUPPORT",
  "long-knife": "HIT",
  "old-magazine": "AMMO",
  pistol: "HIT"
};

const ENCHANTMENT_ADJECTIVES: Record<EnchantmentKind, string> = {
  burning: "燃烧的",
  venomous: "剧毒的",
  frost: "极寒的",
  blood: "染血的",
  deadly: "致命的",
  radiant: "闪耀的"
};

export function isEnchantmentGem(itemId: ItemId): itemId is (typeof ENCHANTMENT_GEM_IDS)[number] {
  return (ENCHANTMENT_GEM_IDS as readonly ItemId[]).includes(itemId);
}

export function enchantmentFromGem(itemId: ItemId): EnchantmentKind | undefined {
  return isEnchantmentGem(itemId) ? ENCHANTMENT_GEM_TO_KIND[itemId] : undefined;
}

export function enchantmentAdjective(enchantment: EnchantmentKind): string {
  return ENCHANTMENT_ADJECTIVES[enchantment];
}

export function enchantedItemName(slot: Pick<InventorySlot, "item" | "affix">): string {
  if (slot.affix?.kind !== "enchantment") return slot.item.name;
  return `${enchantmentAdjective(slot.affix.enchantment)}${slot.item.name}`;
}

export function carrierTemplateForItem(itemId: ItemId): EnchantmentCarrierTemplate | undefined {
  return ENCHANTMENT_CARRIER_TEMPLATES[itemId];
}

export function isEnchantableItem(itemId: ItemId): boolean {
  return !isEnchantmentGem(itemId);
}

export function isEnchantableSlot(slot: InventorySlot): boolean {
  return isEnchantableItem(slot.item.id) && !slot.affix;
}

export function createGemAffix(itemId: ItemId): ItemAffix | undefined {
  const enchantment = enchantmentFromGem(itemId);
  return enchantment ? { kind: "enchantment", enchantment, source: "gem", locked: true } : undefined;
}

export function rollNaturalItemAffix(seed: string, label: string, itemId: ItemId): ItemAffix | undefined {
  if (!isEnchantableItem(itemId)) return undefined;
  if (hashInput(`${seed}-${label}-${itemId}-natural-affix`) % 100 >= NATURAL_ENCHANTMENT_CHANCE) return undefined;
  const enchantment = ENCHANTMENT_KINDS[hashInput(`${seed}-${label}-${itemId}-enchantment-kind`) % ENCHANTMENT_KINDS.length];
  return { kind: "enchantment", enchantment, source: "natural" };
}

export function rollMythicGemItem(seed: string, label: string, unavailable: readonly ItemId[] = []): ItemId | undefined {
  if (hashInput(`${seed}-${label}-mythic-gem-roll`) % 100 >= MYTHIC_GEM_OFFER_CHANCE) return undefined;
  const candidates = ENCHANTMENT_GEM_IDS.filter((itemId) => !unavailable.includes(itemId));
  if (candidates.length === 0) return undefined;
  return candidates[hashInput(`${seed}-${label}-mythic-gem-kind`) % candidates.length];
}

export function enchantmentPower(payloadAmount: number): number {
  return Math.max(1, Math.min(3, Math.floor(Math.max(1, payloadAmount))));
}

export function frostEnchantmentStacks(power: number): number {
  return Math.ceil(power / 2);
}

export function setEnchantmentPrep(actor: { enchantmentPrep?: EnchantmentPrep }, sourceItemId: ItemId, enchantment: EnchantmentKind): void {
  actor.enchantmentPrep = { sourceItemId, enchantment };
}
