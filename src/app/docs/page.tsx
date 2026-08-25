"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import { DocBody } from "@/components/docs/DocBody";
import {
  DocsFooter,
  DocsHeader,
  DocsSidebar,
  groupByPlatform,
} from "@/components/docs/DocsChrome";
import { DocsNotice, useDocsPlatforms } from "@/components/docs/DocsShell";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { PlatformTabs } from "@/components/docs/PlatformTabs";
import { withHeadingIds } from "@/lib/headings";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";
import type { DocPageSummary } from "@/lib/api/types";

/**
 * The documentation's front page.
 *
 * Written in the admin panel, and rendered the way any other doc page is:
 * three columns, headings turned into a contents rail, code and links handled
 * by the same component. A reader arriving at the docs wants to be told what
 * this is, which platform to pick and what integrating involves, and none of
 * that can be derived from a list of page titles.
 *
 * The generated list is still here, and appears when nobody has written a
 * front page. It is a directory rather than an introduction, but a directory
 * beats an empty screen.
 */

/**
 * The states, not the copy.
 *
 * The heading, the front page and the header button come from the settings row
 * and are editable. These are not: they describe what the page is doing at a
 * moment, and a "loading" message somebody can edit into something else is a
 * support ticket waiting to happen.
 */
const COPY = {
  empty: "The documentation is being written. Check back shortly.",
  emptyForPlatform: "Nothing published for this platform yet.",
  failed: "We could not load the documentation just now. Please try again in a moment.",
};

/** One entry: the title, and the sentence under it if the author wrote one. */
function PageLink({ page, platform }: { page: DocPageSummary; platform?: string }) {
  return (
    <Link
      href={
        (platform ? `/docs/${page.slug}?platform=${platform}` : `/docs/${page.slug}`) as never
      }
      className="group flex flex-col gap-1"
    >
      <span className="text-[15.5px] leading-snug text-ink transition-colors group-hover:text-signal">
        {page.title}
      </span>
      {page.summary && (
        <span className="text-[13.5px] leading-[1.55] text-muted">{page.summary}</span>
      )}
    </Link>
  );
}

export default function DocsIndexRoute() {
  // useSearchParams needs a Suspense boundary above it, or the whole route
  // opts out of static rendering.
  return (
    <Suspense fallback={null}>
      <DocsIndex />
    </Suspense>
  );
}

function DocsIndex() {
  const platform = useSearchParams().get("platform") ?? undefined;
  // Every platform, always: the sidebar is how somebody moves between them.
  const nav = useAsync(async () => (await publicApi.docs()).items, []);
  const platforms = useDocsPlatforms();
  const settings = useAsync(() => publicApi.siteSettings(), []);

  const pages = nav.data ?? [];
  const groups = groupByPlatform(pages, platforms.data ?? []);
  // The tabs narrow the cards below, not the sidebar beside them.
  const shown = platform ? groups.filter((g) => g.shared || g.key === platform) : groups;

  // Headings get ids so the contents rail has somewhere to point, and so a
  // reader can link to a section of the front page rather than to the top.
  const home = useMemo(
    () => withHeadingIds(settings.data?.docs_home_html ?? ""),
    [settings.data?.docs_home_html],
  );
  const written = Boolean(home.html.trim());

  return (
    <main className="theme-marketing w-full">
      <DocsHeader />

      <div className="mx-auto grid w-full max-w-[100rem] lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_15rem]">
        <aside className="min-w-0 border-b border-rule px-5 py-8 sm:px-8 lg:border-r lg:border-b-0">
          <div className="lg:sticky lg:top-[4.5rem]">
            <DocsSidebar groups={groups} platform={platform} atHome />
          </div>
        </aside>

        <div className="min-w-0 px-5 py-10 sm:px-10 lg:py-12">
          <h1 className="max-w-[20ch] text-[2rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.4rem]">
            {settings.data?.docs_title ?? "SDK documentation"}
          </h1>
          {settings.data?.docs_intro && (
            <p className="mt-3 max-w-[68ch] text-[16px] leading-[1.65] text-muted">
              {settings.data.docs_intro}
            </p>
          )}

          {written ? (
            <div className="mt-9 max-w-[70ch]">
              <DocBody html={home.html} platform={platform} />
            </div>
          ) : (
            <>
              {/* Nobody has written a front page. The platform choice and the
                  page list stand in for one. */}
              <div className="mt-7">
                <PlatformTabs platforms={platforms.data ?? []} active={platform} />
              </div>

              {nav.loading ? (
                <DocsNotice title="Loading the documentation…" />
              ) : nav.error ? (
                <DocsNotice title={COPY.failed} />
              ) : pages.length === 0 ? (
                <DocsNotice title={platform ? COPY.emptyForPlatform : COPY.empty} />
              ) : (
                <div className="mt-10 flex flex-col gap-12">
                  {shown.map((group) => (
                    <section key={group.key} className="flex flex-col gap-5">
                      <h2 className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                        {group.label}
                      </h2>

                      {/* A card per page where the platform has no sections
                          worth the name, and a card per section where it has.
                          Either way every page here is one click.

                          Bordered cards with a gap rather than a one-pixel
                          grid gap over a coloured background: that trick needs
                          full rows to read as rules, and an odd number of
                          cards paints a grey slab where the missing one would
                          be. */}
                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {group.sectioned
                          ? group.sections.map((section) => (
                              <div
                                key={section.key}
                                className="flex flex-col gap-3 rounded-[3px] border border-rule bg-canvas p-5"
                              >
                                <h3 className="font-mono text-[10px] tracking-[0.12em] text-signal uppercase">
                                  {section.label}
                                </h3>
                                <ul className="flex flex-col gap-3">
                                  {section.pages.map((page) => (
                                    <li key={page.slug}>
                                      <PageLink page={page} platform={platform} />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            ))
                          : group.pages.map((page) => (
                              <div
                                key={page.slug}
                                className="rounded-[3px] border border-rule bg-canvas p-5 transition-colors hover:border-rule-strong hover:bg-sunken/50"
                              >
                                <PageLink page={page} platform={platform} />
                              </div>
                            ))}
                      </div>
                    </section>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Hidden below xl: at that width the contents rail would squeeze the
            body past the point where the code blocks stay readable. */}
        <aside className="hidden min-w-0 px-6 py-12 xl:block">
          <div className="sticky top-[4.5rem]">
            <OnThisPage headings={home.headings} />
          </div>
        </aside>
      </div>

      <DocsFooter />
    </main>
  );
}
