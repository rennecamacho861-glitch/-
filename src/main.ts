import { itemIconUrl } from "./render/gridDungeonAssets";
import { GameSimulation } from "./sim/GameSimulation";
import { activeEffectUiText, itemEnemyCounter, itemUiDescription, itemUiLimit, statusEffectUiText } from "./sim/itemText";
import { ITEMS } from "./sim/items";
import { calculateDerivedStats } from "./sim/stats";
import { enchantedItemName } from "./sim/systems/enchantmentSystem";
import type { SimulationPort } from "./sim/ports";
import type { ActiveEffect, CombatAction, FeedbackEvent, IntelEntry, InventorySlot, ItemId, ItemRarity, StatusEffect } from "./sim/types";
import "./styles.css";

const simulation: SimulationPort = new GameSimulation(createRunSeed());
let game: { destroy(removeCanvas: boolean): void } | undefined;

void import("./render/startPhaserGame").then(({ startPhaserGame }) => {
  game = startPhaserGame(simulation);
});

const hudRoot = document.querySelector<HTMLDivElement>("#hud-root");

if (!hudRoot) {
  throw new Error("HUD root missing");
}

const hud = hudRoot;
let activeFeedback: FeedbackEvent | undefined;
const feedbackQueue: FeedbackEvent[] = [];
const seenFeedbackIds = new Set<string>();

const actionLabels = {
  attack: "进攻",
  defend: "防御",
  "dodge-left": "左闪",
  "dodge-right": "右闪"
} as const;

