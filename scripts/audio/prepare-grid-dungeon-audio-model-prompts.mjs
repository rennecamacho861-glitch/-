import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_VERSION = "grid-dungeon-audio-iter03-model-requests";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../..");
const audioRoot = path.join(projectRoot, "public/assets/audio/grid-dungeon");
const sourceRoot = path.join(projectRoot, "CCGS-Data/design/audio/source/grid-dungeon");
const manifestPath = path.join(audioRoot, "manifest.json");
const promptPackPath = path.join(sourceRoot, "model-prompts-iter03.json");
const briefPath = path.join(sourceRoot, "model-generation-brief-iter03.md");
const targetManifestPath = path.join(audioRoot, "manifest.model-target.json");

const NEGATIVE_PROMPT = [
  "no 8-bit",
  "no chiptune",
  "no retro game beep",
  "no synthetic oscillator tone",
  "no laser",
  "no sci-fi UI bleep",
  "no EDM",
  "no cartoon sound",
  "no vocals",
  "no melody unless the request is a music loop"
].join(", ");

function uniqueAssets(assets) {
  return assets.filter((asset) => asset.file.endsWith(".wav"));
}

function seconds(durationMs) {
  return Number((durationMs / 1000).toFixed(2));
}

function eventDescription(event) {
  if (event.includes("footstep.metal")) return "a boot stepping on a corroded metal grid floor, small dust movement and dull plate resonance";
  if (event.includes("footstep.rubble")) return "a boot crunching through small concrete rubble and broken glass in a dry underground corridor";
  if (event.includes("footstep.wet")) return "a cautious bootstep on damp concrete with a short wet slap and cloth shift";
  if (event.includes("wall.bump")) return "a shoulder or hand bumping a cold concrete divider, dust falling, no large reverb";
  if (event.includes("wall.scrape")) return "fabric and metal scraping along rough concrete wall edge during tight movement";
  if (event.includes("loot.offer")) return "a small cache opened on the floor, leather pouch creak, metal trinkets shifting like a tense tabletop choice";
  if (event.includes("pickup.confirm")) return "one useful item lifted from a dirty cache, small cloth and metal handling";
  if (event.includes("pickup.skip")) return "a cache pouch being let go, quiet leather fold and dull tap";
  if (event.includes("danger.tile")) return "a hazardous floor plate creaking with grit and a subtle low warning rumble from the space itself";
  if (event.includes("exit.sting")) return "an exit threshold discovered, old metal door frame resonance, restrained relief";
  if (event.includes("debris.shift")) return "loose papers, glass, and small debris shifting underfoot";
  if (event.includes("wall.lamp.hum")) return "old wall lamp electrical hum, dusty transformer buzz, unstable but not futuristic";
  if (event.includes("enemy.distant")) return "distant muffled human movement behind walls, low boot thuds and cloth friction, direction hint only";
  if (event.includes("pipe.drip")) return "irregular pipe drips in an underground ruin, close room tone, damp concrete";
  if (event.includes("cable.spark")) return "broken cable crackle and tiny electrical sparks from old wiring, realistic and low-tech";
  if (event.includes("first.sight")) return "the instant the player sees an enemy first, breath catch, small metal token drop, low tension hit";
  if (event.includes("faceoff")) return "two fighters notice each other at close range, tabletop wager tension, leather and metal, no musical fanfare";
  if (event.includes("behind.wall")) return "enemy presence hidden behind a wall, muffled scrape, breath, and low pressure without revealing details";
  if (event.includes("unseen.ranged")) return "short brutal pistol shot from offscreen through the maze, body impact, no cinematic tail";
  if (event.includes("enemy.step.close")) return "an enemy closes distance nearby, muffled boots, fabric, shallow breath";
  if (event.includes("weapon.ready")) return "a knife or small firearm being readied, metal scrape and grip leather tightening";
  if (event.includes("action.commit")) return "a small physical commitment cue like placing a metal token on a table, restrained";
  if (event.includes("read.tell")) return "a subtle read on the opponent, cloth twitch and tiny metal clue, quiet but noticeable";
  if (event.includes("breath.player")) return "tense human breathing close-mic under stress, short and restrained";
  if (event.includes("breath.enemy")) return "nearby enemy breath behind mask or cloth, close but slightly muffled";
  if (event.includes("melee.swing")) return "short melee swing with cloth movement and dull blade air, no fantasy whoosh";
  if (event.includes("melee.clash")) return "two low-tech weapons or arm guards colliding, hard metal and body weight";
  if (event.includes("melee.graze")) return "near miss or shallow graze, cloth tear, light scrape, quick body movement";
  if (event.includes("melee.hit")) return "close-range blunt body hit with light metal contact, dry and immediate";
  if (event.includes("heavy.wound")) return "dangerous heavy wound impact, low body thud, painful breath, not gore-heavy";
  if (event.includes("defend.block")) return "defensive block absorbing a melee hit, metal guard and strained body contact";
  if (event.includes("defend.strain")) return "strain while holding defense, leather creak, breath pressure";
  if (event.includes("dodge.left") || event.includes("dodge.right")) return "quick side dodge, cloth rush and shoe slide on gritty floor";
  if (event.includes("dodge.success")) return "successful dodge into advantage, quick cloth movement and one restrained token-like click";
  if (event.includes("dodge.fail")) return "failed dodge, cloth movement interrupted by body hit";
  if (event.includes("shove")) return "close-quarters shove, boots sliding, body weight into concrete";
  if (event.includes("close.distance")) return "fighter steps in to close distance, fast boot slide and leather creak";
  if (event.includes("retreat.step")) return "fighter backs away one grid, gritty step and controlled breath";
  if (event.includes("advantage.window")) return "advantage window opens, three small physical wager clicks with low pressure";
  if (event.includes("flee.success")) return "successful escape step, urgent cloth movement and retreating bootstep";
  if (event.includes("flee.fail")) return "escape attempt stopped, foot slide, body check, low failed impact";
  if (event.includes("persuade.attempt")) return "low human negotiation tension, breath and a small item offered on metal";
  if (event.includes("persuade.success")) return "persuasion succeeds, tension releases softly with a restrained physical token sound";
  if (event.includes("persuade.fail")) return "persuasion fails, low rejection, leather creak and dull metal tap";
  if (event.includes("pistol.fire")) return "short dry small pistol shot indoors, mechanical snap, tiny casing fall, no long cinematic reverb";
  if (event.includes("pistol.empty")) return "small pistol dry click, empty chamber, close mechanical detail";
  if (event.includes("pistol.reload")) return "small pistol reload with worn magazine, metal slide, hand cloth, close-mic";
  if (event.includes("old.magazine")) return "old loose magazine rattling with two remaining rounds, dirty metal";
  if (event.includes("longknife.swing")) return "long knife close swing, blade air and cloth, low-tech";
  if (event.includes("longknife.throw")) return "knife thrown two grid cells, hand release, blade spin, hard impact";
  if (event.includes("trap.place")) return "small mechanical trap placed on gritty floor, spring tension and metal latch";
  if (event.includes("trap.trigger")) return "trap snaps shut with alarm-like mechanical clack and red warning energy from old hardware";
  if (event.includes("bandage.use")) return "bandage wrapped under pressure, cloth pull, adhesive, controlled breathing";
  if (event.includes("glasses.intel")) return "glasses adjusted and focusing, glass tap and leather strap, no digital scan";
  if (event.includes("glowstick.activate")) return "chemical glow stick cracked and shaken, plastic snap and fluid slosh";
  if (event.includes("echo.needle")) return "echo needle device pinging physically, metal needle resonance and room reflection, no digital sonar";
  if (event.includes("ui.button.click")) return "small physical UI click made from a metal tab, not electronic";
  if (event.includes("ui.action.disabled")) return "small blocked action feedback, dull metal tap, non-annoying";
  if (event.includes("ui.panel.open")) return "panel open as leather pouch and metal hinge, restrained";
  if (event.includes("ui.log.message")) return "tiny log notification like a small metal marker placed down";
  if (event.includes("music.exploration")) return "organic dark ambient loop made from room tone, bowed metal, distant drips, low air pressure, no synth pad";
  if (event.includes("music.combat")) return "organic combat tension loop from low drums, muted metal pulses, breath-like pressure, no electronic beat";
  if (event.includes("music.advantage")) return "organic advantage pulse loop like physical wager clicks and low drum pressure, no victory melody";
  return "raw foley-style sound effect for a low-tech wasteland dungeon game";
}

