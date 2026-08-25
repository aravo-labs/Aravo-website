"use client";

/**
 * A code block, highlighted and painted in one of four themes.
 *
 * The language comes from the admin panel rather than being guessed. Automatic
 * detection gets Kotlin and Swift wrong in the same way every time - they share
 * enough keywords to be coin flips - and an SDK page that highlights the wrong
 * language is worse than one that highlights nothing.
 *
 * Only the languages the SDK ships in are registered. The full highlight.js
 * bundle is around 900KB for a page that shows one snippet; these are a few
 * kilobytes each, and an unregistered language falls back to plain text rather
 * than failing.
 *
 * The theme is a name, not a colour. A free colour field produces unreadable
 * code the first time somebody picks a dark grey background and forgets the
 * text is grey too, so the four below are each checked once and then chosen.
 */

import hljs from "highlight.js/lib/core";
import bash from "highlight.js/lib/languages/bash";
import dart from "highlight.js/lib/languages/dart";
import java from "highlight.js/lib/languages/java";
import javascript from "highlight.js/lib/languages/javascript";
import json from "highlight.js/lib/languages/json";
import kotlin from "highlight.js/lib/languages/kotlin";
import objectivec from "highlight.js/lib/languages/objectivec";
import swift from "highlight.js/lib/languages/swift";
import typescript from "highlight.js/lib/languages/typescript";
import xml from "highlight.js/lib/languages/xml";
import { useEffect, useMemo, useState } from "react";

for (const [name, lang] of [
  ["kotlin", kotlin],
  ["java", java],
  ["swift", swift],
  ["objectivec", objectivec],
  ["typescript", typescript],
  ["javascript", javascript],
  ["dart", dart],
  ["bash", bash],
  ["json", json],
  ["xml", xml],
] as const) {
  if (!hljs.getLanguage(name)) hljs.registerLanguage(name, lang);
}

export type CodeTheme = "ink" | "midnight" | "slate" | "paper";

/** The four painted worlds. `hljs` is the class the highlighter's spans hang off. */
const THEMES: Record<CodeTheme, { shell: string; chrome: string; label: string }> = {
  ink: {
    shell: "bg-ink text-white/80",
    chrome: "border-white/10 text-white/45",
    label: "text-white/30",
  },
  midnight: {
    shell: "bg-[#0b1220] text-[#c9d5e6]",
    chrome: "border-white/10 text-[#7f93b0]",
    label: "text-[#5c6f8c]",
  },
  slate: {
    shell: "bg-[#1f2a30] text-[#d7e2e6]",
    chrome: "border-white/10 text-[#8ea6ae]",
    label: "text-[#6f858d]",
  },
  paper: {
    shell: "bg-sunken text-ink-2",
    chrome: "border-rule text-muted",
    label: "text-faint",
  },
};

export function CodeBlock({
  code,
  language,
  filename,
  theme = "ink",
  className = "",
}: {
  code: string;
  language?: string | null;
  filename?: string | null;
  theme?: CodeTheme;
  className?: string;
}) {
  const painted = THEMES[theme] ?? THEMES.ink;
  const [copied, setCopied] = useState(false);

  // The confirmation clears itself. Left standing it stops being a
  // confirmation and becomes a label on the button.
  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(timer);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch {
      // No clipboard permission, or an insecure origin. The code is on screen
      // and selectable, so this costs a convenience and not the page.
    }
  }

  const html = useMemo(() => {
    const lang = language && hljs.getLanguage(language) ? language : null;
    // highlight() escapes its input, so the result is safe to set. There is no
    // path here from user text to markup: the highlighter emits spans around
    // escaped tokens and nothing else.
    if (!lang) return null;
    try {
      return hljs.highlight(code, { language: lang, ignoreIllegals: true }).value;
    } catch {
      // A grammar that throws on odd input should cost the colours, not the code.
      return null;
    }
  }, [code, language]);

  return (
    <div
      className={`group/code relative flex min-w-0 flex-col overflow-hidden ${painted.shell} ${className}`}
    >
      <div
        className={`flex items-center justify-between gap-3 border-b px-5 py-2.5 ${painted.chrome}`}
      >
        <span className="truncate font-mono text-[11px]">{filename}</span>
        <div className="flex shrink-0 items-center gap-3">
          <span
            className={`font-mono text-[9px] tracking-[0.14em] uppercase ${painted.label}`}
          >
            {language}
          </span>
          <button
            type="button"
            onClick={copy}
            className="rounded-[2px] border border-current/25 px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] uppercase opacity-70 transition-opacity hover:opacity-100"
          >
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      </div>
      <pre className="hljs overflow-x-auto bg-transparent px-5 py-5">
        <code className="font-mono text-[12.5px] leading-[1.85]">
          {html ? <span dangerouslySetInnerHTML={{ __html: html }} /> : code}
        </code>
      </pre>
    </div>
  );
}
