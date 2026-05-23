import { ITEMS } from "./items";
import { carrierTemplateForItem, enchantmentAdjective } from "./systems/enchantmentSystem";
import type { EnchantmentCarrierTemplate } from "./systems/enchantmentSystem";
import type {
  ActiveEffect,
  ActiveEffectStat,
  EnchantmentKind,
  InventorySlot,
  ItemDefinition,
  ItemId,
  StatusEffect,
  StatusEffectType
} from "./types";

export type ItemUiText = {
  uiShort: string;
  uiLimit: string;
  uiEnemyCounter: string;
};

export type EffectUiText = {
  targetLabel: string;
  summary: string;
  duration: string;
  detail: string;
};

const UI_TEXT_OVERRIDES: Partial<Record<ItemId, Partial<ItemUiText>>> = {
  pistol: {
    uiShort: "视野内 4 格射击，命中造成 3 伤害；默认 6 发，弹夹可补到 6 发。",
    uiLimit: "照面内外都可开火；需要视野和直线射线；弹药有限。",
    uiEnemyCounter: "找墙体断线或赌对方向闪避；防御不能减免这把枪。"
  },
  "photon-cut": {
    uiShort: "支付优势出刀；1-2 优势造成 2 伤害，3 优势以上耗尽优势造成优势 x3 伤害。",
    uiLimit: "照面中使用；需要至少 1 点优势；每回合主动道具仍只限 1 件。",
    uiEnemyCounter: "别让持有者存到 3 点优势；用逃跑、压视野或抢先重伤打断。"
  },
  bandage: {
    uiShort: "战斗外包扎伤口，回复 3 点生命；可以反复使用。",
    uiLimit: "无限使用；成功治疗花费 1 个探索回合，满血时不会消耗回合。",
    uiEnemyCounter: "它不能在普通战斗回合救急；逼对方留在照面里。"
  },
  "long-knife": {
    uiShort: "初见第一攻速度 +2，近战伤害 +1；也能投成 2 格飞刀。",
    uiLimit: "投出后失去长刀装备效果。",
    uiEnemyCounter: "第一刀最危险；用防御吃下，或赌对方向躲开投掷。"
  },
  trap: {
    uiShort: "战斗外放置陷阱；敌人踩中会报警、亮红光，并给你 1 条信息。",
    uiLimit: "放置会推进探索回合；触发后消失。",
    uiEnemyCounter: "绕开可疑格；高智力单位更容易识破。"
  },
  glasses: {
    uiShort: "你成功躲闪后，揭示对方 1 件已携带道具。",
    uiLimit: "必须先在照面中躲闪成功。",
    uiEnemyCounter: "用防御或不攻击拖节奏，减少给对方成功躲闪的机会。"
  },
  glow: {
    uiShort: "战斗外短暂扩大视野和地图记忆。",
    uiLimit: "持续很短；使用后推进探索节奏。",
    uiEnemyCounter: "灯亮时会暴露路线压力；贴墙逼近或等光效过去。"
  },
  echo: {
    uiShort: "战斗外释放声波，标出含最近敌人或道具节点的 2x2 回响区。",
    uiLimit: "无限使用；每次花费 1 个探索回合，只给四格范围，不告诉具体是哪一格。",
    uiEnemyCounter: "回响只圈出四格；离开回响区、隔墙移动或换线都能让判断变钝。"
  },
  "old-magazine": {
    uiShort: "战斗外换弹工具，花费 2 回合给左轮 +2 发，最多补到 6 发。",
    uiLimit: "无限使用；无枪或满弹不能启动，换弹期间进入照面会失败。",
    uiEnemyCounter: "逼对方在换弹时照面，或让左轮空弹前先消耗它的节奏。"
  },
  "smoke-ball": {
    uiShort: "支付 1 点优势使用；本次逃跑 +20%，并短暂压低双方视野。",
    uiLimit: "持续 2 回合；同一回合主动道具仍只限 1 件。",
    uiEnemyCounter: "别让对方积累优势；有偏光片时可免疫烟雾视野惩罚。"
  },
  "wood-shield": {
    uiShort: "反应使用；下一次受伤 -2，若是远程伤害则只 -1，然后破碎。",
    uiLimit: "只挡一次伤害；挡完破碎。",
    uiEnemyCounter: "先用小伤或状态骗掉；远程伤害只会被削 1 点。"
  },
  "marked-coin": {
    uiShort: "说服支付时 +1，并判断对方是否偏好支付。",
    uiLimit: "支付后移除；说服需要支付 1 点优势。",
    uiEnemyCounter: "不给对方积累优势，或保留支付物对冲它的说服。"
  },
  "salve-tin": {
    uiShort: "战斗内外都可用，立即回复 1 点生命。",
    uiLimit: "默认 2 次；每回合同一实例只能使用一次；场外使用会推进探索回合。",
    uiEnemyCounter: "回复量只有 1 点；连续施压或逼其在场外花回合。"
  },
  "overrun-chain": {
    uiShort: "单次造成至少 5 点伤害后，下次逃跑 +20%。",
    uiLimit: "被动触发；必须先打出高伤，触发链仍受上限约束。",
    uiEnemyCounter: "用防御和减伤把单次伤害压到 5 点以下。"
  }
};

