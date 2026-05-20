import type { InventorySlot, ItemCategory, ItemDefinition, ItemEffect, ItemId, ItemPort, ItemPortTrigger, ItemRarity, ItemTag, ItemUsage } from "./types";
import { ENCHANTMENT_GEM_IDS } from "./systems/enchantmentSystem";

type ItemDefinitionDraft = Omit<ItemDefinition, "usage" | "ports" | "effects" | "usageAuthored"> &
  Partial<Pick<ItemDefinition, "usage" | "ports" | "effects" | "aiWeight">>;

function defaultUsage(definition: ItemDefinitionDraft): ItemUsage {
  if (definition.id === "pistol") {
    return { mode: "rechargeable", maxUses: definition.maxCharges ?? 5, refillItemIds: ["old-magazine"], manualLock: "per-round" };
  }
  if (definition.maxCharges !== undefined) {
    return { mode: "charges-destroy", maxUses: definition.maxCharges, manualLock: "per-round" };
  }
  if (definition.timing === "passive") return { mode: "unlimited", manualLock: "none" };
  if (definition.rarity !== "rare" && (definition.timing === "active" || definition.timing === "reaction")) {
    return { mode: "charges-destroy", maxUses: definition.rarity === "uncommon" ? 3 : 2, manualLock: "per-round" };
  }
  return { mode: "unlimited", manualLock: "per-round" };
}

function defaultPorts(definition: ItemDefinitionDraft): ItemPort[] {
  if (definition.timing === "passive") {
    return [{ id: `${definition.id}-passive`, kind: "condition", trigger: "combatStart", context: definition.useContext, target: "self" }];
  }
  const trigger = definition.useContext === "field" ? "field" : definition.useContext === "combat" ? "combat" : "combat";
  return [{ id: `${definition.id}-manual`, kind: "manual", trigger, context: definition.useContext, target: "self" }];
}

