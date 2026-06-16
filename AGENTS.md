# Repository Guidelines

## Project Structure & Module Organization

This repository is a Markdown-first digital garden for ML systems notes, with a static personal website layered on top.

- `README.md` and `README_zh.md` describe the project in English and Chinese.
- `inference/` contains serving and inference notes, including `vllm`, `sglang`, and `mlx` tutorials.
- `cuda/kernel/` stores low-level CUDA examples such as `reduce/simple.cu`.
- `skills/` contains local workflow or skill documentation.
- `website/` contains the static site: `index.html`, `styles.css`, `script.js`, `content-index.json`, embedded Markdown in `content-data.js`, and visual assets under `website/assets/`.
- `.github/workflows/deploy-pages.yml` deploys `website/` to GitHub Pages on pushes to `main`.

## Build, Test, and Development Commands

- `node website/tools/embed-markdown.mjs` refreshes `website/content-data.js` after Markdown or `content-index.json` changes.
- `python3 -m http.server 8081` serves the repository locally; open `http://localhost:8081/website/`.
- Opening `website/index.html` directly also works because Markdown content is embedded.
- `git status --short` checks pending changes before committing.

## Coding Style & Naming Conventions

Use concise Markdown with clear headings, short paragraphs, and relative links. Blog-capable Markdown files can declare tags near the top with:

```md
> Tags: #Sglang #Tutorial
```

Keep website JavaScript as plain modern ESM-style browser code, CSS organized around existing variables and responsive sections, and JSON formatted with two-space indentation. Prefer kebab-case slugs and filenames for posts, for example `tutorial-log-parse.md` and `sglang-basics`.

## Testing Guidelines

There is no automated test suite yet. For content changes, run the embed script and verify the relevant route in a browser, for example `website/index.html#post=sglang-basics`. For website changes, check desktop, tablet, and mobile widths, plus light/dark theme behavior, search, blog list sorting, tag rendering, fenced code blocks, and Markdown tables.

## Commit & Pull Request Guidelines

Recent history uses short imperative messages, sometimes with a scope prefix, such as `[doc] add my skill`, `Update project notes`, and `Add personal website and Pages deployment`. Keep commits focused and avoid mixing unrelated notes with website UI changes.

Pull requests should include a short summary, affected paths, screenshots for visible website changes, and verification steps. Link related issues when available.

## Agent-Specific Instructions

Do not add the root `README.md` or `website/README.md` as blog posts. When adding a post, update `website/content-index.json`, run the embed script, and keep the generated `content-data.js` in the same commit.
