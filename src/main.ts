import { itemIconUrl } from "./render/gridDungeonAssets";
import { MetagameSimulation, createLocalProfileStorage, deploymentValueForSlot, priceForSlot, type MetagamePort } from "./sim/metagame";
import { activeEffectUiText, itemEnchantmentUiText, itemEnemyCounter, itemUiDescription, itemUiLimit, statusEffectUiText } from "./sim/itemText";
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
type MetagameView = "home" | "account" | "shop" | "stash";
const metagameViews: Array<{ id: MetagameView; label: string; hint: string }> = [
  { id: "home", label: "行动", hint: "地图/战备/出发" },
  { id: "shop", label: "商店", hint: "购买补给" },
  { id: "stash", label: "仓库", hint: "带入/出售" },
  { id: "account", label: "档案", hint: "属性/账号" }
];
let activeMetagameView: MetagameView = "home";
let lastRenderedMetagameView: MetagameView = activeMetagameView;

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
        <button data-reset="true">${meta ? "回到战备" : "再进一次迷宫"}</button>
      </section>`
    : "";
  const feedbackToast = activeFeedback ? feedbackToastMarkup(activeFeedback) : "";
  const tutorialLayer = !activeFeedback && (!meta || meta.activeRun) ? tutorialLayerMarkup(state) : "";
  const metagamePanel = meta ? metagamePanelMarkup(meta) : "";

  hud.innerHTML = `
    <main class="hud-shell">
      ${healthFeedbackMarkup(healthFeedback)}
      <section class="topbar">
        <div>
          <span class="eyebrow">照面之时</span>
          <h1>${meta ? "游戏外壳 / 战备终端" : "黑暗迷宫原型"}</h1>
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
      </section>
      ${metagamePanel}
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
      ${tutorialLayer}
      ${pickupPanel}
      ${battlePanel}
      ${outcome}
    </main>`;

  const roundLog = hud.querySelector<HTMLOListElement>(".rounds");
  if (roundLog) roundLog.scrollTop = roundLog.scrollHeight;
  restoreMetagameScroll(preservedMetagameScroll);
  lastRenderedMetagameView = activeMetagameView;
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
  const tutorialAction = button.dataset.tutorial;
  const metaCommand = button.dataset.metaCommand;
  if (metaCommand && handleMetagameAction(button, metaCommand)) {
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
    return true;
  }
  if (command === "select-tier") metaPort.selectMapTier?.(button.dataset.tierId as MapTierId);
  if (command === "start-run") {
    if (tutorialPreference === null) {
      tutorialPreference = "off";
      writeTutorialPreference("off");
    }
    clearFeedbackToast();
    metaPort.startRun?.(createRunSeed());
  }
  if (command === "tutorial-run") {
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
  return value === "home" || value === "account" || value === "shop" || value === "stash";
}

function metagamePanelMarkup(meta: MetagameState): string {
  const profile = meta.profile;
  const statTotal = Object.values(profile.stats).reduce((sum, value) => sum + value, 0);
  const summary = profile.lastRunSummary
    ? `<p class="meta-summary">${profile.lastRunSummary.outcome === "extracted" ? "上局撤离" : "上局失败"}：回收 ${profile.lastRunSummary.itemsRecovered} 件，丢失 ${profile.lastRunSummary.itemsLost} 件，金币 +${profile.lastRunSummary.lootGold}</p>`
    : "";
  const nav = metagameViews
    .map(
      (view) => `<button data-meta-command="set-meta-view" data-meta-view="${view.id}" class="${view.id === activeMetagameView ? "is-active" : ""}" aria-pressed="${view.id === activeMetagameView}">
        <strong>${view.label}</strong>
        <small>${view.hint}</small>
      </button>`
    )
    .join("");

  if (meta.activeRun) {
    return `<section class="metagame-panel is-compact">
      <strong>${escapeHtml(meta.selectedMapTier.name)}</strong>
      <span>金币 ${profile.gold}</span>
      <span>撤离成功才会带回身上物品；失败会丢失携带物和本局所得。</span>
    </section>`;
  }

  return `<section class="metagame-panel is-lobby view-${activeMetagameView}" role="dialog" aria-label="战备区">
    <div class="meta-header">
      <div>
        <span class="eyebrow">局外战备</span>
        <h2>${escapeHtml(metagameViewTitle(activeMetagameView))}</h2>
      </div>
      <strong>${profile.gold} 金币</strong>
    </div>
    <nav class="meta-nav" aria-label="局外页面">${nav}</nav>
    <div class="meta-profile-strip">
      <span>属性总值 ${statTotal}</span>
      <span>地图 ${escapeHtml(meta.selectedMapTier.name)}</span>
      <span>入场费 ${meta.selectedMapTier.entryFee}</span>
      <span>战备 ${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</span>
      <span>仓库 ${profile.stash.length}</span>
    </div>
    ${meta.message ? `<p class="meta-message">${escapeHtml(meta.message)}</p>` : ""}
    ${summary}
    <div class="meta-view">${metagameViewMarkup(meta, statTotal)}</div>
  </section>`;
}

function metagameViewTitle(view: MetagameView): string {
  if (view === "home") return "行动选择";
  if (view === "account") return "档案、属性与账号预留";
  if (view === "shop") return "购买与刷新补给";
  return "仓库管理";
}

function metagameViewMarkup(meta: MetagameState, statTotal: number): string {
  if (activeMetagameView === "home") return metagameHomeView(meta);
  if (activeMetagameView === "account") return metagameAccountView(meta, statTotal);
  if (activeMetagameView === "shop") return metagameShopView(meta);
  if (activeMetagameView === "stash") return metagameStashView(meta);
  return metagameHomeView(meta);
}

function metagameHomeView(meta: MetagameState): string {
  const profile = meta.profile;
  const lastRun = profile.lastRunSummary
    ? `${profile.lastRunSummary.outcome === "extracted" ? "上次撤离成功" : "上次行动失败"} · 回收 ${profile.lastRunSummary.itemsRecovered} 件 · 金币 +${profile.lastRunSummary.lootGold}`
    : "还没有行动记录";
  const deployment = profile.deployment.map((slot) => deploymentSlotCard(slot, meta.activeRun)).join("");
  const loadoutState = meta.canStartRun ? "可以进场" : "金币不足或战备超限";
  const tiers = meta.mapTiers
    .map(
      (tier) => `<button data-meta-command="select-tier" data-tier-id="${tier.id}" class="${tier.id === profile.selectedMapTierId ? "is-selected" : ""}" ${meta.activeRun ? "disabled" : ""} title="${escapeHtml(tier.description)}">
        <strong>${escapeHtml(tier.name)}</strong>
        <small>入场 ${tier.entryFee} / 战备 ${tier.deploymentValueCap} / 敌人 ${tier.enemyStatTotalRange[0]}-${tier.enemyStatTotalRange[1]}</small>
        <span>${escapeHtml(tier.description)}</span>
      </button>`
    )
    .join("");
  return `<section class="meta-section meta-home-view">
    <div class="meta-hero">
      <span class="meta-brand-mark" aria-hidden="true"></span>
      <div class="meta-hero-copy">
        <span class="eyebrow">黑暗迷宫搜打撤</span>
        <h3>照面之时</h3>
        <p>带着有限战备进入无视野迷宫，拾取道具、判断敌人、短促交锋，然后找到出口把战利带回来。</p>
      </div>
    </div>
    <div class="meta-home-entry-grid">
      <section class="meta-entry-window meta-map-window">
        <div class="meta-section-head">
          <div>
            <h3>选择行动区域</h3>
            <p>关卡档位是本页最重要的决定：它决定入场费、可携带战备上限、敌人数值、掉落稀有度和附魔机会。</p>
          </div>
          <span class="meta-pill">当前 ${escapeHtml(meta.selectedMapTier.name)}</span>
        </div>
        <div class="tier-list is-entry">${tiers}</div>
      </section>
      <aside class="meta-entry-window meta-launch-window">
        <div class="meta-section-head">
          <div>
            <h3>入场检查 <small>${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap}</small></h3>
            <p>战备是进入前的临门选择。失败会丢失携带物；撤离成功才会带回。</p>
          </div>
          <span class="meta-pill">${loadoutState}</span>
        </div>
        <div class="meta-loadout-summary">
          <span>地图：${escapeHtml(meta.selectedMapTier.name)}</span>
          <span>入场费：${meta.selectedMapTier.entryFee}</span>
          <span>金币：${profile.gold}</span>
        </div>
        <div class="meta-item-list meta-entry-loadout">${deployment || "<p>还没有带入物品。去仓库选择要冒险带入的装备。</p>"}</div>
        <div class="meta-actions meta-action-row">
          <button class="start-run-button meta-primary-cta" data-meta-command="start-run" ${meta.canStartRun ? "" : "disabled"}>支付入场费并开始</button>
          <button data-meta-command="set-meta-view" data-meta-view="stash">调整携带</button>
          <button data-meta-command="set-meta-view" data-meta-view="shop">购买补给</button>
        </div>
      </aside>
    </div>
    <div class="meta-home-grid">
      <article>
        <strong>当前目标</strong>
        <span>进场 → 搜刮/交战 → 找出口撤离</span>
      </article>
      <article>
        <strong>当前档位</strong>
        <span>${escapeHtml(meta.selectedMapTier.name)} · 入场 ${meta.selectedMapTier.entryFee}</span>
      </article>
      <article>
        <strong>战备状态</strong>
        <span>${meta.deploymentValue}/${meta.selectedMapTier.deploymentValueCap} · ${meta.canStartRun ? "可出发" : "需调整"}</span>
      </article>
      <article>
        <strong>档案记录</strong>
        <span>${escapeHtml(lastRun)}</span>
      </article>
    </div>
    <div class="meta-home-actions">
      <button data-meta-command="tutorial-run">训练教程</button>
      <button data-meta-command="set-meta-view" data-meta-view="account">查看属性</button>
      <button data-meta-command="set-meta-view" data-meta-view="shop">补给商店</button>
      <button data-meta-command="set-meta-view" data-meta-view="stash">仓库整备</button>
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
