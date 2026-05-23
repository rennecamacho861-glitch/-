import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1;
const SOURCE_VERSION = "grid-dungeon-audio-iter02-foley-bgm";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../..");
const audioRoot = path.join(projectRoot, "public/assets/audio/grid-dungeon");
const sourceRoot = path.join(projectRoot, "CCGS-Data/design/audio/source/grid-dungeon");

const EVENTS = [
  e("exploration.footstep.metal", "exploration", "sfx", 20, 0.55, false, "player grid movement", "sfx_explore_footstep_metal", 4, 190, "footstepMetal"),
  e("exploration.footstep.rubble", "exploration", "sfx", 20, 0.54, false, "player grid movement", "sfx_explore_footstep_rubble", 3, 210, "footstepRubble"),
  e("exploration.footstep.wet", "exploration", "sfx", 18, 0.48, false, "player grid movement", "sfx_explore_footstep_wet", 2, 230, "footstepWet"),
  e("exploration.wall.bump", "exploration", "sfx", 35, 0.62, false, "cold wall log line", "sfx_explore_wall_bump", 2, 340, "wallBump"),
  e("exploration.wall.scrape", "exploration", "sfx", 30, 0.52, false, "wall-edge movement and log", "sfx_explore_wall_scrape", 2, 420, "wallScrape"),
  e("exploration.loot.offer", "exploration", "sfx", 45, 0.64, true, "three-choice pickup panel", "sfx_explore_loot_offer", 1, 520, "lootOffer"),
  e("exploration.pickup.confirm", "exploration", "ui", 35, 0.45, false, "inventory and log update", "sfx_explore_pickup_confirm", 2, 300, "pickupConfirm"),
  e("exploration.pickup.skip", "exploration", "ui", 25, 0.38, false, "skip log line", "sfx_explore_pickup_skip", 1, 260, "pickupSkip"),
  e("exploration.danger.tile", "exploration", "sfx", 55, 0.68, true, "danger tile color and log", "sfx_explore_danger_tile", 1, 680, "dangerTile"),
  e("exploration.exit.sting", "exploration", "sfx", 65, 0.62, true, "exit tile and settlement text", "sfx_explore_exit_sting", 1, 820, "exitSting"),
  e("exploration.debris.shift", "exploration", "sfx", 28, 0.48, false, "debris prop and log", "sfx_explore_debris_shift", 2, 360, "debrisShift"),
  e("ambient.wall.lamp.hum", "ambient", "ambient", 10, 0.22, false, "visible wall lamps", "sfx_ambient_wall_lamp_hum", 1, 2400, "lampHum"),
  e("ambient.enemy.distant", "ambient", "ambient", 30, 0.3, true, "direction hint, red light, log", "sfx_ambient_enemy_distant", 3, 1500, "distantEnemy"),
  e("ambient.pipe.drip", "ambient", "ambient", 8, 0.2, false, "wet floor and dungeon ambience", "sfx_ambient_pipe_drip", 3, 1900, "pipeDrip"),
  e("ambient.cable.spark", "ambient", "ambient", 22, 0.28, false, "broken cable visual", "sfx_ambient_cable_spark", 2, 900, "cableSpark"),
  e("encounter.first.sight", "combat", "combat", 70, 0.72, true, "first-sight log and advantage UI", "sfx_combat_first_sight", 1, 620, "firstSight"),
  e("encounter.faceoff", "combat", "combat", 75, 0.76, true, "combat panel opens", "sfx_combat_faceoff", 1, 760, "faceoff"),
  e("encounter.behind.wall", "combat", "combat", 60, 0.58, true, "red light or noise hint", "sfx_combat_behind_wall", 2, 900, "behindWall"),
  e("encounter.unseen.ranged", "combat", "combat", 95, 0.9, true, "HP change and unseen ranged log", "sfx_combat_unseen_ranged", 1, 820, "unseenRanged"),
  e("encounter.enemy.step.close", "combat", "combat", 58, 0.58, true, "enemy proximity hint and log", "sfx_combat_enemy_step_close", 2, 420, "enemyStepClose"),
  e("encounter.weapon.ready", "combat", "combat", 62, 0.6, true, "enemy posture or weapon hint", "sfx_combat_weapon_ready", 2, 480, "weaponReady"),
  e("combat.action.commit", "combat", "combat", 50, 0.5, false, "selected combat action button", "sfx_combat_action_commit", 2, 260, "actionCommit"),
  e("combat.read.tell", "combat", "combat", 54, 0.46, true, "intel entry and combat log", "sfx_combat_read_tell", 1, 420, "readTell"),
  e("combat.breath.player.tense", "combat", "combat", 42, 0.42, false, "low HP or combat panel tension", "sfx_combat_breath_player_tense", 2, 900, "breathPlayer"),
  e("combat.breath.enemy.near", "combat", "combat", 44, 0.44, true, "enemy proximity hint and log", "sfx_combat_breath_enemy_near", 2, 950, "breathEnemy"),
  e("combat.melee.swing", "combat", "combat", 60, 0.6, false, "combat log action", "sfx_combat_melee_swing", 4, 300, "meleeSwing"),
  e("combat.melee.clash", "combat", "combat", 78, 0.78, true, "simultaneous attack or block log", "sfx_combat_melee_clash", 2, 420, "meleeClash"),
  e("combat.melee.graze", "combat", "combat", 64, 0.55, true, "near miss or light damage log", "sfx_combat_melee_graze", 2, 330, "meleeGraze"),
  e("combat.melee.hit", "combat", "combat", 80, 0.82, true, "HP change and combat log", "sfx_combat_melee_hit", 3, 430, "meleeHit"),
  e("combat.heavy.wound", "combat", "combat", 90, 0.9, true, "heavy wound text and status", "sfx_combat_heavy_wound", 1, 760, "heavyWound"),
  e("combat.defend.block", "combat", "combat", 75, 0.72, true, "defense log and reduced damage", "sfx_combat_defend_block", 3, 430, "defendBlock"),
  e("combat.defend.strain", "combat", "combat", 63, 0.55, true, "defense log and posture text", "sfx_combat_defend_strain", 1, 520, "defendStrain"),
  e("combat.dodge.left", "combat", "combat", 55, 0.55, false, "left dodge button and log", "sfx_combat_dodge_left", 2, 330, "dodgeLeft"),
  e("combat.dodge.right", "combat", "combat", 55, 0.55, false, "right dodge button and log", "sfx_combat_dodge_right", 2, 330, "dodgeRight"),
  e("combat.dodge.success", "combat", "combat", 70, 0.64, true, "advantage and combat log", "sfx_combat_dodge_success", 1, 440, "dodgeSuccess"),
  e("combat.dodge.fail", "combat", "combat", 70, 0.68, true, "damage or failed dodge log", "sfx_combat_dodge_fail", 1, 520, "dodgeFail"),
  e("combat.shove", "combat", "combat", 72, 0.72, true, "forced position or advantage log", "sfx_combat_shove", 2, 460, "shove"),
  e("combat.close.distance", "combat", "combat", 52, 0.5, true, "enemy closes range log", "sfx_combat_close_distance", 1, 420, "closeDistance"),
  e("combat.retreat.step", "combat", "combat", 55, 0.52, true, "escape or distance log", "sfx_combat_retreat_step", 1, 470, "retreatStep"),
  e("combat.advantage.window", "combat", "combat", 85, 0.72, true, "advantage-window UI", "sfx_combat_advantage_window", 1, 620, "advantageWindow"),
  e("combat.flee.success", "combat", "combat", 80, 0.66, true, "disengage and position change", "sfx_combat_flee_success", 1, 640, "fleeSuccess"),
  e("combat.flee.fail", "combat", "combat", 75, 0.68, true, "failed flee log and enemy bonus", "sfx_combat_flee_fail", 1, 560, "fleeFail"),
  e("combat.persuade.attempt", "combat", "combat", 55, 0.48, false, "persuade button and log", "sfx_combat_persuade_attempt", 1, 540, "persuadeAttempt"),
  e("combat.persuade.success", "combat", "combat", 80, 0.66, true, "cooperation or encounter close state", "sfx_combat_persuade_success", 1, 760, "persuadeSuccess"),
  e("combat.persuade.fail", "combat", "combat", 75, 0.62, true, "failed persuade log", "sfx_combat_persuade_fail", 1, 620, "persuadeFail"),
  e("item.pistol.fire", "item", "combat", 95, 0.92, true, "gunshot log and ammo count", "sfx_item_pistol_fire", 3, 620, "pistolFire"),
  e("item.pistol.empty", "item", "item", 65, 0.52, true, "zero ammo and log", "sfx_item_pistol_empty", 1, 260, "pistolEmpty"),
  e("item.pistol.reload", "item", "item", 65, 0.58, true, "ammo count update", "sfx_item_pistol_reload", 2, 650, "pistolReload"),
  e("item.old.magazine.rattle", "item", "item", 48, 0.48, true, "old magazine item and log", "sfx_item_old_magazine_rattle", 1, 520, "oldMagazine"),
  e("item.longknife.swing", "item", "combat", 65, 0.62, false, "combat log", "sfx_item_longknife_swing", 2, 330, "knifeSwing"),
  e("item.longknife.throw", "item", "combat", 80, 0.72, true, "knife removed and damage log", "sfx_item_longknife_throw", 1, 610, "knifeThrow"),
  e("item.trap.place", "item", "item", 50, 0.52, true, "trap icon and placement log", "sfx_item_trap_place", 1, 520, "trapPlace"),
  e("item.trap.trigger", "item", "combat", 90, 0.86, true, "red light and exposed position log", "sfx_item_trap_trigger", 1, 760, "trapTrigger"),
  e("item.bandage.use", "item", "item", 70, 0.54, true, "HP and bandage log", "sfx_item_bandage_use", 1, 760, "bandageUse"),
  e("item.glasses.intel", "item", "item", 65, 0.46, true, "intel panel and log", "sfx_item_glasses_intel", 1, 520, "glassesIntel"),
  e("item.glowstick.activate", "item", "item", 55, 0.52, true, "vision increase and log", "sfx_item_glowstick_activate", 1, 720, "glowstick"),
  e("item.echo.needle", "item", "item", 60, 0.56, true, "direction hint and log", "sfx_item_echo_needle", 1, 850, "echoNeedle"),
  e("ui.button.click", "ui", "ui", 20, 0.34, false, "button state", "sfx_ui_button_click", 2, 120, "uiClick"),
  e("ui.action.disabled", "ui", "ui", 35, 0.38, false, "disabled style", "sfx_ui_action_disabled", 1, 190, "uiDisabled"),
  e("ui.panel.open", "ui", "ui", 25, 0.38, false, "panel appears", "sfx_ui_panel_open", 1, 280, "panelOpen"),
  e("ui.log.message", "ui", "ui", 15, 0.28, false, "new log line", "sfx_ui_log_message", 1, 160, "logMessage"),
  e("music.exploration.bed", "music", "music", 5, 0.24, false, "exploration visual state", "music_exploration_bed_loop", 1, 12000, "musicExplore"),
  e("music.combat.tension", "music", "music", 15, 0.34, false, "combat panel and danger state", "music_combat_tension_loop", 1, 9000, "musicCombat"),
  e("music.advantage.pulse", "music", "music", 18, 0.3, false, "advantage-window UI", "music_advantage_pulse_loop", 1, 6000, "musicAdvantage")
];

