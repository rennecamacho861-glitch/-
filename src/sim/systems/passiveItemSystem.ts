import type { ActiveEffectStat, ActiveEffectTrigger, ItemId, StatusEffectType } from "../types";

export type PassiveTrigger =
  | "combatStart"
  | "firstRound"
  | "secondRound"
  | "thirdRoundPlus"
  | "onDodgeSuccess"
  | "onDefendSuccess"
  | "onHeavyWoundDealt"
  | "onHeavyWoundTaken"
  | "onDamageTaken"
  | "onHighDamageDealt"
  | "onOneHp"
  | "onIntelGain"
  | "onBurnApplied"
  | "onPoisonApplied"
  | "onFreezeApplied"
  | "onCrit"
  | "onDefendedHit";

export type PassiveRuleEffect =
  | {
      kind: "active";
      stat: ActiveEffectStat;
      amount: number;
      remainingRounds: number;
      activeTrigger: ActiveEffectTrigger;
      target: "self" | "opponent";
      stackPolicy?: "max" | "add";
    }
  | { kind: "status"; status: StatusEffectType; stacks: number; target: "self" | "opponent"; remainingRounds?: number }
  | { kind: "damage"; amount: number; target: "self" | "opponent" }
  | { kind: "heal"; amount: number; target: "self" | "opponent" }
  | { kind: "intel" }
  | { kind: "advantage" };

export type PassiveItemRule = {
  itemId: ItemId;
  trigger: PassiveTrigger;
  label: string;
  effect: PassiveRuleEffect;
  chainLimited?: boolean;
  onceFlag?: string;
};

export const PASSIVE_GRID_ITEM_IDS = [
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
  "data-spur"
] as const satisfies readonly ItemId[];