function promptFor(asset) {
  const description = eventDescription(asset.event);
  const loopText = asset.category === "music" ? "Seamless loop, " : "";
  const common = "Raw sound-effect model generation, realistic foley, close-mic, low-tech wasteland dungeon, tactile physical materials, gritty but not horror-jump-scare.";
  const duration = `Duration about ${seconds(asset.durationMs)} seconds.`;
  return {
    zh: `${loopText}${description}。${common} ${duration} 避免电子合成、8-bit、chiptune、科幻激光、卡通按钮音。`,
    en: `${loopText}${description}. ${common} ${duration} Avoid electronic synthesis, 8-bit, chiptune, sci-fi laser, cartoon UI beeps, and obvious oscillator tones.`
  };
}

async function main() {
  const oldManifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const requests = uniqueAssets(oldManifest.assets).map((asset) => {
    const prompt = promptFor(asset);
    return {
      id: asset.id,
      event: asset.event,
      category: asset.category,
      bus: asset.bus,
      priority: asset.priority,
      defaultVolume: asset.defaultVolume,
      targetFile: asset.file,
      expectedDurationMs: asset.durationMs,
      variation: asset.variant,
      criticalCue: asset.criticalCue,
      visualFallback: asset.visualFallback,
      promptZh: prompt.zh,
      promptEn: prompt.en,
      negativePrompt: NEGATIVE_PROMPT,
      requiredFormat: {
        codec: "PCM WAV",
        sampleRate: 44100,
        bitDepth: 16,
        channels: 1
      }
    };
  });

  const promptPack = {
    sourceVersion: SOURCE_VERSION,
    sourcePolicy: "Use an audio generation model or licensed/raw recorded foley. Do not use procedural oscillator/noise synthesis as final game audio.",
    previousProceduralAssets: "deprecated-reference-only",
    targetRenderDirectory: "CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03",
    outputAssetRoot: "public/assets/audio/grid-dungeon/model",
    format: { codec: "PCM WAV", sampleRate: 44100, bitDepth: 16, channels: 1 },
    negativePrompt: NEGATIVE_PROMPT,
    requestCount: requests.length,
    requests
  };

  await mkdir(sourceRoot, { recursive: true });
  await writeFile(promptPackPath, `${JSON.stringify(promptPack, null, 2)}\n`, "utf8");

  const targetManifest = {
    sourceVersion: SOURCE_VERSION,
    status: "pending_audio_model_renders",
    assetRoot: "public/assets/audio/grid-dungeon/model",
    promptPack: "CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json",
    assetCount: 0,
    eventCount: new Set(requests.map((request) => request.event)).size,
    assets: [],
    plannedRequestCount: requests.length,
    plannedAssets: requests.map((request) => ({
      id: request.id,
      event: request.event,
      category: request.category,
      targetFile: request.targetFile,
      expectedDurationMs: request.expectedDurationMs,
      criticalCue: request.criticalCue,
      visualFallback: request.visualFallback
    }))
  };
  await writeFile(targetManifestPath, `${JSON.stringify(targetManifest, null, 2)}\n`, "utf8");

  const brief = [
    "# Grid Dungeon Audio Model Generation Brief Iter03",
    "",
    "本轮要求不再使用程序化电子合成音。请使用音效生成模型或授权实录 Foley 素材生成/替换音频。",
    "",
    `- Prompt pack: \`CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json\``,
    "- Render output directory: `CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03/`",
    "- Required format: `44.1kHz / 16-bit / mono PCM WAV`",
    "- Forbidden: 8-bit, chiptune, oscillator tones, electronic beeps, sci-fi lasers, cartoon UI sounds.",
    "- After renders are placed, run `node scripts/audio/import-grid-dungeon-model-audio.mjs`.",
    "",
    `Request count: ${requests.length}`,
    ""
  ].join("\n");
  await writeFile(briefPath, brief, "utf8");

  console.log(`Prepared ${requests.length} audio-model requests.`);
  console.log(`Prompt pack: ${promptPackPath}`);
  console.log(`Target manifest: ${targetManifestPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