const PRESENTATION_NOISE = [
  /橙色稀有/g,
  /开火触发枪口火光和弹道演出/g,
  /生效时显示回血窗口演出/g,
  /不再提供文字方向或距离/g,
  /；\s*$/g
];

/** Returns the complete player-facing text bundle for an item. */
export function itemUiText(itemId: ItemId): ItemUiText {
  const item = ITEMS[itemId];
  const override = UI_TEXT_OVERRIDES[itemId] ?? {};
  return {
    uiShort: override.uiShort ?? cleanupItemDescription(item.description),
    uiLimit: override.uiLimit ?? buildLimitText(item),
    uiEnemyCounter: override.uiEnemyCounter ?? buildEnemyCounterText(item)
  };
}

/** Short item text for pickup cards, backpack buttons, and logs. */
export function itemUiDescription(itemId: ItemId): string {
  return itemUiText(itemId).uiShort;
}

/** Limit and cost text for visible HUD affordances. */
export function itemUiLimit(itemId: ItemId): string {
  return itemUiText(itemId).uiLimit;
}

/** Actionable response text shown only when an enemy item is known. */
export function itemEnemyCounter(itemId: ItemId): string {
  return itemUiText(itemId).uiEnemyCounter;
}

/** Returns the player-facing affix explanation for an enchanted item instance. */
export function itemEnchantmentUiText(slot: Pick<InventorySlot, "item" | "affix">): string {
  if (slot.affix?.kind !== "enchantment") return "";
  const template = carrierTemplateForItem(slot.item.id) ?? "SUPPORT";
  const effect = enchantmentEffectText(slot.affix.enchantment);
  const templateText = enchantmentTemplateText(template, effect);
  return `${enchantmentAdjective(slot.affix.enchantment)}附魔：${templateText}`;
}

/** Builds the HUD label for a currently active combat effect. */
export function activeEffectUiText(effect: ActiveEffect, context: { playerId: string; enemyId: string }): EffectUiText {
  const targetLabel = actorLabel(effect.targetActorId ?? effect.ownerId, context);
  const sourceName = ITEMS[effect.sourceItemId].name;
  const stat = statEffectText(effect.stat, effect.amount);
  const trigger = triggerText(effect.trigger);
  const duration = durationText(effect.remainingRounds);
  const summary = `${sourceName}：${stat}`;
  return {
    targetLabel,
    summary,
    duration,
    detail: `${targetLabel}${stat}；${trigger}；${duration}`
  };
}

/** Builds the HUD label for a current damage-over-time or control status. */
export function statusEffectUiText(effect: StatusEffect, context: { playerId: string; enemyId: string }): EffectUiText {
  const targetLabel = actorLabel(effect.targetActorId, context);
  const summary = `${statusName(effect.type)} x${effect.stacks}`;
  const duration = durationText(effect.remainingRounds);
  return {
    targetLabel,
    summary,
    duration,
    detail: `${targetLabel}${summary}；${duration}`
  };
}

function cleanupItemDescription(description: string): string {
  let text = description;
  for (const pattern of PRESENTATION_NOISE) {
    text = text.replace(pattern, "");
  }
  return text.replace(/\s+/g, " ").replace(/，；/g, "，").trim();
}

function buildLimitText(item: ItemDefinition): string {
  const parts: string[] = [];
  if (item.useContext === "field") parts.push("战斗外使用");
  if (item.useContext === "combat") parts.push("照面中使用");
  if (item.useContext === "both") parts.push("战斗内外都可用");
  if (item.useContext === "passive") parts.push("持有后自动触发");

  if (item.ports.some((port) => port.requiresAdvantage || port.trigger === "advantage")) parts.push("需要支付优势");
  if (item.ports.some((port) => port.requiresVision)) parts.push("需要视野");

  if (item.usage.mode === "rechargeable") {
    parts.push(`最多 ${item.usage.maxUses ?? item.maxCharges ?? 1} 发/次，可由指定补给恢复`);
  } else if (item.usage.mode === "charges-destroy" || item.usage.mode === "charges-keep") {
    parts.push(`默认 ${item.usage.maxUses ?? item.maxCharges ?? 1} 次`);
  }

  if (item.usage.manualLock === "per-round" && item.timing !== "passive") parts.push("每回合同一实例最多主动用 1 次");
  if (item.durationTurns) parts.push(`持续 ${item.durationTurns} 回合`);
  return parts.join("；") || "无额外使用限制。";
}

