import { itemIconUrl } from "./render/gridDungeonAssets";
import { MetagameSimulation, createLocalProfileStorage, deploymentValueForSlot, priceForSlot, type MetagamePort } from "./sim/metagame";
import { activeEffectUiText, itemEnchantmentUiText, itemUiDescription, itemUiLimit, statusEffectUiText } from "./sim/itemText";
import { ITEMS } from "./sim/items";
import { calculateDerivedStats } from "./sim/stats";
import { enchantedItemName } from "./sim/systems/enchantmentSystem";
import type { SimulationPort } from "./sim/ports";
import type { ActiveEffect, CombatAction, FeedbackEvent, IntelEntry, InventorySlot, ItemId, ItemRarity, MapTierId, MetagameState, ProfileItemSlot, StatusEffect, TutorialInput } from "./sim/types";
import "./styles.css";

const simulation: SimulationPort & Partial<MetagamePort> = new MetagameSimulation(createRunSeed(), createLocalProfileStorage("zhaomian-profile-v1"));
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
type TutorialPreference = "on" | "off";
type TutorialMessage = {
  id: string;
  title: string;
  body: string;
};

const tutorialPreferenceKey = "zhaomian-tutorial-v2";
let tutorialPreference: TutorialPreference | null = readTutorialPreference();
let activeTutorial: TutorialMessage | undefined;
const shownTutorialIds = new Set<string>();
const shownScriptedTutorialSteps = new Set<string>();
type MetagameView = "home" | "account" | "shop" | "stash" | "compendium";
const metagameViews: Array<{ id: MetagameView; label: string; hint: string }> = [
  { id: "shop", label: "商城", hint: "购买补给" },
  { id: "account", label: "角色", hint: "属性/账号" },
  { id: "home", label: "战斗", hint: "地图/出发" },
  { id: "stash", label: "背包", hint: "带入/出售" },
  { id: "compendium", label: "百科", hint: "规则索引" }
];
let activeMetagameView: MetagameView = "home";
let lastRenderedMetagameView: MetagameView = activeMetagameView;
let carouselPointerStart: { x: number; y: number; prevTierId?: string; nextTierId?: string } | undefined;
let longPressTimer: number | undefined;
let touchTooltipTarget: HTMLElement | undefined;
let suppressNextHudClick = false;
let pendingRunConfirm = false;
let pickupPanelCollapsed = false;
let lastPickupOfferKey: string | undefined;

const actionLabels = {
  attack: "进攻",
  defend: "防御",
  "dodge-left": "左闪",
  "dodge-right": "右闪"
} as const;

