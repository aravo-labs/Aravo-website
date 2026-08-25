"use client";

/**
 * Which platform's documentation you are reading.
 *
 * The list comes from the admin panel, so adding Flutter is a form rather than
 * a deploy, and nothing here knows the name of a single platform. "All" is
 * first and is the default: somebody arriving at the docs may not have chosen
 * a platform yet, and making them pick before they can read anything is a
 * gate in front of a library.
 *
 * The choice is in the URL, not in state. A developer who has found the iOS
 * pages will send that link to a colleague, and a tab selection held in
 * memory would send them to the wrong place.
 */

import Link from "next/link";

import type { PlatformPublic } from "@/lib/api/types";

export function PlatformTabs({
  platforms,
  active,
  basePath = "/docs",
}: {
  platforms: readonly PlatformPublic[];
  /** Slug of the current platform, or undefined for all of them. */
  active?: string;
  basePath?: string;
}) {
  if (platforms.length === 0) return null;

  const tabs = [{ slug: undefined as string | undefined, name: "All" }, ...platforms];

  return (
    <nav aria-label="Documentation platform" className="flex flex-wrap items-center gap-1">
      {tabs.map((tab) => {
        const current = tab.slug === active;
        return (
          <Link
            key={tab.slug ?? "all"}
            href={(tab.slug ? `${basePath}?platform=${tab.slug}` : basePath) as never}
            aria-current={current ? "page" : undefined}
            className={`rounded-[3px] px-3.5 py-2 font-mono text-[11px] tracking-[0.1em] uppercase transition-colors ${
              current
                ? "bg-[var(--color-accent)] text-white"
                : "text-[var(--color-muted)] hover:bg-[var(--color-accent-subtle)] hover:text-[var(--color-accent)]"
            }`}
          >
            {tab.name}
          </Link>
        );
      })}
    </nav>
  );
}
