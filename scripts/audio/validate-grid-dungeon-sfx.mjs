import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const SAMPLE_RATE = 44100;
const BIT_DEPTH = 16;
const CHANNELS = 1;
const ALLOWED_CATEGORIES = new Set(["exploration", "combat", "item", "ui", "ambient", "music"]);

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDir, "../..");
const audioRoot = path.join(projectRoot, "public/assets/audio/grid-dungeon");
const manifestPath = path.join(audioRoot, "manifest.json");
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

async function main() {
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const failures = [];
  const warnings = [];
  const events = new Set();
  const buses = new Set();
  let peakMax = 0;

  if (!Array.isArray(manifest.assets)) failures.push("manifest.assets is not an array");

  for (const asset of manifest.assets ?? []) {
    const filePath = path.join(audioRoot, asset.file);
    events.add(asset.event);
    buses.add(asset.bus);

    if (!ALLOWED_CATEGORIES.has(asset.category)) failures.push(`${asset.id}: invalid category ${asset.category}`);
    if (asset.criticalCue && !asset.visualFallback) failures.push(`${asset.id}: critical cue lacks visualFallback`);
    if (asset.defaultVolume < 0 || asset.defaultVolume > 1) failures.push(`${asset.id}: defaultVolume out of range`);
    if (asset.priority < 1 || asset.priority > 100) failures.push(`${asset.id}: priority out of range`);

    let wav;
    try {
      wav = parseWav(await readFile(filePath));
    } catch (error) {
      failures.push(`${asset.id}: ${error.message}`);
      continue;
    }

    if (wav.audioFormat !== 1) failures.push(`${asset.id}: expected PCM format`);
    if (wav.channels !== CHANNELS) failures.push(`${asset.id}: expected ${CHANNELS} channel`);
    if (wav.sampleRate !== SAMPLE_RATE) failures.push(`${asset.id}: expected ${SAMPLE_RATE}Hz`);
    if (wav.bitsPerSample !== BIT_DEPTH) failures.push(`${asset.id}: expected ${BIT_DEPTH}-bit`);
    if (Math.abs(wav.durationMs - asset.durationMs) > 25) {
      failures.push(`${asset.id}: duration mismatch manifest ${asset.durationMs}ms vs wav ${wav.durationMs}ms`);
    }
    if (wav.peak >= 32767) failures.push(`${asset.id}: clipped sample peak`);
    if (wav.peak < 1200) warnings.push(`${asset.id}: very quiet peak ${wav.peak}`);
    peakMax = Math.max(peakMax, wav.peak);
  }

  if (manifest.assetCount !== manifest.assets.length) failures.push("assetCount does not match assets length");
  if (manifest.eventCount !== events.size) failures.push("eventCount does not match unique event count");

  const summary = {
    result: failures.length === 0 ? "PASS" : "FAIL",
    sourceVersion: manifest.sourceVersion,
    assetCount: manifest.assets?.length ?? 0,
    eventCount: events.size,
    buses: [...buses].sort(),
    maxPeakSample: peakMax,
    maxPeakDbfs: peakMax > 0 ? Number((20 * Math.log10(peakMax / 32767)).toFixed(2)) : null,
    failures,
    warnings
  };

  await mkdir(evidenceRoot, { recursive: true });
  await writeFile(path.join(evidenceRoot, "validation-summary.json"), `${JSON.stringify(summary, null, 2)}\n`, "utf8");

  if (failures.length > 0) {
    console.error(JSON.stringify(summary, null, 2));
    process.exitCode = 1;
    return;
  }

  console.log(`Validated ${summary.assetCount} WAV assets across ${summary.eventCount} events.`);
  console.log(`Max peak: ${summary.maxPeakSample} (${summary.maxPeakDbfs} dBFS)`);
  if (warnings.length > 0) console.log(`Warnings: ${warnings.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