function renderHud(): void {
  const preserveMetagameScroll = lastRenderedMetagameView === activeMetagameView;
  const preservedMetagameScroll = preserveMetagameScroll ? readMetagameScroll() : undefined;
  const state = simulation.snapshot();
  const meta = simulation.metaSnapshot?.();
  for (const event of state.feedbackEvents) {
    if (seenFeedbackIds.has(event.id)) continue;
    seenFeedbackIds.add(event.id);
    feedbackQueue.push(event);
  }
  if (!activeFeedback) activeFeedback = feedbackQueue.shift();
  const encounter = state.encounter;
  const encounterEnemy = encounter ? state.map.aiUnits.find((unit) => unit.id === encounter.enemyId) : undefined;
  const pickup = state.pendingPickupOffer;
  const pickupOfferKey = pickup ? `${pickup.nodeId}:${pickup.itemIds.join("|")}` : undefined;
  if (!pickupOfferKey) {
    pickupPanelCollapsed = false;
    lastPickupOfferKey = undefined;
  } else if (lastPickupOfferKey !== pickupOfferKey) {
    pickupPanelCollapsed = false;
    lastPickupOfferKey = pickupOfferKey;
  }
  const isStarterPickup = pickup?.nodeId === "starter";
  const hideStarterChoiceForTutorialNotice = Boolean(
    activeFeedback?.kind === "tutorial" && isStarterPickup && tutorialPreference === "on"
  );
  const playerAdvantagePoints = encounter?.advantage.playerPoints ?? 0;
  const enemyAdvantagePoints = encounter?.advantage.enemyPoints ?? 0;
  const hasPlayerAdvantage = playerAdvantagePoints > 0;
  const tutorialScenario = state.tutorialScenario?.active ? state.tutorialScenario : undefined;
  const tutorialAttrs = (input: TutorialInput, baseDisabled = false): string => {
    const disabled = baseDisabled || Boolean(tutorialScenario && !tutorialScenario.allowedInputs.includes(input));
    const highlighted = tutorialScenario?.highlightedInput === input;
    return `${disabled ? "disabled" : ""} ${highlighted ? 'data-tutorial-highlight="true"' : ""}`;
  };
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
      const enchantmentText = itemEnchantmentUiText(slot);
      const title = `${description} ${limit}${enchantmentText ? ` ${enchantmentText}` : ""}`;
      const displayName = enchantedItemName(slot);
      const enchantmentAttr = slot.affix?.kind === "enchantment" ? ` data-enchantment="${slot.affix.enchantment}"` : "";
      return `<button class="tool-button" data-item="${slot.item.id}" data-category="${slot.item.category}" data-rarity="${slot.item.rarity}"${enchantmentAttr} ${disabled ? "disabled" : ""} title="${escapeHtml(title)}" aria-label="${escapeHtml(`${displayName}：${title}`)}">
        ${icon}
        <span class="tool-copy">
          <span class="tool-label">${escapeHtml(displayName)}</span>
          <span class="tool-tooltip" role="tooltip">
            <span class="tool-hint">${escapeHtml(description)}</span>
            <span class="tool-limit">${escapeHtml(limit)}</span>
            ${enchantmentText ? `<span class="tool-enchantment">${escapeHtml(enchantmentText)}</span>` : ""}
          </span>
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
          <strong class="${playerAdvantagePoints > 0 ? "good" : enemyAdvantagePoints > 0 ? "bad" : ""}">
            ${playerAdvantagePoints > 0 ? `我方优势 ${playerAdvantagePoints}` : enemyAdvantagePoints > 0 ? `敌方优势 ${enemyAdvantagePoints}` : "僵持"}
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
          <button data-action="attack" ${tutorialAttrs("attack", encounter.phase !== "chooseAction")}>进攻 <small>比速度/力量</small></button>
          <button data-action="defend" ${tutorialAttrs("defend", encounter.phase !== "chooseAction")}>防御 <small>减伤/看数值</small></button>
          <button data-action="dodge-left" ${tutorialAttrs("dodge-left", encounter.phase !== "chooseAction")}>左闪 <small>方向预判</small></button>
          <button data-action="dodge-right" ${tutorialAttrs("dodge-right", encounter.phase !== "chooseAction")}>右闪 <small>方向预判</small></button>
        </div>
        <div class="secondary-actions">
          <button data-special="flee" ${!hasPlayerAdvantage || tutorialScenario ? "disabled" : ""} title="支付 1 点优势；成功率主要看你的速度、敌人速度、软底鞋和逃跑类道具修正。">逃跑 <small>-1 优势</small></button>
          <button data-special="pressPower" ${tutorialAttrs("pressPower", !hasPlayerAdvantage)} title="支付 1 点优势；下一次近战伤害 +1。重复选择会继续叠加。">续战·力量 <small>-1 优势</small></button>
          <button data-special="pressTempo" ${tutorialAttrs("pressTempo", !hasPlayerAdvantage)} title="支付 1 点优势；下一次动作速度 +1。重复选择会继续叠加。">续战·节奏 <small>-1 优势</small></button>
          <button data-special="persuade" ${tutorialAttrs("persuade", !hasPlayerAdvantage)} title="支付 1 点优势；成功率主要看智力、已确认情报、支付战利、说服道具和敌人当前伤势。">说服 <small>-1 优势</small></button>
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

  const pickupPanel = pickup && !hideStarterChoiceForTutorialNotice
    ? pickupPanelCollapsed
      ? `<section class="pickup-panel is-collapsed ${isStarterPickup ? "is-starter" : ""}" role="dialog" aria-label="${isStarterPickup ? "开局装备选择已收起" : "道具节点选择已收起"}">
        <div>
          <span class="eyebrow">${isStarterPickup ? "开局装备" : "道具节点"}</span>
          <h2>${isStarterPickup ? "选择已收起" : "三选一已收起"}</h2>
        </div>
        <button class="pickup-toggle" data-pickup-toggle="expand">展开</button>
      </section>`
      : `<section class="pickup-panel ${isStarterPickup ? "is-starter" : ""}" role="dialog" aria-label="${isStarterPickup ? "开局装备选择" : "道具节点三选一"}">
        <div class="battle-header">
          <div>
            <span class="eyebrow">${isStarterPickup ? "开局装备" : "道具节点"}</span>
            <h2>${isStarterPickup ? "先带一件进场" : "三选一"}</h2>
          </div>
          <button class="pickup-toggle" data-pickup-toggle="collapse" title="收起选择面板，查看地图。">收起</button>
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
        <button data-reset="true">${meta ? "回到战备" : "再进一次迷宫"}</button>
      </section>`
    : "";
  const feedbackToast = activeFeedback ? feedbackToastMarkup(activeFeedback) : "";
  const showRunHud = !meta || meta.activeRun;
  const tutorialLayer = !activeFeedback && showRunHud ? tutorialLayerMarkup(state) : "";
  const metagamePanel = meta ? metagamePanelMarkup(meta) : "";
  const topbar = showRunHud
    ? `<section class="topbar">
        <div>
          <span class="eyebrow">照面之时</span>
          <h1>${meta ? "迷宫行动" : "黑暗迷宫原型"}</h1>
        </div>
        <div class="stats">
          ${meta ? `<span>金币 ${meta.profile.gold}</span><span>${escapeHtml(meta.selectedMapTier.name)}</span><span>战备 ${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</span>` : ""}
          <span>时间 ${state.turn}/${state.turnLimit}</span>
          <span class="${healthFeedback.statClass}">生命 ${state.player.hp}/${playerMaxHp}</span>
          <span>战利 ${state.loot}</span>
          <span>精神 ${state.player.stats.spirit}</span>
          <span>智力 ${state.player.stats.intellect}</span>
          <span>力量 ${state.player.stats.strength}</span>
          <span>速度 ${state.player.stats.speed}</span>
          <span>体质 ${state.player.stats.constitution}</span>
        </div>
      </section>`
    : "";
  const runSidePanel = showRunHud
    ? `<section class="side-panel">
        <div class="panel-block inventory-panel">
          <h2>携带物</h2>
          <div class="inventory">${inventory || "<p>背包是空的。</p>"}</div>
        </div>
        <div class="panel-block log-panel">
          <h2>记录</h2>
          <ul class="log">${log}</ul>
        </div>
      </section>`
    : "";
  const runCommandStrip = showRunHud
    ? `<section class="command-strip">
        <button data-command="restart">重开</button>
      </section>`
    : "";

  hud.innerHTML = `
    <main class="hud-shell">
      ${showRunHud ? healthFeedbackMarkup(healthFeedback) : ""}
      ${topbar}
      ${metagamePanel}
      ${runSidePanel}
      ${runCommandStrip}
      ${feedbackToast}
      ${tutorialLayer}
      ${showRunHud ? pickupPanel : ""}
      ${showRunHud ? battlePanel : ""}
      ${showRunHud ? outcome : ""}
    </main>`;

  const roundLog = hud.querySelector<HTMLOListElement>(".rounds");
  if (roundLog) roundLog.scrollTop = roundLog.scrollHeight;
  restoreMetagameScroll(preservedMetagameScroll);
  lastRenderedMetagameView = activeMetagameView;
}

hud.addEventListener("click", (event) => {
  const target = event.target as HTMLElement;
  if (suppressNextHudClick) {
    const shouldSuppress = !touchTooltipTarget || touchTooltipTarget === target || touchTooltipTarget.contains(target);
    suppressNextHudClick = false;
    if (shouldSuppress) {
      event.preventDefault();
      return;
    }
  }
  if (!target.closest(".is-touch-tooltip")) hideTouchTooltip();
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
  const tutorialAction = button.dataset.tutorial;
  const metaCommand = button.dataset.metaCommand;
  const pickupToggle = button.dataset.pickupToggle;
  if (metaCommand && handleMetagameAction(button, metaCommand)) {
    renderHud();
    return;
  }

  if (pickupToggle) {
    pickupPanelCollapsed = pickupToggle === "collapse";
    renderHud();
    return;
  }

  if (tutorialAction) {
    handleTutorialAction(tutorialAction);
    renderHud();
    return;
  }

  const meta = simulation.metaSnapshot?.();
  if (activeFeedback) return;
  if ((!meta || meta.activeRun) && (tutorialPreference === null || activeTutorial || scriptedTutorialBlocking(simulation.snapshot()))) return;

  if (command === "restart" || button.dataset.reset) {
    clearFeedbackToast();
    simulation.reset(createRunSeed());
  }
  if (pickupItem) {
    pickupPanelCollapsed = false;
    simulation.choosePickup(pickupItem);
  }
  if (button.dataset.skipPickup) {
    pickupPanelCollapsed = false;
    simulation.choosePickup(null);
  }
  if (action) simulation.playCombatAction(toCombatAction(action));
  if (item) simulation.useItem(item);
  if (special === "flee") simulation.tryFlee();
  if (special === "pressPower") simulation.continueFight("pressPower");
  if (special === "pressTempo") simulation.continueFight("pressTempo");
  if (special === "persuade") simulation.tryPersuade();

  renderHud();
});

hud.addEventListener("pointerdown", (event) => {
  const target = event.target as HTMLElement;
  const carousel = target.closest<HTMLElement>(".meta-map-carousel");
  if (carousel) {
    carouselPointerStart = {
      x: event.clientX,
      y: event.clientY,
      prevTierId: carousel.dataset.prevTier,
      nextTierId: carousel.dataset.nextTier
    };
  }

  const hoverless = globalThis.matchMedia?.("(hover: none)").matches ?? false;
  if (event.pointerType === "mouse" && !hoverless) return;
  const tooltipHost = target.closest<HTMLElement>(".meta-item-card, .meta-loadout-chip, .tool-button, .intel-token, .effect-chip");
  if (!tooltipHost) return;
  window.clearTimeout(longPressTimer);
  longPressTimer = window.setTimeout(() => {
    hideTouchTooltip();
    tooltipHost.classList.add("is-touch-tooltip");
    touchTooltipTarget = tooltipHost;
    suppressNextHudClick = true;
  }, 520);
});

hud.addEventListener("pointerup", (event) => {
  window.clearTimeout(longPressTimer);
  longPressTimer = undefined;
  if (!carouselPointerStart) return;
  const deltaX = event.clientX - carouselPointerStart.x;
  const deltaY = event.clientY - carouselPointerStart.y;
  if (Math.abs(deltaX) > 46 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2) {
    const tierId = deltaX < 0 ? carouselPointerStart.nextTierId : carouselPointerStart.prevTierId;
    if (tierId) {
      (simulation as Partial<MetagamePort>).selectMapTier?.(tierId as MapTierId);
      suppressNextHudClick = true;
      event.preventDefault();
      renderHud();
    }
  }
  carouselPointerStart = undefined;
});

hud.addEventListener("pointercancel", () => {
  window.clearTimeout(longPressTimer);
  longPressTimer = undefined;
  carouselPointerStart = undefined;
});

function hideTouchTooltip(): void {
  if (touchTooltipTarget) touchTooltipTarget.classList.remove("is-touch-tooltip");
  touchTooltipTarget = undefined;
  hud.querySelectorAll(".is-touch-tooltip").forEach((element) => element.classList.remove("is-touch-tooltip"));
}

window.addEventListener("keydown", (event) => {
  const meta = simulation.metaSnapshot?.();
  if (meta && !meta.activeRun) return;
  if (simulation.snapshot().outcome) return;
  if (activeFeedback) return;
  if (tutorialPreference === null || activeTutorial || scriptedTutorialBlocking(simulation.snapshot())) return;
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

function tutorialLayerMarkup(state: ReturnType<SimulationPort["snapshot"]>): string {
  if (tutorialPreference === null) {
    return `<aside class="tutorial-panel tutorial-prompt" role="dialog" aria-modal="true" aria-label="新手教程">
      <span class="eyebrow">新手教程</span>
      <h2>需要一轮简短教学吗？</h2>
      <p>教程会先进入一段独立训练照面，练习防御读情报、方向闪避、优势下注、击杀和说服。完成或跳过后，才进入正式开局四选一。</p>
      <div class="tutorial-actions">
        <button data-tutorial="enable">需要</button>
        <button data-tutorial="disable">不需要</button>
      </div>
    </aside>`;
  }

  if (tutorialPreference !== "on") return "";
  const scriptedMessage = scriptedTutorialMessage(state);
  if (scriptedMessage) {
    return `<aside class="tutorial-panel scripted-tutorial-panel" role="dialog" aria-modal="true" aria-label="${escapeHtml(scriptedMessage.title)}">
      <span class="eyebrow">脚本教学</span>
      <h2>${escapeHtml(scriptedMessage.title)}</h2>
      <p>${escapeHtml(scriptedMessage.body)}</p>
      <div class="tutorial-goal">${escapeHtml(scriptedMessage.goal)}</div>
      <div class="tutorial-actions">
        <button data-tutorial="scripted-next">知道了</button>
        <button data-tutorial="skip-scripted">跳过教程</button>
      </div>
    </aside>`;
  }
  return "";
}

function scriptedTutorialBlocking(state: ReturnType<SimulationPort["snapshot"]>): boolean {
  return Boolean(scriptedTutorialMessage(state));
}

function scriptedTutorialMessage(
  state: ReturnType<SimulationPort["snapshot"]>
): { title: string; body: string; goal: string } | undefined {
  const scenario = state.tutorialScenario;
  if (!scenario?.active || shownScriptedTutorialSteps.has(scenario.stepId)) return undefined;
  const requiredDodge = scenario.requiredDodge === "right" ? "右闪" : "左闪";
  const messages: Record<string, { title: string; body: string; goal: string }> = {
    "enemy1-guard": {
      title: "第一课：别急着进攻",
      body: "这名训练敌高伤、低体质，速度也不慢。直接进攻会被先手重击惩罚。第一手先防御，稳定减伤并读取属性情报。",
      goal: "点击战斗面板中的「防御」。想试「进攻」也可以，系统会演示为什么危险。"
    },
    "enemy1-direction-guard": {
      title: "第二课：情报不是装饰",
      body: "防御已经让你看见了敌人的低体质。再防御一次，读取下一次攻击方向，为闪避做准备。",
      goal: "再次点击「防御」。"
    },
    "enemy1-dodge": {
      title: "第三课：按情报闪避",
      body: "你已经知道敌人的下一刀方向。闪避会根据方向和速度判定；猜对方向时更容易成功，并能获得更大的优势窗口。",
      goal: `点击「${requiredDodge}」。`
    },
    "enemy1-invest-tempo": {
      title: "第四课：优势是资源",
      body: "优势会积累，也可以支付。把 3 点优势全部投入速度，下一次进攻就能抢在高速敌人前面。",
      goal: "连续点击「续战·节奏」三次。"
    },
    "enemy1-kill": {
      title: "第五课：抢到先手后再杀",
      body: "速度下注完成。现在进攻会先手命中，让低体质敌人重伤并丢掉后手。继续追击即可击杀。",
      goal: "点击「进攻」。如果敌人还没倒下，再进攻一次。"
    },
    "enemy2-intel": {
      title: "第六课：不是每场都要杀",
      body: "第二名训练敌用于教学说服。先防御获得情报和优势，确认对方智力很低。",
      goal: "点击「防御」。"
    },
    "enemy2-persuade": {
      title: "第七课：用优势说服",
      body: "敌人智力低，且你已有优势。说服会支付 1 点优势，让对方休战。正式局里说服成功率还会受智力、情报、战利支付和道具影响。",
      goal: "点击「说服」，完成教程。"
    }
  };
  return messages[scenario.stepId];
}

function nextTutorialMessage(state: ReturnType<SimulationPort["snapshot"]>): TutorialMessage | undefined {
  const messages: TutorialMessage[] = [
    {
      id: "goal",
      title: "目标：搜、打、撤",
      body: "你要在黑暗迷宫里捡道具、判断照面风险，并在被击倒前从出口撤离。WASD 或方向键每次移动一格，每走一步都会推进敌人行动。"
    },
    {
      id: "attributes",
      title: "五项属性",
      body: "精神决定视野、初见情报和掉落修正；智力决定读信息和说服；力量决定伤害与同速先手；速度决定先后手、闪避和逃跑；体质决定生命、重伤阈值和异常持续。"
    },
    {
      id: "pickup",
      title: "道具是三选一构筑",
      body: "踩到道具节点会弹出三件候选，选一件加入背包，未选项会移除。拾取选择不额外花回合；背包里的道具说明可悬浮查看。"
    },
    {
      id: "vision",
      title: "视野决定谁先下注",
      body: "亮区是当前看见的范围，暗区是已探索记忆，墙会阻断视线。谁先看见对方，谁就可能拿到开局优势；敌人视野也可能比你远。"
    },
    {
      id: "items",
      title: "道具有主动和自动触发",
      body: "右侧背包可点击主动道具；被动道具会在满足条件时自动生效。部分局外道具会花费回合，意味着敌人也会移动和拾取。"
    },
    {
      id: "pistol",
      title: "左轮：先脱战，再开火",
      body: "左轮能在战斗外攻击视野内、直线射线可达的敌人。它不能被防御减免，适合先拉开距离、隔墙断线，再找枪线打掉追击者。"
    },
    {
      id: "enemy",
      title: "敌人也会成长",
      body: "敌人没有固定职业，会按随机属性、手上道具和迷宫拾取慢慢变强。听到红光、枪声或提示时，先判断是否该绕开。"
    },
    {
      id: "combat",
      title: "照面：进攻、防御、左右闪",
      body: "进攻比速度和力量；防御稳定减伤并读信息；左右闪要猜攻击方向，猜对更容易躲开。信息越多，动作选择越像读牌。"
    },
    {
      id: "advantage",
      title: "优势是出口，也是赌注",
      body: "优势会积累。逃跑、说服、续战和部分道具都要支付 1 点优势；优势越多，越能连续操作，长刀·光子切在 3 点以上会变成爆发。"
    }
  ];

  for (const message of messages) {
    if (shownTutorialIds.has(message.id)) continue;
    if (message.id === "goal") return message;
    if (message.id === "attributes") return message;
    if (message.id === "pickup" && state.pendingPickupOffer) return message;
    if (message.id === "vision" && state.turn > 0 && !state.encounter && !state.pendingPickupOffer) return message;
    if (message.id === "items" && state.inventory.length > 0 && !state.encounter && !state.pendingPickupOffer) return message;
    if (message.id === "pistol" && state.inventory.some((slot) => slot.item.id === "pistol") && !state.encounter) return message;
    if (message.id === "enemy" && (state.map.hints.length > 0 || state.encounter)) return message;
    if (message.id === "combat" && state.encounter) return message;
    if (message.id === "advantage" && (state.encounter?.advantage.playerPoints ?? 0) > 0) return message;
  }
  return undefined;
}

function handleTutorialAction(action: string): void {
  if (action === "enable") {
    tutorialPreference = "on";
    writeTutorialPreference("on");
    activeTutorial = undefined;
    shownScriptedTutorialSteps.clear();
    simulation.beginTutorialScenario();
    return;
  }
  if (action === "disable") {
    tutorialPreference = "off";
    writeTutorialPreference("off");
    activeTutorial = undefined;
    if (simulation.snapshot().tutorialScenario?.active) simulation.skipTutorialScenario();
    return;
  }
  if (action === "scripted-next") {
    const scenario = simulation.snapshot().tutorialScenario;
    if (scenario?.active) shownScriptedTutorialSteps.add(scenario.stepId);
    return;
  }
  if (action === "skip-scripted") {
    tutorialPreference = "off";
    writeTutorialPreference("off");
    activeTutorial = undefined;
    shownScriptedTutorialSteps.clear();
    simulation.skipTutorialScenario();
    return;
  }
  if (action === "next" && activeTutorial) {
    shownTutorialIds.add(activeTutorial.id);
    activeTutorial = undefined;
  }
}

function readTutorialPreference(): TutorialPreference | null {
  try {
    const value = globalThis.localStorage?.getItem(tutorialPreferenceKey);
    return value === "on" || value === "off" ? value : null;
  } catch {
    return null;
  }
}

function writeTutorialPreference(value: TutorialPreference): void {
  try {
    globalThis.localStorage?.setItem(tutorialPreferenceKey, value);
  } catch {
    // Local storage may be unavailable in private or embedded contexts; session state still works.
  }
}

function clearFeedbackToast(): void {
  activeFeedback = undefined;
  feedbackQueue.length = 0;
  seenFeedbackIds.clear();
}

function readMetagameScroll(): { top: number; left: number } | undefined {
  const panel = hud.querySelector<HTMLElement>(".metagame-panel.is-lobby");
  return panel ? { top: panel.scrollTop, left: panel.scrollLeft } : undefined;
}

function restoreMetagameScroll(position: { top: number; left: number } | undefined): void {
  if (!position) return;
  const panel = hud.querySelector<HTMLElement>(".metagame-panel.is-lobby");
  if (!panel) return;
  panel.scrollTop = position.top;
  panel.scrollLeft = position.left;
}

function handleMetagameAction(button: HTMLButtonElement, command: string): boolean {
  const metaPort = simulation as Partial<MetagamePort>;
  if (!metaPort.metaSnapshot) return false;
  if (command === "set-meta-view") {
    const nextView = button.dataset.metaView;
    if (isMetagameView(nextView)) activeMetagameView = nextView;
    pendingRunConfirm = false;
    return true;
  }
  if (command === "select-tier") {
    metaPort.selectMapTier?.(button.dataset.tierId as MapTierId);
    pendingRunConfirm = false;
  }
  if (command === "open-run-confirm") {
    pendingRunConfirm = true;
    return true;
  }
  if (command === "cancel-run-confirm") {
    pendingRunConfirm = false;
    return true;
  }
  if (command === "start-run") {
    const meta = metaPort.metaSnapshot();
    if (meta && !meta.canStartRun) {
      pendingRunConfirm = true;
      return true;
    }
    if (tutorialPreference === null) {
      tutorialPreference = "off";
      writeTutorialPreference("off");
    }
    pendingRunConfirm = false;
    clearFeedbackToast();
    metaPort.startRun?.(createRunSeed());
  }
  if (command === "tutorial-run") {
    pendingRunConfirm = false;
    tutorialPreference = "on";
    writeTutorialPreference("on");
    clearFeedbackToast();
    shownScriptedTutorialSteps.clear();
    metaPort.beginTutorialScenario?.();
  }
  if (command === "buy-shop") metaPort.buyShopOffer?.(button.dataset.offerId ?? "");
  if (command === "refresh-shop") metaPort.refreshShop?.();
  if (command === "equip-stash") metaPort.equipStashSlot?.(button.dataset.slotId ?? "");
  if (command === "unequip-deploy") metaPort.unequipDeploymentSlot?.(button.dataset.slotId ?? "");
  if (command === "sell-stash") metaPort.sellStashSlot?.(button.dataset.slotId ?? "");
  if (command === "reroll-stats") metaPort.rerollProfileStats?.();
  if (command === "upgrade-stats") metaPort.upgradeProfileStats?.();
  return true;
}

function isMetagameView(value: string | undefined): value is MetagameView {
  return value === "home" || value === "account" || value === "shop" || value === "stash" || value === "compendium";
}

function metagamePanelMarkup(meta: MetagameState): string {
  const profile = meta.profile;
  const statTotal = Object.values(profile.stats).reduce((sum, value) => sum + value, 0);
  const profileLevel = Math.max(1, profile.runsCompleted + 1);
  const shortProfileId = profile.id.length > 10 ? profile.id.slice(-10) : profile.id;
  const summary = profile.lastRunSummary
    ? `<p class="meta-summary">${profile.lastRunSummary.outcome === "extracted" ? "上局撤离" : "上局失败"}：回收 ${profile.lastRunSummary.itemsRecovered} 件，丢失 ${profile.lastRunSummary.itemsLost} 件，金币 +${profile.lastRunSummary.lootGold}</p>`
    : "";
  const metaMessage = meta.message ?? "";
  const showMetaMessage = metaMessage.length > 0 && !(activeMetagameView === "home" && metaMessage.startsWith("已选择"));
  const nav = metagameViews
    .map(
      (view) => `<button data-meta-command="set-meta-view" data-meta-view="${view.id}" class="${view.id === activeMetagameView ? "is-active" : ""}" aria-pressed="${view.id === activeMetagameView}">
        <strong>${view.label}</strong>
        <small>${view.hint}</small>
      </button>`
    )
    .join("");
  const startStatus = meta.canStartRun ? "可以进入" : "金币不足或战备超限";

  if (meta.activeRun) {
    return `<section class="metagame-panel is-compact">
      <strong>${escapeHtml(meta.selectedMapTier.name)}</strong>
      <span>金币 ${profile.gold}</span>
      <span>撤离成功才会带回身上物品；失败会丢失携带物和本局所得。</span>
    </section>`;
  }

  return `<section class="metagame-panel is-lobby view-${activeMetagameView}" role="dialog" aria-label="战备区">
    <header class="meta-lobby-topbar">
      <div class="meta-player-chip">
        <span class="meta-player-avatar" aria-hidden="true">照</span>
        <div>
          <span class="eyebrow">本地档案</span>
          <strong>${escapeHtml(shortProfileId)}</strong>
          <small>等级 ${profileLevel} / 属性 ${statTotal}</small>
        </div>
      </div>
      <div class="meta-resource-strip" aria-label="玩家资源">
        <span><strong>${profile.gold}</strong><small>金币</small></span>
        <span><strong>${escapeHtml(statBandLabel(profile.statBandId))}</strong><small>属性档</small></span>
        <span><strong>${profile.stash.length}</strong><small>背包库存</small></span>
        <span><strong>${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</strong><small>战备</small></span>
      </div>
      <div class="meta-current-route">
        <span class="eyebrow">当前地图</span>
        <strong>${escapeHtml(meta.selectedMapTier.name)}</strong>
        <small>入场 ${meta.selectedMapTier.entryFee} / ${startStatus}</small>
      </div>
    </header>
    ${showMetaMessage ? `<p class="meta-message">${escapeHtml(metaMessage)}</p>` : ""}
    <div class="meta-shell-layout">
      <div class="meta-stage-area">
        <div class="meta-page-title">
          <span class="eyebrow">照面之时</span>
          <h2>${escapeHtml(metagameViewTitle(activeMetagameView))}</h2>
        </div>
        ${summary}
        <div class="meta-view">${metagameViewMarkup(meta, statTotal)}</div>
      </div>
      <aside class="meta-shell-nav" aria-label="局外导航">
        <button class="meta-rail-start" data-meta-command="open-run-confirm">
          <span class="eyebrow">进入地图</span>
          <strong>开始行动</strong>
          <small>${escapeHtml(meta.selectedMapTier.name)} · 入场 ${meta.selectedMapTier.entryFee}</small>
        </button>
        <nav class="meta-nav" aria-label="局外页面">${nav}</nav>
      </aside>
    </div>
    ${pendingRunConfirm ? metagameRunConfirmMarkup(meta) : ""}
  </section>`;
}

function metagameViewTitle(view: MetagameView): string {
  if (view === "home") return "地图行动";
  if (view === "account") return "角色档案";
  if (view === "shop") return "补给商城";
  if (view === "stash") return "背包仓库";
  return "百科索引";
}

function metagameViewMarkup(meta: MetagameState, statTotal: number): string {
  if (activeMetagameView === "home") return metagameHomeView(meta);
  if (activeMetagameView === "account") return metagameAccountView(meta, statTotal);
  if (activeMetagameView === "shop") return metagameShopView(meta);
  if (activeMetagameView === "stash") return metagameStashView(meta);
  if (activeMetagameView === "compendium") return metagameCompendiumView(meta);
  return metagameHomeView(meta);
}

function metagameHomeView(meta: MetagameState): string {
  const profile = meta.profile;
  const lastRun = profile.lastRunSummary
    ? `${profile.lastRunSummary.outcome === "extracted" ? "上次撤离成功" : "上次行动失败"} · 回收 ${profile.lastRunSummary.itemsRecovered} 件 · 金币 +${profile.lastRunSummary.lootGold}`
    : "还没有行动记录";
  const deploymentSummary = deploymentSummaryMarkup(meta);
  const loadoutState = meta.canStartRun ? "可以进场" : "金币不足或战备超限";
  const selectedIndex = Math.max(0, meta.mapTiers.findIndex((tier) => tier.id === profile.selectedMapTierId));
  const selectedTier = meta.mapTiers[selectedIndex] ?? meta.selectedMapTier;
  const previousTier = meta.mapTiers[(selectedIndex - 1 + meta.mapTiers.length) % meta.mapTiers.length] ?? selectedTier;
  const nextTier = meta.mapTiers[(selectedIndex + 1) % meta.mapTiers.length] ?? selectedTier;
  const pips = meta.mapTiers
    .map(
      (tier) => `<button class="${tier.id === selectedTier.id ? "is-active" : ""}" data-meta-command="select-tier" data-tier-id="${tier.id}" aria-label="选择${escapeHtml(tier.name)}">
        <span>${tier.rank}</span>
      </button>`
    )
    .join("");
  return `<section class="meta-section meta-home-view">
    <div class="meta-battle-stage">
      <section class="meta-map-carousel" data-prev-tier="${previousTier.id}" data-next-tier="${nextTier.id}" aria-label="地图档位轮播">
        ${mapTierCardMarkup(previousTier, "is-ghost is-prev", "select-tier")}
        ${mapTierCardMarkup(nextTier, "is-ghost is-next", "select-tier")}
        <button class="meta-carousel-arrow is-left" data-meta-command="select-tier" data-tier-id="${previousTier.id}" aria-label="上一张地图">‹</button>
        ${mapTierCardMarkup(selectedTier, "is-active", "open-run-confirm")}
        <button class="meta-carousel-arrow is-right" data-meta-command="select-tier" data-tier-id="${nextTier.id}" aria-label="下一张地图">›</button>
        <div class="meta-carousel-pips" aria-label="地图档位">${pips}</div>
      </section>
      <aside class="meta-start-console">
        <div>
          <span class="eyebrow">入场检查</span>
          <h3>${loadoutState}</h3>
          <p>确认费用、战备和风险。完整携带管理在背包中完成。</p>
        </div>
        <div class="meta-loadout-summary meta-entry-metrics">
          <span>入场费 ${selectedTier.entryFee}</span>
          <span>敌人 ${selectedTier.enemyStatTotalRange[0]}-${selectedTier.enemyStatTotalRange[1]}</span>
          <span>掉落 ${tierRarityLine(selectedTier)}</span>
        </div>
        <div class="meta-loadout-compact">
          <div>
            <strong>携带 ${profile.deployment.length} 件</strong>
            <small>战备 ${meta.deploymentValue}/${selectedTier.deploymentValueCap} · 失败丢失，撤离回仓库</small>
          </div>
          ${deploymentSummary}
        </div>
        <div class="meta-actions meta-action-row">
          <button class="start-run-button meta-primary-cta" data-meta-command="open-run-confirm">开始行动</button>
          <button data-meta-command="set-meta-view" data-meta-view="stash">调整背包</button>
          <button data-meta-command="tutorial-run">训练教程</button>
        </div>
      </aside>
    </div>
    <div class="meta-home-grid is-supporting">
      <article>
        <strong>当前目标</strong>
        <span>进场 → 搜刮/交战 → 找出口撤离</span>
      </article>
      <article>
        <strong>当前地图</strong>
        <span>${escapeHtml(selectedTier.name)} · 入场 ${selectedTier.entryFee}</span>
      </article>
      <article>
        <strong>战备状态</strong>
        <span>${meta.deploymentValue}/${selectedTier.deploymentValueCap} · ${meta.canStartRun ? "可出发" : "需调整"}</span>
      </article>
      <article>
        <strong>档案记录</strong>
        <span>${escapeHtml(lastRun)}</span>
      </article>
    </div>
  </section>`;
}

function mapTierCardMarkup(tier: MetagameState["mapTiers"][number], variantClass: string, command: "select-tier" | "open-run-confirm"): string {
  return `<button class="meta-map-card ${variantClass}" data-meta-command="${command}" data-tier-id="${tier.id}" title="${escapeHtml(tier.description)}">
    <span class="meta-map-rank">第 ${tier.rank} 档</span>
    <span class="meta-map-art" aria-hidden="true"></span>
    <span class="meta-map-copy">
      <strong>${escapeHtml(tier.name)}</strong>
      <small>入场 ${tier.entryFee} / 战备 ${tier.deploymentValueCap} / 敌人 ${tier.enemyStatTotalRange[0]}-${tier.enemyStatTotalRange[1]}</small>
      <em>${escapeHtml(tier.description)}</em>
    </span>
    <span class="meta-map-tags">
      <b>${tierRarityLine(tier)}</b>
      <b>${tier.naturalAffixChance > 0 ? `附魔 ${tier.naturalAffixChance}%` : "无自然附魔"}</b>
      <b>${tier.enemyStartsWithEnchantedItem ? "敌人携带附魔" : "常规敌人"}</b>
    </span>
  </button>`;
}

function metagameRunConfirmMarkup(meta: MetagameState): string {
  const deployment = meta.profile.deployment.map((slot) => enchantedItemName(slot)).join("、") || "未携带道具";
  const blockReason = meta.canStartRun ? "" : "金币不足或战备超限，请先调整背包或选择低档地图。";
  return `<section class="meta-run-confirm-backdrop" role="presentation">
    <div class="meta-run-confirm" role="dialog" aria-modal="true" aria-label="确认进入地图">
      <span class="eyebrow">确认进入地图</span>
      <h3>${escapeHtml(meta.selectedMapTier.name)}</h3>
      <p>进入后会支付入场费，并带着当前战备进入迷宫。失败会失去带入物和本局所得；撤离成功才会带回战利。</p>
      <div class="meta-confirm-facts">
        <span>入场费 ${meta.selectedMapTier.entryFee}</span>
        <span>战备 ${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</span>
        <span>敌人 ${meta.selectedMapTier.enemyStatTotalRange[0]}-${meta.selectedMapTier.enemyStatTotalRange[1]}</span>
        <span>携带：${escapeHtml(deployment)}</span>
      </div>
      ${blockReason ? `<p class="meta-confirm-warning">${escapeHtml(blockReason)}</p>` : ""}
      <div class="meta-confirm-actions">
        <button data-meta-command="cancel-run-confirm">取消</button>
        <button class="meta-primary-cta" data-meta-command="start-run" ${meta.canStartRun ? "" : "disabled"}>确认进入</button>
      </div>
    </div>
  </section>`;
}

function tierRarityLine(tier: MetagameState["mapTiers"][number]): string {
  const parts: string[] = [];
  if (tier.rarityWeights.common > 0) parts.push("白");
  if (tier.rarityWeights.uncommon > 0) parts.push("蓝");
  if (tier.rarityWeights.rare > 0) parts.push("橙");
  if (tier.rarityWeights.mythic > 0 || tier.mythicGemOfferChance > 0) parts.push("红");
  return parts.join("/") || "无";
}

function metagameCompendiumView(meta: MetagameState): string {
  return `<section class="meta-section meta-compendium-view">
    <div class="meta-section-head">
      <div>
        <h3>百科索引</h3>
        <p>这里收束玩家在大厅需要反复查看的规则：搜打撤目标、属性作用、道具触发、附魔稀有度和地图档位差异。</p>
      </div>
      <span class="meta-pill">${escapeHtml(meta.selectedMapTier.name)}</span>
    </div>
    <div class="meta-compendium-grid">
      <article><strong>游戏目标</strong><span>带入战备进迷宫，搜集道具并找出口撤离。失败会失去带入物与本局所得。</span></article>
      <article><strong>五维属性</strong><span>精神看视野与掉落感知，智力看情报与说服，力量看伤害，速度看先手/闪避/逃跑，体质看生命与重伤抗性。</span></article>
      <article><strong>战斗优势</strong><span>优势是可积累资源，可用于逃跑、说服、续战加成和部分强力道具。</span></article>
      <article><strong>道具规则</strong><span>商店和背包卡片可悬浮查看详情；手机端长按卡片查看同样信息。</span></article>
      <article><strong>地图档位</strong><span>高档地图入场费和战备上限更高，敌人更强，稀有与附魔收益也更高。</span></article>
      <article><strong>当前选择</strong><span>${escapeHtml(meta.selectedMapTier.name)}：入场 ${meta.selectedMapTier.entryFee}，敌人 ${meta.selectedMapTier.enemyStatTotalRange[0]}-${meta.selectedMapTier.enemyStatTotalRange[1]}。</span></article>
    </div>
  </section>`;
}

function metagameAccountView(meta: MetagameState, statTotal: number): string {
  const profile = meta.profile;
  return `<section class="meta-section meta-account-view">
    <div class="meta-section-head">
      <div>
        <h3>本地档案</h3>
        <p>当前版本使用本地存档；账号和密码输入已预留给后续云端账号接入。</p>
      </div>
      <span class="meta-pill">ID ${escapeHtml(profile.id)}</span>
    </div>
    <form class="auth-hook-form" data-auth-hook="profile-auth">
      <label>
        <span>账号</span>
        <input data-auth-field="account" name="account" autocomplete="username" placeholder="后续账号名 / 邮箱" />
      </label>
      <label>
        <span>密码</span>
        <input data-auth-field="password" name="password" type="password" autocomplete="current-password" placeholder="后续密码" />
      </label>
      <div class="auth-hook-actions">
        <button type="button" data-auth-hook="login" disabled>登录预留</button>
        <button type="button" data-auth-hook="register" disabled>注册预留</button>
      </div>
    </form>
    <div class="meta-section-head">
      <div>
        <h3>角色属性 <small>总值 ${statTotal}</small></h3>
        <p>属性决定视野、情报、伤害、先后手、逃跑、说服与生命承压。</p>
      </div>
      <span class="meta-pill">${escapeHtml(statBandLabel(profile.statBandId))}</span>
    </div>
    <div class="meta-stats">
      <span><strong>精神</strong>${profile.stats.spirit}<small>视野/掉落感知</small></span>
      <span><strong>智力</strong>${profile.stats.intellect}<small>情报/说服</small></span>
      <span><strong>力量</strong>${profile.stats.strength}<small>伤害/同速</small></span>
      <span><strong>速度</strong>${profile.stats.speed}<small>先手/闪避</small></span>
      <span><strong>体质</strong>${profile.stats.constitution}<small>生命/重伤</small></span>
    </div>
    <div class="meta-actions">
      <button data-meta-command="reroll-stats">重Roll属性</button>
      <button data-meta-command="upgrade-stats">升级总值档</button>
      <button data-meta-command="tutorial-run">训练教程</button>
    </div>
  </section>`;
}

function metagameShopView(meta: MetagameState): string {
  const shop = meta.profile.shop.offers.map((offer) => shopOfferCard(offer, meta.activeRun)).join("");
  return `<section class="meta-section meta-shop-view">
    <div class="meta-section-head">
      <div>
        <h3>商店</h3>
        <p>商店价格按稀有度与附魔提高；买到的物品进入仓库。</p>
      </div>
      <span class="meta-pill">金币 ${meta.profile.gold}</span>
    </div>
    <div class="meta-item-list">${shop}</div>
    <div class="meta-actions">
      <button data-meta-command="refresh-shop">刷新商店</button>
    </div>
  </section>`;
}

function metagameStashView(meta: MetagameState): string {
  const stash = meta.profile.stash.map((slot) => stashSlotCard(slot, meta.activeRun)).join("");
  return `<section class="meta-section meta-stash-view">
    <div class="meta-section-head">
      <div>
        <h3>仓库 <small>${meta.profile.stash.length} 件</small></h3>
        <p>仓库无上限。卖出获得半价金币；带入后失败会丢失。</p>
      </div>
      <span class="meta-pill">战备 ${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</span>
    </div>
    <div class="meta-item-list">${stash || "<p>仓库空着。撤离成功会把身上物品放进来。</p>"}</div>
  </section>`;
}

function shopOfferCard(offer: MetagameState["profile"]["shop"]["offers"][number], activeRun: boolean): string {
  return `<article class="meta-item-card ${offer.sold ? "is-sold" : ""}" data-rarity="${offer.slot.item.rarity}"${enchantmentDataAttr(offer.slot)} tabindex="0">
    ${profileSlotIconMarkup(offer.slot)}
    <div>
      <strong>${escapeHtml(enchantedItemName(offer.slot))}</strong>
      <small>${escapeHtml(rarityLabel(offer.slot.item.rarity))} / ${offer.price} 金币 / 战备值 ${deploymentValueForSlot(offer.slot)}</small>
    </div>
    <button data-meta-command="buy-shop" data-offer-id="${offer.id}" ${activeRun || offer.sold ? "disabled" : ""}>${offer.sold ? "已售" : "购买"}</button>
    ${profileSlotTooltipMarkup(offer.slot, `售价 ${offer.price} 金币；战备值 ${deploymentValueForSlot(offer.slot)}`)}
  </article>`;
}

function stashSlotCard(slot: ProfileItemSlot, activeRun: boolean): string {
  return `<article class="meta-item-card" data-rarity="${slot.item.rarity}"${enchantmentDataAttr(slot)} tabindex="0">
    ${profileSlotIconMarkup(slot)}
    <div>
      <strong>${escapeHtml(enchantedItemName(slot))}</strong>
      <small>${escapeHtml(slotRuntimeText(slot, 0))} / 售价 ${Math.floor(priceForSlot(slot) / 2)}</small>
    </div>
    <span class="meta-card-actions">
      <button data-meta-command="equip-stash" data-slot-id="${slot.instanceId}" ${activeRun ? "disabled" : ""}>带入</button>
      <button data-meta-command="sell-stash" data-slot-id="${slot.instanceId}" ${activeRun ? "disabled" : ""}>卖</button>
    </span>
    ${profileSlotTooltipMarkup(slot, `卖出获得 ${Math.floor(priceForSlot(slot) / 2)} 金币；带入价值 ${deploymentValueForSlot(slot)}`)}
  </article>`;
}

function deploymentSummaryMarkup(meta: MetagameState): string {
  const slots = meta.profile.deployment;
  if (!slots.length) {
    return `<div class="meta-loadout-chips is-empty"><span>未携带道具</span></div>`;
  }
  const preview = slots
    .slice(0, 3)
    .map(
      (slot) => `<span class="meta-loadout-chip" data-rarity="${slot.item.rarity}"${enchantmentDataAttr(slot)} tabindex="0">
        ${profileSlotIconMarkup(slot)}
        <span class="meta-loadout-chip-name">${escapeHtml(enchantedItemName(slot))}</span>
        ${profileSlotTooltipMarkup(slot, `战备值 ${deploymentValueForSlot(slot)}；失败会丢失，撤离成功会回仓库`)}
      </span>`
    )
    .join("");
  const extra = slots.length > 3 ? `<span class="meta-loadout-more">+${slots.length - 3}</span>` : "";
  return `<div class="meta-loadout-chips">${preview}${extra}</div>`;
}

function deploymentSlotCard(slot: ProfileItemSlot, activeRun: boolean): string {
  return `<article class="meta-item-card" data-rarity="${slot.item.rarity}"${enchantmentDataAttr(slot)} tabindex="0">
    ${profileSlotIconMarkup(slot)}
    <div>
      <strong>${escapeHtml(enchantedItemName(slot))}</strong>
      <small>战备值 ${deploymentValueForSlot(slot)}；失败会丢失</small>
    </div>
    <button data-meta-command="unequip-deploy" data-slot-id="${slot.instanceId}" ${activeRun ? "disabled" : ""}>撤下</button>
    ${profileSlotTooltipMarkup(slot, `战备值 ${deploymentValueForSlot(slot)}；失败会丢失，撤离成功会回仓库`)}
  </article>`;
}

function statBandLabel(bandId: MetagameState["profile"]["statBandId"]): string {
  if (bandId === "baseline") return "拾荒者 10-12";
  if (bandId === "trained") return "熟手 12-15";
  return "硬牌 15-20";
}

function profileSlotIconMarkup(slot: ProfileItemSlot): string {
  const iconUrl = itemIconUrl(slot.item.id);
  const charges = slot.charges !== undefined ? `<small>${slot.charges}</small>` : slot.count > 1 ? `<small>x${slot.count}</small>` : "";
  const icon = iconUrl
    ? `<img class="tool-icon" src="${iconUrl}" alt="" aria-hidden="true">`
    : `<span class="tool-icon tool-icon-fallback" aria-hidden="true">${escapeHtml(slot.item.category.slice(0, 1).toUpperCase())}</span>`;
  return `<span class="meta-item-icon">${icon}${charges}</span>`;
}

function profileSlotTooltipMarkup(slot: ProfileItemSlot, economyText: string): string {
  const description = itemUiDescription(slot.item.id);
  const limit = slotRuntimeText(slot, 0);
  const enchantmentText = itemEnchantmentUiText(slot);
  return `<span class="meta-item-tooltip" role="tooltip">
    <strong>${escapeHtml(enchantedItemName(slot))} · ${escapeHtml(rarityLabel(slot.item.rarity))}</strong>
    <span class="tool-hint">${escapeHtml(description)}</span>
    <span class="tool-limit">${escapeHtml(limit)}</span>
    <span class="tool-limit">${escapeHtml(economyText)}</span>
    ${enchantmentText ? `<span class="tool-enchantment">${escapeHtml(enchantmentText)}</span>` : ""}
  </span>`;
}

function enchantmentDataAttr(slot: Pick<InventorySlot, "affix">): string {
  return slot.affix?.kind === "enchantment" ? ` data-enchantment="${slot.affix.enchantment}"` : "";
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
        <small>${escapeHtml(itemUiLimit(entry.itemId))}</small>
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