function e(eventName, category, bus, priority, defaultVolume, criticalCue, visualFallback, fileStem, variants, durationMs, recipe) {
  return { event: eventName, category, bus, priority, defaultVolume, criticalCue, visualFallback, fileStem, variants, durationMs, recipe };
}

function hashString(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function prng(seedText) {
  let state = hashString(seedText) || 1;
  return () => {
    state = Math.imul(state, 1664525) + 1013904223;
    return (state >>> 0) / 4294967296;
  };
}

function synthesize(def, variant) {
  const samples = new Float32Array(Math.ceil((def.durationMs / 1000) * SAMPLE_RATE));
  const rng = prng(`${SOURCE_VERSION}:${def.event}:${variant}`);
  const v = variant - 1;

  switch (def.recipe) {
    case "footstepMetal":
      addThump(samples, 6, 120, 0.3, 82 - v * 3);
      addScrape(samples, 26, 120, 0.18, rng, 0.72);
      addMetalHit(samples, 38, 0.18, 520 + v * 80);
      break;
    case "footstepRubble":
      addThump(samples, 10, 120, 0.26, 70);
      addGravel(samples, 22, 160, 0.2, rng, 7);
      break;
    case "footstepWet":
      addThump(samples, 8, 100, 0.2, 62);
      addWetSlap(samples, 22, 150, 0.2, rng);
      break;
    case "wallBump":
      addThump(samples, 0, 230, 0.44, 56);
      addConcreteDust(samples, 24, 220, 0.18, rng);
      addMetalHit(samples, 55, 0.12, 280);
      break;
    case "wallScrape":
      addScrape(samples, 0, 390, 0.22, rng, 0.88);
      addConcreteDust(samples, 90, 260, 0.12, rng);
      break;
    case "lootOffer":
      addCoinDrop(samples, 18, 0.34, 760);
      addCoinDrop(samples, 150, 0.27, 980);
      addLeatherCreak(samples, 120, 250, 0.12, rng);
      addThump(samples, 310, 160, 0.18, 80);
      break;
    case "pickupConfirm":
      addCoinDrop(samples, 18, 0.22 + v * 0.02, 820 + v * 90);
      addLeatherCreak(samples, 72, 160, 0.08, rng);
      break;
    case "pickupSkip":
      addLeatherCreak(samples, 5, 150, 0.08, rng);
      addThump(samples, 62, 130, 0.13, 92);
      break;
    case "dangerTile":
      addLowDrone(samples, 0, 620, 0.18, 42, 36);
      addGravel(samples, 80, 360, 0.16, rng, 9);
      addCoinDrop(samples, 320, 0.2, 410);
      break;
    case "exitSting":
      addLowDrone(samples, 0, 760, 0.14, 90, 130);
      addMetalHit(samples, 80, 0.14, 520);
      addMetalHit(samples, 310, 0.11, 690);
      addBreath(samples, 410, 330, 0.09, rng);
      break;
    case "debrisShift":
      addGravel(samples, 0, 300, 0.22, rng, 12);
      addScrape(samples, 90, 220, 0.1, rng, 0.82);
      break;
    case "lampHum":
      addLowDrone(samples, 0, def.durationMs, 0.1, 58, 59);
      addLowDrone(samples, 0, def.durationMs, 0.06, 116, 117);
      addAir(samples, 0, def.durationMs, 0.04, rng, 0.985);
      addSparkPattern(samples, 300, 1600, 8, 0.035, rng);
      break;
    case "distantEnemy":
      addMuffledStep(samples, 80, 620, 0.18 + v * 0.02, rng);
      addAir(samples, 140, 900, 0.08, rng, 0.96);
      addLowDrone(samples, 300, 680, 0.07, 75 - v * 4, 62);
      break;
    case "pipeDrip":
      addAir(samples, 0, def.durationMs, 0.015, rng, 0.98);
      addWaterDrop(samples, 250 + v * 180, 0.11, rng);
      addWaterDrop(samples, 950 + v * 120, 0.08, rng);
      break;
    case "cableSpark":
      addSparkPattern(samples, 25, 520, 9 + v * 2, 0.12, rng);
      addAir(samples, 80, 420, 0.035, rng, 0.93);
      break;
    case "firstSight":
      addCoinDrop(samples, 20, 0.34, 680);
      addLowDrone(samples, 45, 500, 0.18, 70, 96);
      addBreath(samples, 220, 220, 0.08, rng);
      break;
    case "faceoff":
      addCoinDrop(samples, 24, 0.26, 520);
      addCoinDrop(samples, 190, 0.3, 640);
      addThump(samples, 310, 340, 0.24, 50);
      addLeatherCreak(samples, 260, 260, 0.1, rng);
      break;
    case "behindWall":
      addLowDrone(samples, 0, 820, 0.14, 64, 57);
      addMuffledStep(samples, 160, 500, 0.16 + v * 0.02, rng);
      addScrape(samples, 360, 320, 0.1, rng, 0.9);
      break;
    case "unseenRanged":
      addGunshot(samples, rng, 0.8);
      addThump(samples, 75, 580, 0.34, 43);
      addAir(samples, 120, 520, 0.08, rng, 0.92);
      break;
    case "enemyStepClose":
      addMuffledStep(samples, 0, 300, 0.19 + v * 0.02, rng);
      addLeatherCreak(samples, 140, 210, 0.08, rng);
      break;
    case "weaponReady":
      addMetalHit(samples, 20, 0.18 + v * 0.02, 430 + v * 90);
      addScrape(samples, 90, 270, 0.13, rng, 0.86);
      break;
    case "actionCommit":
      addCoinDrop(samples, 10, 0.2 + v * 0.02, 520 + v * 120);
      addThump(samples, 85, 120, 0.08, 100);
      break;
    case "readTell":
      addLeatherCreak(samples, 20, 220, 0.08, rng);
      addCoinDrop(samples, 180, 0.16, 720);
      addAir(samples, 110, 250, 0.025, rng, 0.92);
      break;
    case "breathPlayer":
      addBreath(samples, 40, 660, 0.17 + v * 0.01, rng);
      addLowDrone(samples, 180, 550, 0.06, 74, 70);
      break;
    case "breathEnemy":
      addBreath(samples, 70, 710, 0.16 + v * 0.01, rng);
      addMuffledStep(samples, 360, 330, 0.08, rng);
      break;
    case "meleeSwing":
    case "knifeSwing":
      addWhoosh(samples, 0, 230, 0.18 + v * 0.015, rng);
      addLeatherCreak(samples, 40, 170, 0.08, rng);
      addMetalHit(samples, 160, 0.08, 660 + v * 80);
      break;
    case "meleeClash":
      addMetalHit(samples, 0, 0.48 + v * 0.03, 520);
      addMetalHit(samples, 30, 0.2, 910 + v * 120);
      addThump(samples, 40, 300, 0.24, 62);
      break;
    case "meleeGraze":
      addWhoosh(samples, 0, 180, 0.14 + v * 0.01, rng);
      addScrape(samples, 100, 180, 0.12, rng, 0.9);
      break;
    case "meleeHit":
      addBodyHit(samples, 0, 330, 0.42 + v * 0.03, rng);
      addMetalHit(samples, 36, 0.12, 460 + v * 90);
      break;
    case "heavyWound":
      addBodyHit(samples, 0, 520, 0.58, rng);
      addLowDrone(samples, 140, 560, 0.18, 50, 38);
      addBreath(samples, 300, 360, 0.12, rng);
      break;
    case "defendBlock":
      addMetalHit(samples, 0, 0.36 + v * 0.02, 380 + v * 90);
      addThump(samples, 35, 290, 0.23, 74);
      addScrape(samples, 120, 230, 0.08, rng, 0.86);
      break;
    case "defendStrain":
      addLeatherCreak(samples, 10, 350, 0.14, rng);
      addBreath(samples, 190, 260, 0.1, rng);
      break;
    case "dodgeLeft":
    case "dodgeRight":
      addCloth(samples, 0, 230, 0.18 + v * 0.01, rng);
      addFootSlide(samples, 100, 170, 0.12, rng);
      break;
    case "dodgeSuccess":
      addCloth(samples, 0, 190, 0.16, rng);
      addFootSlide(samples, 90, 160, 0.1, rng);
      addCoinDrop(samples, 230, 0.18, 820);
      break;
    case "dodgeFail":
      addCloth(samples, 0, 170, 0.13, rng);
      addBodyHit(samples, 120, 260, 0.26, rng);
      break;
    case "shove":
      addBodyHit(samples, 0, 340, 0.36 + v * 0.02, rng);
      addFootSlide(samples, 110, 240, 0.16, rng);
      break;
    case "closeDistance":
      addMuffledStep(samples, 0, 280, 0.18, rng);
      addCloth(samples, 80, 180, 0.09, rng);
      break;
    case "retreatStep":
      addFootSlide(samples, 0, 230, 0.16, rng);
      addMuffledStep(samples, 190, 180, 0.1, rng);
      break;
    case "advantageWindow":
      addCoinDrop(samples, 25, 0.34, 630);
      addCoinDrop(samples, 160, 0.28, 870);
      addCoinDrop(samples, 340, 0.3, 1060);
      addLowDrone(samples, 240, 320, 0.1, 130, 180);
      break;
    case "fleeSuccess":
      addCloth(samples, 0, 220, 0.16, rng);
      addFootSlide(samples, 100, 260, 0.17, rng);
      addMuffledStep(samples, 320, 200, 0.1, rng);
      break;
    case "fleeFail":
      addFootSlide(samples, 0, 190, 0.15, rng);
      addBodyHit(samples, 120, 290, 0.3, rng);
      addMetalHit(samples, 260, 0.12, 260);
      break;
    case "persuadeAttempt":
      addBreath(samples, 40, 300, 0.1, rng);
      addCoinDrop(samples, 330, 0.12, 460);
      break;
    case "persuadeSuccess":
      addLowDrone(samples, 0, 650, 0.14, 110, 160);
      addCoinDrop(samples, 180, 0.2, 700);
      addBreath(samples, 420, 220, 0.07, rng);
      break;
    case "persuadeFail":
      addLowDrone(samples, 0, 400, 0.12, 110, 62);
      addCoinDrop(samples, 300, 0.2, 240);
      addLeatherCreak(samples, 340, 180, 0.08, rng);
      break;
    case "pistolFire":
      addGunshot(samples, rng, 0.88 + v * 0.02);
      addShellDrop(samples, 250 + v * 30, 0.1, rng);
      break;
    case "pistolEmpty":
      addMetalHit(samples, 8, 0.22, 330);
      addMetalHit(samples, 90, 0.1, 210);
      break;
    case "pistolReload":
      addMetalHit(samples, 22, 0.18, 520 + v * 80);
      addScrape(samples, 120, 270, 0.12, rng, 0.87);
      addMetalHit(samples, 410, 0.18, 650);
      break;
    case "oldMagazine":
      addMetalHit(samples, 40, 0.12, 380);
      addMetalHit(samples, 155, 0.1, 450);
      addScrape(samples, 230, 180, 0.08, rng, 0.84);
      break;
    case "knifeThrow":
      addWhoosh(samples, 0, 330, 0.2, rng);
      addMetalHit(samples, 350, 0.2, 740);
      addThump(samples, 390, 170, 0.15, 90);
      break;
    case "trapPlace":
      addMetalHit(samples, 24, 0.16, 410);
      addScrape(samples, 100, 260, 0.11, rng, 0.88);
      addMetalHit(samples, 350, 0.12, 520);
      break;
    case "trapTrigger":
      addMetalHit(samples, 10, 0.42, 960);
      addGunSnap(samples, 70, 0.34, rng);
      addSparkPattern(samples, 170, 390, 7, 0.12, rng);
      addThump(samples, 220, 430, 0.28, 54);
      break;
    case "bandageUse":
      addCloth(samples, 30, 540, 0.18, rng);
      addBreath(samples, 380, 240, 0.08, rng);
      break;
    case "glassesIntel":
      addGlassTap(samples, 30, 0.18, 980);
      addLeatherCreak(samples, 110, 250, 0.07, rng);
      addAir(samples, 190, 190, 0.03, rng, 0.94);
      break;
    case "glowstick":
      addPlasticCrack(samples, 20, 0.24, rng);
      addAir(samples, 140, 420, 0.05, rng, 0.97);
      addLowDrone(samples, 190, 460, 0.08, 250, 320);
      break;
    case "echoNeedle":
      addMetalHit(samples, 20, 0.18, 760);
      addAir(samples, 80, 600, 0.08, rng, 0.98);
      addWaterDrop(samples, 520, 0.08, rng);
      break;
    case "uiClick":
      addCoinDrop(samples, 8, 0.14 + v * 0.015, 500 + v * 80);
      break;
    case "uiDisabled":
      addMetalHit(samples, 8, 0.14, 230);
      addThump(samples, 80, 90, 0.08, 75);
      break;
    case "panelOpen":
      addLeatherCreak(samples, 0, 170, 0.1, rng);
      addCoinDrop(samples, 150, 0.1, 620);
      break;
    case "logMessage":
      addCoinDrop(samples, 12, 0.08, 760);
      break;
    case "musicExplore":
      addMusicExplore(samples, rng);
      break;
    case "musicCombat":
      addMusicCombat(samples, rng);
      break;
    case "musicAdvantage":
      addMusicAdvantage(samples, rng);
      break;
    default:
      addCoinDrop(samples, 10, 0.15, 440);
  }

  normalize(samples, Math.min(0.9, def.defaultVolume + 0.06));
  return samples;
}

function addTone(samples, startMs, durationMs, startFreq, endFreq, amp, envelope) {
  const start = msToIndex(startMs);
  const length = msToIndex(durationMs);
  let phase = 0;
  for (let i = 0; i < length; i += 1) {
    const index = start + i;
    if (index >= samples.length) break;
    const t = i / Math.max(1, length - 1);
    const freq = startFreq + (endFreq - startFreq) * t;
    phase += (Math.PI * 2 * freq) / SAMPLE_RATE;
    samples[index] += Math.sin(phase) * amp * envelopeValue(t, envelope);
  }
}

function addLowDrone(samples, startMs, durationMs, amp, startFreq, endFreq) {
  addTone(samples, startMs, durationMs, startFreq, endFreq, amp, "swell");
  addTone(samples, startMs, durationMs, startFreq * 0.5, endFreq * 0.5, amp * 0.6, "swell");
}

function addAir(samples, startMs, durationMs, amp, rng, smoothing) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, smoothing, "steady");
}

