/* Project registry used by the Projects timeline page. */
(function initProjects(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});

  app.projects = {
    items: [
      {
        title: "awesome-agent-projects",
        repo: "Dmaner/awesome-agent-projects",
        description: "Awesome agent projects in opensource, weekly update.",
        href: "https://github.com/Dmaner/awesome-agent-projects",
        homepage: "https://dmaner.github.io/awesome-agent-projects/",
        createdAt: "2026-06-17T12:20:13Z",
        language: "TypeScript",
        tags: ["Agent", "Awesome", "Open Source"],
      },
    ],
  };
})(window);
