import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { ALL_ITEM_IDS, createInventorySlot } = require("../../.test-build/src/sim/items.js");
const { activeEffectUiText, itemEnchantmentUiText, itemEnemyCounter, itemUiDescription, itemUiLimit, itemUiText, statusEffectUiText } = require("../../.test-build/src/sim/itemText.js");

const BANNED_UI_TEXT = ["橙色稀有", "FeedbackEvent", "effectKey", "useContext", "ports", "trigger", "DOM", "Phaser", "生效时显示", "触发枪口", "弹道演出"];

test("starter item cards use player-facing descriptions instead of rule implementation text", () => {
  assert.equal(itemUiDescription("echo"), "战斗外释放声波，标出含最近敌人或道具节点的 2x2 回响区。");
  assert.equal(itemUiDescription("pistol"), "视野内 4 格射击，命中造成 3 伤害；默认 6 发，弹夹可补到 6 发。");
  assert.equal(itemUiDescription("bandage"), "战斗外包扎伤口，回复 3 点生命；可以反复使用。");
});

test("all item UI text fields are available and omit implementation wording", () => {
  for (const itemId of ALL_ITEM_IDS) {
    const fields = itemUiText(itemId);
    assert.ok(fields.uiShort.length > 0, `${itemId} should have uiShort`);
    assert.ok(fields.uiLimit.length > 0, `${itemId} should have uiLimit`);
    assert.ok(fields.uiEnemyCounter.length > 0, `${itemId} should have uiEnemyCounter`);
    for (const text of [fields.uiShort, fields.uiLimit, fields.uiEnemyCounter]) {
      for (const banned of BANNED_UI_TEXT) {
        assert.equal(text.includes(banned), false, `${itemId} UI text should not include ${banned}`);
      }
    }
  }
});

test("high-risk item text matches current runtime effects", () => {
  assert.equal(itemUiDescription("echo"), "战斗外释放声波，标出含最近敌人或道具节点的 2x2 回响区。");
  assert.equal(itemUiLimit("echo"), "无限使用；每次花费 1 个探索回合，只给四格范围，不告诉具体是哪一格。");
  assert.equal(itemUiLimit("old-magazine"), "无限使用；无枪或满弹不能启动，换弹期间进入照面会失败。");
  assert.equal(itemUiDescription("salve-tin"), "战斗内外都可用，立即回复 1 点生命。");
  assert.equal(itemUiLimit("salve-tin"), "默认 2 次；每回合同一实例只能使用一次；场外使用会推进探索回合。");
  assert.equal(itemUiDescription("smoke-ball"), "支付 1 点优势使用；本次逃跑 +20%，并短暂压低双方视野。");
  assert.equal(itemUiDescription("wood-shield"), "反应使用；下一次受伤 -2，若是远程伤害则只 -1，然后破碎。");
  assert.equal(itemUiDescription("marked-coin"), "说服支付时 +1，并判断对方是否偏好支付。");
  assert.equal(itemUiDescription("overrun-chain"), "单次造成至少 5 点伤害后，下次逃跑 +20%。");
  assert.ok(itemEnemyCounter("overrun-chain").includes("5 点以下"));
});

test("active and status effect labels show current target, effect, and duration", () => {
  const active = activeEffectUiText(
    {
      id: "player-overrun-chain-1",
      ownerId: "player",
      sourceItemId: "overrun-chain",
      label: "test",
      stat: "flee",
      amount: 20,
      remainingRounds: 2,
      trigger: "nextFlee",
      targetActorId: "player"
    },
    { playerId: "player", enemyId: "enemy" }
  );
  assert.equal(active.targetLabel, "我方");
  assert.equal(active.summary, "越线链：逃跑 +20%");
  assert.equal(active.duration, "还剩 2 回合");
  assert.ok(active.detail.includes("下次逃跑消耗"));

  const status = statusEffectUiText(
    {
      id: "enemy-burn-1",
      ownerId: "player",
      targetActorId: "enemy",
      type: "burn",
      stacks: 1,
      remainingRounds: 1
    },
    { playerId: "player", enemyId: "enemy" }
  );
  assert.equal(status.targetLabel, "敌方");
  assert.equal(status.summary, "灼烧 x1");
  assert.equal(status.duration, "还剩 1 回合");
});

test("HUD and pickup log read item UI descriptions through the presentation port", () => {
  const mainSource = fs.readFileSync(path.join(process.cwd(), "src", "main.ts"), "utf8");
  const simulationSource = fs.readFileSync(path.join(process.cwd(), "src", "sim", "GameSimulation.ts"), "utf8");

  assert.ok(mainSource.includes('from "./sim/itemText";'));
  assert.ok(mainSource.includes("itemUiDescription(slot.item.id)"));
  assert.ok(mainSource.includes("itemUiDescription(entry.itemId)"));
  assert.equal(mainSource.includes("应对："), false);
  assert.equal(mainSource.includes("itemEnemyCounter(entry.itemId)"), false);
  assert.ok(mainSource.includes("itemUiLimit(itemId)"));
  assert.ok(mainSource.includes("itemUiLimit(entry.itemId)"));
  assert.ok(mainSource.includes("activeEffectUiText(effect"));
  assert.ok(mainSource.includes("statusEffectUiText(effect"));
  assert.equal(mainSource.includes("item.counterplay"), false);
  assert.ok(simulationSource.includes('from "./itemText";'));
  assert.ok(simulationSource.includes("itemUiDescription(itemId)"));
});

test("enchanted item descriptions expose affix effects at the presentation port", () => {
  const pistol = createInventorySlot("pistol", 1, {
    affix: { kind: "enchantment", enchantment: "burning", source: "natural" }
  });
  const bandage = createInventorySlot("bandage", 1, {
    affix: { kind: "enchantment", enchantment: "radiant", source: "gem", locked: true }
  });

  assert.equal(
    itemEnchantmentUiText(pistol),
    "燃烧的附魔：该道具直接命中并造成伤害时，额外施加 1-3 层灼烧。"
  );
  assert.equal(
    itemEnchantmentUiText(bandage),
    "闪耀的附魔：原效果成功后刷新 1 次附魔预备；下一次有效命中额外结算 1 次基础效果，不复制附魔本身。"
  );
});

test("HUD exposes enchantment text and visual data attributes", () => {
  const mainSource = fs.readFileSync(path.join(process.cwd(), "src", "main.ts"), "utf8");
  const styleSource = fs.readFileSync(path.join(process.cwd(), "src", "styles.css"), "utf8");

  assert.ok(mainSource.includes("itemEnchantmentUiText(slot)"));
  assert.ok(mainSource.includes("data-enchantment"));
  assert.ok(styleSource.includes(".tool-button[data-enchantment]"));
  assert.ok(styleSource.includes(".tool-enchantment"));
});