function addScrape(samples, startMs, durationMs, amp, rng, smoothing) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, smoothing, "scrape");
}

function addCloth(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.9, "cloth");
}

function addConcreteDust(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.82, "dust");
}

function addWhoosh(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.78, "whoosh");
}

function addFilteredNoise(samples, startMs, durationMs, amp, rng, smoothing, envelope) {
  const start = msToIndex(startMs);
  const length = msToIndex(durationMs);
  let previous = 0;
  for (let i = 0; i < length; i += 1) {
    const index = start + i;
    if (index >= samples.length) break;
    const t = i / Math.max(1, length - 1);
    const white = rng() * 2 - 1;
    previous = previous * smoothing + white * (1 - smoothing);
    samples[index] += previous * amp * envelopeValue(t, envelope);
  }
}

function addThump(samples, startMs, durationMs, amp, freq) {
  addTone(samples, startMs, durationMs, freq, Math.max(24, freq * 0.45), amp, "thud");
}

function addMetalHit(samples, startMs, amp, freq) {
  addTone(samples, startMs, 260, freq, freq * 0.82, amp, "metal");
  addTone(samples, startMs + 12, 190, freq * 1.7, freq * 1.25, amp * 0.45, "metal");
}

function addCoinDrop(samples, startMs, amp, freq) {
  addMetalHit(samples, startMs, amp, freq);
  addFilteredNoise(samples, startMs, 38, amp * 0.1, prng(`${startMs}:${freq}`), 0.72, "pluck");
}

