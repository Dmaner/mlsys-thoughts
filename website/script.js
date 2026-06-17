/* Site bootstrap: wires content loading, routing, view rendering, and search. */
(function initSite(global) {
  "use strict";

  const app = global.MLSystem;
  let contentIndex = [];

  /* Routes hash URLs to the home view, blog list, or a single Markdown article. */
  function handleRoute() {
    const postMatch = window.location.hash.match(/^#post=([^&]+)/);
    if (postMatch) {
      app.views.openPost(decodeURIComponent(postMatch[1]), contentIndex);
      return;
    }

    if (window.location.hash === "#blogs") {
      app.views.showBlogIndex();
      return;
    }

    if (window.location.hash === "#projects") {
      app.views.showProjects();
      return;
    }

    app.views.showHome();
  }

  /* Initializes all feature modules after the embedded Markdown index is ready. */
  async function start() {
    app.views.initTheme();
    contentIndex = await app.content.loadContentIndex();

    app.views.renderCurrentCards(contentIndex);
    app.views.renderBlogIndex(contentIndex);
    app.views.renderProjectTimeline(app.projects?.items || []);
    app.search.initSearch(() => contentIndex);

    app.views.nodes.backHome?.addEventListener("click", () => {
      window.location.hash = "blogs";
      app.views.showBlogIndex();
    });

    window.addEventListener("hashchange", handleRoute);
    handleRoute();
  }

  start();
})(window);