function defaultEffects(definition: ItemDefinitionDraft): ItemDefinition["effects"] {
  const duration = definition.durationTurns;
  switch (definition.effectKey) {
    case "ranged-shot":
      return [{ kind: "rangedDamage", amount: 3, label: definition.effectKey }];
    case "heal-3":
      return [{ kind: "heal", amount: 3, label: definition.effectKey }];
    case "first-attack-and-throw":
      return [
        { kind: "stat", stat: "speed", amount: 2, label: "first-attack-speed" },
        { kind: "stat", stat: "damage", amount: 1, label: "knife-melee-damage" },
        { kind: "rangedDamage", amount: 2, label: "knife-throw" }
      ];
    case "alarm-trap":
    case "equipment-alarm":
      return [{ kind: "trap", label: definition.effectKey }, { kind: "intel", label: "trap-intel" }];
    case "speed-trap":
      return [{ kind: "trap", amount: 1, label: "caltrop-damage" }, { kind: "stat", stat: "speed", amount: -1, durationRounds: 1 }];
    case "reveal-item-on-dodge":
    case "nearest-signal":
    case "reveal-speed-stat":
    case "reveal-charges":
    case "extra-stat-intel":
    case "mark-enemy":
    case "round-two-stat-or-item":
    case "next-attack-direction":
      return [{ kind: "intel", label: definition.effectKey }];
    case "vision-boost":
      return [{ kind: "vision", amount: 3, durationRounds: duration, label: definition.effectKey }];
    case "visibility-reduce":
      return [{ kind: "vision", amount: -1, durationRounds: duration, label: definition.effectKey }];
    case "first-hit-damage":
    case "temporary-melee-damage":
    case "advantage-next-melee-damage":
    case "next-melee-damage":
      return [{ kind: "stat", stat: "damage", amount: 1, durationRounds: duration ?? 1, label: definition.effectKey }];
    case "round-crit":
      return [{ kind: "stat", stat: "critChance", amount: 20, durationRounds: 1, label: definition.effectKey }];
    case "heavy-threshold-minus":
      return [{ kind: "stat", stat: "heavyThreshold", amount: -1, durationRounds: 1, label: definition.effectKey }];
    case "dodge-penalty":
    case "advantage-dodge-penalty":
      return [{ kind: "stat", stat: "dodge", amount: definition.effectKey === "advantage-dodge-penalty" ? -20 : -15, durationRounds: 1, label: definition.effectKey }];
    case "short-throw":
      return [{ kind: "rangedDamage", amount: 2, label: definition.effectKey }];
    case "tie-strength":
      return [{ kind: "stat", stat: "tieStrength", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "flee-penalty":
    case "advantage-flee-penalty":
      return [{ kind: "stat", stat: "flee", amount: definition.effectKey === "advantage-flee-penalty" ? -15 : -20, durationRounds: 1, label: definition.effectKey }];
    case "minor-dot":
      return [{ kind: "status", status: "poison", amount: 1, durationRounds: 3, label: definition.effectKey }];
    case "next-hit-burn":
      return [{ kind: "status", status: "burn", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "next-hit-poison":
      return [{ kind: "status", status: "poison", amount: 1, durationRounds: 3, label: definition.effectKey }];
    case "next-hit-bleed":
      return [{ kind: "status", status: "bleed", amount: 1, durationRounds: 3, label: definition.effectKey }];
    case "next-hit-freeze":
      return [{ kind: "status", status: "freeze", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "pistol-ammo":
      return [{ kind: "ammo", amount: 2, label: definition.effectKey }];
    case "first-melee-reduce":
    case "breakable-damage-reduce":
    case "advantage-incoming-reduce":
      return [{ kind: "stat", stat: "incomingDamage", amount: definition.effectKey === "breakable-damage-reduce" ? -2 : -1, durationRounds: 1, label: definition.effectKey }];
    case "first-defend-bonus":
      return [{ kind: "stat", stat: "incomingDamage", amount: -1, durationRounds: 1 }, { kind: "intel", label: definition.effectKey }];
    case "smoke-flee":
      return [{ kind: "stat", stat: "flee", amount: 20, durationRounds: 1, label: definition.effectKey }];
    case "ignore-heavy-wound":
    case "debuff-duration-reduce":
      return [{ kind: "stat", stat: "heavyPenalty", amount: -1, durationRounds: duration ?? 1, label: definition.effectKey }];
    case "cleanse-or-heal-1":
    case "cleanse-poison-heal":
    case "charcoal-cleanse-heal":
    case "heal-1":
      return [{ kind: "heal", amount: 1, label: definition.effectKey }];
    case "field-heal-2":
      return [{ kind: "heal", amount: 2, label: definition.effectKey }];
    case "advantage-heal-3":
      return [{ kind: "heal", amount: 3, label: definition.effectKey }];
    case "heal-shield":
      return [
        { kind: "heal", amount: 1, label: definition.effectKey },
        { kind: "stat", stat: "incomingDamage", amount: -1, durationRounds: 1, label: definition.effectKey }
      ];
    case "next-hit-heal":
      return [{ kind: "stat", stat: "healOnMeleeHit", amount: 1, durationRounds: 2, label: definition.effectKey }];
    case "dodge-heal":
      return [{ kind: "heal", amount: 1, label: definition.effectKey }];
    case "emergency-heal":
      return [{ kind: "heal", amount: 4, label: definition.effectKey }];
    case "passive-strength":
      return [{ kind: "stat", stat: "strength", amount: 1, label: definition.effectKey }];
    case "passive-speed":
      return [{ kind: "stat", stat: "speed", amount: 1, label: definition.effectKey }];
    case "passive-crit":
      return [{ kind: "stat", stat: "critChance", amount: 8, label: definition.effectKey }];
    case "first-round-burn":
      return [{ kind: "status", status: "burn", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "second-round-dodge":
      return [{ kind: "stat", stat: "dodge", amount: 15, durationRounds: 1, label: definition.effectKey }];
    case "third-round-dodge-down":
      return [{ kind: "stat", stat: "dodge", amount: -10, durationRounds: 1, label: definition.effectKey }];
    case "burn-crit-synergy":
      return [{ kind: "stat", stat: "critChance", amount: 10, durationRounds: 1, label: definition.effectKey }];
    case "poison-speed-synergy":
      return [{ kind: "stat", stat: "speed", amount: -1, durationRounds: 1, label: definition.effectKey }];
    case "freeze-damage-synergy":
    case "guard-hit-damage":
      return [{ kind: "stat", stat: "damage", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "crit-bleed":
      return [{ kind: "status", status: "bleed", amount: 1, durationRounds: 3, label: definition.effectKey }];
    case "cleanse-burn-freeze-shield":
      return [{ kind: "stat", stat: "incomingDamage", amount: -1, durationRounds: 1, label: definition.effectKey }];
    case "first-dodge-flee":
      return [{ kind: "stat", stat: "dodge", amount: 10, durationRounds: 1 }, { kind: "stat", stat: "flee", amount: 10, durationRounds: 1 }];
    case "ambush-reduce":
      return [{ kind: "stat", stat: "incomingDamage", amount: -1, durationRounds: 1, label: definition.effectKey }];
    case "temporary-speed":
    case "advantage-speed":
      return [{ kind: "stat", stat: "speed", amount: 1, durationRounds: duration ?? 1, label: definition.effectKey }];
    case "smoke-flash-immunity":
      return [{ kind: "stat", stat: "dodge", amount: 0, durationRounds: 1, label: definition.effectKey }];
    case "persuasion-payment":
      return [{ kind: "stat", stat: "persuasion", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "lure-step":
    case "two-step-move":
      return [{ kind: "movement", amount: 1, label: definition.effectKey }];
    case "advantage-dodge-boost":
      return [{ kind: "stat", stat: "dodge", amount: 15, durationRounds: 1, label: definition.effectKey }];
    case "visible-item-intel":
      return [{ kind: "intel", label: definition.effectKey }];
    case "global-intel":
      return [{ kind: "globalIntel", label: definition.effectKey }];
    case "flare-vision":
      return [{ kind: "vision", amount: 4, durationRounds: duration ?? 2, label: definition.effectKey }];
    case "burn-dodge-synergy":
      return [{ kind: "stat", stat: "dodge", amount: -10, durationRounds: 1, label: definition.effectKey }];
    case "poison-damage-synergy":
      return [{ kind: "stat", stat: "damage", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "bleed-speed-synergy":
      return [{ kind: "stat", stat: "speed", amount: 1, durationRounds: 1, label: definition.effectKey }];
    case "freeze-guard-synergy":
      return [{ kind: "stat", stat: "incomingDamage", amount: -1, durationRounds: 1, label: definition.effectKey }];
    case "dodge-crit-intel":
      return [
        { kind: "stat", stat: "critChance", amount: 10, durationRounds: 1, label: definition.effectKey },
        { kind: "intel", label: definition.effectKey }
      ];
    case "cleanse-status-to-damage":
      return [
        { kind: "heal", amount: 1, label: definition.effectKey },
        { kind: "stat", stat: "damage", amount: 1, durationRounds: 1, label: definition.effectKey }
      ];
    case "bleed-trap-intel":
      return [{ kind: "trap", amount: 1, label: definition.effectKey }, { kind: "intel" }];
    case "rare-loot-signal":
      return [{ kind: "globalIntel", label: definition.effectKey }];
    case "enchant-gem":
      return [{ kind: "log", label: definition.effectKey }];
    case "dodge-poison-counter":
      return [{ kind: "status", status: "poison", amount: 1, durationRounds: 3, label: definition.effectKey }];
    case "thorn-counter-bleed":
      return [{ kind: "status", status: "bleed", amount: 1, durationRounds: 3, label: definition.effectKey }];
    default:
      return [{ kind: "log", label: definition.effectKey }];
  }
}

const item = (definition: ItemDefinitionDraft): ItemDefinition => ({
  ...definition,
  usage: definition.usage ?? defaultUsage(definition),
  usageAuthored: Boolean(definition.usage || definition.maxCharges !== undefined),
  ports: definition.ports ?? defaultPorts(definition),
  effects: definition.effects ?? defaultEffects(definition)
});

function passiveGridItem(definition: {
  id: ItemId;
  name: string;
  rarity: ItemRarity;
  category: ItemCategory;
  tags: ItemTag[];
  effectKey: string;
  trigger: ItemPortTrigger;
  target?: "self" | "enemy";
  effects: ItemEffect[];
  counterplay: string;
  description: string;
}): ItemDefinition {
  return item({
    id: definition.id,
    name: definition.name,
    useContext: "passive",
    rarity: definition.rarity,
    category: definition.category,
    timing: "passive",
    tags: definition.tags,
    effectKey: definition.effectKey,
    ports: [
      {
        id: `${definition.id}-${definition.trigger}`,
        kind: definition.trigger === "combatStart" || definition.trigger === "firstRound" || definition.trigger === "secondRound" || definition.trigger === "thirdRoundPlus" ? "time" : "condition",
        trigger: definition.trigger,
        context: "passive",
        target: definition.target ?? "self"
      }
    ],
    effects: definition.effects,
    counterplay: definition.counterplay,
    description: definition.description
  });
}

export const ITEMS: Record<ItemId, ItemDefinition> = {
  pistol: item({
    id: "pistol",
    name: "手枪",
    useContext: "both",
    rarity: "rare",
    category: "damage",
    timing: "active",
    maxCharges: 5,
    tags: ["ranged", "damage"],
    effectKey: "ranged-shot",
    counterplay: "需要视野和清晰射线；防御减免，正确躲闪可避开，开枪会暴露方向。",
    description: "橙色稀有远程武器，视野内 4 格射击，命中 3 伤害，默认 5 发；开火触发枪口火光和弹道演出。"
  }),
  bandage: item({
    id: "bandage",
    name: "绷带",
    useContext: "field",
    rarity: "rare",
    category: "survival",
    timing: "active",
    usage: { mode: "unlimited", manualLock: "per-round" },
    tags: ["healing", "survival"],
    effectKey: "heal-3",
    counterplay: "只能在战斗外使用，不能抵消已经导致生命归零的伤害；使用会推进一次探索回合。",
    description: "橙色稀有局外治疗道具，无限使用；战斗外回复 3 点生命并花费 1 个探索回合，不能在照面战斗中使用。"
  }),
  "long-knife": item({
    id: "long-knife",
    name: "长刀",
    useContext: "combat",
    rarity: "rare",
    category: "damage",
    timing: "active",
    usage: { mode: "unlimited", manualLock: "per-round" },
    tags: ["melee", "throwable", "damage"],
    effectKey: "first-attack-and-throw",
    counterplay: "防御减免近战；投掷可被正确躲闪规避，投出后失去装备效果。",
    description: "初见第一攻速度 +2，近战伤害 +1；可投掷为 2 格飞刀。"
  }),
  trap: item({
    id: "trap",
    name: "陷阱",
    useContext: "field",
    rarity: "common",
    category: "intel",
    timing: "active",
    tags: ["trap", "intel"],
    effectKey: "alarm-trap",
    counterplay: "高智力可识破；触发后暴露布置痕迹并给出红光提示。",
    description: "放置后敌人触发报警、红光提示并揭示 1 条信息。"
  }),
  glasses: item({
    id: "glasses",
    name: "眼镜",
    useContext: "passive",
    rarity: "common",
    category: "intel",
    timing: "passive",
    tags: ["intel"],
    effectKey: "reveal-item-on-dodge",
    counterplay: "必须先成功躲闪；若对方没有道具只能确认无可见道具。",
    description: "躲闪成功后知晓对方 1 件道具信息。"
  }),
  glow: item({
    id: "glow",
    name: "照明棒",
    useContext: "field",
    rarity: "common",
    category: "intel",
    timing: "active",
    durationTurns: 3,
    tags: ["vision", "intel"],
    effectKey: "vision-boost",
    counterplay: "持续时间短，暴露探索节奏。",
    description: "短暂扩大视野和地图记忆。"
  }),
  echo: item({
    id: "echo",
    name: "回声针",
    useContext: "field",
    rarity: "rare",
    category: "intel",
    timing: "active",
    usage: { mode: "unlimited", manualLock: "per-round" },
    tags: ["scout", "intel"],
    effectKey: "nearest-signal",
    counterplay: "只标出含目标的 2x2 四格回响区，不说明是哪一格，也不保证路径安全；使用会推进一次探索回合。",
    description: "橙色稀有场外侦察道具，无限使用；释放扩散声波并标出含最近道具节点或敌人的 2x2 四格区域，花费 1 个探索回合。"
  }),
  "weighted-grip": item({
    id: "weighted-grip",
    name: "配重握柄",
    useContext: "passive",
    rarity: "common",
    category: "damage",
    timing: "passive",
    tags: ["melee", "damage"],
    effectKey: "first-hit-damage",
    counterplay: "防御取消加成；每场照面触发 1 次。",
    description: "首个命中近战 +1 伤害。"
  }),
  "blade-oil": item({
    id: "blade-oil",
    name: "刀油",
    useContext: "combat",
    rarity: "common",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "heavy-threshold-minus",
    counterplay: "防御取消；未命中即消耗。",
    description: "下一次命中使目标重伤阈值 -1。"
  }),
  "lime-powder": item({
    id: "lime-powder",
    name: "石灰粉",
    useContext: "combat",
    rarity: "common",
    category: "damage",
    timing: "active",
    tags: ["damage", "counter"],
    effectKey: "dodge-penalty",
    counterplay: "防御免疫；使用者暴露意图。",
    description: "目标本轮躲闪 -15%。"
  }),
  "throwing-knife": item({
    id: "throwing-knife",
    name: "飞刀",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["throwable", "damage"],
    effectKey: "short-throw",
    counterplay: "正确躲闪可避开；一次性。",
    description: "视野内 2 格投掷，造成 2 伤害。"
  }),
  "sleeve-stone": item({
    id: "sleeve-stone",
    name: "袖中石",
    useContext: "combat",
    rarity: "common",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "tie-strength",
    counterplay: "对方躲闪会使其落空。",
    description: "同速互攻时本轮力量视为 +1。"
  }),
  "ice-awl": item({
    id: "ice-awl",
    name: "冰锥",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    durationTurns: 2,
    tags: ["melee", "damage"],
    effectKey: "temporary-melee-damage",
    counterplay: "拖延后失效；防御仍减免。",
    description: "2 回合临时近战 +1 伤害。"
  }),
  caltrops: item({
    id: "caltrops",
    name: "铁蒺藜",
    useContext: "field",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["trap", "damage"],
    effectKey: "speed-trap",
    counterplay: "高智力可识破；一次性。",
    description: "放置后踩中 1 伤害且下轮速度 -1。"
  }),
  "hook-rope": item({
    id: "hook-rope",
    name: "钩绳",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["mobility", "counter"],
    effectKey: "flee-penalty",
    counterplay: "成功躲闪可摆脱。",
    description: "优势窗口使用，目标下次逃跑 -20%。"
  }),
  "acid-vial": item({
    id: "acid-vial",
    name: "腐蚀小瓶",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["damage"],
    effectKey: "minor-dot",
    counterplay: "绷带或凝血粉可清除。",
    description: "命中后造成 1 回合轻微持续伤害。"
  }),
  "old-magazine": item({
    id: "old-magazine",
    name: "旧弹夹",
    useContext: "both",
    rarity: "rare",
    category: "damage",
    timing: "active",
    usage: { mode: "unlimited", manualLock: "per-round" },
    tags: ["ammo"],
    effectKey: "pistol-ammo",
    counterplay: "无枪或满弹时不能启动；换弹花费 2 回合，期间若进入照面则失败。",
    description: "无限使用的换弹工具；战斗外花费 2 回合，完成后给手枪 +2 发，最多补到 5 发。"
  }),
  "thick-cloth": item({
    id: "thick-cloth",
    name: "厚布衣",
    useContext: "passive",
    rarity: "common",
    category: "survival",
    timing: "passive",
    tags: ["survival"],
    effectKey: "first-melee-reduce",
    counterplay: "对手枪和腐蚀无效。",
    description: "每场照面首次近战伤害 -1。"
  }),
  bracer: item({
    id: "bracer",
    name: "护臂",
    useContext: "passive",
    rarity: "uncommon",
    category: "survival",
    timing: "passive",
    tags: ["survival", "intel"],
    effectKey: "first-defend-bonus",
    counterplay: "只在防御动作触发。",
    description: "首次防御额外 -1 伤害并获得 1 条信息。"
  }),
  "smoke-ball": item({
    id: "smoke-ball",
    name: "烟雾球",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility", "vision"],
    effectKey: "smoke-flee",
    counterplay: "偏光片反制；持续很短。",
    description: "优势窗口使用，逃跑 +20%，双方视野短暂下降。"
  }),
  painkiller: item({
    id: "painkiller",
    name: "止痛片",
    useContext: "combat",
    rarity: "common",
    category: "survival",
    timing: "active",
    durationTurns: 2,
    tags: ["survival"],
    effectKey: "ignore-heavy-wound",
    counterplay: "不回血；结束后惩罚恢复。",
    description: "2 回合忽略重伤行动惩罚。"
  }),
  "coagulation-powder": item({
    id: "coagulation-powder",
    name: "凝血粉",
    useContext: "both",
    rarity: "common",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival"],
    effectKey: "cleanse-or-heal-1",
    counterplay: "无持续伤害时收益很小。",
    description: "移除 1 个流血/持续伤害或回复 1 点生命。"
  }),
  "wood-shield": item({
    id: "wood-shield",
    name: "木盾片",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "reaction",
    tags: ["survival", "counter"],
    effectKey: "breakable-damage-reduce",
    counterplay: "对远程只 -1；一次性。",
    description: "反应使用，本次伤害 -2 后破碎。"
  }),
  "soft-shoes": item({
    id: "soft-shoes",
    name: "软底鞋",
    useContext: "passive",
    rarity: "common",
    category: "survival",
    timing: "passive",
    tags: ["mobility"],
    effectKey: "first-dodge-flee",
    counterplay: "被陷阱、铁蒺藜克制。",
    description: "每场首次躲闪或逃跑 +10%。"
  }),
  "steady-charm": item({
    id: "steady-charm",
    name: "稳心符",
    useContext: "passive",
    rarity: "common",
    category: "survival",
    timing: "passive",
    tags: ["survival", "intel"],
    effectKey: "ambush-reduce",
    counterplay: "只触发 1 次。",
    description: "首次未见远程先手伤害 -1 并给方向提示。"
  }),
  "adrenaline-shot": item({
    id: "adrenaline-shot",
    name: "肾上针",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility"],
    effectKey: "temporary-speed",
    counterplay: "结束后 1 回合速度 -1；不叠加。",
    description: "2 回合速度 +1。"
  }),
  splint: item({
    id: "splint",
    name: "夹板",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["survival"],
    effectKey: "debuff-duration-reduce",
    counterplay: "不能防止生命归零。",
    description: "优势窗口使用，使一次重伤 debuff 持续 -1。"
  }),
  lens: item({
    id: "lens",
    name: "镜片",
    useContext: "combat",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    maxCharges: 1,
    tags: ["intel"],
    effectKey: "next-attack-direction",
    counterplay: "用后破碎；只揭示下一次攻击方向，不提供属性、道具或后续回合方向。",
    description: "战斗中揭示敌人下一次攻击方向。"
  }),
  "counting-beads": item({
    id: "counting-beads",
    name: "计数珠",
    useContext: "passive",
    rarity: "common",
    category: "intel",
    timing: "passive",
    tags: ["intel"],
    effectKey: "reveal-charges",
    counterplay: "必须先看见使用者或道具。",
    description: "看见敌人使用充能道具时，显示剩余次数。"
  }),
  notebook: item({
    id: "notebook",
    name: "记事本",
    useContext: "passive",
    rarity: "common",
    category: "intel",
    timing: "passive",
    tags: ["intel"],
    effectKey: "extra-stat-intel",
    counterplay: "每名敌人触发 1 次。",
    description: "首次获得敌人情报时，额外记录最高或最低属性。"
  }),
  "scent-powder": item({
    id: "scent-powder",
    name: "气味粉",
    useContext: "combat",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    durationTurns: 5,
    tags: ["intel", "scout"],
    effectKey: "mark-enemy",
    counterplay: "敌人脱离过远后失效。",
    description: "标记可见敌人，5 回合内显示大致方向。"
  }),
  "black-cloth": item({
    id: "black-cloth",
    name: "黑布",
    useContext: "field",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    durationTurns: 2,
    tags: ["vision"],
    effectKey: "visibility-reduce",
    counterplay: "攻击或开枪即失效。",
    description: "2 回合内未攻击时自身被看见距离 -1。"
  }),
  "bell-wire": item({
    id: "bell-wire",
    name: "铜铃线",
    useContext: "field",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    tags: ["trap", "intel"],
    effectKey: "equipment-alarm",
    counterplay: "可被高智力识破或绕开。",
    description: "布置后触发方向提示，并揭示触发者一类装备。"
  }),
  "polarized-lens": item({
    id: "polarized-lens",
    name: "偏光片",
    useContext: "passive",
    rarity: "common",
    category: "intel",
    timing: "passive",
    tags: ["vision", "counter"],
    effectKey: "smoke-flash-immunity",
    counterplay: "只触发 1 次。",
    description: "首次免疫烟雾或强光造成的视野惩罚。"
  }),
  "marked-coin": item({
    id: "marked-coin",
    name: "标记硬币",
    useContext: "both",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    tags: ["persuasion", "intel"],
    effectKey: "persuasion-payment",
    counterplay: "支付后移除。",
    description: "说服支付 +1，并判断敌人是否偏好支付。"
  }),
  "voice-whistle": item({
    id: "voice-whistle",
    name: "假声哨",
    useContext: "field",
    rarity: "common",
    category: "intel",
    timing: "active",
    tags: ["scout", "intel"],
    effectKey: "lure-step",
    counterplay: "高智力敌人可能识破。",
    description: "引导附近敌人向指定邻格移动一步。"
  }),
  "rib-hook": item({
    id: "rib-hook",
    name: "肋钩",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    durationTurns: 2,
    tags: ["melee", "damage"],
    effectKey: "advantage-next-melee-damage",
    counterplay: "必须在优势窗口或优势修正后使用；防御仍会减免伤害，拖延一轮后失效。",
    description: "优势后使用，下一动作回合近战伤害 +1。"
  }),
  "ankle-line": item({
    id: "ankle-line",
    name: "绊踝线",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility", "counter"],
    effectKey: "advantage-dodge-penalty",
    counterplay: "必须在优势窗口或优势修正后使用；防御不受影响，目标不躲闪即可规避收益。",
    description: "优势后使用，目标下一动作回合躲闪 -20%。"
  }),
  "chase-spur": item({
    id: "chase-spur",
    name: "追步刺",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility", "damage"],
    effectKey: "advantage-speed",
    counterplay: "必须在优势窗口或优势修正后使用；不叠加，防御和成功躲闪仍可反制。",
    description: "优势后使用，下一动作回合速度 +1。"
  }),
  "counter-plate": item({
    id: "counter-plate",
    name: "反压铁片",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["survival", "counter"],
    effectKey: "advantage-incoming-reduce",
    counterplay: "必须在优势窗口或优势修正后使用；只抵消一次小额伤害，不能阻止生命归零后的失败。",
    description: "优势后使用，下一次受到伤害 -1。"
  }),
  "panic-nail": item({
    id: "panic-nail",
    name: "压胆钉",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility", "counter"],
    effectKey: "advantage-flee-penalty",
    counterplay: "必须在优势窗口或优势修正后使用；目标不逃跑或成功躲闪拖开节奏即可浪费。",
    description: "优势后使用，目标下一次逃跑 -15%。"
  }),
  "focus-thread": item({
    id: "focus-thread",
    name: "定神线",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    durationTurns: 2,
    tags: ["mobility", "survival"],
    effectKey: "advantage-dodge-boost",
    counterplay: "必须在优势窗口或优势修正后使用；仍需选对闪避方向，石灰粉等躲闪惩罚可抵消。",
    description: "优势后使用，下一动作回合躲闪 +15%。"
  }),
  "breath-cord": item({
    id: "breath-cord",
    name: "数息绳",
    useContext: "passive",
    rarity: "common",
    category: "intel",
    timing: "passive",
    tags: ["intel"],
    effectKey: "round-two-stat-or-item",
    counterplay: "对低轮次爆发无效，且推测可能为假。",
    description: "同一敌人战斗第 2 轮后，可获得一条数值或道具推测。"
  }),
  "sharpening-stone": item({
    id: "sharpening-stone",
    name: "磨刀石",
    useContext: "combat",
    rarity: "common",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "next-melee-damage",
    counterplay: "只强化下一次近战命中；防御仍会减免，躲闪会让加成落空。",
    description: "下一次近战命中伤害 +1。"
  }),
  "glass-spike": item({
    id: "glass-spike",
    name: "玻璃刺",
    useContext: "combat",
    rarity: "common",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "round-crit",
    counterplay: "只提高本回合暴击率；未命中无收益，暴击只增加 1 点最终伤害。",
    description: "本回合暴击率 +20%。"
  }),
  "tinder-vial": item({
    id: "tinder-vial",
    name: "火绒瓶",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "next-hit-burn",
    counterplay: "必须命中近战；躲闪可规避，凝血粉可清除。",
    description: "下一次近战命中附加 1 层灼烧。"
  }),
  "poison-needle": item({
    id: "poison-needle",
    name: "毒针",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "next-hit-poison",
    counterplay: "必须命中近战；中毒延迟出伤，可被凝血粉或解毒片清除。",
    description: "下一次近战命中附加 1 层中毒。"
  }),
  "barbed-line": item({
    id: "barbed-line",
    name: "锯齿线",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["melee", "damage"],
    effectKey: "next-hit-bleed",
    counterplay: "必须命中近战；目标防御或停止攻击/躲闪可降低流血损失。",
    description: "下一次近战命中附加 1 层流血。"
  }),
  "frost-nail": item({
    id: "frost-nail",
    name: "冷凝钉",
    useContext: "combat",
    rarity: "rare",
    category: "damage",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["melee", "counter"],
    effectKey: "next-hit-freeze",
    counterplay: "需要优势窗口；必须命中近战，拖延或躲闪都会浪费。",
    description: "优势窗口使用，下一次近战命中附加冻结 1 回合。"
  }),
  "antidote-tablet": item({
    id: "antidote-tablet",
    name: "解毒片",
    useContext: "both",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival"],
    effectKey: "cleanse-poison-heal",
    counterplay: "没有中毒时只回复 1 点生命，收益较低。",
    description: "清除自身中毒，并回复 1 点生命。"
  }),
  "insulation-cloth": item({
    id: "insulation-cloth",
    name: "绝缘布",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["survival", "counter"],
    effectKey: "cleanse-burn-freeze-shield",
    counterplay: "只能保护下一次受伤；对高额伤害有限。",
    description: "清除自身灼烧/冻结，并使下一次受到伤害 -1。"
  }),
  "signal-mirror": item({
    id: "signal-mirror",
    name: "信号镜",
    useContext: "field",
    rarity: "common",
    category: "intel",
    timing: "active",
    tags: ["intel", "scout"],
    effectKey: "visible-item-intel",
    counterplay: "必须先看见目标；只提供道具情报，不提供路线或意图。",
    description: "对视野内 1 名敌人获得 1 条道具情报。"
  }),
  "folded-map": item({
    id: "folded-map",
    name: "折叠地图",
    useContext: "field",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    tags: ["intel", "scout"],
    effectKey: "global-intel",
    counterplay: "情报来自当前场中变量，不保证路线安全。",
    description: "获得 1 条全场变量情报。"
  }),
  "runner-knot": item({
    id: "runner-knot",
    name: "跑绳结",
    useContext: "field",
    rarity: "uncommon",
    category: "utility",
    timing: "active",
    tags: ["mobility"],
    effectKey: "two-step-move",
    counterplay: "不能穿墙或穿过单位；使用后推进回合。",
    description: "沿当前朝向连续移动最多 2 格。"
  }),
  "signal-flare": item({
    id: "signal-flare",
    name: "信号火",
    useContext: "field",
    rarity: "rare",
    category: "intel",
    timing: "active",
    durationTurns: 2,
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["vision", "intel"],
    effectKey: "flare-vision",
    counterplay: "视野收益很短，同时会暴露自身当前位置提示。",
    description: "2 回合内明亮视野 +4，并暴露当前位置提示。"
  }),
  "soot-hook": item({
    id: "soot-hook",
    name: "煤钩",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "burn-dodge-synergy",
    ports: [{ id: "soot-hook-burn", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "enemy" }],
    counterplay: "必须由持有者先造成灼烧；防御和躲闪可以让灼烧来源落空，清除灼烧会切断后续收益。",
    description: "持有者造成灼烧时，目标下个动作回合躲闪 -10%。"
  }),
  "venom-saw": item({
    id: "venom-saw",
    name: "毒锯片",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "poison-damage-synergy",
    ports: [{ id: "venom-saw-poison", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "self" }],
    counterplay: "必须由持有者先造成中毒；毒被清除或命中被躲开时不会转化为后续伤害。",
    description: "持有者造成中毒时，自己的下一次近战命中伤害 +1。"
  }),
  "blood-knot": item({
    id: "blood-knot",
    name: "血结绳",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "mobility"],
    effectKey: "bleed-speed-synergy",
    ports: [{ id: "blood-knot-bleed", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "self" }],
    counterplay: "必须由持有者先造成流血；防御、躲闪和止血类道具会降低触发价值。",
    description: "持有者造成流血时，自己下个动作回合速度 +1。"
  }),
  "frost-latch": item({
    id: "frost-latch",
    name: "霜扣",
    useContext: "passive",
    rarity: "uncommon",
    category: "survival",
    timing: "passive",
    tags: ["survival", "counter"],
    effectKey: "freeze-guard-synergy",
    ports: [{ id: "frost-latch-freeze", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "self" }],
    counterplay: "必须由持有者先造成冻结；冻结来源通常稀少且可通过优势窗口、躲闪或清除道具反制。",
    description: "持有者造成冻结时，自己的下一次受伤 -1。"
  }),
  "lens-thread": item({
    id: "lens-thread",
    name: "镜线",
    useContext: "passive",
    rarity: "uncommon",
    category: "intel",
    timing: "passive",
    tags: ["intel", "counter"],
    effectKey: "dodge-crit-intel",
    ports: [{ id: "lens-thread-dodge", kind: "condition", trigger: "onDodgeSuccess", context: "passive", target: "self" }],
    counterplay: "必须先成功躲闪；敌人不攻击、攻击方向判断失败或用防御压制时不会触发。",
    description: "成功躲闪后获得 1 条道具情报，并在下个动作回合暴击率 +10%。"
  }),
  "stitch-kit": item({
    id: "stitch-kit",
    name: "缝合包",
    useContext: "both",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival"],
    effectKey: "cleanse-status-to-damage",
    counterplay: "需要手动消耗；没有负面状态时只提供少量回复，无法阻止已经归零的伤害。",
    description: "清除自身灼烧/中毒/流血；若清除了状态，下一次近战命中伤害 +1，否则回复 1 生命。"
  }),
  "tripwire-spool": item({
    id: "tripwire-spool",
    name: "绊线卷",
    useContext: "field",
    rarity: "uncommon",
    category: "intel",
    timing: "active",
    tags: ["trap", "intel"],
    effectKey: "bleed-trap-intel",
    counterplay: "需要预先布置；高智力敌人后续可通过路径选择规避，触发后即清空。",
    description: "布置后，触发敌人受到 1 点伤害并暴露 1 条属性数值情报。"
  }),
  "red-compass": item({
    id: "red-compass",
    name: "红针罗盘",
    useContext: "field",
    rarity: "common",
    category: "intel",
    timing: "active",
    tags: ["intel", "scout"],
    effectKey: "rare-loot-signal",
    counterplay: "只提示最近含 uncommon/rare 的拾取点方向与距离，不揭示路径安全，也不阻止敌人先拾取。",
    description: "指出最近含较高稀有度道具的未清空拾取点方向与距离，并在地图上给出提示。"
  }),
  "smoke-needle": item({
    id: "smoke-needle",
    name: "烟针",
    useContext: "combat",
    rarity: "uncommon",
    category: "damage",
    timing: "active",
    tags: ["damage", "counter"],
    effectKey: "dodge-poison-counter",
    counterplay: "必须先手动准备并成功躲闪；敌人防御、远程压制或判断方向失败都会让它空耗。",
    description: "准备后，下一次成功躲闪会令攻击者中毒 1 层。"
  }),
  "thorn-plate": item({
    id: "thorn-plate",
    name: "刺片",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "reaction",
    tags: ["survival", "counter"],
    effectKey: "thorn-counter-bleed",
    counterplay: "只在下一次受到近战命中时反扎；远程、说服、逃跑或拖延会让效果失效。",
    description: "准备后，下一次受到近战命中时令攻击者流血 1 层。"
  }),
  "salve-tin": item({
    id: "salve-tin",
    name: "药膏铁盒",
    useContext: "both",
    rarity: "common",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival"],
    effectKey: "heal-1",
    counterplay: "每回合同一实例只能使用一次；场外使用会推进回合，可能让敌人靠近。",
    description: "回复 1 点生命。"
  }),
  "field-ration": item({
    id: "field-ration",
    name: "压缩口粮",
    useContext: "field",
    rarity: "common",
    category: "survival",
    timing: "active",
    maxCharges: 2,
    tags: ["healing", "survival"],
    effectKey: "field-heal-2",
    counterplay: "只能在战斗外使用；使用会推进回合，敌人也会移动。",
    description: "战斗外回复 2 点生命，共 2 次。"
  }),
  "charcoal-tablet": item({
    id: "charcoal-tablet",
    name: "炭净片",
    useContext: "both",
    rarity: "common",
    category: "survival",
    timing: "active",
    maxCharges: 2,
    tags: ["healing", "survival", "counter"],
    effectKey: "charcoal-cleanse-heal",
    counterplay: "没有中毒时只回复 1 点生命；固定次数有限。",
    description: "清除自身中毒，并回复 1 点生命。"
  }),
  "pressure-bandage": item({
    id: "pressure-bandage",
    name: "压伤绷带",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival"],
    effectKey: "advantage-heal-3",
    ports: [{ id: "pressure-bandage-advantage", kind: "manual", trigger: "advantage", context: "combat", requiresAdvantage: true, target: "self" }],
    counterplay: "必须先取得优势窗口；使用后关闭本次优势窗口，不能防止已经归零的伤害。",
    description: "优势窗口使用，回复 3 点生命并回到继续战斗。"
  }),
  "heat-pad": item({
    id: "heat-pad",
    name: "暖石贴",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["healing", "survival", "counter"],
    effectKey: "heal-shield",
    counterplay: "只抵消下一次伤害 1 点；拖延或小伤也会消耗保护。",
    description: "回复 1 点生命，并使下一次受到的伤害 -1。"
  }),
  "blood-sponge": item({
    id: "blood-sponge",
    name: "血吸垫",
    useContext: "combat",
    rarity: "uncommon",
    category: "survival",
    timing: "active",
    tags: ["healing", "melee", "survival"],
    effectKey: "next-hit-heal",
    counterplay: "必须下一次近战命中才回血；躲闪、防御拖延或远程对抗可让它落空。",
    description: "准备后，下一次近战命中回复 1 点生命。"
  }),
  "mercy-thread": item({
    id: "mercy-thread",
    name: "缓息线",
    useContext: "passive",
    rarity: "common",
    category: "survival",
    timing: "passive",
    tags: ["healing", "survival", "mobility"],
    effectKey: "dodge-heal",
    ports: [{ id: "mercy-thread-dodge", kind: "condition", trigger: "onDodgeSuccess", context: "passive", target: "self" }],
    counterplay: "必须成功躲闪且自身有伤；敌人不攻击、方向判断失败或远程压制都会降低触发率。",
    description: "每场照面首次成功躲闪后回复 1 点生命。"
  }),
  "emergency-syringe": item({
    id: "emergency-syringe",
    name: "急救针",
    useContext: "passive",
    rarity: "rare",
    category: "survival",
    timing: "passive",
    tags: ["healing", "survival", "counter"],
    effectKey: "emergency-heal",
    ports: [{ id: "emergency-syringe-heavy", kind: "condition", trigger: "onHeavyWoundTaken", context: "passive", target: "self" }],
    counterplay: "每局只触发一次，破碎后不掉落；若爆发伤害直接归零则无法挽救。",
    description: "生命未归零且降到重伤阈值内时自动回复 4 点生命，然后破碎。"
  }),
  "lead-wrap": item({
    id: "lead-wrap",
    name: "铅缠带",
    useContext: "passive",
    rarity: "common",
    category: "damage",
    timing: "passive",
    tags: ["melee", "damage"],
    effectKey: "passive-strength",
    ports: [{ id: "lead-wrap-start", kind: "time", trigger: "combatStart", context: "passive", target: "self" }],
    counterplay: "只提高力量，不提高速度；防御仍会稳定减免伤害。",
    description: "战斗开始后，本场力量 +1。"
  }),
  "ankle-spring": item({
    id: "ankle-spring",
    name: "踝簧",
    useContext: "passive",
    rarity: "uncommon",
    category: "survival",
    timing: "passive",
    tags: ["mobility"],
    effectKey: "passive-speed",
    ports: [{ id: "ankle-spring-start", kind: "time", trigger: "combatStart", context: "passive", target: "self" }],
    counterplay: "只提供小额先后手优势；减速道具和正确防御仍可反制。",
    description: "战斗开始后，本场速度 +1。"
  }),
  "cracked-scope": item({
    id: "cracked-scope",
    name: "裂准镜",
    useContext: "passive",
    rarity: "common",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "passive-crit",
    ports: [{ id: "cracked-scope-start", kind: "time", trigger: "combatStart", context: "passive", target: "self" }],
    counterplay: "暴击必须先命中；躲闪和防御都能压低收益。",
    description: "战斗开始后，本场暴击率 +8%。"
  }),
  "spark-fuse": item({
    id: "spark-fuse",
    name: "火星引线",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "melee"],
    effectKey: "first-round-burn",
    ports: [{ id: "spark-fuse-first", kind: "time", trigger: "firstRound", context: "passive", target: "self" }],
    counterplay: "只准备下一次近战命中；躲闪或拖延可让灼烧落空。",
    description: "第 1 动作回合开始时，下一次近战命中附加灼烧。"
  }),
  "second-breath": item({
    id: "second-breath",
    name: "二息带",
    useContext: "passive",
    rarity: "common",
    category: "survival",
    timing: "passive",
    tags: ["mobility", "survival"],
    effectKey: "second-round-dodge",
    ports: [{ id: "second-breath-round", kind: "time", trigger: "secondRound", context: "passive", target: "self" }],
    counterplay: "仍需读对攻击方向；石灰粉和绊踝线可抵消。",
    description: "第 2 动作回合开始时，本回合躲闪 +15%。"
  }),
  "rust-cloud": item({
    id: "rust-cloud",
    name: "锈粉囊",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["counter", "damage"],
    effectKey: "third-round-dodge-down",
    ports: [{ id: "rust-cloud-late", kind: "time", trigger: "thirdRoundPlus", context: "passive", target: "enemy" }],
    counterplay: "第三回合后才生效；快速击杀、逃跑或说服可避开。",
    description: "第 3 动作回合起，每回合让目标本回合躲闪 -10%。"
  }),
  "coal-beads": item({
    id: "coal-beads",
    name: "煤珠串",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "burn-crit-synergy",
    ports: [{ id: "coal-beads-burn", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "self" }],
    counterplay: "必须先施加灼烧；清除灼烧或躲开灼烧来源即可切断。",
    description: "持有者施加灼烧时，下个动作回合暴击率 +10%。"
  }),
  "toxin-skein": item({
    id: "toxin-skein",
    name: "毒丝束",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "poison-speed-synergy",
    ports: [{ id: "toxin-skein-poison", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "enemy" }],
    counterplay: "必须先施加中毒；解毒和抢先脱战可降低价值。",
    description: "持有者施加中毒时，目标下个动作回合速度 -1。"
  }),
  "cold-rivet": item({
    id: "cold-rivet",
    name: "冷铆钉",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "freeze-damage-synergy",
    ports: [{ id: "cold-rivet-freeze", kind: "condition", trigger: "onStatusApplied", context: "passive", target: "self" }],
    counterplay: "冻结来源稀少且常需要优势；躲闪冻结来源即可反制。",
    description: "持有者施加冻结时，下一次近战命中伤害 +1。"
  }),
  "crit-hook": item({
    id: "crit-hook",
    name: "裂口钩",
    useContext: "passive",
    rarity: "uncommon",
    category: "damage",
    timing: "passive",
    tags: ["damage", "counter"],
    effectKey: "crit-bleed",
    ports: [{ id: "crit-hook-crit", kind: "condition", trigger: "onCrit", context: "passive", target: "enemy" }],
    counterplay: "必须先暴击；防御和躲闪能降低触发机会。",
    description: "持有者暴击时，目标获得 1 层流血。"
  }),
  "guard-breaker": item({
    id: "guard-breaker",
    name: "破挡楔",
    useContext: "passive",
    rarity: "common",
    category: "damage",
    timing: "passive",
    tags: ["melee", "damage"],
    effectKey: "guard-hit-damage",
    ports: [{ id: "guard-breaker-hit", kind: "condition", trigger: "onDefendedHit", context: "passive", target: "self" }],
    counterplay: "目标不防御或成功躲闪时不会触发。",
    description: "击中正在防御的目标时，下一次近战命中伤害 +1。"
  }),
  "servo-heel": passiveGridItem({ id: "servo-heel", name: "伺服鞋跟", rarity: "uncommon", category: "survival", tags: ["mobility"], effectKey: "grid-uncommon-stat", trigger: "combatStart", effects: [{ kind: "stat", stat: "speed", amount: 1 }], counterplay: "只提高先后手；减速、冻结和防御仍可拖住节奏。", description: "战斗开始后，本场速度 +1。" }),
  "mnemonic-plate": passiveGridItem({ id: "mnemonic-plate", name: "记忆钢片", rarity: "uncommon", category: "intel", tags: ["intel"], effectKey: "grid-uncommon-stat", trigger: "combatStart", effects: [{ kind: "stat", stat: "intellect", amount: 1 }], counterplay: "只提升情报与说服预算；不能直接阻止伤害。", description: "战斗开始后，本场智力 +1。" }),
  "knuckle-core": passiveGridItem({ id: "knuckle-core", name: "指节铁芯", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-stat", trigger: "combatStart", effects: [{ kind: "stat", stat: "strength", amount: 1 }], counterplay: "不提供命中和速度；防御仍会压低实际伤害。", description: "战斗开始后，本场力量 +1。" }),
  "exit-charm": passiveGridItem({ id: "exit-charm", name: "出口符牌", rarity: "common", category: "utility", tags: ["mobility"], effectKey: "grid-common-flee", trigger: "combatStart", effects: [{ kind: "stat", stat: "flee", amount: 10 }], counterplay: "只有尝试逃脱时有收益；钩绳、压胆钉和高速度追击可抵消。", description: "战斗开始后，本场逃脱概率 +10%。" }),
  "opener-gear": passiveGridItem({ id: "opener-gear", name: "开局齿轮", rarity: "common", category: "survival", tags: ["mobility"], effectKey: "grid-common-stat", trigger: "firstRound", effects: [{ kind: "stat", stat: "speed", amount: 1, durationRounds: 1 }], counterplay: "只在首回合生效；拖到后续回合即失去价值。", description: "首回合速度 +1。" }),
  "first-glint": passiveGridItem({ id: "first-glint", name: "初光片", rarity: "common", category: "intel", tags: ["intel"], effectKey: "grid-common-intel", trigger: "firstRound", effects: [{ kind: "intel", label: "first-round-intel" }], counterplay: "只给结构化情报，不提供数值防护。", description: "首回合获得 1 条情报。" }),
  "pilot-flame": passiveGridItem({ id: "pilot-flame", name: "引燃头", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-status", trigger: "firstRound", target: "enemy", effects: [{ kind: "status", status: "burn", amount: 1 }], counterplay: "必须在首回合后命中；防御、躲闪或拖延可浪费火种。", description: "首回合准备火种，下一次近战命中施加燃烧。" }),
  "rawhide-guard": passiveGridItem({ id: "rawhide-guard", name: "生皮护边", rarity: "common", category: "survival", tags: ["survival", "mobility"], effectKey: "grid-common-dodge", trigger: "firstRound", effects: [{ kind: "stat", stat: "dodge", amount: 10, durationRounds: 1 }], counterplay: "只在首回合提高闪避，不改变左右读向。", description: "首回合闪避 +10%。" }),
  "second-gear": passiveGridItem({ id: "second-gear", name: "二段齿轮", rarity: "common", category: "damage", tags: ["melee", "damage"], effectKey: "grid-common-stat", trigger: "secondRound", effects: [{ kind: "stat", stat: "strength", amount: 1, durationRounds: 1 }], counterplay: "只在次回合生效；首回合压制或脱战可绕开。", description: "次回合力量 +1。" }),
  "coolant-breath": passiveGridItem({ id: "coolant-breath", name: "冷却气囊", rarity: "common", category: "survival", tags: ["healing", "survival"], effectKey: "grid-common-heal", trigger: "secondRound", effects: [{ kind: "heal", amount: 1 }], counterplay: "回复量小；爆发伤害仍可直接压倒。", description: "次回合回复 1 点生命。" }),
  "second-sight": passiveGridItem({ id: "second-sight", name: "二次校准片", rarity: "uncommon", category: "intel", tags: ["intel"], effectKey: "grid-uncommon-stat", trigger: "secondRound", effects: [{ kind: "stat", stat: "intellect", amount: 1, durationRounds: 1 }], counterplay: "只提高本回合情报/说服预算，不直接增加伤害。", description: "次回合智力 +1。" }),
  "venom-timer": passiveGridItem({ id: "venom-timer", name: "延时毒囊", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-status", trigger: "secondRound", target: "enemy", effects: [{ kind: "status", status: "poison", amount: 1 }], counterplay: "需要后续近战命中；解毒和防御可降低价值。", description: "次回合准备毒囊，下一次近战命中施加中毒。" }),
  "long-fuse": passiveGridItem({ id: "long-fuse", name: "长引线", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-status", trigger: "thirdRoundPlus", target: "enemy", effects: [{ kind: "status", status: "burn", amount: 1 }], counterplay: "第三回合后才启动；快速击败、逃跑或说服可避开。", description: "第三回合起，每回合准备一次燃烧近战。" }),
  "fatigue-tax": passiveGridItem({ id: "fatigue-tax", name: "疲劳刻痕", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-threshold", trigger: "thirdRoundPlus", target: "enemy", effects: [{ kind: "stat", stat: "heavyThreshold", amount: -1 }], counterplay: "需要拖到第三回合并命中；防御会压低伤害。", description: "第三回合起，下一次近战重伤阈值 -1。" }),
  "bunker-prayer": passiveGridItem({ id: "bunker-prayer", name: "地堡祈牌", rarity: "rare", category: "survival", tags: ["healing", "survival"], effectKey: "grid-rare-heal-loop", trigger: "thirdRoundPlus", effects: [{ kind: "heal", amount: 1 }], counterplay: "必须拖入第三回合；爆发、重伤和说服可避免其慢慢回血。", description: "第三回合起，每回合回复 1 点生命。" }),
  "escape-count": passiveGridItem({ id: "escape-count", name: "逃生计数绳", rarity: "common", category: "utility", tags: ["mobility"], effectKey: "grid-common-flee", trigger: "thirdRoundPlus", effects: [{ kind: "stat", stat: "flee", amount: 10 }], counterplay: "需要优势窗口才能真正尝试逃脱；封锁逃跑的道具可抵消。", description: "第三回合起，下次逃脱 +10%。" }),
  "spring-step": passiveGridItem({ id: "spring-step", name: "弹簧步带", rarity: "common", category: "survival", tags: ["mobility"], effectKey: "grid-common-stat", trigger: "onDodgeSuccess", effects: [{ kind: "stat", stat: "speed", amount: 1 }], counterplay: "必须成功躲闪；攻击方向读错时很难触发。", description: "闪避成功后，下个动作回合速度 +1。" }),
  "dust-kicker": passiveGridItem({ id: "dust-kicker", name: "扬尘片", rarity: "common", category: "damage", tags: ["counter", "damage"], effectKey: "grid-common-damage", trigger: "onDodgeSuccess", target: "enemy", effects: [{ kind: "rangedDamage", amount: 1 }], counterplay: "必须成功躲闪；远程、说服或防御不会触发。", description: "闪避成功后，对攻击者造成 1 点伤害。" }),
  "slip-venom": passiveGridItem({ id: "slip-venom", name: "滑毒线", rarity: "uncommon", category: "damage", tags: ["counter", "damage"], effectKey: "grid-uncommon-status", trigger: "onDodgeSuccess", target: "enemy", effects: [{ kind: "status", status: "poison", amount: 1 }], counterplay: "必须成功躲闪；对手不攻击时不会触发。", description: "闪避成功后，攻击者中毒。" }),
  "dodge-reader": passiveGridItem({ id: "dodge-reader", name: "侧闪读片", rarity: "common", category: "intel", tags: ["intel", "mobility"], effectKey: "grid-common-intel", trigger: "onDodgeSuccess", effects: [{ kind: "intel", label: "dodge-intel" }], counterplay: "只给情报；无法直接避免下一次伤害。", description: "闪避成功后获得 1 条情报。" }),
  "guard-lens": passiveGridItem({ id: "guard-lens", name: "防御镜片", rarity: "common", category: "intel", tags: ["intel", "survival"], effectKey: "grid-common-intel", trigger: "onDefendSuccess", effects: [{ kind: "intel", label: "guard-intel" }], counterplay: "只在选择防御后触发；主动压制可迫使其少拿节奏。", description: "防御成功后获得 1 条情报。" }),
  "brace-piston": passiveGridItem({ id: "brace-piston", name: "护架活塞", rarity: "common", category: "damage", tags: ["survival", "melee"], effectKey: "grid-common-stat", trigger: "onDefendSuccess", effects: [{ kind: "stat", stat: "strength", amount: 1 }], counterplay: "必须防御成功；可用说服、逃跑或远程避开反打。", description: "防御成功后，下个动作回合力量 +1。" }),
  "shield-spark": passiveGridItem({ id: "shield-spark", name: "盾火石", rarity: "uncommon", category: "damage", tags: ["survival", "counter"], effectKey: "grid-uncommon-status", trigger: "onDefendSuccess", target: "enemy", effects: [{ kind: "status", status: "burn", amount: 1 }], counterplay: "需要防御窗口；对手可不进攻或用远程/状态逼迫。", description: "防御成功后，攻击者燃烧。" }),
  "calm-mouthpiece": passiveGridItem({ id: "calm-mouthpiece", name: "稳声咬嘴", rarity: "common", category: "utility", tags: ["persuasion", "survival"], effectKey: "grid-common-persuasion", trigger: "onDefendSuccess", effects: [{ kind: "stat", stat: "persuasion", amount: 1 }], counterplay: "需要优势窗口才能把说服修正变成停战。", description: "防御成功后，下次说服 +1。" }),
  "wound-motor": passiveGridItem({ id: "wound-motor", name: "伤口马达", rarity: "common", category: "damage", tags: ["melee", "damage"], effectKey: "grid-common-stat", trigger: "onHeavyWoundDealt", effects: [{ kind: "stat", stat: "speed", amount: 1 }], counterplay: "必须先造成重伤；防御和治疗能压低后续收益。", description: "造成重伤后，下个动作回合速度 +1。" }),
  "crack-reader": passiveGridItem({ id: "crack-reader", name: "裂纹读片", rarity: "common", category: "intel", tags: ["intel", "damage"], effectKey: "grid-common-intel", trigger: "onHeavyWoundDealt", effects: [{ kind: "intel", label: "heavy-dealt-intel" }], counterplay: "必须先打出重伤；低伤害构筑难以触发。", description: "造成重伤后获得 1 条情报。" }),
  "crush-salt": passiveGridItem({ id: "crush-salt", name: "压碎盐包", rarity: "rare", category: "damage", tags: ["damage", "counter"], effectKey: "grid-rare-freeze", trigger: "onHeavyWoundDealt", target: "enemy", effects: [{ kind: "status", status: "freeze", amount: 1 }], counterplay: "必须先造成重伤；防御、躲闪和高体质能减少触发。", description: "造成重伤后，目标冻结。" }),
  "ember-step": passiveGridItem({ id: "ember-step", name: "余烬踏板", rarity: "common", category: "damage", tags: ["mobility", "damage"], effectKey: "grid-common-stat", trigger: "onStatusApplied", effects: [{ kind: "stat", stat: "speed", amount: 1 }], counterplay: "必须先成功施加燃烧；清火和躲开火源可反制。", description: "施加燃烧后，下个动作回合速度 +1。" }),
  "heat-read": passiveGridItem({ id: "heat-read", name: "热读片", rarity: "common", category: "intel", tags: ["intel", "damage"], effectKey: "grid-common-intel", trigger: "onStatusApplied", effects: [{ kind: "intel", label: "burn-intel" }], counterplay: "必须先施加燃烧；只提供情报，不保证反打。", description: "施加燃烧后获得 1 条情报。" }),
  "ash-threshold": passiveGridItem({ id: "ash-threshold", name: "灰线刻尺", rarity: "uncommon", category: "damage", tags: ["melee", "damage"], effectKey: "grid-uncommon-threshold", trigger: "onStatusApplied", effects: [{ kind: "stat", stat: "heavyThreshold", amount: -1 }], counterplay: "必须先施加燃烧，再命中下一次近战。", description: "施加燃烧后，下一次近战重伤阈值 -1。" }),
  "toxic-focus": passiveGridItem({ id: "toxic-focus", name: "毒焦环", rarity: "uncommon", category: "damage", tags: ["damage"], effectKey: "grid-uncommon-crit", trigger: "onStatusApplied", effects: [{ kind: "stat", stat: "critChance", amount: 10 }], counterplay: "必须先施加中毒；暴击仍受概率限制。", description: "施加中毒后，下个动作回合暴击率 +10%。" }),
  "bitter-mouth": passiveGridItem({ id: "bitter-mouth", name: "苦味咬嘴", rarity: "common", category: "utility", tags: ["persuasion", "damage"], effectKey: "grid-common-persuasion", trigger: "onStatusApplied", effects: [{ kind: "stat", stat: "persuasion", amount: 1 }], counterplay: "必须先施加中毒；说服仍需要优势窗口。", description: "施加中毒后，下次说服 +1。" }),
  "green-pulse": passiveGridItem({ id: "green-pulse", name: "绿脉管", rarity: "common", category: "survival", tags: ["healing", "damage"], effectKey: "grid-common-heal", trigger: "onStatusApplied", effects: [{ kind: "heal", amount: 1 }], counterplay: "必须先施加中毒；回复量小，无法抵消爆发。", description: "施加中毒后，回复 1 点生命。" }),
  "ice-step": passiveGridItem({ id: "ice-step", name: "冰步扣", rarity: "common", category: "survival", tags: ["mobility", "survival"], effectKey: "grid-common-dodge", trigger: "onStatusApplied", effects: [{ kind: "stat", stat: "dodge", amount: 15 }], counterplay: "必须先施加冻结；攻击方向读错仍会降低闪避。", description: "施加冻结后，下个动作回合闪避 +15%。" }),
  "cold-reader": passiveGridItem({ id: "cold-reader", name: "冷读针", rarity: "common", category: "intel", tags: ["intel", "damage"], effectKey: "grid-common-intel", trigger: "onStatusApplied", effects: [{ kind: "intel", label: "freeze-intel" }], counterplay: "必须先施加冻结；不提供直接伤害。", description: "施加冻结后获得 1 条情报。" }),
  "shatter-pin": passiveGridItem({ id: "shatter-pin", name: "碎冰针", rarity: "uncommon", category: "damage", tags: ["damage"], effectKey: "grid-uncommon-damage", trigger: "onStatusApplied", target: "enemy", effects: [{ kind: "rangedDamage", amount: 1 }], counterplay: "必须先施加冻结；触发链上限会限制连续爆发。", description: "施加冻结后，目标受到 1 点伤害。" }),
  "crit-lens": passiveGridItem({ id: "crit-lens", name: "暴击镜片", rarity: "common", category: "intel", tags: ["intel", "damage"], effectKey: "grid-common-intel", trigger: "onCrit", effects: [{ kind: "intel", label: "crit-intel" }], counterplay: "必须先暴击；防御和躲闪都能降低触发机会。", description: "暴击后获得 1 条情报。" }),
  "white-spark": passiveGridItem({ id: "white-spark", name: "白火星", rarity: "uncommon", category: "damage", tags: ["damage"], effectKey: "grid-uncommon-status", trigger: "onCrit", target: "enemy", effects: [{ kind: "status", status: "burn", amount: 1 }], counterplay: "必须先暴击；触发概率依赖其他道具。", description: "暴击后，目标燃烧。" }),
  "snap-sinew": passiveGridItem({ id: "snap-sinew", name: "响筋线", rarity: "common", category: "damage", tags: ["mobility", "damage"], effectKey: "grid-common-stat", trigger: "onCrit", effects: [{ kind: "stat", stat: "speed", amount: 1 }], counterplay: "必须先暴击；只提高后续先后手。", description: "暴击后，下个动作回合速度 +1。" }),
  "pain-wheel": passiveGridItem({ id: "pain-wheel", name: "痛轮", rarity: "common", category: "survival", tags: ["survival", "melee"], effectKey: "grid-common-stat", trigger: "onDamageTaken", effects: [{ kind: "stat", stat: "strength", amount: 1 }], counterplay: "必须先受到伤害；高爆发可能不给反打机会。", description: "受到伤害后，下个动作回合力量 +1。" }),
  "blood-map": passiveGridItem({ id: "blood-map", name: "血迹地图", rarity: "common", category: "intel", tags: ["intel", "survival"], effectKey: "grid-common-intel", trigger: "onDamageTaken", effects: [{ kind: "intel", label: "damage-taken-intel" }], counterplay: "需要先受伤；不提供减伤。", description: "受到伤害后获得 1 条情报。" }),
  "recoil-plate": passiveGridItem({ id: "recoil-plate", name: "反冲铁片", rarity: "uncommon", category: "survival", tags: ["counter", "damage"], effectKey: "grid-uncommon-damage", trigger: "onDamageTaken", target: "enemy", effects: [{ kind: "rangedDamage", amount: 1 }], counterplay: "需要先受到伤害；远程和高伤害仍能压制。", description: "受到伤害后，攻击者受到 1 点伤害。" }),
  "overrun-chain": passiveGridItem({ id: "overrun-chain", name: "越线链", rarity: "rare", category: "damage", tags: ["damage", "counter"], effectKey: "grid-rare-advantage", trigger: "onHighDamageDealt", effects: [{ kind: "stat", stat: "flee", amount: 20 }], counterplay: "必须单次造成至少 5 点伤害；防御和减伤可以压低伤害。", description: "单次造成至少 5 点伤害后，获得优势。" }),
  "hard-receipt": passiveGridItem({ id: "hard-receipt", name: "硬账票", rarity: "common", category: "utility", tags: ["persuasion", "damage"], effectKey: "grid-common-persuasion", trigger: "onHighDamageDealt", effects: [{ kind: "stat", stat: "persuasion", amount: 1 }], counterplay: "必须先打出高伤；说服仍需要优势窗口。", description: "单次造成至少 5 点伤害后，下次说服 +1。" }),
  "marrow-coin": passiveGridItem({ id: "marrow-coin", name: "髓币", rarity: "common", category: "survival", tags: ["healing", "damage"], effectKey: "grid-common-heal", trigger: "onHighDamageDealt", effects: [{ kind: "heal", amount: 1 }], counterplay: "必须先打出高伤；不能治疗溢出生命。", description: "单次造成至少 5 点伤害后，回复 1 点生命。" }),
  "breakwater-splint": passiveGridItem({ id: "breakwater-splint", name: "防波夹板", rarity: "uncommon", category: "survival", tags: ["healing", "survival"], effectKey: "grid-uncommon-heal", trigger: "onHeavyWoundTaken", effects: [{ kind: "heal", amount: 2 }], counterplay: "只有受到重伤才触发；生命归零仍可能来不及挽回。", description: "受到重伤后，回复 2 点生命。" }),
  "trauma-scan": passiveGridItem({ id: "trauma-scan", name: "创伤扫描片", rarity: "common", category: "intel", tags: ["intel", "survival"], effectKey: "grid-common-intel", trigger: "onHeavyWoundTaken", effects: [{ kind: "intel", label: "heavy-taken-intel" }], counterplay: "必须先承受重伤；不提供防护。", description: "受到重伤后获得 1 条情报。" }),
  "last-ice": passiveGridItem({ id: "last-ice", name: "最后冰钉", rarity: "rare", category: "survival", tags: ["counter", "survival"], effectKey: "grid-rare-freeze", trigger: "onHeavyWoundTaken", target: "enemy", effects: [{ kind: "status", status: "freeze", amount: 1 }], counterplay: "必须承受重伤且仍未倒下；高爆发可直接击败。", description: "受到重伤后，攻击者冻结。" }),
  "last-match": passiveGridItem({ id: "last-match", name: "最后火柴", rarity: "rare", category: "survival", tags: ["counter", "damage"], effectKey: "grid-rare-last-stand", trigger: "onOneHp", target: "enemy", effects: [{ kind: "status", status: "burn", amount: 1 }], counterplay: "每场照面只在剩余 1 点生命时触发一次；直接归零不会触发。", description: "生命降到 1 点时，攻击者燃烧。" }),
  "data-spur": passiveGridItem({ id: "data-spur", name: "数据马刺", rarity: "common", category: "intel", tags: ["intel", "damage"], effectKey: "grid-common-crit", trigger: "onIntelGain", effects: [{ kind: "stat", stat: "critChance", amount: 10 }], counterplay: "必须先获得情报；暴击仍需命中和概率。", description: "获得情报后，下个动作回合暴击率 +10%。" }),
  "burning-enchant-gem": item({
    id: "burning-enchant-gem",
    name: "燃烧附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入燃烧附魔。"
  }),
  "venomous-enchant-gem": item({
    id: "venomous-enchant-gem",
    name: "剧毒附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入剧毒附魔。"
  }),
  "frost-enchant-gem": item({
    id: "frost-enchant-gem",
    name: "极寒附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入极寒附魔。"
  }),
  "blood-enchant-gem": item({
    id: "blood-enchant-gem",
    name: "染血附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入染血附魔。"
  }),
  "deadly-enchant-gem": item({
    id: "deadly-enchant-gem",
    name: "致命附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入致命附魔。"
  }),
  "radiant-enchant-gem": item({
    id: "radiant-enchant-gem",
    name: "闪耀附魔宝石",
    useContext: "field",
    rarity: "mythic",
    category: "utility",
    timing: "active",
    usage: { mode: "charges-destroy", maxUses: 1, manualLock: "per-round" },
    tags: ["enchantment"],
    effectKey: "enchant-gem",
    counterplay: "宝石需要战斗外安全窗口；写入后占用道具唯一附魔位。",
    description: "一次性使用，为一件未附魔道具写入闪耀附魔。"
  })
};

export const ALL_ITEM_IDS = Object.keys(ITEMS) as ItemId[];
export const MYTHIC_ITEM_IDS = [...ENCHANTMENT_GEM_IDS];

export const PICKUP_ITEM_POOL: ItemId[] = [
  "bandage",
  "trap",
  "glasses",
  "glow",
  "echo",
  "weighted-grip",
  "blade-oil",
  "lime-powder",
  "throwing-knife",
  "sleeve-stone",
  "ice-awl",
  "caltrops",
  "hook-rope",
  "acid-vial",
  "thick-cloth",
  "bracer",
  "smoke-ball",
  "painkiller",
  "coagulation-powder",
  "wood-shield",
  "soft-shoes",
  "steady-charm",
  "adrenaline-shot",
  "splint",
  "lens",
  "counting-beads",
  "notebook",
  "scent-powder",
  "black-cloth",
  "bell-wire",
  "polarized-lens",
  "marked-coin",
  "voice-whistle",
  "rib-hook",
  "ankle-line",
  "chase-spur",
  "counter-plate",
  "panic-nail",
  "focus-thread",
  "breath-cord",
  "sharpening-stone",
  "glass-spike",
  "tinder-vial",
  "poison-needle",
  "barbed-line",
  "frost-nail",
  "antidote-tablet",
  "insulation-cloth",
  "signal-mirror",
  "folded-map",
  "runner-knot",
  "signal-flare",
  "soot-hook",
  "venom-saw",
  "blood-knot",
  "frost-latch",
  "lens-thread",
  "stitch-kit",
  "tripwire-spool",
  "red-compass",
  "smoke-needle",
  "thorn-plate",
  "salve-tin",
  "field-ration",
  "charcoal-tablet",
  "pressure-bandage",
  "heat-pad",
  "blood-sponge",
  "mercy-thread",
  "emergency-syringe",
  "lead-wrap",
  "ankle-spring",
  "cracked-scope",
  "spark-fuse",
  "second-breath",
  "rust-cloud",
  "coal-beads",
  "toxin-skein",
  "cold-rivet",
  "crit-hook",
  "guard-breaker",
  "servo-heel",
  "mnemonic-plate",
  "knuckle-core",
  "exit-charm",
  "opener-gear",
  "first-glint",
  "pilot-flame",
  "rawhide-guard",
  "second-gear",
  "coolant-breath",
  "second-sight",
  "venom-timer",
  "long-fuse",
  "fatigue-tax",
  "bunker-prayer",
  "escape-count",
  "spring-step",
  "dust-kicker",
  "slip-venom",
  "dodge-reader",
  "guard-lens",
  "brace-piston",
  "shield-spark",
  "calm-mouthpiece",
  "wound-motor",
  "crack-reader",
  "crush-salt",
  "ember-step",
  "heat-read",
  "ash-threshold",
  "toxic-focus",
  "bitter-mouth",
  "green-pulse",
  "ice-step",
  "cold-reader",
  "shatter-pin",
  "crit-lens",
  "white-spark",
  "snap-sinew",
  "pain-wheel",
  "blood-map",
  "recoil-plate",
  "overrun-chain",
  "hard-receipt",
  "marrow-coin",
  "breakwater-splint",
  "trauma-scan",
  "last-ice",
  "last-match",
  "data-spur",
  "long-knife",
  "old-magazine",
  "pistol"
];

export function createInventorySlot(
  itemId: ItemId,
  count = 1,
  state: Partial<Pick<InventorySlot, "charges" | "durability" | "usedFlags" | "lastManualUseRound" | "affix">> = {}
): InventorySlot {
  const itemDefinition = ITEMS[itemId];
  return {
    item: itemDefinition,
    count,
    charges: state.charges ?? itemDefinition.maxCharges ?? itemDefinition.usage.maxUses,
    durability: state.durability,
    usedFlags: state.usedFlags ? { ...state.usedFlags } : {},
    lastManualUseRound: state.lastManualUseRound,
    affix: state.affix ? { ...state.affix } : undefined
  };
}

export function cloneInventorySlot(slot: InventorySlot): InventorySlot {
  return {
    item: slot.item,
    count: slot.count,
    charges: slot.charges,
    durability: slot.durability,
    usedFlags: slot.usedFlags ? { ...slot.usedFlags } : {},
    lastManualUseRound: slot.lastManualUseRound,
    affix: slot.affix ? { ...slot.affix } : undefined
  };
}
