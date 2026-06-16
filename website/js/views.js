/* DOM rendering for homepage cards, blog rows, article pages, and theme state. */
(function initViews(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});
  const { escapeHtml, formatDate, sortByCreated, uniqueTags } = app.utils;
  const { parsePostMetadata } = app.content;
  const { markdownToHtml } = app.markdown;

  const nodes = {
    root: document.documentElement,
    themeToggle: document.querySelector("[data-theme-toggle]"),
    currentList: document.querySelector("[data-current-list]"),
    blogList: document.querySelector("[data-blog-list]"),
    blogIndexShell: document.querySelector("[data-blog-index-shell]"),
    articleShell: document.querySelector("[data-article-shell]"),
    markdownBody: document.querySelector("[data-markdown-body]"),
    articleMeta: document.querySelector("[data-article-meta]"),
    backHome: document.querySelector("[data-back-home]"),
  };

  /* Applies saved light/dark preference and persists future theme changes. */
  function initTheme() {
    const storedTheme = localStorage.getItem("ml-system-theme");
    if (storedTheme) nodes.root.dataset.theme = storedTheme;

    nodes.themeToggle?.addEventListener("click", () => {
      const nextTheme = nodes.root.dataset.theme === "dark" ? "light" : "dark";
      nodes.root.dataset.theme = nextTheme;
      localStorage.setItem("ml-system-theme", nextTheme);
    });
  }

  /* Renders reusable tag pills for cards, blog rows, article pages, and search. */
  function renderTagList(tags = []) {
    const cleanTags = uniqueTags(tags);
    if (!cleanTags.length) return "";
    return `<div class="tag-list">${cleanTags
      .map((tag) => `<span class="tag">#${escapeHtml(tag)}</span>`)
      .join("")}</div>`;
  }

  function showHome() {
    nodes.articleShell.hidden = true;
    nodes.blogIndexShell.hidden = true;
    document.querySelectorAll(".section-block").forEach((section) => {
      section.hidden = false;
    });
  }

  function showBlogIndex() {
    nodes.articleShell.hidden = true;
    nodes.blogIndexShell.hidden = false;
    document.querySelectorAll(".section-block").forEach((section) => {
      section.hidden = true;
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function renderArticleMeta(item, tags = item.tags) {
    nodes.articleMeta.innerHTML = `
      <div class="article-topline">
        <span>${escapeHtml(item.category)}</span>
        <span>${escapeHtml(formatDate(item.createdAt))}</span>
      </div>
      <h1>${escapeHtml(item.title)}</h1>
      <p>${escapeHtml(item.description)}</p>
      ${renderTagList(tags)}
    `;
  }

  /* Opens a single post and renders embedded Markdown content into the article shell. */
  async function openPost(slug, contentIndex) {
    const item = contentIndex.find((entry) => entry.slug === slug);
    if (!item) {
      showHome();
      return;
    }

    document.querySelectorAll(".section-block").forEach((section) => {
      section.hidden = true;
    });
    nodes.blogIndexShell.hidden = true;
    nodes.articleShell.hidden = false;
    renderArticleMeta(item);
    nodes.markdownBody.innerHTML = "<p>Loading Markdown...</p>";

    if (typeof item.markdown === "string") {
      const metadata = parsePostMetadata(item.markdown);
      const tags = uniqueTags(metadata.tags.length ? metadata.tags : item.tags || []);
      const description = metadata.desc || item.description;
      renderArticleMeta({ ...item, description, tags }, tags);
      nodes.markdownBody.innerHTML = item.markdown.trim()
        ? markdownToHtml(item.markdown, { title: item.title })
        : `<p>This Markdown file is currently empty.</p>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const response = await fetch(item.path);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const markdown = await response.text();
      const metadata = parsePostMetadata(markdown);
      const tags = uniqueTags(metadata.tags.length ? metadata.tags : item.tags || []);
      const description = metadata.desc || item.description;
      renderArticleMeta({ ...item, description, tags }, tags);
      nodes.markdownBody.innerHTML = markdown.trim()
        ? markdownToHtml(markdown, { title: item.title })
        : `<p>This Markdown file is currently empty.</p><p><a href="${escapeHtml(item.path)}">Open raw Markdown</a></p>`;
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      nodes.markdownBody.innerHTML = `
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

  /* Current shows the six latest created posts, producing a 2 by 3 grid on desktop. */
  function renderCurrentCards(contentIndex) {
    const cards = sortByCreated(contentIndex).slice(0, 6);
    nodes.currentList.innerHTML = cards.map(renderBlogCard).join("");
  }

  function renderBlogIndex(contentIndex) {
    nodes.blogList.innerHTML = sortByCreated(contentIndex).map(renderBlogRow).join("");
  }

  app.views = {
    initTheme,
    nodes,
    openPost,
    renderBlogIndex,
    renderCurrentCards,
    renderTagList,
    showBlogIndex,
    showHome,
  };
})(window);
