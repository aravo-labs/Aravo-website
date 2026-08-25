"use client";

/**
 * A documentation body: prose, and the code inside it painted properly.
 *
 * The editor stores a code block as `<pre><code class="language-kotlin">`,
 * which is HTML a browser will happily render as one undifferentiated grey
 * wall. Reference documentation is read by looking for the call you need, and
 * a wall of one colour makes that a search rather than a glance. So the body
 * is split here into prose and code, and every code block goes through the
 * same painted, highlighted component the homepage uses - language label,
 * copy button, tokens in their own colours.
 *
 * Splitting is done on the string rather than by walking the DOM afterwards,
 * so the server and the client render the same markup and nothing repaints
 * after hydration. It is safe because the source is not arbitrary: the API
 * sanitised it on write against an allowlist that has no attribute able to
 * carry a `<pre` inside it, so the tags found here are the tags the editor
 * wrote.
 *
 * Links inside the body are handled here too. A reader following a reference
 * from one page to another should not watch the whole application reload, and
 * a link to another doc page should carry the platform they are reading
 * along with it - arriving at the Android events page with the iOS sidebar
 * would be the site losing its place, not the reader.
 */

import { useRouter } from "next/navigation";
import { useMemo, type MouseEvent } from "react";

import { CodeBlock, type CodeTheme } from "@/components/code/CodeBlock";
import { RichText } from "@/components/docs/RichText";

type Segment =
  { kind: "prose"; html: string } | { kind: "code"; code: string; language: string | null };

/** `&amp;` and friends, back to the characters the author typed. */
function decodeEntities(text: string): string {
  return (
    text
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#(\d+);/g, (_, n: string) => String.fromCharCode(Number(n)))
      .replace(/&#x([0-9a-f]+);/gi, (_, n: string) => String.fromCharCode(parseInt(n, 16)))
      .replace(/&nbsp;/g, " ")
      // Ampersand last, or "&amp;lt;" would decode twice into a tag.
      .replace(/&amp;/g, "&")
  );
}

export function splitBody(html: string): Segment[] {
  const segments: Segment[] = [];
  const block = /<pre[^>]*>([\s\S]*?)<\/pre>/gi;
  let cursor = 0;
  let match: RegExpExecArray | null;

  while ((match = block.exec(html))) {
    const before = html.slice(cursor, match.index);
    if (before.trim()) segments.push({ kind: "prose", html: before });

    const inner = match[1];
    // The language is on the <code>, where the editor puts it, or on the
    // <pre> if the HTML came from somewhere else.
    const language =
      /class="[^"]*language-([a-z0-9+#]+)/i.exec(inner)?.[1] ??
      /class="[^"]*language-([a-z0-9+#]+)/i.exec(match[0])?.[1] ??
      null;

    const code = decodeEntities(
      inner
        .replace(/<\/?code[^>]*>/gi, "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/<[^>]+>/g, ""),
    ).replace(/^\n+|\n+$/g, "");

    segments.push({ kind: "code", code, language });
    cursor = block.lastIndex;
  }

  const rest = html.slice(cursor);
  if (rest.trim()) segments.push({ kind: "prose", html: rest });
  return segments;
}

export function DocBody({
  html,
  /** Carried onto links that point at another doc page. */
  platform,
  theme = "ink",
}: {
  html: string;
  platform?: string;
  theme?: CodeTheme;
}) {
  const router = useRouter();
  const segments = useMemo(() => splitBody(html), [html]);

  function follow(event: MouseEvent<HTMLDivElement>) {
    // Modified clicks are the reader asking for a new tab or a download, and
    // are none of this handler's business.
    if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey) return;

    const anchor = (event.target as HTMLElement).closest?.("a");
    const href = anchor?.getAttribute("href");
    if (!anchor || !href) return;

    // Anchors within the page are the browser's job, and external links and
    // mail addresses are somebody else's site.
    if (href.startsWith("#") || !href.startsWith("/")) return;

    event.preventDefault();
    const keepsPlatform = platform && href.startsWith("/docs/") && !href.includes("?");
    router.push((keepsPlatform ? `${href}?platform=${platform}` : href) as never);
  }

  if (!html?.trim()) return null;

  return (
    // A click handler on a container rather than a listener per link: the
    // markup is a string, so there are no React elements to attach to. The
    // links inside are real anchors, so the keyboard already works - this
    // only intercepts what the mouse does.
    <div onClick={follow} className="flex flex-col gap-6">
      {segments.map((segment, i) =>
        segment.kind === "prose" ? (
          <RichText key={i} html={segment.html} />
        ) : (
          <CodeBlock
            key={i}
            code={segment.code}
            language={segment.language}
            theme={theme}
            className="rounded-[4px]"
          />
        ),
      )}
    </div>
  );
}