function renderHud(): void {
  const state = simulation.snapshot();
  for (const event of state.feedbackEvents) {
    if (seenFeedbackIds.has(event.id)) continue;
    seenFeedbackIds.add(event.id);
    feedbackQueue.push(event);
  }
  if (!activeFeedback) activeFeedback = feedbackQueue.shift();
  const encounter = state.encounter;
  const encounterEnemy = encounter ? state.map.aiUnits.find((unit) => unit.id === encounter.enemyId) : undefined;
  const pickup = state.pendingPickupOffer;
  const isStarterPickup = pickup?.nodeId === "starter";
  const hasPlayerAdvantage = encounter?.phase === "advantageWindow" && encounter.advantage.owner === "player";
  const manualRound = encounter?.round ?? state.turn;
  const playerMaxHp = calculateDerivedStats(state.player.stats).maxHp;
  const healthFeedback = healthFeedbackState(state.player.hp, playerMaxHp);
  const inventory = state.inventory
    .map((slot) => {
      const passive = slot.item.useContext === "passive";
      const combatOnly = slot.item.useContext === "combat";
      const fieldOnly = slot.item.useContext === "field";
      const usedThisRound = slot.item.usage.manualLock === "per-round" && slot.lastManualUseRound === manualRound;
      const spent =
        slot.charges !== undefined &&
        slot.charges <= 0 &&
        slot.item.usage.mode !== "rechargeable" &&
        slot.item.usage.mode !== "charges-keep";
      const disabled =
        passive ||
        usedThisRound ||
        spent ||
        (combatOnly && !encounter) ||
        (fieldOnly && Boolean(encounter)) ||
        (slot.item.id === "bandage" && Boolean(encounter) && !hasPlayerAdvantage);
      const charges = slot.charges !== undefined ? `<small>${slot.charges}</small>` : `<small>x${slot.count}</small>`;
      const iconUrl = itemIconUrl(slot.item.id);
      const icon = iconUrl
        ? `<img class="tool-icon" src="${iconUrl}" alt="" aria-hidden="true">`
        : `<span class="tool-icon tool-icon-fallback" aria-hidden="true">${escapeHtml(slot.item.category.slice(0, 1).toUpperCase())}</span>`;
      const description = itemUiDescription(slot.item.id);
      const limit = slotRuntimeText(slot, manualRound);
      const title = `${description} ${limit}`;
      const displayName = enchantedItemName(slot);
      return `<button class="tool-button" data-item="${slot.item.id}" data-category="${slot.item.category}" data-rarity="${slot.item.rarity}" ${disabled ? "disabled" : ""} title="${escapeHtml(title)}" aria-label="${escapeHtml(`${displayName}：${title}`)}">
        ${icon}
        <span class="tool-copy">
          <span class="tool-label">${escapeHtml(displayName)}</span>
          <span class="tool-hint">${escapeHtml(description)}</span>
          <span class="tool-limit">${escapeHtml(limit)}</span>
        </span>
        ${charges}
      </button>`;
    })
    .join("");

  const log = state.log
    .slice(-7)
    .map((line) => `<li>${line}</li>`)
    .join("");

  const intel = encounter
    ? state.intel
        .filter((entry) => entry.targetId === encounter.enemyId)
        .map((entry) => intelMarkup(entry))
        .join("")
    : "";
  const activeEffectStrip = encounter ? activeEffectsMarkup(state.player.id, encounter.enemyId, encounter.activeEffects, encounter.statusEffects) : "";

  const battlePanel = encounter
    ? `<section class="battle-panel">
        <div class="battle-header">
          <div>
            <span class="eyebrow">照面</span>
            <h2>${encounter.enemyName}</h2>
          </div>
          <strong class="${encounter.advantage.owner === "player" ? "good" : encounter.advantage.owner === "enemy" ? "bad" : ""}">
            ${encounter.advantage.owner === "player" ? "我方优势" : encounter.advantage.owner === "enemy" ? "敌方优势" : "僵持"}
          </strong>
        </div>
        <div class="read-row">
          <span>回合 ${encounter.round + 1}</span>
          <span>战斗次数 ${encounterEnemy?.combatCount ?? 0}</span>
          <span>你看见对方：${visibilityLabel(encounter.visibility.playerToEnemy)}</span>
          <span>对方看见你：${visibilityLabel(encounter.visibility.enemyToPlayer)}</span>
        </div>
        ${activeEffectStrip}
        <div class="battle-actions">
          <button data-action="attack" ${encounter.phase !== "chooseAction" ? "disabled" : ""}>进攻 <small>比速度/力量</small></button>
          <button data-action="defend" ${encounter.phase !== "chooseAction" ? "disabled" : ""}>防御 <small>减伤/看数值</small></button>
          <button data-action="dodge-left" ${encounter.phase !== "chooseAction" ? "disabled" : ""}>左闪 <small>方向预判</small></button>
          <button data-action="dodge-right" ${encounter.phase !== "chooseAction" ? "disabled" : ""}>右闪 <small>方向预判</small></button>
        </div>
        <div class="secondary-actions">
          <button data-special="flee" ${!hasPlayerAdvantage ? "disabled" : ""}>逃跑</button>
          <button data-special="pressPower" ${!hasPlayerAdvantage ? "disabled" : ""}>续战·力量</button>
          <button data-special="pressTempo" ${!hasPlayerAdvantage ? "disabled" : ""}>续战·节奏</button>
          <button data-special="persuade" ${!hasPlayerAdvantage ? "disabled" : ""}>说服</button>
        </div>
        <div class="intel-list">
          <h3>已知信息</h3>
          <ul>${intel || "<li><span>未知</span>还没有足够信息。</li>"}</ul>
        </div>
        <ol class="rounds">
          ${encounter.log.map((entry) => `<li><span>${entry.round}</span><strong>${entry.text}</strong></li>`).join("")}
        </ol>
      </section>`
    : "";

  const pickupPanel = pickup
    ? `<section class="pickup-panel ${isStarterPickup ? "is-starter" : ""}">
        <div class="battle-header">
          <div>
            <span class="eyebrow">${isStarterPickup ? "开局装备" : "道具节点"}</span>
            <h2>${isStarterPickup ? "先带一件进场" : "三选一"}</h2>
          </div>
        </div>
        <div class="pickup-options">
          ${pickup.itemIds
            .map(
              (itemId) => `<button data-pickup="${itemId}" data-category="${ITEMS[itemId].category}" data-rarity="${ITEMS[itemId].rarity}" title="${escapeHtml(`${itemDescription(itemId)} ${itemUiLimit(itemId)}`)}">
                ${pickupIconMarkup(itemId)}
                <strong>${itemName(itemId)}</strong>
                <small>${itemDescription(itemId)}</small>
                <span class="pickup-limit">${escapeHtml(itemUiLimit(itemId))}</span>
              </button>`
            )
            .join("")}
        </div>
        <button class="skip-pickup" data-skip-pickup="true">跳过</button>
      </section>`
    : "";

  const outcome = state.outcome
    ? `<section class="outcome">
        <h2>${state.outcome.title}</h2>
        <p>${state.outcome.body}</p>
        <button data-reset="true">再进一次迷宫</button>
      </section>`
    : "";
  const feedbackToast = activeFeedback ? feedbackToastMarkup(activeFeedback) : "";

  hud.innerHTML = `
    <main class="hud-shell">
      ${healthFeedbackMarkup(healthFeedback)}
      <section class="topbar">
        <div>
          <span class="eyebrow">照面之时</span>
          <h1>黑暗迷宫原型</h1>
        </div>
        <div class="stats">
          <span>时间 ${state.turn}/${state.turnLimit}</span>
          <span class="${healthFeedback.statClass}">生命 ${state.player.hp}/${playerMaxHp}</span>
          <span>战利 ${state.loot}</span>
          <span>精神 ${state.player.stats.spirit}</span>
          <span>智力 ${state.player.stats.intellect}</span>
          <span>力量 ${state.player.stats.strength}</span>
          <span>速度 ${state.player.stats.speed}</span>
          <span>体质 ${state.player.stats.constitution}</span>
        </div>
      </section>
      <section class="side-panel">
        <div class="panel-block inventory-panel">
          <h2>携带物</h2>
          <div class="inventory">${inventory || "<p>背包是空的。</p>"}</div>
        </div>
        <div class="panel-block log-panel">
          <h2>记录</h2>
          <ul class="log">${log}</ul>
        </div>
      </section>
      <section class="command-strip">
        <button data-command="restart">重开</button>
      </section>
      ${feedbackToast}
      ${pickupPanel}
      ${battlePanel}
      ${outcome}
    </main>`;

  const roundLog = hud.querySelector<HTMLOListElement>(".rounds");
  if (roundLog) roundLog.scrollTop = roundLog.scrollHeight;
}

