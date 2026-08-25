"use client";

/**
 * The docs layout: a sticky section index on the left, the page on the right.
 *
 * The navigation is fetched once and shared by every page, so moving between
 * pages does not rebuild the sidebar or make it flicker.
 */

import Link from "next/link";

import { Eyebrow, Shell } from "@/components/primitives";
import { publicApi } from "@/lib/api/public";
import type { DocPageSummary } from "@/lib/api/types";
import { useAsync } from "@/lib/useAsync";

export type DocsNav = { section: string; pages: DocPageSummary[] }[];

/** Group the flat list into sections, preserving the admin's ordering. */
export function groupBySection(pages: DocPageSummary[]): DocsNav {
  const order: string[] = [];
  const bySection = new Map<string, DocPageSummary[]>();
  for (const page of pages) {
    if (!bySection.has(page.section)) {
      bySection.set(page.section, []);
      order.push(page.section);
    }
    bySection.get(page.section)!.push(page);
  }
  return order.map((section) => ({ section, pages: bySection.get(section)! }));
}

/**
 * The navigation for one platform, or for everything.
 *
 * A platform's pages come back together with the pages that belong to no
 * platform - concepts, webhooks, billing - because those are part of reading
 * any platform's documentation and a strict filter would hide them from every
 * sidebar they should be in. The API does that joining; this only passes the
 * slug through.
 */
export function useDocsNav(platform?: string) {
  return useAsync(
    async () => groupBySection((await publicApi.docs(platform)).items),
    [platform],
  );
}

/** The platforms the admin panel has published, for the docs switcher. */
export function useDocsPlatforms() {
  return useAsync(async () => (await publicApi.platforms()).items, []);
}

export function DocsLayout({
  nav,
  activeSlug,
  children,
}: {
  nav: DocsNav;
  activeSlug?: string;
  children: React.ReactNode;
}) {
  return (
    <Shell>
      <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)]">
        {/* min-w-0 on both columns: a grid item defaults to min-width:auto and
            refuses to shrink below its content, which pushes the whole page
            sideways on a narrow screen. */}
        <aside className="min-w-0 border-b border-[var(--color-rule)] px-6 py-8 sm:px-10 lg:border-r lg:border-b-0 lg:px-6">
          <div className="lg:sticky lg:top-24">
            <Eyebrow>SDK docs</Eyebrow>
            <nav className="mt-5 flex flex-col gap-6">
              {nav.map(({ section, pages }) => (
                <div key={section}>
                  <p className="font-mono text-[11px] tracking-[0.1em] text-[var(--color-muted)] uppercase">
                    {section}
                  </p>
                  <ul className="mt-2 flex flex-col">
                    {pages.map((page) => {
                      const active = page.slug === activeSlug;
                      return (
                        <li key={page.slug}>
                          <Link
                            href={`/docs/${page.slug}` as never}
                            className={
                              active
                                ? "block border-l-2 border-[var(--color-accent)] py-1.5 pl-3 text-[15px] text-[var(--color-accent)]"
                                : "block border-l-2 border-transparent py-1.5 pl-3 text-[15px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
                            }
                          >
                            {page.title}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </aside>

        <div className="min-w-0 px-6 py-10 sm:px-10 lg:py-14">{children}</div>
      </div>
    </Shell>
  );
}

export function DocsNotice({ title, body }: { title: string; body?: string }) {
  return (
    <Shell>
      <div className="px-6 py-24 text-center sm:px-10">
        <p className="text-[17px] text-[var(--color-ink)]">{title}</p>
        {body && <p className="mt-2 text-[15px] text-[var(--color-muted)]">{body}</p>}
      </div>
    </Shell>
  );
}
