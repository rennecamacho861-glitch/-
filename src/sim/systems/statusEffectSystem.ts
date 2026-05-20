import type { ActorState, EncounterState, StatusEffect, StatusEffectType } from "../types";

export type StatusApplication = {
  ownerId: string;
  target: ActorState;
  type: StatusEffectType;
  stacks?: number;
  remainingRounds?: number;
  delayRounds?: number;
};

export type StatusResolution = {
  logs: string[];
  skippedActorIds: Set<string>;
};

/**
 * Adds or refreshes a combat status effect.
 */
export function applyStatusEffect(encounter: EncounterState, application: StatusApplication): string[] {
  const stacks = application.stacks ?? 1;
  const existing = encounter.statusEffects.find(
    (effect) => effect.targetActorId === application.target.id && effect.type === application.type && effect.ownerId === application.ownerId
  );
  if (existing) {
    existing.stacks += stacks;
    existing.remainingRounds = Math.max(existing.remainingRounds, application.remainingRounds ?? existing.remainingRounds);
    existing.delayRounds = application.delayRounds ?? existing.delayRounds;
  } else {
    encounter.statusEffects.push({
      id: `${application.ownerId}-${application.target.id}-${application.type}-${encounter.statusEffects.length + 1}`,
      ownerId: application.ownerId,
      targetActorId: application.target.id,
      type: application.type,
      stacks,
      remainingRounds: application.remainingRounds ?? defaultDuration(application.type),
      delayRounds: application.delayRounds
    });
  }

  if (application.type === "burn") {
    application.target.hp = Math.max(0, application.target.hp - stacks);
    return [`${application.target.name}受到灼烧 ${stacks} 点。`];
  }
  return [`${application.target.name}被附加${statusLabel(application.type)}。`];
}

/**
 * Resolves status effects at the start of a combat round.
 */
export function resolveRoundStartStatuses(encounter: EncounterState, actors: ActorState[]): StatusResolution {
  const logs: string[] = [];
  const skippedActorIds = new Set<string>();
  for (const effect of encounter.statusEffects) {
    const target = actors.find((actor) => actor.id === effect.targetActorId);
    if (!target || target.defeated) continue;
    if (effect.type === "freeze") {
      skippedActorIds.add(target.id);
      effect.remainingRounds = 0;
      logs.push(`${target.name}被冻结，本回合停滞。`);
    } else if (effect.type === "poison") {
      if ((effect.delayRounds ?? 0) > 0) {
        effect.delayRounds = (effect.delayRounds ?? 0) - 1;
      } else {
        target.hp = Math.max(0, target.hp - effect.stacks);
        logs.push(`${target.name}受到中毒 ${effect.stacks} 点。`);
      }
    }
  }
  expireStatuses(encounter, logs);
  return { logs, skippedActorIds };
}

/**
 * Resolves bleed when a bleeding actor attacks or dodges.
 */
export function resolveBleedOnAction(encounter: EncounterState, actor: ActorState, actionType: string): string[] {
  if (actionType !== "attack" && actionType !== "dodge") return [];
  const logs: string[] = [];
  for (const effect of encounter.statusEffects.filter((candidate) => candidate.targetActorId === actor.id && candidate.type === "bleed")) {
    actor.hp = Math.max(0, actor.hp - effect.stacks);
    logs.push(`${actor.name}牵动流血，受到 ${effect.stacks} 点。`);
  }
  return logs;
}

/**
 * Decrements status durations at the end of a combat round.
 */
export function decrementStatusDurations(encounter: EncounterState): string[] {
  const logs: string[] = [];
  for (const effect of encounter.statusEffects) effect.remainingRounds -= 1;
  expireStatuses(encounter, logs);
  return logs;
}

function expireStatuses(encounter: EncounterState, logs: string[]): void {
  const expired = encounter.statusEffects.filter((effect) => effect.remainingRounds <= 0);
  encounter.statusEffects = encounter.statusEffects.filter((effect) => effect.remainingRounds > 0);
  for (const effect of expired) logs.push(`${statusLabel(effect.type)}效果结束。`);
}

function defaultDuration(type: StatusEffectType): number {
  if (type === "burn") return 1;
  if (type === "poison") return 3;
  if (type === "bleed") return 3;
  return 1;
}

function statusLabel(type: StatusEffectType): string {
  if (type === "burn") return "灼烧";
  if (type === "poison") return "中毒";
  if (type === "bleed") return "流血";
  return "冻结";
}