hud.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  const button = target.closest("button") as HTMLButtonElement | null;
  if (!button || button.disabled) return;
  if (button.dataset.feedbackConfirm) {
    activeFeedback = undefined;
    renderHud();
    return;
  }

  const command = button.dataset.command;
  const action = button.dataset.action as keyof typeof actionLabels | undefined;
  const item = button.dataset.item as ItemId | undefined;
  const pickupItem = button.dataset.pickup as ItemId | undefined;
  const special = button.dataset.special;

  if (activeFeedback) return;

  if (command === "restart" || button.dataset.reset) {
    clearFeedbackToast();
    simulation.reset(createRunSeed());
  }
  if (pickupItem) simulation.choosePickup(pickupItem);
  if (button.dataset.skipPickup) simulation.choosePickup(null);
  if (action) simulation.playCombatAction(toCombatAction(action));
  if (item) simulation.useItem(item);
  if (special === "flee") simulation.tryFlee();
  if (special === "pressPower") simulation.continueFight("pressPower");
  if (special === "pressTempo") simulation.continueFight("pressTempo");
  if (special === "persuade") simulation.tryPersuade();

  renderHud();
});

window.addEventListener("keydown", (event) => {
  if (simulation.snapshot().outcome) return;
  if (activeFeedback) return;
  if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") simulation.move(0, -1);
  if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") simulation.move(0, 1);
  if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") simulation.move(-1, 0);
  if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") simulation.move(1, 0);
  renderHud();
});

function toCombatAction(action: keyof typeof actionLabels): CombatAction {
  if (action === "attack") return { type: "attack", mode: "melee" };
  if (action === "defend") return { type: "defend" };
  if (action === "dodge-left") return { type: "dodge", direction: "left" };
  return { type: "dodge", direction: "right" };
}

function visibilityLabel(level: string): string {
  if (level === "visible") return "看见";
  if (level === "aware") return "察觉";
  return "未见";
}

function feedbackToastMarkup(event: FeedbackEvent): string {
  return `<aside class="feedback-toast tone-${event.tone} kind-${event.kind}" role="dialog" aria-live="assertive" aria-label="${escapeHtml(event.title)}">
    <span>${escapeHtml(event.title)}</span>
    <strong>${escapeHtml(event.body)}</strong>
    <button class="feedback-confirm" data-feedback-confirm="true">确认</button>
  </aside>`;
}

function healthFeedbackState(
  hp: number,
  maxHp: number
): { overlayClass: string; statClass: string; bloodOpacity: string; criticalBloodOpacity: string } {
  const safeMaxHp = Math.max(1, maxHp);
  const hpRatio = Math.max(0, Math.min(1, hp / safeMaxHp));
  const woundIntensity = 1 - hpRatio;
  const critical = hp < 3;
  const wounded = hp < safeMaxHp / 2;
  const overlayClass = critical ? "is-critical" : wounded ? "is-wounded" : "is-safe";
  const statClass = critical ? "health-stat is-critical" : wounded ? "health-stat is-wounded" : "health-stat";
  return {
    overlayClass,
    statClass,
    bloodOpacity: (0.32 + woundIntensity * 0.38).toFixed(2),
    criticalBloodOpacity: (0.46 + woundIntensity * 0.42).toFixed(2)
  };
}

function healthFeedbackMarkup(feedback: { overlayClass: string; bloodOpacity: string; criticalBloodOpacity: string }): string {
  return `<div class="health-screen-effects ${feedback.overlayClass}" style="--blood-opacity: ${feedback.bloodOpacity}; --critical-blood-opacity: ${feedback.criticalBloodOpacity};" aria-hidden="true">
    <div class="health-blood-layer"></div>
    <div class="health-breath-layer"></div>
    <div class="health-heartbeat-layer"></div>
  </div>`;
}

function clearFeedbackToast(): void {
  activeFeedback = undefined;
  feedbackQueue.length = 0;
  seenFeedbackIds.clear();
}

