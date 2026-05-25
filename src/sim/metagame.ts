import { GameSimulation, type GameSimulationOptions } from "./GameSimulation";
import { ITEMS, PICKUP_ITEM_POOL, cloneInventorySlot, createInventorySlot } from "./items";
import type { SimulationListener, SimulationPort, Unsubscribe } from "./ports";
import {
  type AdvantagePressChoice,
  type CombatAction,
  type GameState,
  type InventorySlot,
  type ItemAffix,
  type ItemId,
  type ItemRarity,
  type MapTierId,
  type MetagameState,
  type ProfileItemSlot,
  type ProfileState,
  type ProfileStatBandId,
  type RunOutcome,
  type RunSummary,
  type ShopOffer,
  type StatBlock
} from "./types";
import { rollNaturalItemAffix } from "./systems/enchantmentSystem";
import { createWeightedItemOffer } from "./systems/itemBalanceSystem";
import { MAP_TIERS, PROFILE_STAT_BANDS, getMapTier, nextProfileStatBand, rollProfileStats } from "./systems/mapTierSystem";

export type ProfileStorage = {
  load(): unknown;
  save(profile: ProfileState): void;
};

export type MetagamePort = SimulationPort & {
  metaSnapshot(): MetagameState;
  selectMapTier(tierId: MapTierId): void;
  startRun(seed?: string): boolean;
  buyShopOffer(offerId: string): void;
  refreshShop(): void;
  equipStashSlot(instanceId: string): void;
  unequipDeploymentSlot(instanceId: string): void;
  sellStashSlot(instanceId: string): void;
  rerollProfileStats(): void;
  upgradeProfileStats(): void;
};

type SavedSlot = {
  instanceId: string;
  itemId: ItemId;
  count: number;
  charges?: number;
  durability?: number;
  usedFlags?: Record<string, boolean>;
  lastManualUseRound?: number;
  affix?: ItemAffix;
};

type SavedProfile = Omit<ProfileState, "stash" | "deployment" | "shop"> & {
  stash: SavedSlot[];
  deployment: SavedSlot[];
  shop: {
    refreshIndex: number;
    offers: Array<Omit<ShopOffer, "slot"> & { slot: SavedSlot }>;
  };
};

const STARTING_GOLD = 120;
const SHOP_OFFER_COUNT = 6;
const SHOP_REFRESH_COST = 12;

const RARITY_PRICE: Record<ItemRarity, number> = {
  common: 12,
  uncommon: 30,
  rare: 84,
  mythic: 260
};

const DEPLOYMENT_VALUE: Record<ItemRarity, number> = {
  common: 4,
  uncommon: 8,
  rare: 18,
  mythic: 40
};

export class MetagameSimulation implements MetagamePort {
  private listeners = new Set<SimulationListener>();
  private run: GameSimulation;
  private runActive = false;
  private message: string | undefined;
  private processedRunId: string | undefined;
  private unsubscribeRun?: Unsubscribe;

  constructor(
    private seed: string,
    private storage?: ProfileStorage
  ) {
    this.profile = this.loadOrCreateProfile(seed);
    this.run = this.createRun(seed, { starterOffer: false, initialInventory: [] });
    this.attachRun(this.run);
  }

  private profile!: ProfileState;

  snapshot(): GameState {
    return this.run.snapshot();
  }

  metaSnapshot(): MetagameState {
    const selectedMapTier = getMapTier(this.profile.selectedMapTierId);
    const deploymentValue = this.deploymentValue();
    return {
      profile: this.profile,
      mapTiers: MAP_TIERS,
      activeRun: this.runActive,
      selectedMapTier,
      deploymentValue,
      canStartRun: this.profile.gold >= selectedMapTier.entryFee && deploymentValue <= selectedMapTier.deploymentValueCap,
      message: this.message
    };
  }