function addGlassTap(samples, startMs, amp, freq) {
  addTone(samples, startMs, 240, freq, freq * 0.92, amp, "glass");
  addTone(samples, startMs + 18, 180, freq * 1.52, freq * 1.2, amp * 0.32, "glass");
}

function addWaterDrop(samples, startMs, amp, rng) {
  addTone(samples, startMs, 180, 580 + rng() * 160, 240, amp, "water");
  addFilteredNoise(samples, startMs + 8, 70, amp * 0.18, rng, 0.65, "water");
}

function addGravel(samples, startMs, durationMs, amp, rng, count) {
  for (let i = 0; i < count; i += 1) {
    const local = startMs + rng() * durationMs;
    addMetalHit(samples, local, amp * (0.25 + rng() * 0.35), 190 + rng() * 420);
  }
  addFilteredNoise(samples, startMs, durationMs, amp * 0.16, rng, 0.78, "dust");
}

function addWetSlap(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.92, "wet");
  addTone(samples, startMs + 10, durationMs * 0.7, 140, 90, amp * 0.25, "thud");
}

function addFootSlide(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.86, "scrape");
}

function addLeatherCreak(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.94, "creak");
  addTone(samples, startMs + 20, durationMs * 0.8, 120 + rng() * 80, 95, amp * 0.22, "creak");
}

