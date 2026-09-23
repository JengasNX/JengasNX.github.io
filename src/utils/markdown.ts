/**
 * Minimal, safe Markdown → HTML renderer for GitHub READMEs.
 *
 * The input is fully escaped before any markup is applied, so repository
 * content can never inject scripts (no dangerouslySetInnerHTML with raw text).
 */

function escapeHtml(src: string): string {
  return src
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** Inline formatting: code, bold, italic, links, images. */
function inline(src: string): string {
  let out = src;
  out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
  out = out.replace(
    /!\[([^\]]*)\]\(([^)\s]+)\)/g,
    '<img src="$2" alt="$1" loading="lazy" />',
  );
  out = out.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
  );
  out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  out = out.replace(/__([^_]+)__/g, '<strong>$1</strong>');
  out = out.replace(/(^|[\s(])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return out;
}

export function renderMarkdown(markdown: string): string {
  const src = escapeHtml(markdown.replace(/\r\n/g, '\n'));
  const lines = src.split('\n');
  const html: string[] = [];

  let i = 0;
  let listType: 'ul' | 'ol' | null = null;

  const closeList = () => {
    if (listType) {
      html.push(`</${listType}>`);
      listType = null;
    }
  };

  while (i < lines.length) {
    const line = lines[i];

    /* fenced code */
    if (/^```/.test(line)) {
      closeList();
      const lang = line.replace(/^```/, '').trim();
      const buf: string[] = [];
      i++;
      while (i < lines.length && !/^```/.test(lines[i])) {
        buf.push(lines[i]);
        i++;
      }
      i++; // skip closing ```
      html.push(
        `<pre><code${lang ? ` class="lang-${lang}"` : ''}>${buf.join('\n')}</code></pre>`,
      );
      continue;
    }

    /* table */
    if (/^\|.*\|/.test(line) && /^\|[\s:|-]+\|/.test(lines[i + 1] ?? '')) {
      closeList();
      const cells = (row: string) =>
        row
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());
      const head = cells(line);
      i += 2;
      const body: string[][] = [];
      while (i < lines.length && /^\|.*\|/.test(lines[i])) {
        body.push(cells(lines[i]));
        i++;
      }
      html.push(
        '<table><thead><tr>' +
          head.map((c) => `<th>${inline(c)}</th>`).join('') +
          '</tr></thead><tbody>' +
          body
            .map((row) => '<tr>' + row.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>')
            .join('') +
          '</tbody></table>',
      );
      continue;
    }

    /* headings */
    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      closeList();
      const level = Math.min(heading[1].length, 4);
      html.push(`<h${level}>${inline(heading[2])}</h${level}>`);
      i++;
      continue;
    }

    /* horizontal rule */
    if (/^(-{3,}|\*{3,}|_{3,})\s*$/.test(line)) {
      closeList();
      html.push('<hr />');
      i++;
      continue;
    }

    /* blockquote */
    if (/^&gt;\s?/.test(line)) {
      closeList();
      const buf: string[] = [];
      while (i < lines.length && /^&gt;\s?/.test(lines[i])) {
        buf.push(lines[i].replace(/^&gt;\s?/, ''));
        i++;
      }
      html.push(`<blockquote>${inline(buf.join(' '))}</blockquote>`);
      continue;
    }

    /* unordered list */
    const ul = line.match(/^\s*[-*+]\s+(.*)$/);
    if (ul) {
      if (listType !== 'ul') {
        closeList();
        html.push('<ul>');
        listType = 'ul';
      }
      html.push(`<li>${inline(ul[1])}</li>`);
      i++;
      continue;
    }

    /* ordered list */
    const ol = line.match(/^\s*\d+\.\s+(.*)$/);
    if (ol) {
      if (listType !== 'ol') {
        closeList();
        html.push('<ol>');
        listType = 'ol';
      }
      html.push(`<li>${inline(ol[1])}</li>`);
      i++;
      continue;
    }

    /* empty line */
    if (!line.trim()) {
      closeList();
      i++;
      continue;
    }

    /* paragraph (merge consecutive plain lines) */
    closeList();
    const buf: string[] = [line];
    i++;
    while (
      i < lines.length &&
      lines[i].trim() &&
      !/^(#{1,6}\s|```|>|\s*[-*+]\s|\s*\d+\.\s|\|)/.test(lines[i])
    ) {
      buf.push(lines[i]);
      i++;
    }
    html.push(`<p>${inline(buf.join(' '))}</p>`);
  }

  closeList();
  return html.join('\n');
}
