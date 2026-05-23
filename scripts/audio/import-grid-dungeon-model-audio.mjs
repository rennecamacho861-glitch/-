import { copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const CHECK_ONLY = process.argv.includes("--check");
const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1;

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../..");
const promptPackPath = path.join(projectRoot, "CCGS-Data/design/audio/source/grid-dungeon/model-prompts-iter03.json");
const renderRoot = path.join(projectRoot, "CCGS-Data/design/audio/source/grid-dungeon/model-renders/iter03");
const outputRoot = path.join(projectRoot, "public/assets/audio/grid-dungeon/model");
const outputManifestPath = path.join(projectRoot, "public/assets/audio/grid-dungeon/manifest.model-generated.json");
const evidenceRoot = path.join(projectRoot, "CCGS-Data/production/qa/evidence/audio/grid-dungeon");

function readChunks(buffer) {
  const chunks = new Map();
  let offset = 12;
  while (offset + 8 <= buffer.length) {
    const id = buffer.toString("ascii", offset, offset + 4);
    const size = buffer.readUInt32LE(offset + 4);
    chunks.set(id, { offset: offset + 8, size });
    offset += 8 + size + (size % 2);
  }
  return chunks;
}

function parseWav(buffer) {
  if (buffer.toString("ascii", 0, 4) !== "RIFF") throw new Error("Missing RIFF header");
  if (buffer.toString("ascii", 8, 12) !== "WAVE") throw new Error("Missing WAVE header");
  const chunks = readChunks(buffer);
  const fmt = chunks.get("fmt ");
  const data = chunks.get("data");
  if (!fmt) throw new Error("Missing fmt chunk");
  if (!data) throw new Error("Missing data chunk");
  const audioFormat = buffer.readUInt16LE(fmt.offset);
  const channels = buffer.readUInt16LE(fmt.offset + 2);
  const sampleRate = buffer.readUInt32LE(fmt.offset + 4);
  const bitsPerSample = buffer.readUInt16LE(fmt.offset + 14);
  const frameBytes = channels * (bitsPerSample / 8);
  const sampleCount = data.size / frameBytes;
  const durationMs = Math.round((sampleCount / sampleRate) * 1000);
  let peak = 0;
  for (let offset = data.offset; offset < data.offset + data.size; offset += 2) {
    peak = Math.max(peak, Math.abs(buffer.readInt16LE(offset)));
  }
  return { audioFormat, channels, sampleRate, bitsPerSample, durationMs, peak };
}

function validateRequest(request, wav) {
  const failures = [];
  if (wav.audioFormat !== 1) failures.push("expected PCM format");
  if (wav.channels !== CHANNELS) failures.push(`expected ${CHANNELS} channel`);
  if (wav.sampleRate !== SAMPLE_RATE) failures.push(`expected ${SAMPLE_RATE}Hz`);
  if (wav.bitsPerSample !== BIT_DEPTH) failures.push(`expected ${BIT_DEPTH}-bit`);
  if (Math.abs(wav.durationMs - request.expectedDurationMs) > Math.max(200, request.expectedDurationMs * 0.25)) {
    failures.push(`duration ${wav.durationMs}ms too far from target ${request.expectedDurationMs}ms`);
  }
  if (wav.peak >= 32767) failures.push("clipped sample peak");
  return failures;
}

async function main() {
  const promptPack = JSON.parse(await readFile(promptPackPath, "utf8"));
  const assets = [];
  const missing = [];
  const invalid = [];
  let maxPeak = 0;

  if (!CHECK_ONLY) await mkdir(outputRoot, { recursive: true });

  for (const request of promptPack.requests) {
    const sourcePath = path.join(renderRoot, request.targetFile);
    if (!existsSync(sourcePath)) {
      missing.push(request.targetFile);
      continue;
    }

    let wav;
    try {
      wav = parseWav(await readFile(sourcePath));
    } catch (error) {
      invalid.push({ file: request.targetFile, failures: [error.message] });
      continue;
    }

    const failures = validateRequest(request, wav);
    if (failures.length > 0) {
      invalid.push({ file: request.targetFile, failures });
      continue;
    }

    maxPeak = Math.max(maxPeak, wav.peak);
    if (!CHECK_ONLY) await copyFile(sourcePath, path.join(outputRoot, request.targetFile));
    assets.push({
      id: request.id,
      event: request.event,
      category: request.category,
      file: request.targetFile,
      durationMs: wav.durationMs,
      bus: request.bus,
      priority: request.priority,
      defaultVolume: request.defaultVolume,
      variant: request.variation,
      criticalCue: request.criticalCue,
      visualFallback: request.visualFallback,
      sourceType: "audio-model-generated"
    });
  }

  const summary = {
    result: missing.length === 0 && invalid.length === 0 ? "PASS" : CHECK_ONLY ? "PENDING" : "FAIL",
    sourceVersion: promptPack.sourceVersion,
    checkOnly: CHECK_ONLY,
    expectedCount: promptPack.requests.length,
    validCount: assets.length,
    missingCount: missing.length,
    invalidCount: invalid.length,
    maxPeakSample: maxPeak,
    missing,
    invalid
  };

  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(path.join(evidenceRoot, "model-import-summary-iter03.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  if (summary.result === "PASS" && !CHECK_ONLY) {
    const manifest = {
      sourceVersion: promptPack.sourceVersion,
      generatedBy: "scripts/audio/import-grid-dungeon-model-audio.mjs",
      format: promptPack.format,
      assetRoot: "public/assets/audio/grid-dungeon/model",
      assetCount: assets.length,
      eventCount: new Set(assets.map((asset) => asset.event)).size,
      assets
    };
    await writeFile(outputManifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
  }

  console.log(`${summary.result}: ${summary.validCount}/${summary.expectedCount} model audio files valid.`);
  if (missing.length > 0) console.log(`Missing renders: ${missing.length}`);
  if (invalid.length > 0) console.log(`Invalid renders: ${invalid.length}`);

  if (summary.result === "FAIL") process.exitCode = 1;
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