function addBreath(samples, startMs, durationMs, amp, rng) {
  addFilteredNoise(samples, startMs, durationMs, amp, rng, 0.97, "breath");
}

function addMuffledStep(samples, startMs, durationMs, amp, rng) {
  addThump(samples, startMs, durationMs * 0.65, amp, 48 + rng() * 18);
  addFilteredNoise(samples, startMs + 40, durationMs * 0.5, amp * 0.35, rng, 0.94, "muffled");
}

function addBodyHit(samples, startMs, durationMs, amp, rng) {
  addThump(samples, startMs, durationMs, amp, 48 + rng() * 18);
  addFilteredNoise(samples, startMs + 10, durationMs * 0.55, amp * 0.22, rng, 0.86, "impact");
}

function addGunshot(samples, rng, amp) {
  addFilteredNoise(samples, 0, 38, amp, rng, 0.42, "gun");
  addTone(samples, 0, 82, 1500 + rng() * 300, 420, amp * 0.16, "pluck");
  addThump(samples, 42, 420, amp * 0.32, 55);
  addFilteredNoise(samples, 110, 330, amp * 0.08, rng, 0.9, "dust");
}

function addGunSnap(samples, startMs, amp, rng) {
  addFilteredNoise(samples, startMs, 45, amp, rng, 0.58, "pluck");
  addMetalHit(samples, startMs + 30, amp * 0.22, 720);
}

