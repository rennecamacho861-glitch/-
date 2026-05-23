const fs = require("node:fs");
const path = require("node:path");

const outputDir = path.join(__dirname, "..", ".test-build");
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "package.json"), '{"type":"commonjs"}\n');