function buildEnemyCounterText(item: ItemDefinition): string {
  if (item.tags.includes("ranged")) return "用墙体断开射线，或用防御和正确闪避降低远程伤害。";
  if (item.tags.includes("trap")) return "绕开可疑格；用视野和智力先确认地面。";
  if (item.tags.includes("healing")) return "逼它在低血前交掉次数，或持续压制让回复赶不上伤害。";
  if (item.tags.includes("persuasion")) return "不要轻易给它优势窗口；保留支付物对冲说服。";
  if (item.effects.some((effect) => effect.kind === "status")) return "用防御和闪避降低命中；有清除道具时尽快处理状态。";
  if (item.effects.some((effect) => effect.kind === "intel" || effect.kind === "globalIntel")) return "减少暴露关键道具和攻击方向，必要时换线拖掉情报价值。";
  if (item.effects.some((effect) => effect.stat === "dodge")) return "它影响闪避判断时，改用防御或拖过本回合。";
  if (item.effects.some((effect) => effect.stat === "incomingDamage")) return "先用小伤骗掉减伤，或改用状态、远程和连续压制。";
  if (item.effects.some((effect) => effect.kind === "rangedDamage")) return "读方向并躲闪；防御能吃下一部分伤害。";
  return "先用防御或躲闪观察它的触发窗口，再决定追击或撤开。";
}

function enchantmentEffectText(enchantment: EnchantmentKind): string {
  switch (enchantment) {
    case "burning":
      return "施加 1-3 层灼烧";
    case "venomous":
      return "施加 1-3 层中毒";
    case "frost":
      return "施加 1-2 层冻结";
    case "blood":
      return "施加 1-3 层流血";
    case "deadly":
      return "获得 50% 暴击率，暴击使本次伤害 +1";
    case "radiant":
      return "结算 1 次基础效果，不复制附魔本身";
  }
}

function enchantmentTemplateText(template: EnchantmentCarrierTemplate, effect: string): string {
  switch (template) {
    case "HIT":
      return `该道具直接命中并造成伤害时，额外${effect}。`;
    case "PRIME":
      return `该道具强化下一次攻击；那次攻击命中时额外${effect}。`;
    case "COUNTER":
      return `该道具的反应条件成立时，对触发者或当前敌人额外${effect}。`;
    case "SUPPORT":
      return `原效果成功后刷新 1 次附魔预备；下一次有效命中额外${effect}。`;
    case "TRAP":
      return `布置时不触发；敌人踩中或触发地物时额外${effect}。`;
    case "AMMO":
      return `补充成功后，下一发有效子弹额外${effect}。`;
  }
}

function statEffectText(stat: ActiveEffectStat, amount: number): string {
  const signed = amount > 0 ? `+${amount}` : `${amount}`;
  switch (stat) {
    case "strength":
      return `力量 ${signed}`;
    case "intellect":
      return `智力 ${signed}`;
    case "damage":
      return `近战伤害 ${signed}`;
    case "speed":
      return `速度 ${signed}`;
    case "dodge":
      return `躲闪 ${signed}%`;
    case "flee":
      return `逃跑 ${signed}%`;
    case "heavyThreshold":
      return `重伤阈值 ${signed}`;
    case "tieStrength":
      return `同速互攻力量 ${signed}`;
    case "incomingDamage":
      return `受到伤害 ${signed}`;
    case "heavyPenalty":
      return "重伤惩罚减轻";
    case "dot":
      return `持续伤害 ${signed}`;
    case "persuasion":
      return `说服 ${signed}`;
    case "mark":
      return "显示大致方向";
    case "critChance":
      return `暴击率 ${signed}%`;
    case "burn":
      return "下次命中附加灼烧";
    case "poison":
      return "下次命中附加中毒";
    case "bleed":
      return "下次命中附加流血";
    case "freeze":
      return "下次命中附加冻结";
    case "healOnMeleeHit":
      return `下次近战命中回复 ${amount} 点生命`;
  }
}

function triggerText(trigger: ActiveEffect["trigger"]): string {
  switch (trigger) {
    case "round":
      return "当前回合生效";
    case "nextMeleeHit":
      return "下次近战命中消耗";
    case "nextIncomingDamage":
      return "下次受伤消耗";
    case "nextDodge":
      return "下次躲闪消耗";
    case "nextFlee":
      return "下次逃跑消耗";
    case "persuasion":
      return "下次说服消耗";
    case "passive":
      return "被动触发";
  }
}

function durationText(rounds: number): string {
  if (rounds >= 90) return "本场照面";
  if (rounds <= 0) return "即将结束";
  return `还剩 ${rounds} 回合`;
}

function actorLabel(actorId: string, context: { playerId: string; enemyId: string }): string {
  if (actorId === context.playerId) return "我方";
  if (actorId === context.enemyId) return "敌方";
  return "目标";
}

function statusName(type: StatusEffectType): string {
  if (type === "burn") return "灼烧";
  if (type === "poison") return "中毒";
  if (type === "bleed") return "流血";
  return "冻结";
}