function addShellDrop(samples, startMs, amp, rng) {
  addMetalHit(samples, startMs, amp, 720 + rng() * 260);
  addMetalHit(samples, startMs + 130, amp * 0.55, 520 + rng() * 160);
}

function addSparkPattern(samples, startMs, durationMs, count, amp, rng) {
  for (let i = 0; i < count; i += 1) {
    addFilteredNoise(samples, startMs + rng() * durationMs, 32 + rng() * 45, amp * (0.45 + rng()), rng, 0.4, "spark");
  }
}

function addPlasticCrack(samples, startMs, amp, rng) {
  addFilteredNoise(samples, startMs, 110, amp, rng, 0.68, "crackle");
  addFilteredNoise(samples, startMs + 90, 160, amp * 0.4, rng, 0.82, "crackle");
}

function addMusicExplore(samples, rng) {
  addLowDrone(samples, 0, samplesMs(samples), 0.07, 54, 55);
  addLowDrone(samples, 0, samplesMs(samples), 0.035, 81, 80);
  addAir(samples, 0, samplesMs(samples), 0.035, rng, 0.99);
  for (let ms = 900; ms < samplesMs(samples); ms += 1700) addWaterDrop(samples, ms + rng() * 300, 0.025, rng);
  for (let ms = 1400; ms < samplesMs(samples); ms += 2600) addMetalHit(samples, ms + rng() * 500, 0.025, 320 + rng() * 120);
}

