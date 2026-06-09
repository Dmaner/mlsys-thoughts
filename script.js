const root = document.documentElement;
const themeToggle = document.querySelector("[data-theme-toggle]");
const searchButton = document.querySelector("[data-open-search]");
const searchDialog = document.querySelector("[data-search-dialog]");
const searchInput = document.querySelector("#site-search");
const searchResults = document.querySelector("[data-search-results]");
const currentList = document.querySelector("[data-current-list]");
const blogList = document.querySelector("[data-blog-list]");
const blogIndexShell = document.querySelector("[data-blog-index-shell]");
const articleShell = document.querySelector("[data-article-shell]");
const markdownBody = document.querySelector("[data-markdown-body]");
const articleMeta = document.querySelector("[data-article-meta]");
const backHome = document.querySelector("[data-back-home]");

const fallbackContentIndex = [
  {
    slug: "vllm-notes",
    title: "vLLM notes",
    category: "Inference",
    description: "PagedAttention, continuous batching, and scheduler source analysis.",
    path: "../inference/vllm/tutorial.md",
    createdAt: "2026-05-21T17:31:15Z",
    tags: ["vLLM", "Inference"],
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

let contentIndex = [];

const excludedRenderPaths = new Set(["./README.md", "../README.md", "../README_zh.md"]);

const storedTheme = localStorage.getItem("ml-system-theme");
if (storedTheme) {
  root.dataset.theme = storedTheme;
}

themeToggle?.addEventListener("click", () => {
  const nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
  root.dataset.theme = nextTheme;
  localStorage.setItem("ml-system-theme", nextTheme);
});

function escapeHtml(value = "") {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function normalizeTag(tag) {
  return tag.replace(/^#/, "").trim();
}

function uniqueTags(tags = []) {
  return Array.from(new Set(tags.map(normalizeTag).filter(Boolean)));
}

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
}

function sortByCreated(items) {
  return [...items].sort((a, b) => {
    const left = new Date(a.createdAt || 0).getTime();
    const right = new Date(b.createdAt || 0).getTime();
    return right - left;
  });
}

function isRenderablePost(item) {
  return !excludedRenderPaths.has(item.path);
}

function renderTagList(tags = []) {
  const cleanTags = uniqueTags(tags);
  if (!cleanTags.length) return "";
  return `<div class="tag-list">${cleanTags
    .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
    .join("")}</div>`;
}

function parseTagsFromMarkdown(markdown) {
  const match = markdown.match(/^>\s*Tags:\s*(.+)$/im);
  if (!match) return [];
  return uniqueTags(match[1].match(/#[\p{L}\p{N}_-]+/gu) || []);
}

function stripPostMetadata(markdown) {
  return markdown
    .replace(/^>\s*Tags:\s*.+$/gim, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function inlineMarkdown(value) {
  return escapeHtml(value)
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
}

function isShellLanguage(language) {
  return /^(bash|sh|shell|zsh|console|terminal)$/i.test(language || "");
}

function findShellCommentStart(line) {
  let quote = "";
  let escaped = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === "\\" && quote !== "'") {
      escaped = true;
      continue;
    }

    if ((char === "'" || char === '"' || char === "`") && !quote) {
      quote = char;
      continue;
    }

    if (char === quote) {
      quote = "";
      continue;
    }

    if (char === "#" && !quote && (index === 0 || /\s/.test(line[index - 1]))) {
      return index;
    }
  }

  return -1;
}

function wrapToken(className, value) {
  return `<span class="${className}">${escapeHtml(value)}</span>`;
}

function classifyShellWord(word, expectingCommand) {
  if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
    return wrapToken("syntax-env", word);
  }

  if (/^https?:\/\//.test(word)) {
    return wrapToken("syntax-link", word);
  }

  if (/^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?$/.test(word) || word.includes("$")) {
    return wrapToken("syntax-variable", word);
  }

  if (/^--?[A-Za-z0-9][A-Za-z0-9_-]*(=.*)?$/.test(word)) {
    return wrapToken("syntax-option", word);
  }

  if (/^-?\d+(\.\d+)?$/.test(word)) {
    return wrapToken("syntax-number", word);
  }

  if (expectingCommand) {
    return wrapToken("syntax-command", word);
  }

  if (/^(\.?\.?\/|~\/)[^\s]+/.test(word) || /\/[A-Za-z0-9_.-]+/.test(word)) {
    return wrapToken("syntax-path", word);
  }

  return escapeHtml(word);
}

function highlightShellMain(line) {
  let html = "";
  let index = 0;
  let expectingCommand = true;

  while (index < line.length) {
    const char = line[index];

    if (/\s/.test(char)) {
      html += escapeHtml(char);
      index += 1;
      continue;
    }

    if (char === "'" || char === '"' || char === "`") {
      const quote = char;
      let end = index + 1;
      let escaped = false;

      while (end < line.length) {
        const current = line[end];
        if (escaped) {
          escaped = false;
        } else if (current === "\\" && quote !== "'") {
          escaped = true;
        } else if (current === quote) {
          end += 1;
          break;
        }
        end += 1;
      }

      html += wrapToken("syntax-string", line.slice(index, end));
      index = end;
      expectingCommand = false;
      continue;
    }

    const operator = line.slice(index).match(/^(2>&1|&&|\|\||>>|<<|[|;><&\\])/);
    if (operator) {
      html += wrapToken("syntax-operator", operator[0]);
      index += operator[0].length;
      expectingCommand = /^(&&|\|\||[|;])$/.test(operator[0]);
      continue;
    }

    let end = index;
    while (end < line.length && !/\s/.test(line[end]) && !/[|;><&\\]/.test(line[end])) {
      end += 1;
    }

    const word = line.slice(index, end);
    html += classifyShellWord(word, expectingCommand);
    if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) {
      expectingCommand = false;
    }
    index = end;
  }

  return html;
}

function highlightShellLine(line) {
  const commentStart = findShellCommentStart(line);
  if (commentStart === -1) {
    return highlightShellMain(line);
  }

  return `${highlightShellMain(line.slice(0, commentStart))}${wrapToken("syntax-comment", line.slice(commentStart))}`;
}

function highlightCode(code, language) {
  if (!isShellLanguage(language)) {
    return escapeHtml(code);
  }

  return code.split("\n").map(highlightShellLine).join("\n");
}

function isTableRow(line) {
  return /^\s*\|.+\|\s*$/.test(line);
}

function isTableDivider(line) {
  return /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(line);
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function renderTable(headerLine, rows) {
  const headers = parseTableRow(headerLine);
  const body = rows.map(parseTableRow);
  const width = headers.length;

  function normalizeCells(cells) {
    return Array.from({ length: width }, (_, index) => cells[index] || "");
  }

  return `
    <div class="markdown-table-wrap">
      <table>
        <thead>
          <tr>${headers.map((cell) => `<th>${inlineMarkdown(cell)}</th>`).join("")}</tr>
        </thead>
        <tbody>
          ${body
            .map((row) => `<tr>${normalizeCells(row).map((cell) => `<td>${inlineMarkdown(cell)}</td>`).join("")}</tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function markdownToHtml(markdown) {
  const lines = stripPostMetadata(markdown).replace(/\r\n/g, "\n").split("\n");
  const html = [];
  let paragraph = [];
  let list = [];
  let inFence = false;
  let codeLines = [];
  let codeLang = "";

  function flushParagraph() {
    if (!paragraph.length) return;
    html.push(`<p>${inlineMarkdown(paragraph.join(" "))}</p>`);
    paragraph = [];
  }

  function flushList() {
    if (!list.length) return;
    html.push(`<ul>${list.map((item) => `<li>${inlineMarkdown(item)}</li>`).join("")}</ul>`);
    list = [];
  }

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    const fence = line.match(/^```(\w*)\s*$/);
    if (fence) {
      if (inFence) {
        html.push(
          `<pre><code class="language-${escapeHtml(codeLang)}">${highlightCode(codeLines.join("\n"), codeLang)}</code></pre>`
        );
        inFence = false;
        codeLines = [];
        codeLang = "";
      } else {
        flushParagraph();
        flushList();
        inFence = true;
        codeLang = fence[1] || "";
      }
      continue;
    }

    if (inFence) {
      codeLines.push(line);
      continue;
    }

    if (!line.trim()) {
      flushParagraph();
      flushList();
      continue;
    }

    if (isTableRow(line) && isTableDivider(lines[index + 1] || "")) {
      flushParagraph();
      flushList();
      index += 2;
      const rows = [];

      while (index < lines.length && isTableRow(lines[index])) {
        rows.push(lines[index]);
        index += 1;
      }

      html.push(renderTable(line, rows));
      index -= 1;
      continue;
    }

    const heading = line.match(/^(#{1,4})\s+(.+)$/);
    if (heading) {
      flushParagraph();
      flushList();
      const level = heading[1].length;
      html.push(`<h${level}>${inlineMarkdown(heading[2])}</h${level}>`);
      continue;
    }

    const item = line.match(/^\s*[-*]\s+(.+)$/);
    if (item) {
      flushParagraph();
      list.push(item[1]);
      continue;
    }

    paragraph.push(line.trim());
  }

  if (inFence) {
    html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${highlightCode(codeLines.join("\n"), codeLang)}</code></pre>`);
  }
  flushParagraph();
  flushList();
  return html.join("");
}

function showHome() {
  articleShell.hidden = true;
  blogIndexShell.hidden = true;
  document.querySelectorAll(".section-block").forEach((section) => {
    section.hidden = false;
  });
}

function showBlogIndex() {
  articleShell.hidden = true;
  blogIndexShell.hidden = false;
  document.querySelectorAll(".section-block").forEach((section) => {
    section.hidden = true;
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderArticleMeta(item, tags = item.tags) {
  articleMeta.innerHTML = `
    <div class="article-topline">
      <span>${escapeHtml(item.category)}</span>
      <span>${escapeHtml(formatDate(item.createdAt))}</span>
    </div>
    <h1>${escapeHtml(item.title)}</h1>
    <p>${escapeHtml(item.description)}</p>
    ${renderTagList(tags)}
  `;
}

async function openPost(slug) {
  const item = contentIndex.find((entry) => entry.slug === slug);
  if (!item) {
    showHome();
    return;
  }

  document.querySelectorAll(".section-block").forEach((section) => {
    section.hidden = true;
  });
  blogIndexShell.hidden = true;
  articleShell.hidden = false;
  renderArticleMeta(item);
  markdownBody.innerHTML = "<p>Loading Markdown...</p>";

  if (typeof item.markdown === "string") {
    const tags = uniqueTags([...(item.tags || []), ...parseTagsFromMarkdown(item.markdown)]);
    renderArticleMeta({ ...item, tags }, tags);
    markdownBody.innerHTML = item.markdown.trim()
      ? markdownToHtml(item.markdown)
      : `<p>This Markdown file is currently empty.</p>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
    return;
  }

  try {
    const response = await fetch(item.path);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const markdown = await response.text();
    const tags = uniqueTags([...(item.tags || []), ...parseTagsFromMarkdown(markdown)]);
    renderArticleMeta({ ...item, tags }, tags);
    markdownBody.innerHTML = markdown.trim()
      ? markdownToHtml(markdown)
      : `<p>This Markdown file is currently empty.</p><p><a href="${escapeHtml(item.path)}">Open raw Markdown</a></p>`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  } catch (error) {
    markdownBody.innerHTML = `
      <p>This post is missing embedded Markdown content.</p>
      <p>Run <code>node website/tools/embed-markdown.mjs</code> from the repository root, then refresh this page.</p>
      <p><a href="${escapeHtml(item.path)}">Open raw Markdown</a></p>
    `;
  }
}

function renderBlogCard(item) {
  return `
    <a class="window-card topic-card" href="#post=${escapeHtml(item.slug)}" data-searchable data-slug="${escapeHtml(item.slug)}">
      <div class="window-dots" aria-hidden="true">
        <span></span>
        <span></span>
        <span></span>
      </div>
      <p class="kicker">${escapeHtml(item.category)}</p>
      <h3>${escapeHtml(item.title)}</h3>
      <p>${escapeHtml(item.description)}</p>
      ${renderTagList(item.tags)}
      <div class="blue-stroke"></div>
    </a>
  `;
}

function renderBlogRow(item) {
  return `
    <a class="window-card blog-row" href="#post=${escapeHtml(item.slug)}" data-searchable data-slug="${escapeHtml(item.slug)}">
      <div>
        <p class="kicker">${escapeHtml(item.category)}</p>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
        ${renderTagList(item.tags)}
      </div>
      <time datetime="${escapeHtml(item.createdAt || "")}">${escapeHtml(formatDate(item.createdAt))}</time>
    </a>
  `;
}

function renderCurrentCards() {
  const cards = sortByCreated(contentIndex.filter((item) => item.featured)).slice(0, 3);
  currentList.innerHTML = cards.map(renderBlogCard).join("");
}

function renderBlogIndex() {
  blogList.innerHTML = sortByCreated(contentIndex).map(renderBlogRow).join("");
}

function renderSearch(query) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    searchResults.textContent = "Type a title, keyword, or tag such as #Sglang.";
    return;
  }

  const normalizedTagQuery = normalizedQuery.replace(/^#/, "");
  const matches = contentIndex.filter((item) => {
    const tags = uniqueTags(item.tags).join(" ").toLowerCase();
    const text = `${item.title} ${item.category} ${item.description} ${tags}`.toLowerCase();
    return text.includes(normalizedQuery) || tags.includes(normalizedTagQuery);
  });

  searchResults.innerHTML = "";
  if (!matches.length) {
    searchResults.textContent = "No matching local section found.";
    return;
  }

  matches.slice(0, 8).forEach((item) => {
    const result = document.createElement("a");
    result.className = "search-result";
    result.href = `#post=${item.slug}`;
    result.innerHTML = `<strong>${escapeHtml(item.title)}</strong>${renderTagList(item.tags)}`;
    result.addEventListener("click", () => searchDialog?.close());
    searchResults.append(result);
  });
}

async function hydrateTagsFromMarkdown(items) {
  const hydrated = await Promise.all(
    items.map(async (item) => {
      if (typeof item.markdown === "string") {
        const parsedTags = parseTagsFromMarkdown(item.markdown);
        return {
          ...item,
          tags: uniqueTags([...(item.tags || []), ...parsedTags]),
        };
      }

      try {
        const response = await fetch(item.path);
        if (!response.ok) return item;
        const markdown = await response.text();
        const parsedTags = parseTagsFromMarkdown(markdown);
        return {
          ...item,
          tags: uniqueTags([...(item.tags || []), ...parsedTags]),
        };
      } catch {
        return item;
      }
    })
  );
  return hydrated;
}

async function loadContentIndex() {
  if (Array.isArray(window.ML_SYSTEM_CONTENT_INDEX)) {
    contentIndex = window.ML_SYSTEM_CONTENT_INDEX;
  } else {
    try {
      const response = await fetch("./content-index.json");
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      contentIndex = await response.json();
    } catch {
      contentIndex = fallbackContentIndex;
    }
  }

  contentIndex = sortByCreated((await hydrateTagsFromMarkdown(contentIndex)).filter(isRenderablePost));
  renderCurrentCards();
  renderBlogIndex();
  handleRoute();
}

function handleRoute() {
  const postMatch = window.location.hash.match(/^#post=([^&]+)/);
  if (postMatch) {
    openPost(decodeURIComponent(postMatch[1]));
    return;
  }
  if (window.location.hash === "#blogs") {
    showBlogIndex();
    return;
  }
  showHome();
}

searchButton?.addEventListener("click", () => {
  searchDialog?.showModal();
  requestAnimationFrame(() => searchInput?.focus());
  renderSearch(searchInput?.value || "");
});

searchInput?.addEventListener("input", (event) => {
  renderSearch(event.target.value);
});

searchDialog?.addEventListener("close", () => {
  searchInput.value = "";
  renderSearch("");
});

backHome?.addEventListener("click", () => {
  window.location.hash = "blogs";
  showBlogIndex();
});

window.addEventListener("hashchange", handleRoute);

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    searchDialog?.showModal();
    requestAnimationFrame(() => searchInput?.focus());
  }
});

loadContentIndex();
