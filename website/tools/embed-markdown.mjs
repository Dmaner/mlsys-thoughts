import { readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteDir = resolve(scriptDir, "..");
const indexPath = resolve(websiteDir, "content-index.json");
const dataPath = resolve(websiteDir, "content-data.js");

const entries = JSON.parse(await readFile(indexPath, "utf8"));

function titleCase(value) {
  return String(value)
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase())
    .trim();
}

function categoryFromPath(path = "") {
  const normalized = String(path).replaceAll("\\", "/").replace(/^(\.\/|\.\.\/)+/, "");
  const topLevel = normalized.split("/").filter(Boolean)[0];
  if (!topLevel) return "";
  if (topLevel.toLowerCase() === "cuda") return "CUDA";
  return titleCase(topLevel);
}

const hydrated = await Promise.all(
  entries.map(async (entry) => {
    const category = categoryFromPath(entry.path) || entry.category;
    if (!entry.path) return { ...entry, category };

    const markdownPath = resolve(websiteDir, entry.path);
    const markdown = await readFile(markdownPath, "utf8");

    return {
      ...entry,
      category,
      markdown,
    };
  })
);

await writeFile(indexPath, `${JSON.stringify(hydrated, null, 2)}\n`);
await writeFile(
  dataPath,
  `window.ML_SYSTEM_CONTENT_INDEX = ${JSON.stringify(hydrated, null, 2)};\n`
);