function addMusicCombat(samples, rng) {
  addLowDrone(samples, 0, samplesMs(samples), 0.09, 48, 46);
  for (let ms = 180; ms < samplesMs(samples); ms += 560) addThump(samples, ms, 180, 0.05, 58);
  for (let ms = 320; ms < samplesMs(samples); ms += 1120) addCoinDrop(samples, ms, 0.045, 430 + rng() * 90);
  addAir(samples, 0, samplesMs(samples), 0.03, rng, 0.985);
}

function addMusicAdvantage(samples, rng) {
  addLowDrone(samples, 0, samplesMs(samples), 0.07, 70, 78);
  for (let ms = 80; ms < samplesMs(samples); ms += 500) addCoinDrop(samples, ms, 0.055, 620 + rng() * 160);
  for (let ms = 250; ms < samplesMs(samples); ms += 1000) addThump(samples, ms, 150, 0.045, 66);
}

function envelopeValue(t, envelope) {
  if (envelope === "swell") return Math.sin(t * Math.PI) ** 0.72;
  if (envelope === "steady") return 0.72 + 0.08 * Math.sin(t * Math.PI * 2);
  if (envelope === "scrape") return (1 - t) * (0.4 + 0.6 * Math.sin(t * Math.PI * 17) ** 2);
  if (envelope === "dust") return Math.exp(-t * 4) * (0.5 + 0.5 * Math.sin(t * Math.PI * 9) ** 2);
  if (envelope === "cloth") return (1 - t) ** 1.25;
  if (envelope === "creak") return Math.sin(t * Math.PI) * (0.4 + 0.6 * Math.sin(t * Math.PI * 4) ** 2);
  if (envelope === "breath") return Math.sin(t * Math.PI) ** 1.2;
  if (envelope === "muffled") return Math.sin(t * Math.PI) * 0.65;
  if (envelope === "impact") return Math.exp(-t * 7);
  if (envelope === "wet") return Math.exp(-t * 4.5) * (0.55 + 0.45 * Math.sin(t * Math.PI * 5) ** 2);
  if (envelope === "whoosh") return Math.sin(t * Math.PI) * (1 - t * 0.25);
  if (envelope === "metal") return Math.exp(-t * 5.5) * (0.62 + 0.38 * Math.sin(t * Math.PI * 22) ** 2);
  if (envelope === "glass") return Math.exp(-t * 7) * (0.72 + 0.28 * Math.sin(t * Math.PI * 26) ** 2);
  if (envelope === "water") return Math.exp(-t * 5) * Math.sin(t * Math.PI) ** 0.25;
  if (envelope === "gun") return Math.exp(-t * 18);
  if (envelope === "spark") return Math.exp(-t * 11);
  if (envelope === "crackle") return (1 - t) * (0.2 + 0.8 * Math.sin(t * Math.PI * 24) ** 2);
  if (envelope === "thud") return Math.exp(-t * 5.2);
  if (envelope === "pluck") return Math.exp(-t * 9);
  return Math.exp(-t * 6);
}