export const PASSIVE_ITEM_RULES: PassiveItemRule[] = [
  rule("servo-heel", "combatStart", "伺服鞋跟咬住地面：本场速度 +1。", active("speed", 1, 99, "round")),
  rule("mnemonic-plate", "combatStart", "记忆钢片压住杂念：本场智力 +1。", active("intellect", 1, 99, "round")),
  rule("knuckle-core", "combatStart", "指节铁芯顶住拳面：本场力量 +1。", active("strength", 1, 99, "round")),
  rule("exit-charm", "combatStart", "出口符牌记住退路：本场逃脱 +10%。", active("flee", 10, 99, "round")),
  rule("opener-gear", "firstRound", "开局齿轮弹起：本回合速度 +1。", active("speed", 1, 1, "round")),
  rule("first-glint", "firstRound", "第一道反光扫过对手：获得 1 条情报。", { kind: "intel" }),
  rule("pilot-flame", "firstRound", "引燃头吐出火星：下一次近战命中施加燃烧。", active("burn", 1, 2, "nextMeleeHit")),
  rule("rawhide-guard", "firstRound", "生皮护边护住身位：本回合闪避 +10%。", active("dodge", 10, 1, "round")),
  rule("second-gear", "secondRound", "二段齿轮扣紧：本回合力量 +1。", active("strength", 1, 1, "round")),
  rule("coolant-breath", "secondRound", "冷却气囊回压：回复 1 点生命。", { kind: "heal", amount: 1, target: "self" }),
  rule("second-sight", "secondRound", "二次校准片亮起：本回合智力 +1。", active("intellect", 1, 1, "round")),
  rule("venom-timer", "secondRound", "延时毒囊破开：下一次近战命中施加中毒。", active("poison", 1, 2, "nextMeleeHit")),
  rule("long-fuse", "thirdRoundPlus", "长引线烧到尾端：下一次近战命中施加燃烧。", active("burn", 1, 2, "nextMeleeHit")),
  rule("fatigue-tax", "thirdRoundPlus", "疲劳刻痕压低对手承受线：下一次近战重伤阈值 -1。", active("heavyThreshold", -1, 2, "nextMeleeHit")),
  rule("bunker-prayer", "thirdRoundPlus", "地堡祈牌稳住呼吸：回复 1 点生命。", { kind: "heal", amount: 1, target: "self" }),
  rule("escape-count", "thirdRoundPlus", "逃生计数绳对上节拍：下次逃脱 +10%。", active("flee", 10, 1, "nextFlee")),
  rule("spring-step", "onDodgeSuccess", "弹簧步带回弹：下个动作回合速度 +1。", active("speed", 1, 2, "round")),
  rule("dust-kicker", "onDodgeSuccess", "扬尘片刮过脚面：攻击者受到 1 点伤害。", { kind: "damage", amount: 1, target: "opponent" }),
  rule("slip-venom", "onDodgeSuccess", "滑毒线擦入破绽：攻击者中毒。", { kind: "status", status: "poison", stacks: 1, target: "opponent", remainingRounds: 3 }),
  rule("dodge-reader", "onDodgeSuccess", "侧闪读片捕捉细节：获得 1 条情报。", { kind: "intel" }),
  rule("guard-lens", "onDefendSuccess", "防御镜片记录动作：获得 1 条情报。", { kind: "intel" }),
  rule("brace-piston", "onDefendSuccess", "护架活塞回压：下个动作回合力量 +1。", active("strength", 1, 2, "round")),
  rule("shield-spark", "onDefendSuccess", "盾火石弹出火星：攻击者燃烧。", { kind: "status", status: "burn", stacks: 1, target: "opponent", remainingRounds: 1 }),
  rule("calm-mouthpiece", "onDefendSuccess", "稳声咬嘴压住气息：下次说服 +1。", active("persuasion", 1, 3, "persuasion")),
  rule("wound-motor", "onHeavyWoundDealt", "伤口马达开始转动：下个动作回合速度 +1。", active("speed", 1, 2, "round")),
  rule("crack-reader", "onHeavyWoundDealt", "裂纹读片扫到弱点：获得 1 条情报。", { kind: "intel" }),
  rule("crush-salt", "onHeavyWoundDealt", "压碎盐包冻住伤口：目标冻结。", { kind: "status", status: "freeze", stacks: 1, target: "opponent", remainingRounds: 2 }),
  rule("ember-step", "onBurnApplied", "余烬踏板借火提速：下个动作回合速度 +1。", active("speed", 1, 2, "round")),
  rule("heat-read", "onBurnApplied", "热读片沿火光记录：获得 1 条情报。", { kind: "intel" }),
  rule("ash-threshold", "onBurnApplied", "灰线压低承受点：下一次近战重伤阈值 -1。", active("heavyThreshold", -1, 2, "nextMeleeHit")),
  rule("toxic-focus", "onPoisonApplied", "毒焦环收紧瞄点：下个动作回合暴击率 +10%。", active("critChance", 10, 2, "round")),
  rule("bitter-mouth", "onPoisonApplied", "苦味咬嘴压住话头：下次说服 +1。", active("persuasion", 1, 3, "persuasion")),
  rule("green-pulse", "onPoisonApplied", "绿脉管回抽药液：回复 1 点生命。", { kind: "heal", amount: 1, target: "self" }),
  rule("ice-step", "onFreezeApplied", "冰步扣稳住脚面：下个动作回合闪避 +15%。", active("dodge", 15, 2, "round")),
  rule("cold-reader", "onFreezeApplied", "冷读针记录僵直：获得 1 条情报。", { kind: "intel" }),
  rule("shatter-pin", "onFreezeApplied", "碎冰针补上一击：目标受到 1 点伤害。", { kind: "damage", amount: 1, target: "opponent" }),
  rule("crit-lens", "onCrit", "暴击镜片定住要害：获得 1 条情报。", { kind: "intel" }),
  rule("white-spark", "onCrit", "白火星钻入裂口：目标燃烧。", { kind: "status", status: "burn", stacks: 1, target: "opponent", remainingRounds: 1 }),
  rule("snap-sinew", "onCrit", "响筋线弹起：下个动作回合速度 +1。", active("speed", 1, 2, "round")),
  rule("pain-wheel", "onDamageTaken", "痛轮锁紧手腕：下个动作回合力量 +1。", active("strength", 1, 2, "round")),
  rule("blood-map", "onDamageTaken", "血迹地图标出破绽：获得 1 条情报。", { kind: "intel" }),
  rule("recoil-plate", "onDamageTaken", "反冲铁片弹回：攻击者受到 1 点伤害。", { kind: "damage", amount: 1, target: "opponent" }),
  rule("overrun-chain", "onHighDamageDealt", "越线链拖住局面：获得优势。", { kind: "advantage" }),
  rule("hard-receipt", "onHighDamageDealt", "硬账票压到桌面：下次说服 +1。", active("persuasion", 1, 3, "persuasion")),
  rule("marrow-coin", "onHighDamageDealt", "髓币换回一口气：回复 1 点生命。", { kind: "heal", amount: 1, target: "self" }),
  rule("breakwater-splint", "onHeavyWoundTaken", "防波夹板顶住断口：回复 2 点生命。", { kind: "heal", amount: 2, target: "self" }),
  rule("trauma-scan", "onHeavyWoundTaken", "创伤扫描片记录来源：获得 1 条情报。", { kind: "intel" }),
  rule("last-ice", "onHeavyWoundTaken", "最后冰钉反咬攻击者：攻击者冻结。", { kind: "status", status: "freeze", stacks: 1, target: "opponent", remainingRounds: 2 }),
  rule("last-match", "onOneHp", "最后火柴擦亮：攻击者燃烧。", { kind: "status", status: "burn", stacks: 1, target: "opponent", remainingRounds: 1 }, "one-hp"),
  rule("data-spur", "onIntelGain", "数据马刺压住下一手：下个动作回合暴击率 +10%。", active("critChance", 10, 2, "round"))
];

/** Returns passive item rules for a specific combat trigger. */
export function passiveRulesForTrigger(trigger: PassiveTrigger): PassiveItemRule[] {
  return PASSIVE_ITEM_RULES.filter((rule) => rule.trigger === trigger);
}

function rule(
  itemId: ItemId,
  trigger: PassiveTrigger,
  label: string,
  effect: PassiveRuleEffect,
  onceFlag?: string
): PassiveItemRule {
  return { itemId, trigger, label, effect, onceFlag, chainLimited: trigger !== "combatStart" };
}

function active(
  stat: ActiveEffectStat,
  amount: number,
  remainingRounds: number,
  activeTrigger: ActiveEffectTrigger,
  target: "self" | "opponent" = "self",
  stackPolicy?: "max" | "add"
): PassiveRuleEffect {
  return { kind: "active", stat, amount, remainingRounds, activeTrigger, target, stackPolicy };
}
