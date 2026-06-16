/* Search dialog behavior for titles, descriptions, categories, and tags. */
(function initSearchModule(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});
  const { escapeHtml, uniqueTags } = app.utils;
  const { renderTagList } = app.views;

  const searchButton = document.querySelector("[data-open-search]");
  const searchDialog = document.querySelector("[data-search-dialog]");
  const searchInput = document.querySelector("#site-search");
  const searchResults = document.querySelector("[data-search-results]");

  /* Filters posts by title, category, description, or tags and paints result links. */
  function renderSearch(query, contentIndex) {
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

  /* Wires the search dialog button, keyboard shortcut, and live input updates. */
  function initSearch(getContentIndex) {
    searchButton?.addEventListener("click", () => {
      searchDialog?.showModal();
      requestAnimationFrame(() => searchInput?.focus());
      renderSearch(searchInput?.value || "", getContentIndex());
    });

    searchInput?.addEventListener("input", (event) => {
      renderSearch(event.target.value, getContentIndex());
    });

    searchDialog?.addEventListener("close", () => {
      searchInput.value = "";
      renderSearch("", getContentIndex());
    });

    document.addEventListener("keydown", (event) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchDialog?.showModal();
        requestAnimationFrame(() => searchInput?.focus());
        renderSearch(searchInput?.value || "", getContentIndex());
      }
    });
  }

  app.search = {
    initSearch,
  };
})(window);
