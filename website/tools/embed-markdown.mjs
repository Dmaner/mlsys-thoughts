import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteDir = resolve(scriptDir, "..");
const indexPath = resolve(websiteDir, "content-index.json");
const dataPath = resolve(websiteDir, "content-data.js");

const entries = JSON.parse(await readFile(indexPath, "utf8"));

const hydrated = await Promise.all(
  entries.map(async (entry) => {
    if (!entry.path) return entry;

    const markdownPath = resolve(websiteDir, entry.path);
    const markdown = await readFile(markdownPath, "utf8");

    return {
      ...entry,
      markdown,
    };
  })
);

await writeFile(indexPath, `${JSON.stringify(hydrated, null, 2)}\n`);
await writeFile(
  dataPath,
  `window.ML_SYSTEM_CONTENT_INDEX = ${JSON.stringify(hydrated, null, 2)};\n`
);
