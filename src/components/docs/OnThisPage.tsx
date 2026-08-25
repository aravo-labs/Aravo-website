"use client";

/**
 * The contents of the page you are reading, on the right.
 *
 * Documentation is read by scanning for the one section you came for, and a
 * long page hides its own shape. This lists the h2s and h3s and marks where
 * you are.
 *
 * Position is tracked with IntersectionObserver rather than by measuring
 * scroll offsets on every frame: the browser already knows what is on screen,
 * and asking it is both cheaper and correct when the layout shifts because an
 * image or a video above has finished loading.
 *
 * The top margin is negative and the bottom large, which makes the observed
 * band a strip near the top of the viewport. That matches how people read - a
 * heading is "current" once it reaches the top, not when it is centred - and
 * it stops the last two entries fighting each other at the end of the page.
 */

import { useEffect, useState } from "react";

import type { Heading } from "@/lib/headings";

export function OnThisPage({ headings }: { headings: readonly Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    if (headings.length === 0) return;

    const seen = new Map<string, boolean>();
    const watch = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) seen.set(entry.target.id, entry.isIntersecting);
        // The first heading in document order that is inside the band; falling
        // back to the last one passed keeps something highlighted while
        // reading the body between two headings.
        const current = headings.find((h) => seen.get(h.id));
        if (current) setActive(current.id);
      },
      { rootMargin: "-88px 0px -70% 0px", threshold: 0 },
    );

    for (const heading of headings) {
      const el = document.getElementById(heading.id);
      if (el) watch.observe(el);
    }
    return () => watch.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  return (
    <nav aria-label="On this page" className="flex flex-col gap-3">
      <p className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
        On this page
      </p>
      <ul className="flex flex-col border-l border-rule">
        {headings.map((heading) => {
          const current = heading.id === active;
          return (
            <li key={heading.id}>
              <a
                href={`#${heading.id}`}
                aria-current={current ? "location" : undefined}
                className={`-ml-px block border-l py-1.5 text-[13px] leading-snug transition-colors ${
                  heading.level === 3 ? "pl-6" : "pl-3"
                } ${
                  current
                    ? "border-signal text-signal"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {heading.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
