"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, use, useMemo } from "react";

import {
  Breadcrumbs,
  DocsFooter,
  DocsHeader,
  DocsSidebar,
  flattenNav,
  groupByPlatform,
} from "@/components/docs/DocsChrome";
import { DocsNotice, useDocsPlatforms } from "@/components/docs/DocsShell";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { DocBody } from "@/components/docs/DocBody";
import { withHeadingIds } from "@/lib/headings";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";

/**
 * One documentation page.
 *
 * Three columns, which is the shape reference documentation has settled on
 * for a reason: where you are in the set, what you are reading, and where you
 * are inside it. The middle column is held near 70 characters, because the
 * body is prose with code in it and prose at full width is unreadable.
 *
 * The chrome is the docs' own, not the marketing navigation. Someone reading
 * an integration guide is not shopping.
 */
export default function DocPageRoute({ params }: { params: Promise<{ slug: string }> }) {
  return (
    <Suspense fallback={null}>
      <DocPage params={params} />
    </Suspense>
  );
}

function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const platform = useSearchParams().get("platform") ?? undefined;

  const page = useAsync(() => publicApi.doc(slug), [slug]);
  /**
   * Every published page, not just this platform's.
   *
   * The sidebar is how a reader moves between platforms, and asking the API
   * for one platform's pages left it showing only that platform: from the iOS
   * pages there was no way to reach Android without going back to the index.
   * The platform is still what decides which group is open and which pages
   * previous and next walk through - it just no longer decides what exists.
   */
  const nav = useAsync(async () => (await publicApi.docs()).items, []);
  const platforms = useDocsPlatforms();

  // Headings get ids so the contents rail has somewhere to point, and so a
  // reader can link to a section rather than to the top of a long page.
  const body = useMemo(
    () => withHeadingIds(page.data?.body_html ?? ""),
    [page.data?.body_html],
  );

  const pages = nav.data ?? [];
  const groups = groupByPlatform(pages, platforms.data ?? []);
  const owner = platforms.data?.find((p) => p.id === page.data?.platform_id);

  // Previous and next follow the sidebar's order, so "next" means the next
  // thing in the list a reader can see rather than an ordering only the
  // database knows about.
  // Previous and next stay inside the platform being read, plus the pages
  // that belong to every platform. Walking off the end of iOS into Android is
  // not "next" by any reading a person would recognise.
  const reading = groups.filter(
    (g) => g.shared || !owner || g.key === owner.slug || (!!platform && g.key === platform),
  );
  const ordered = flattenNav(reading);
  const index = ordered.findIndex((p) => p.slug === slug);
  const previous = index > 0 ? ordered[index - 1] : undefined;
  const next = index >= 0 && index < ordered.length - 1 ? ordered[index + 1] : undefined;
  const suffix = platform ? `?platform=${platform}` : "";

  return (
    <main className="theme-marketing w-full">
      <DocsHeader />

      {page.loading ? (
        <DocsNotice title="Loading…" />
      ) : page.error ? (
        <DocsNotice
          title="That page does not exist."
          body="It may have been renamed or unpublished."
        />
      ) : (
        <div className="mx-auto grid w-full max-w-[100rem] lg:grid-cols-[16rem_minmax(0,1fr)] xl:grid-cols-[16rem_minmax(0,1fr)_15rem]">
          {/* min-w-0 on every column: a grid item will not shrink below its
              content by default, and one long code line would push the page
              sideways. */}
          <aside className="min-w-0 border-b border-rule px-5 py-8 sm:px-8 lg:border-r lg:border-b-0">
            <div className="lg:sticky lg:top-[4.5rem]">
              <DocsSidebar groups={groups} activeSlug={slug} platform={platform} />
            </div>
          </aside>

          <article className="min-w-0 px-5 py-10 sm:px-10 lg:py-12">
            <Breadcrumbs
              platformName={owner?.name}
              platformSlug={owner?.slug}
              title={page.data!.title}
            />

            <h1 className="mt-5 max-w-[22ch] text-[2rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.4rem]">
              {page.data!.title}
            </h1>
            {page.data!.summary && (
              <p className="mt-3 max-w-[68ch] text-[17px] leading-[1.6] text-muted">
                {page.data!.summary}
              </p>
            )}

            <div className="mt-9 max-w-[70ch]">
              <DocBody html={body.html} platform={platform} />
            </div>

            {/* The page's footer: where to go next, at the point somebody has
                finished reading and is deciding whether there is more.

                Two bordered cards rather than two bare columns split by a
                hairline. The old version sat flush against the body with
                nothing around it, so at a glance it read as two more
                paragraphs of the page rather than as the way out of it. A card
                each, with the direction marked, says these are controls. */}
            {(previous || next) && (
              <nav
                aria-label="Documentation pages"
                className="mt-16 grid gap-3 border-t border-rule pt-8 sm:grid-cols-2"
              >
                {previous ? (
                  <Link
                    href={`/docs/${previous.slug}${suffix}` as never}
                    className="group flex flex-col gap-1.5 rounded-[4px] border border-rule bg-canvas px-5 py-4 transition-colors hover:border-signal/40 hover:bg-signal-wash"
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                      <span aria-hidden>←</span>
                      Previous
                    </span>
                    <span className="text-[15px] leading-snug text-ink transition-colors group-hover:text-signal">
                      {previous.title}
                    </span>
                  </Link>
                ) : (
                  // Holds the column so a lone "next" stays on the right,
                  // where the reader's eye is already looking for it.
                  <span className="hidden sm:block" />
                )}

                {next && (
                  <Link
                    href={`/docs/${next.slug}${suffix}` as never}
                    className="group flex flex-col items-end gap-1.5 rounded-[4px] border border-rule bg-canvas px-5 py-4 text-right transition-colors hover:border-signal/40 hover:bg-signal-wash"
                  >
                    <span className="flex items-center gap-1.5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
                      Next
                      <span aria-hidden>→</span>
                    </span>
                    <span className="text-[15px] leading-snug text-ink transition-colors group-hover:text-signal">
                      {next.title}
                    </span>
                  </Link>
                )}
              </nav>
            )}
          </article>

          {/* Hidden below xl: at that width it would squeeze the body column
              past the point where the code blocks stay readable, and a
              contents list is the least valuable of the three. */}
          <aside className="hidden min-w-0 px-6 py-12 xl:block">
            <div className="sticky top-[4.5rem]">
              <OnThisPage headings={body.headings} />
            </div>
          </aside>
        </div>
      )}

      <DocsFooter />
    </main>
  );
}
