/**
 * Anchors for admin-written headings.
 *
 * The bodies are HTML produced by the editor, so the headings arrive without
 * ids and there is nothing for a table of contents to link to and nothing for
 * a reader to copy a link to. Rather than ask authors to write ids by hand -
 * which they would forget, and which would collide - they are derived here
 * from the heading text, at render.
 *
 * Derived from the text rather than from position, because "#permissions" is
 * a link somebody can read and keep, while "#h2-3" changes meaning the moment
 * a section is inserted above it.
 */

export type Heading = { id: string; text: string; level: 2 | 3 };

/** A url fragment from heading text: lowercase, words joined by hyphens. */
export function slugifyHeading(text: string): string {
  return (
    text
      .toLowerCase()
      .replace(/<[^>]+>/g, "")
      .replace(/&[a-z]+;/g, " ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "section"
  );
}

/**
 * Give every h2 and h3 an id, and return the list for the sidebar.
 *
 * Only two levels. A contents list that mirrors every heading in a long page
 * stops being a summary and becomes a second copy of the page; h2 and h3 are
 * the levels a reader actually navigates by.
 *
 * Duplicate texts get a numeric suffix - two "Example" headings are common
 * and two identical ids would send both entries to the first one.
 */
export function withHeadingIds(html: string): { html: string; headings: Heading[] } {
  if (!html) return { html, headings: [] };

  const headings: Heading[] = [];
  const used = new Map<string, number>();

  const out = html.replace(
    /<h([23])([^>]*)>([\s\S]*?)<\/h\1>/gi,
    (match, rawLevel: string, attrs: string, inner: string) => {
      // An id already on the tag is the author's, and is left alone.
      if (/\sid\s*=/.test(attrs)) return match;

      const level = Number(rawLevel) as 2 | 3;
      const text = inner
        .replace(/<[^>]+>/g, "")
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#x27;/g, "'")
        .trim();
      if (!text) return match;

      const base = slugifyHeading(text);
      const seen = used.get(base) ?? 0;
      used.set(base, seen + 1);
      const id = seen === 0 ? base : `${base}-${seen + 1}`;

      headings.push({ id, text, level });
      return `<h${level}${attrs} id="${id}">${inner}</h${level}>`;
    },
  );

  return { html: out, headings };
}
