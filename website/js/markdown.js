/* Markdown renderer for the site's limited local-preview needs. */
(function initMarkdown(global) {
  "use strict";

  const app = (global.MLSystem = global.MLSystem || {});
  const { escapeHtml } = app.utils;
  const { stripPostMetadata } = app.content;

  /* Renders the small inline Markdown subset used in cards, paragraphs, and tables. */
  function inlineMarkdown(value) {
    return escapeHtml(value)
      .replace(/!\[([^\]]*)\]\(([^)\s]+)(?:\s+&quot;([^&]*)&quot;)?\)/g, (_, alt, src, title = "") => {
        const titleAttribute = title ? ` title="${title}"` : "";
        return `<img src="${src}" alt="${alt}" loading="lazy" decoding="async"${titleAttribute}>`;
      })
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^!])\[([^\]]+)\]\(([^)]+)\)/g, '$1<a href="$3">$2</a>');
  }

  /* Shell highlighting keeps common bash snippets readable without a dependency. */
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

  /* Assigns lightweight VS Code-like classes to shell tokens for syntax coloring. */
  function classifyShellWord(word, expectingCommand) {
    if (/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) return wrapToken("syntax-env", word);
    if (/^https?:\/\//.test(word)) return wrapToken("syntax-link", word);
    if (/^\$\{?[A-Za-z_][A-Za-z0-9_]*\}?$/.test(word) || word.includes("$")) {
      return wrapToken("syntax-variable", word);
    }
    if (/^--?[A-Za-z0-9][A-Za-z0-9_-]*(=.*)?$/.test(word)) return wrapToken("syntax-option", word);
    if (/^-?\d+(\.\d+)?$/.test(word)) return wrapToken("syntax-number", word);
    if (expectingCommand) return wrapToken("syntax-command", word);
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
          if (escaped) escaped = false;
          else if (current === "\\" && quote !== "'") escaped = true;
          else if (current === quote) {
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
      while (end < line.length && !/\s/.test(line[end]) && !/[|;><&\\]/.test(line[end])) end += 1;
      const word = line.slice(index, end);
      html += classifyShellWord(word, expectingCommand);
      if (!/^[A-Za-z_][A-Za-z0-9_]*=/.test(word)) expectingCommand = false;
      index = end;
    }

    return html;
  }

  function highlightShellLine(line) {
    const commentStart = findShellCommentStart(line);
    if (commentStart === -1) return highlightShellMain(line);
    return `${highlightShellMain(line.slice(0, commentStart))}${wrapToken("syntax-comment", line.slice(commentStart))}`;
  }

  function highlightCode(code, language) {
    if (!isShellLanguage(language)) return escapeHtml(code);
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

  /* Tables are rendered into a scroll wrapper for small screens. */
  function renderTable(headerLine, rows) {
    const headers = parseTableRow(headerLine);
    const body = rows.map(parseTableRow);
    const width = headers.length;
    const normalizeCells = (cells) => Array.from({ length: width }, (_, index) => cells[index] || "");

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

  function leadingIndent(value) {
    const match = value.replace(/\t/g, "    ").match(/^ */);
    return match ? match[0].length : 0;
  }

  /* Builds nested lists from Markdown indentation instead of flattening bullets. */
  function renderNestedList(items) {
    const root = { children: [] };
    const stack = [{ indent: -1, node: root }];

    items.forEach((item) => {
      while (stack.length > 1 && item.indent <= stack[stack.length - 1].indent) stack.pop();
      const node = { text: item.text, children: [] };
      stack[stack.length - 1].node.children.push(node);
      stack.push({ indent: item.indent, node });
    });

    function renderNodes(nodes) {
      return `<ul>${nodes
        .map((node) => `<li>${inlineMarkdown(node.text)}${node.children.length ? renderNodes(node.children) : ""}</li>`)
        .join("")}</ul>`;
    }

    return renderNodes(root.children);
  }

  function normalizeHeading(value = "") {
    return String(value)
      .replace(/[`*_]+/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .toLowerCase();
  }

  /* The article template already prints the title, so the first matching H1/H2 is skipped. */
  function stripLeadingTitle(markdown, title) {
    if (!title) return markdown;
    const source = markdown.replace(/\r\n/g, "\n");
    const match = source.match(/^\s*#{1,3}\s+(.+?)\s*(?:\n|$)/);
    if (!match || normalizeHeading(match[1]) !== normalizeHeading(title)) return source;
    return source.slice(match[0].length).replace(/^\n+/, "");
  }

  /* Converts local Markdown files into HTML without requiring a server-side renderer. */
  function markdownToHtml(markdown, options = {}) {
    const source = stripLeadingTitle(stripPostMetadata(markdown), options.title);
    const lines = source.replace(/\r\n/g, "\n").split("\n");
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
      html.push(renderNestedList(list));
      list = [];
    }

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];
      const fence = line.match(/^```(\w*)\s*$/);
      if (fence) {
        if (inFence) {
          html.push(`<pre><code class="language-${escapeHtml(codeLang)}">${highlightCode(codeLines.join("\n"), codeLang)}</code></pre>`);
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

      const quote = line.match(/^\s*>\s?(.*)$/);
      if (quote) {
        flushParagraph();
        flushList();
        const quoteLines = [quote[1]];
        while (index + 1 < lines.length) {
          const nextQuote = lines[index + 1].match(/^\s*>\s?(.*)$/);
          if (!nextQuote) break;
          quoteLines.push(nextQuote[1]);
          index += 1;
        }
        html.push(`<blockquote>${markdownToHtml(quoteLines.join("\n"))}</blockquote>`);
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

      const item = line.match(/^(\s*)[-*]\s+(.+)$/);
      if (item) {
        flushParagraph();
        list.push({ indent: leadingIndent(item[1]), text: item[2] });
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

  app.markdown = {
    markdownToHtml,
  };
})(window);