function normalize(samples, targetPeak) {
  let peak = 0;
  for (const sample of samples) peak = Math.max(peak, Math.abs(sample));
  if (peak <= 0) return;
  const gain = targetPeak / peak;
  for (let i = 0; i < samples.length; i += 1) samples[i] = clamp(samples[i] * gain, -0.96, 0.96);
}

function msToIndex(ms) {
  return Math.floor((ms / 1000) * SAMPLE_RATE);
}

function samplesMs(samples) {
  return (samples.length / SAMPLE_RATE) * 1000;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function wavBuffer(samples) {
  const dataBytes = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataBytes);
  buffer.write("RIFF", 0, "ascii");
  buffer.writeUInt32LE(36 + dataBytes, 4);
  buffer.write("WAVE", 8, "ascii");
  buffer.write("fmt ", 12, "ascii");
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(CHANNELS, 22);
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * CHANNELS * (BIT_DEPTH / 8), 28);
  buffer.writeUInt16LE(CHANNELS * (BIT_DEPTH / 8), 32);
  buffer.writeUInt16LE(BIT_DEPTH, 34);
  buffer.write("data", 36, "ascii");
  buffer.writeUInt32LE(dataBytes, 40);

  for (let i = 0; i < samples.length; i += 1) {
    const intSample = Math.round(clamp(samples[i], -0.999, 0.999) * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  return buffer;
}

async function main() {
  await mkdir(audioRoot, { recursive: true });
  await mkdir(sourceRoot, { recursive: true });

  const assets = [];
  const sourceEvents = [];

  for (const def of EVENTS) {
    const variationIds = Array.from({ length: def.variants }, (_, index) => {
      return `${def.fileStem}_${String(index + 1).padStart(2, "0")}`;
    });

    for (let variant = 1; variant <= def.variants; variant += 1) {
      const variantText = String(variant).padStart(2, "0");
      const id = `${def.fileStem}_${variantText}`;
      const file = `${id}.wav`;
      const samples = synthesize(def, variant);
      await writeFile(path.join(audioRoot, file), wavBuffer(samples));

      assets.push({
        id,
        event: def.event,
        category: def.category,
        file,
        durationMs: Math.round((samples.length / SAMPLE_RATE) * 1000),
        bus: def.bus,
        priority: def.priority,
        defaultVolume: def.defaultVolume,
        variant,
        ...(variant === 1 && def.variants > 1 ? { variations: variationIds } : {}),
        ...(variant > 1 ? { variantOf: variationIds[0] } : {}),
        criticalCue: def.criticalCue,
        visualFallback: def.visualFallback,
        materialStyle: def.category === "music" ? "organic-bgm-loop" : "foley-layered-placeholder"
      });
    }

    sourceEvents.push(def);
  }

  const manifest = {
    sourceVersion: SOURCE_VERSION,
    generatedBy: "scripts/audio/generate-grid-dungeon-sfx.mjs",
    format: { codec: "PCM WAV", sampleRate: SAMPLE_RATE, bitDepth: BIT_DEPTH, channels: CHANNELS },
    assetRoot: "public/assets/audio/grid-dungeon",
    assetCount: assets.length,
    eventCount: EVENTS.length,
    styleNotes: "Iter02 reduces pure electronic tones and uses layered foley-style noise, cloth, metal, body impact, breath, and sparse organic BGM loops.",
    assets
  };

  await writeFile(path.join(audioRoot, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  await writeFile(
    path.join(sourceRoot, "audio-event-source.json"),
    `${JSON.stringify({ sourceVersion: SOURCE_VERSION, sampleRate: SAMPLE_RATE, events: sourceEvents }, null, 2)}\n`,
    "utf8"
  );

  console.log(`Generated ${assets.length} WAV assets for ${EVENTS.length} audio events.`);
  console.log(`Manifest: ${path.join(audioRoot, "manifest.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