  onChange(listener: SimulationListener): Unsubscribe {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  reset(seed?: string): void {
    if (this.runActive) this.recordFailedRun("主动放弃");
    this.seed = seed ?? this.seed;
    this.runActive = false;
    this.processedRunId = undefined;
    this.run = this.createRun(this.seed, { starterOffer: false, initialInventory: [] });
    this.attachRun(this.run);
    this.message = "已回到战备区。";
    this.saveProfile();
    this.emit();
  }

  beginTutorialScenario(): void {
    this.runActive = true;
    this.run = this.createRun(`tutorial-${this.seed}`, { starterOffer: false, initialInventory: [] });
    this.attachRun(this.run);
    this.run.beginTutorialScenario();
    this.message = "训练局不会结算仓库或金币。";
    this.emit();
  }

  skipTutorialScenario(): void {
    this.run.skipTutorialScenario();
  }

  move(dx: number, dy: number): void {
    if (!this.runActive) return;
    this.run.move(dx, dy);
  }

  choosePickup(itemId: ItemId | null): void {
    if (!this.runActive) return;
    this.run.choosePickup(itemId);
  }

  useItem(itemId: ItemId): void {
    if (!this.runActive) return;
    this.run.useItem(itemId);
  }

  playCombatAction(action: CombatAction): void {
    if (!this.runActive) return;
    this.run.playCombatAction(action);
  }

  tryFlee(): void {
    if (!this.runActive) return;
    this.run.tryFlee();
  }

  continueFight(choice?: AdvantagePressChoice): void {
    if (!this.runActive) return;
    this.run.continueFight(choice);
  }

  tryPersuade(): void {
    if (!this.runActive) return;
    this.run.tryPersuade();
  }

  selectMapTier(tierId: MapTierId): void {
    if (this.runActive) return;
    this.profile.selectedMapTierId = tierId;
    this.message = `已选择 ${getMapTier(tierId).name}。`;
    this.saveProfile();
    this.emit();
  }

  startRun(seed?: string): boolean {
    if (this.runActive) return false;
    const tier = getMapTier(this.profile.selectedMapTierId);
    const deploymentValue = this.deploymentValue();
    if (this.profile.gold < tier.entryFee) {
      this.message = `金币不足，进入 ${tier.name} 需要 ${tier.entryFee} 金币。`;
      this.emit();
      return false;
    }
    if (deploymentValue > tier.deploymentValueCap) {
      this.message = `战备价值 ${deploymentValue} 超过本档上限 ${tier.deploymentValueCap}。`;
      this.emit();
      return false;
    }

    const runSeed = seed ?? createSeed("run");
    const loadout = this.profile.deployment.map((slot) => cloneInventorySlot(slot));
    this.profile.gold -= tier.entryFee;
    this.profile.deployment = [];
    this.runActive = true;
    this.processedRunId = undefined;
    this.seed = runSeed;
    this.run = this.createRun(runSeed, {
      starterOffer: false,
      playerStats: this.profile.stats,
      initialInventory: loadout,
      mapTier: tier,
      naturalAffixChance: tier.naturalAffixChance
    });
    this.attachRun(this.run);
    this.message = `${tier.name} 已入场。安全撤离才会把身上物品带回仓库。`;
    this.saveProfile();
    this.emit();
    return true;
  }

  buyShopOffer(offerId: string): void {
    if (this.runActive) return;
    const offer = this.profile.shop.offers.find((candidate) => candidate.id === offerId);
    if (!offer || offer.sold) return;
    if (this.profile.gold < offer.price) {
      this.message = `金币不足，购买 ${offer.slot.item.name} 需要 ${offer.price}。`;
      this.emit();
      return;
    }
    this.profile.gold -= offer.price;
    offer.sold = true;
    this.profile.stash.push(this.cloneProfileSlot(offer.slot));
    this.message = `${offer.slot.item.name} 已进入仓库。`;
    this.saveProfile();
    this.emit();
  }

  refreshShop(): void {
    if (this.runActive) return;
    if (this.profile.gold < SHOP_REFRESH_COST) {
      this.message = `刷新商店需要 ${SHOP_REFRESH_COST} 金币。`;
      this.emit();
      return;
    }
    this.profile.gold -= SHOP_REFRESH_COST;
    this.profile.shop = this.createShop(this.profile.shop.refreshIndex + 1);
    this.message = "商店已刷新。";
    this.saveProfile();
    this.emit();
  }

  equipStashSlot(instanceId: string): void {
    if (this.runActive) return;
    const index = this.profile.stash.findIndex((slot) => slot.instanceId === instanceId);
    if (index < 0) return;
    const slot = this.profile.stash[index];
    const tier = getMapTier(this.profile.selectedMapTierId);
    const nextValue = this.deploymentValue() + deploymentValueForSlot(slot);
    if (nextValue > tier.deploymentValueCap) {
      this.message = `这件物品会让战备价值达到 ${nextValue}，超过 ${tier.name} 上限 ${tier.deploymentValueCap}。`;
      this.emit();
      return;
    }
    this.profile.stash.splice(index, 1);
    this.profile.deployment.push(slot);
    this.message = `${slot.item.name} 已加入战备。`;
    this.saveProfile();
    this.emit();
  }

  unequipDeploymentSlot(instanceId: string): void {
    if (this.runActive) return;
    const index = this.profile.deployment.findIndex((slot) => slot.instanceId === instanceId);
    if (index < 0) return;
    const [slot] = this.profile.deployment.splice(index, 1);
    this.profile.stash.push(slot);
    this.message = `${slot.item.name} 已放回仓库。`;
    this.saveProfile();
    this.emit();
  }

  sellStashSlot(instanceId: string): void {
    if (this.runActive) return;
    const index = this.profile.stash.findIndex((slot) => slot.instanceId === instanceId);
    if (index < 0) return;
    const [slot] = this.profile.stash.splice(index, 1);
    const value = Math.max(1, Math.floor(priceForSlot(slot) / 2));
    this.profile.gold += value;
    this.message = `卖出 ${slot.item.name}，获得 ${value} 金币。`;
    this.saveProfile();
    this.emit();
  }

  rerollProfileStats(): void {
    if (this.runActive) return;
    const band = PROFILE_STAT_BANDS[this.profile.statBandId];
    if (this.profile.gold < band.rerollCost) {
      this.message = `重Roll属性需要 ${band.rerollCost} 金币。`;
      this.emit();
      return;
    }
    this.profile.gold -= band.rerollCost;
    this.profile.stats = rollProfileStats(createSeed("stats"), this.profile.statBandId, `reroll-${this.profile.runsCompleted}`);
    this.message = "属性已重Roll。";
    this.saveProfile();
    this.emit();
  }

  upgradeProfileStats(): void {
    if (this.runActive) return;
    const nextBand = nextProfileStatBand(this.profile.statBandId);
    if (!nextBand) {
      this.message = "属性总值已经到达当前最高档。";
      this.emit();
      return;
    }
    const cost = PROFILE_STAT_BANDS[this.profile.statBandId].upgradeCost ?? 0;
    if (this.profile.gold < cost) {
      this.message = `升级属性档位需要 ${cost} 金币。`;
      this.emit();
      return;
    }
    this.profile.gold -= cost;
    this.profile.statBandId = nextBand;
    this.profile.stats = rollProfileStats(createSeed("upgrade"), nextBand, `upgrade-${this.profile.runsCompleted}`);
    this.message = `属性档位提升为 ${PROFILE_STAT_BANDS[nextBand].label}。`;
    this.saveProfile();
    this.emit();
  }

  private createRun(seed: string, options: GameSimulationOptions): GameSimulation {
    return new GameSimulation(seed, options);
  }

  private attachRun(run: GameSimulation): void {
    this.unsubscribeRun?.();
    this.unsubscribeRun = run.onChange(() => {
      this.finalizeOutcomeIfNeeded();
      this.emit();
    });
  }

  private finalizeOutcomeIfNeeded(): void {
    const outcome = this.run.snapshot().outcome;
    if (!outcome || !this.runActive) return;
    const outcomeKey = `${this.run.snapshot().seed}-${outcome.kind}`;
    if (this.processedRunId === outcomeKey) return;
    this.processedRunId = outcomeKey;
    this.finishRun(outcome.kind);
  }

  private finishRun(outcome: RunOutcome): void {
    const state = this.run.snapshot();
    const tier = getMapTier(this.profile.selectedMapTierId);
    const itemsInRun = state.inventory.reduce((sum, slot) => sum + slot.count, 0);
    let lootGold = 0;
    let recovered = 0;
    if (outcome === "extracted") {
      lootGold = tier.extractionBonusGold + state.loot * tier.lootGoldMultiplier;
      recovered = this.recoverRunInventory(state.inventory);
      this.profile.gold += lootGold;
    }
    const summary: RunSummary = {
      runId: state.seed,
      tierId: tier.id,
      outcome,
      lootGold,
      itemsRecovered: recovered,
      itemsLost: outcome === "extracted" ? 0 : itemsInRun,
    };
    this.profile.lastRunSummary = summary;
    this.profile.runsCompleted += 1;
    this.runActive = false;
    this.message =
      outcome === "extracted"
        ? `撤离成功：回收 ${recovered} 件物品，获得 ${lootGold} 金币。`
        : `本局失败：携带入场和本局所得共 ${itemsInRun} 件物品丢失。`;
    this.saveProfile();
  }

  private recordFailedRun(reason: string): void {
    const state = this.run.snapshot();
    const itemsLost = state.inventory.reduce((sum, slot) => sum + slot.count, 0);
    this.profile.lastRunSummary = {
      runId: state.seed,
      tierId: this.profile.selectedMapTierId,
      outcome: "failed",
      lootGold: 0,
      itemsRecovered: 0,
      itemsLost
    };
    this.profile.runsCompleted += 1;
    this.runActive = false;
    this.message = `${reason}：本局身上 ${itemsLost} 件物品丢失。`;
  }

  private recoverRunInventory(inventory: InventorySlot[]): number {
    let recovered = 0;
    for (const slot of inventory) {
      if (slot.count <= 0) continue;
      this.profile.stash.push(this.profileSlotFromInventory(slot));
      recovered += slot.count;
    }
    return recovered;
  }

  private loadOrCreateProfile(seed: string): ProfileState {
    const saved = hydrateProfile(this.storage?.load());
    if (saved) return saved;
    const profile: ProfileState = {
      id: `local-${createSeed("profile")}`,
      gold: STARTING_GOLD,
      stats: rollProfileStats(seed, "baseline", "new-profile"),
      statBandId: "baseline",
      stash: [],
      deployment: [],
      selectedMapTierId: "tier-1",
      shop: { refreshIndex: 0, offers: [] },
      runsCompleted: 0,
      nextInstanceSerial: 1
    };
    this.profile = profile;
    profile.shop = this.createShop(0, profile);
    this.saveProfile();
    return profile;
  }

  private createShop(refreshIndex: number, profile = this.profile): ProfileState["shop"] {
    const tier = getMapTier(profile.selectedMapTierId);
    const offers: ShopOffer[] = [];
    const rareCounts = {};
    for (let index = 0; index < SHOP_OFFER_COUNT; index += 1) {
      const offer = createWeightedItemOffer(PICKUP_ITEM_POOL, ITEMS, profile.id, `shop-${refreshIndex}-${index}`, "map", rareCounts, 999, {
        rarityWeights: tier.rarityWeights,
        mythicGemChance: tier.mythicGemOfferChance
      });
      const itemId = offer[index % offer.length];
      const affix = rollNaturalItemAffix(profile.id, `shop-${refreshIndex}-${index}`, itemId, tier.naturalAffixChance);
      const slot = this.profileSlotFromInventory(createInventorySlot(itemId, 1, { affix }));
      offers.push({ id: `shop-${refreshIndex}-${index}`, slot, price: priceForSlot(slot), sold: false });
    }
    return { refreshIndex, offers };
  }

  private profileSlotFromInventory(slot: InventorySlot): ProfileItemSlot {
    return {
      ...cloneInventorySlot(slot),
      instanceId: this.nextInstanceId()
    };
  }

  private cloneProfileSlot(slot: ProfileItemSlot): ProfileItemSlot {
    return {
      ...cloneInventorySlot(slot),
      instanceId: this.nextInstanceId()
    };
  }

  private nextInstanceId(): string {
    const id = `slot-${this.profile.nextInstanceSerial}`;
    this.profile.nextInstanceSerial += 1;
    return id;
  }

  private deploymentValue(): number {
    return this.profile.deployment.reduce((sum, slot) => sum + deploymentValueForSlot(slot), 0);
  }

  private saveProfile(): void {
    this.storage?.save(this.profile);
  }

  private emit(): void {
    for (const listener of this.listeners) listener();
  }
}

export function createLocalProfileStorage(key: string): ProfileStorage {
  return {
    load: () => {
      try {
        const raw = globalThis.localStorage?.getItem(key);
        return raw ? JSON.parse(raw) : undefined;
      } catch {
        return undefined;
      }
    },
    save: (profile) => {
      try {
        globalThis.localStorage?.setItem(key, JSON.stringify(serializeProfile(profile)));
      } catch {
        // Embedded previews and privacy modes may block localStorage; the in-memory profile still works.
      }
    }
  };
}

export function priceForSlot(slot: Pick<InventorySlot, "item" | "affix" | "charges" | "count">): number {
  const base = RARITY_PRICE[slot.item.rarity] * Math.max(1, slot.count);
  const affixPremium = slot.affix?.kind === "enchantment" ? Math.ceil(base * 0.75) : 0;
  const chargePremium = slot.charges !== undefined && slot.item.maxCharges ? Math.ceil((slot.charges / slot.item.maxCharges) * 6) : 0;
  return base + affixPremium + chargePremium;
}

export function deploymentValueForSlot(slot: Pick<InventorySlot, "item" | "affix" | "count">): number {
  return (DEPLOYMENT_VALUE[slot.item.rarity] + (slot.affix?.kind === "enchantment" ? 8 : 0)) * Math.max(1, slot.count);
}

function serializeProfile(profile: ProfileState): SavedProfile {
  return {
    ...profile,
    stash: profile.stash.map(serializeSlot),
    deployment: profile.deployment.map(serializeSlot),
    shop: {
      refreshIndex: profile.shop.refreshIndex,
      offers: profile.shop.offers.map((offer) => ({ ...offer, slot: serializeSlot(offer.slot) }))
    }
  };
}

function hydrateProfile(value: unknown): ProfileState | undefined {
  if (!value || typeof value !== "object") return undefined;
  const raw = value as Partial<SavedProfile>;
  if (!raw.id || typeof raw.gold !== "number" || !raw.stats || !raw.statBandId || !raw.selectedMapTierId) return undefined;
  return {
    id: raw.id,
    gold: raw.gold,
    stats: raw.stats as StatBlock,
    statBandId: raw.statBandId as ProfileStatBandId,
    stash: (raw.stash ?? []).map(hydrateSlot).filter(Boolean) as ProfileItemSlot[],
    deployment: (raw.deployment ?? []).map(hydrateSlot).filter(Boolean) as ProfileItemSlot[],
    selectedMapTierId: raw.selectedMapTierId as MapTierId,
    shop: {
      refreshIndex: raw.shop?.refreshIndex ?? 0,
      offers: (raw.shop?.offers ?? [])
        .map((offer) => {
          const slot = hydrateSlot(offer.slot);
          return slot ? { id: offer.id, slot, price: offer.price, sold: Boolean(offer.sold) } : undefined;
        })
        .filter(Boolean) as ShopOffer[]
    },
    runsCompleted: raw.runsCompleted ?? 0,
    nextInstanceSerial: raw.nextInstanceSerial ?? 1,
    lastRunSummary: raw.lastRunSummary
  };
}

function serializeSlot(slot: ProfileItemSlot): SavedSlot {
  return {
    instanceId: slot.instanceId,
    itemId: slot.item.id,
    count: slot.count,
    charges: slot.charges,
    durability: slot.durability,
    usedFlags: slot.usedFlags ? { ...slot.usedFlags } : undefined,
    lastManualUseRound: slot.lastManualUseRound,
    affix: slot.affix ? { ...slot.affix } : undefined
  };
}

function hydrateSlot(slot: SavedSlot | undefined): ProfileItemSlot | undefined {
  if (!slot || !ITEMS[slot.itemId]) return undefined;
  return {
    ...createInventorySlot(slot.itemId, slot.count, {
      charges: slot.charges,
      durability: slot.durability,
      usedFlags: slot.usedFlags,
      lastManualUseRound: slot.lastManualUseRound,
      affix: slot.affix
    }),
    instanceId: slot.instanceId
  };
}

function createSeed(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}