function itemName(itemId: ItemId): string {
  return ITEMS[itemId].name;
}

function itemDescription(itemId: ItemId): string {
  return itemUiDescription(itemId);
}

function slotRuntimeText(slot: InventorySlot, manualRound: number): string {
  const spent =
    slot.charges !== undefined &&
    slot.charges <= 0 &&
    slot.item.usage.mode !== "rechargeable" &&
    slot.item.usage.mode !== "charges-keep";
  if (spent) return "已耗尽";
  if (slot.item.usage.manualLock === "per-round" && slot.lastManualUseRound === manualRound) return "本回合已使用";
  const remaining = slot.charges !== undefined ? `剩余 ${slot.charges} 次` : "";
  const limit = itemUiLimit(slot.item.id);
  return remaining ? `${remaining}；${limit}` : limit;
}

function rarityLabel(rarity: ItemRarity): string {
  if (rarity === "mythic") return "神话";
  if (rarity === "rare") return "稀有";
  if (rarity === "uncommon") return "精良";
  return "常见";
}

function pickupIconMarkup(itemId: ItemId): string {
  const iconUrl = itemIconUrl(itemId);
  if (!iconUrl) return `<span class="pickup-icon pickup-icon-fallback" aria-hidden="true">${escapeHtml(ITEMS[itemId].category.slice(0, 1).toUpperCase())}</span>`;
  return `<img class="pickup-icon" src="${iconUrl}" alt="" aria-hidden="true">`;
}

function intelMarkup(entry: IntelEntry): string {
  const label = entry.certainty === "confirmed" ? "已知" : `推测${entry.confidence !== undefined ? ` ${entry.confidence}%` : ""}`;
  if (entry.kind === "attackDirection") {
    const direction = entry.attackDirection ?? (entry.value === "left" ? "left" : "right");
    return `<li><span>${label}</span>下次攻击方向 = ${direction === "left" ? "左" : "右"}</li>`;
  }
  if (!entry.itemId) return `<li><span>${label}</span>${escapeHtml(entry.value)}</li>`;
  const item = ITEMS[entry.itemId];
  return `<li class="intel-item" data-rarity="${item.rarity}">
    <span>${label}</span>
    <span class="intel-token" tabindex="0">${escapeHtml(entry.value)}
      <span class="intel-tooltip">
        <strong>${escapeHtml(item.name)} · ${rarityLabel(item.rarity)}</strong>
        <em>${escapeHtml(itemUiDescription(entry.itemId))}</em>
        <small>应对：${escapeHtml(itemEnemyCounter(entry.itemId))}</small>
      </span>
    </span>
  </li>`;
}

function activeEffectsMarkup(playerId: string, enemyId: string, effects: ActiveEffect[], statuses: StatusEffect[]): string {
  if (effects.length === 0 && statuses.length === 0) return "";
  const playerEffects = effects.filter((effect) => effect.ownerId === playerId || effect.targetActorId === playerId);
  const enemyEffects = effects.filter((effect) => effect.ownerId === enemyId || effect.targetActorId === enemyId);
  const playerStatuses = statuses.filter((effect) => effect.targetActorId === playerId);
  const enemyStatuses = statuses.filter((effect) => effect.targetActorId === enemyId);
  const chips = [
    ...playerEffects.map((effect) => effectChip(effect, playerId, enemyId)),
    ...enemyEffects.map((effect) => effectChip(effect, playerId, enemyId)),
    ...playerStatuses.map((effect) => statusChip(effect, playerId, enemyId)),
    ...enemyStatuses.map((effect) => statusChip(effect, playerId, enemyId))
  ];
  if (chips.length === 0) return "";
  return `<div class="effect-strip" aria-label="正在生效的道具">${chips.join("")}</div>`;
}

function effectChip(effect: ActiveEffect, playerId: string, enemyId: string): string {
  const text = activeEffectUiText(effect, { playerId, enemyId });
  return `<span class="effect-chip" title="${escapeHtml(text.detail)}">
    <b>${escapeHtml(text.targetLabel)}</b>
    <span>${escapeHtml(text.summary)}</span>
    <small>${escapeHtml(text.duration)}</small>
  </span>`;
}

function statusChip(effect: StatusEffect, playerId: string, enemyId: string): string {
  const text = statusEffectUiText(effect, { playerId, enemyId });
  return `<span class="effect-chip status-effect" title="${escapeHtml(text.detail)}">
    <b>${escapeHtml(text.targetLabel)}</b>
    <span>${escapeHtml(text.summary)}</span>
    <small>${escapeHtml(text.duration)}</small>
  </span>`;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createRunSeed(): string {
  return globalThis.crypto?.randomUUID?.() ?? `run-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
}

simulation.onChange(renderHud);
renderHud();

window.addEventListener("beforeunload", () => {
  game?.destroy(true);
});
