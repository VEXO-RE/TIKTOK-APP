import fs from "node:fs";
import path from "node:path";

const required = [
  "README.md",
  ".env.example",
  "docs/OFFICIAL-SOURCES.md",
  "docs/PROJECT-VALIDATION.md",
  "docs/PHASES.md",
  "src/server.js",
  "src/config/features.js",
  "src/tiktok/developer/README.md",
  "src/tiktok/shop/DISABLED.md",
  "src/content/rules/ORGANIC-CONTENT-RULES.md"
];

let failed = false;

for (const item of required) {
  const absolute = path.resolve(item);

  if (!fs.existsSync(absolute)) {
    console.error(`MISSING: ${item}`);
    failed = true;
  } else {
    console.log(`OK: ${item}`);
  }
}

if (failed) {
  process.exit(1);
}

console.log("Project foundation verified.");
