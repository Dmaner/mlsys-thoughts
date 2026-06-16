/* Shared helpers for escaping user-authored content, tags, and dates. */
(function initUtils(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});

  function escapeHtml(value = "") {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function normalizeTag(tag) {
    return String(tag).replace(/^#/, "").trim();
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

  app.utils = {
    escapeHtml,
    formatDate,
    sortByCreated,
    uniqueTags,
  };
})(window);
