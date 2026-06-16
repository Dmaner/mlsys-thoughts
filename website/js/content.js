/* Content loading and Markdown metadata extraction for local file and Pages use. */
(function initContent(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});
  const { sortByCreated, uniqueTags } = app.utils;

  const fallbackContentIndex = [
    {
      slug: "vllm-notes",
      title: "vLLM notes",
      category: "Inference",
      description: "Explore vllm internals",
      path: "../inference/vllm/tutorial.md",
      createdAt: "2026-05-21T17:31:15Z",
      tags: ["vLLM"],
      featured: true,
    },
    {
      slug: "sglang-basics",
      title: "SGLang basics",
      category: "Serving",
      description: "Launch commands, request examples, resource usage, and log parsing.",
      path: "../inference/sglang/tutorial.md",
      createdAt: "2026-05-21T17:31:15Z",
      tags: ["Sglang", "Tutorial"],
      featured: true,
    },
    {
      slug: "mlx-workflow",
      title: "MLX workflow",
      category: "Local models",
      description: "Download, cache, mirror, and verify Gemma-family MLX model assets.",
      path: "../inference/mlx/tutorial.md",
      createdAt: "2026-05-21T17:31:15Z",
      tags: ["MLX", "Gemma", "Download"],
      featured: true,
    },
  ];

  const excludedRenderPaths = new Set(["./README.md", "../README.md", "../README_zh.md", "../AGENTS.md"]);

  function titleCase(value) {
    return String(value)
      .replace(/[-_]+/g, " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
      .trim();
  }

  /* Derives display category from the top-level repository directory. */
  function categoryFromPath(path = "") {
    const normalized = String(path).replaceAll("\\", "/").replace(/^(\.\/|\.\.\/)+/, "");
    const topLevel = normalized.split("/").filter(Boolean)[0];
    if (!topLevel) return "";
    if (topLevel.toLowerCase() === "cuda") return "CUDA";
    return titleCase(topLevel);
  }

  /* Parses `Tags:` values from fenced post metadata into normalized tag labels. */
  function splitMetaTags(value = "") {
    const hashTags = value.match(/#[\p{L}\p{N}_-]+/gu);
    if (hashTags?.length) return uniqueTags(hashTags);
    return uniqueTags(value.split(/[,，\s]+/));
  }

  /* Extracts the leading fenced metadata block used for card descriptions and tags. */
  function parsePostMetadata(markdown = "") {
    const source = String(markdown).replace(/\r\n/g, "\n");
    const match = source.match(/^\s*```\s*\n([\s\S]*?)\n```\s*/);
    if (!match) return { tags: [], desc: "", raw: "", markdown: source };

    const raw = match[1].trim();
    const metadata = { tags: [], desc: "", raw, markdown: source.slice(match[0].length) };

    raw.split("\n").forEach((line) => {
      const cleanLine = line.trim();
      const tagMatch = cleanLine.match(/^tags?\s*:\s*(.+)$/i);
      if (tagMatch) {
        metadata.tags = uniqueTags([...metadata.tags, ...splitMetaTags(tagMatch[1])]);
        return;
      }

      const descMatch = cleanLine.match(/^(desc|description)\s*:\s*(.+)$/i);
      if (descMatch) {
        metadata.desc = descMatch[2].trim();
      }
    });

    if (!metadata.tags.length && !metadata.desc) {
      return { tags: [], desc: "", raw: "", markdown: source };
    }

    return metadata;
  }

  /* Removes post metadata so it does not appear inside the rendered article body. */
  function stripPostMetadata(markdown) {
    return parsePostMetadata(markdown).markdown
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }

  /* Keeps repository guide files out of the blog index. */
  function isRenderablePost(item) {
    return !excludedRenderPaths.has(item.path);
  }

  /* Hydrates descriptions and tags from the fenced metadata block in each post. */
  async function hydrateMetadataFromMarkdown(items) {
    const hydrated = await Promise.all(
      items.map(async (item) => {
        const category = categoryFromPath(item.path) || item.category;

        if (typeof item.markdown === "string") {
          const metadata = parsePostMetadata(item.markdown);
          return {
            ...item,
            category,
            description: metadata.desc || item.description,
            tags: uniqueTags(metadata.tags.length ? metadata.tags : item.tags || []),
          };
        }

        try {
          const response = await fetch(item.path);
          if (!response.ok) return item;
          const markdown = await response.text();
          const metadata = parsePostMetadata(markdown);
          return {
            ...item,
            category,
            description: metadata.desc || item.description,
            tags: uniqueTags(metadata.tags.length ? metadata.tags : item.tags || []),
          };
        } catch {
          return { ...item, category };
        }
      })
    );
    return hydrated;
  }

  /* Loads embedded content first so file:// article rendering works without a server. */
  async function loadContentIndex() {
    let contentIndex = [];
    if (Array.isArray(global.ML_SYSTEM_CONTENT_INDEX)) {
      contentIndex = global.ML_SYSTEM_CONTENT_INDEX;
    } else {
      try {
        const response = await fetch("./content-index.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        contentIndex = await response.json();
      } catch {
        contentIndex = fallbackContentIndex;
      }
    }

    return sortByCreated((await hydrateMetadataFromMarkdown(contentIndex)).filter(isRenderablePost));
  }

  app.content = {
    loadContentIndex,
    parsePostMetadata,
    stripPostMetadata,
  };
})(window);
