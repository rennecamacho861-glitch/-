import type { ActiveEffectStat, ActiveEffectTrigger, ItemId } from "../types";

type EffectTarget = "self" | "opponent";

export type CombatItemEffectSpec = {
  itemId: ItemId;
  label: string;
  stat: ActiveEffectStat;
  amount: number;
  remainingRounds: number;
  trigger: ActiveEffectTrigger;
  targetActorId?: string;
  stackPolicy?: "max" | "add";
  requiresAdvantage?: boolean;
};

type CombatItemEffectDefinition = Omit<CombatItemEffectSpec, "itemId" | "targetActorId"> & {
  target: EffectTarget;
  requiresAdvantage?: boolean;
  blockedMessage?: string;
};

export type CombatItemEffectResolution =
  | { type: "effect"; effect: CombatItemEffectSpec }
  | { type: "blocked"; message: string }
  | { type: "unsupported" };

const PLAYER_COMBAT_EFFECTS: Partial<Record<ItemId, CombatItemEffectDefinition>> = {
  "sharpening-stone": {
    label: "磨刀石擦过刃口：下一次近战命中伤害 +1。",
    stat: "damage",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "glass-spike": {
    label: "玻璃刺扣在掌心：本回合暴击率 +20%。",
    stat: "critChance",
    amount: 20,
    remainingRounds: 1,
    trigger: "round",
    target: "self"
  },
  "tinder-vial": {
    label: "火绒瓶备好：下一次近战命中附加灼烧。",
    stat: "burn",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "poison-needle": {
    label: "毒针藏进指缝：下一次近战命中附加中毒。",
    stat: "poison",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "barbed-line": {
    label: "锯齿线绷紧：下一次近战命中附加流血。",
    stat: "bleed",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "frost-nail": {
    label: "冷凝钉压进掌心：下一次近战命中附加冻结。",
    stat: "freeze",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "冷凝钉需要支付 1 点优势使用。"
  },
  "smoke-needle": {
    label: "烟针藏在闪避手里：下一次成功躲闪会让攻击者中毒。",
    stat: "poison",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextDodge",
    target: "self"
  },
  "thorn-plate": {
    label: "刺片扣在护具内：下一次受到近战命中时反扎流血。",
    stat: "bleed",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextIncomingDamage",
    target: "self"
  },
  "insulation-cloth": {
    label: "绝缘布裹住伤口：下一次受到伤害 -1。",
    stat: "incomingDamage",
    amount: -1,
    remainingRounds: 2,
    trigger: "nextIncomingDamage",
    target: "self"
  },
  "blade-oil": {
    label: "刀油覆在刃口：下一次近战命中使重伤阈值 -1。",
    stat: "heavyThreshold",
    amount: -1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "lime-powder": {
    label: "石灰粉扬起：目标本回合躲闪 -15%。",
    stat: "dodge",
    amount: -15,
    remainingRounds: 1,
    trigger: "round",
    target: "opponent"
  },
  "sleeve-stone": {
    label: "袖中石握紧：本回合同速互攻力量视为 +1。",
    stat: "tieStrength",
    amount: 1,
    remainingRounds: 1,
    trigger: "round",
    target: "self"
  },
  "ice-awl": {
    label: "冰锥抵在掌心：2 回合内近战伤害 +1。",
    stat: "damage",
    amount: 1,
    remainingRounds: 2,
    trigger: "round",
    target: "self"
  },
  "hook-rope": {
    label: "钩绳封路：目标下一次逃跑 -20%。",
    stat: "flee",
    amount: -20,
    remainingRounds: 2,
    trigger: "nextFlee",
    target: "opponent",
    requiresAdvantage: true,
    blockedMessage: "钩绳需要支付 1 点优势使用。"
  },
  "acid-vial": {
    label: "腐蚀小瓶备好：下一次近战命中追加 1 点腐蚀伤害。",
    stat: "dot",
    amount: 1,
    remainingRounds: 2,
    trigger: "nextMeleeHit",
    target: "self"
  },
  "smoke-ball": {
    label: "烟雾铺开：下一次逃跑 +20%。",
    stat: "flee",
    amount: 20,
    remainingRounds: 2,
    trigger: "nextFlee",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "烟雾球需要支付 1 点优势使用。"
  },
  painkiller: {
    label: "止痛片生效：2 回合内抵消一次重伤额外惩罚。",
    stat: "heavyPenalty",
    amount: -1,
    remainingRounds: 2,
    trigger: "round",
    target: "self"
  },
  "wood-shield": {
    label: "木盾片举起：下一次受到伤害时近战 -2，远程 -1。",
    stat: "incomingDamage",
    amount: -2,
    remainingRounds: 1,
    trigger: "nextIncomingDamage",
    target: "self"
  },
  "adrenaline-shot": {
    label: "肾上针刺入：2 回合速度 +1。",
    stat: "speed",
    amount: 1,
    remainingRounds: 2,
    trigger: "round",
    target: "self"
  },
  splint: {
    label: "夹板固定：2 回合内抵消一次重伤后续惩罚。",
    stat: "heavyPenalty",
    amount: -1,
    remainingRounds: 2,
    trigger: "round",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "夹板需要支付 1 点优势使用。"
  },
  "marked-coin": {
    label: "标记硬币压上桌：下一次说服值 +1。",
    stat: "persuasion",
    amount: 1,
    remainingRounds: 3,
    trigger: "persuasion",
    target: "self"
  },
  "rib-hook": {
    label: "肋钩扣住空隙：下一动作回合近战伤害 +1。",
    stat: "damage",
    amount: 1,
    remainingRounds: 2,
    trigger: "round",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "肋钩需要支付 1 点优势使用。"
  },
  "ankle-line": {
    label: "绊踝线压低步点：目标下一动作回合躲闪 -20%。",
    stat: "dodge",
    amount: -20,
    remainingRounds: 2,
    trigger: "round",
    target: "opponent",
    requiresAdvantage: true,
    blockedMessage: "绊踝线需要支付 1 点优势使用。"
  },
  "chase-spur": {
    label: "追步刺逼进身位：下一动作回合速度 +1。",
    stat: "speed",
    amount: 1,
    remainingRounds: 2,
    trigger: "round",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "追步刺需要支付 1 点优势使用。"
  },
  "counter-plate": {
    label: "反压铁片抵住要害：下一次受到伤害 -1。",
    stat: "incomingDamage",
    amount: -1,
    remainingRounds: 2,
    trigger: "nextIncomingDamage",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "反压铁片需要支付 1 点优势使用。"
  },
  "panic-nail": {
    label: "压胆钉封住退路：目标下一次逃跑 -15%。",
    stat: "flee",
    amount: -15,
    remainingRounds: 2,
    trigger: "nextFlee",
    target: "opponent",
    requiresAdvantage: true,
    blockedMessage: "压胆钉需要支付 1 点优势使用。"
  },
  "focus-thread": {
    label: "定神线拉紧呼吸：下一动作回合躲闪 +15%。",
    stat: "dodge",
    amount: 15,
    remainingRounds: 2,
    trigger: "round",
    target: "self",
    requiresAdvantage: true,
    blockedMessage: "定神线需要支付 1 点优势使用。"
  }
};

const ENEMY_COMBAT_EFFECTS: Partial<Record<ItemId, CombatItemEffectDefinition>> = PLAYER_COMBAT_EFFECTS;

/**
 * Resolves combat item effects that are simple active-effect applications.
 */
export function resolvePlayerCombatItemEffect(itemId: ItemId, opponentId: string, hasAdvantageWindow: boolean): CombatItemEffectResolution {
  return resolveCombatItemEffect(PLAYER_COMBAT_EFFECTS, itemId, opponentId, hasAdvantageWindow);
}

/**
 * Resolves enemy combat item effects while preserving the current enemy item-use surface.
 */
export function resolveEnemyCombatItemEffect(itemId: ItemId, opponentId: string, hasAdvantageMomentum: boolean): CombatItemEffectResolution {
  return resolveCombatItemEffect(ENEMY_COMBAT_EFFECTS, itemId, opponentId, hasAdvantageMomentum);
}

function resolveCombatItemEffect(
  table: Partial<Record<ItemId, CombatItemEffectDefinition>>,
  itemId: ItemId,
  opponentId: string,
  hasRequiredAdvantage: boolean
): CombatItemEffectResolution {
  const definition = table[itemId];
  if (!definition) return { type: "unsupported" };
  if (definition.requiresAdvantage && !hasRequiredAdvantage) {
    return { type: "blocked", message: definition.blockedMessage ?? "该道具需要支付 1 点优势使用。" };
  }
  return {
    type: "effect",
    effect: {
      itemId,
      label: definition.label,
      stat: definition.stat,
      amount: definition.amount,
      remainingRounds: definition.remainingRounds,
      trigger: definition.trigger,
      targetActorId: definition.target === "opponent" ? opponentId : undefined,
      stackPolicy: definition.stackPolicy,
      requiresAdvantage: definition.requiresAdvantage
    }
  };
}
