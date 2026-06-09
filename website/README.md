# ML System Thoughts Website

Static personal website for this repository.

## Files

- `index.html` - single-page personal site.
- `styles.css` - small browser-window visual system.
- `script.js` - local search, theme toggle, and Markdown renderer.
- `content-index.json` - Markdown content registry used to build blog cards and article routes.
- `content-data.js` - browser-loadable embedded Markdown payload for direct local opening.
- `tools/embed-markdown.mjs` - embeds Markdown file contents into the content registry.
- `assets/design-board.svg` - design reference for the current style.

## Open Locally

Open `index.html` directly in a browser, or serve the repository with any static server.
The renderer uses Markdown content embedded in `content-data.js`, so article
pages work even when the HTML file is opened directly.

```bash
python3 -m http.server 8081
```

Then open `http://localhost:8081/website/`.

## Add A Markdown Post

Add an entry to `content-index.json`:

```json
{
  "slug": "new-post",
  "title": "New post",
  "category": "Inference",
  "description": "Short card summary.",
  "path": "../path/to/file.md",
  "featured": true
}
```

Then refresh the embedded Markdown payload:

```bash
node website/tools/embed-markdown.mjs
```

Project README files and `website/README.md` are excluded from rendering so the
blog list stays focused on notes.

The homepage renders the first three `featured` entries as the single
`Current` row. The `Blog` nav opens `#blogs`, a full list sorted by
`createdAt` from newest to oldest. Opening `#post=<slug>` uses the shared
article template.

Markdown files can declare searchable tags with a blockquote near the top:

```md
> Tags: #Sglang #Tutorial
```

## Style

The current design follows the small-window reference: dark canvas, warm paper
cards, tiny browser dots, serif display type, and a short Klein-blue underline.
