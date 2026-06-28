import { access, copyFile, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = dirname(fileURLToPath(import.meta.url));
const websiteDir = resolve(scriptDir, "..");
const repoRoot = resolve(websiteDir, "..");
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

function isExternalAsset(path = "") {
  return /^(?:[a-z][a-z0-9+.-]*:|\/|#)/i.test(path);
}

async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function rewriteLocalImageSources(markdown, entry, markdownPath) {
  const sourceDir = dirname(markdownPath);
  const imagePattern = /!\[([^\]]*)\]\(([^)\s]+)(\s+(?:"[^"]*"|'[^']*'))?\)/g;
  let rewritten = "";
  let lastIndex = 0;

  for (const match of markdown.matchAll(imagePattern)) {
    const [original, alt, rawSource, title = ""] = match;
    const source = rawSource.replace(/^<|>$/g, "");

    rewritten += markdown.slice(lastIndex, match.index);
    lastIndex = match.index + original.length;

    if (isExternalAsset(source) || source.startsWith("assets/posts/")) {
      rewritten += original;
      continue;
    }

    const suffixIndex = source.search(/[?#]/);
    const sourcePath = suffixIndex === -1 ? source : source.slice(0, suffixIndex);
    const suffix = suffixIndex === -1 ? "" : source.slice(suffixIndex);
    const absoluteSourcePath = resolve(sourceDir, sourcePath);
    const repoRelativeSource = relative(repoRoot, absoluteSourcePath).replaceAll("\\", "/");

    if (repoRelativeSource.startsWith("..") || repoRelativeSource.startsWith("/")) {
      rewritten += original;
      continue;
    }

    if (!(await exists(absoluteSourcePath))) {
      rewritten += original;
      continue;
    }

    const imageRelativeToMarkdown = relative(sourceDir, absoluteSourcePath)
      .replaceAll("\\", "/")
      .replace(/^(\.\.\/)+/, "")
      .replace(/^\.\//, "");
    const websiteAssetPath = `assets/posts/${entry.slug}/${imageRelativeToMarkdown}`;
    const absoluteWebsiteAssetPath = resolve(websiteDir, websiteAssetPath);

    await mkdir(dirname(absoluteWebsiteAssetPath), { recursive: true });
    await copyFile(absoluteSourcePath, absoluteWebsiteAssetPath);
    rewritten += `![${alt}](${websiteAssetPath}${suffix}${title})`;
  }

  return `${rewritten}${markdown.slice(lastIndex)}`;
}

const hydrated = await Promise.all(
  entries.map(async (entry) => {
    const category = categoryFromPath(entry.path) || entry.category;
    if (!entry.path) return { ...entry, category };

    const markdownPath = resolve(websiteDir, entry.path);
    const markdown = await rewriteLocalImageSources(await readFile(markdownPath, "utf8"), entry, markdownPath);

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
