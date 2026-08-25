"use client";

/**
 * Any page written in the admin panel, at its own address.
 *
 * The privacy policy and the terms used to be two hard-coded routes with
 * their copy in the repository, which meant a developer and a deploy every
 * time a sentence changed. They are rows now, and so is anything else that
 * needs an address of its own: an announcement, a customer note, a policy
 * nobody has thought of yet.
 *
 * This route sits at the root, so a page written as "seed" is reachable at
 * /seed. Next resolves static routes first, so /docs and /careers keep their
 * own files and only unclaimed addresses arrive here.
 *
 * One narrow column, no illustration and no call to action above the footer.
 * These pages are read to answer a specific question, so the job is to let
 * somebody find the heading they need and stop reading.
 */

import { use } from "react";

import { RichText } from "@/components/docs/RichText";
import { Eyebrow, Shell } from "@/components/primitives";
import { Closing } from "@/components/sections/Closing";
import { Nav } from "@/components/sections/Nav";
import { OnThisPage } from "@/components/docs/OnThisPage";
import { withHeadingIds } from "@/lib/headings";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";
import { useReveal } from "@/lib/useReveal";

export default function StandalonePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const page = useAsync(() => publicApi.page(slug), [slug]);
  useReveal();

  // Headings get ids so the contents rail has somewhere to point and a reader
  // can link to a section rather than to the top of a long policy.
  const body = withHeadingIds(page.data?.body_html ?? "");

  const updated = page.data
    ? new Date(page.data.updated_at).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <main className="theme-marketing w-full">
      <Nav />
      <Shell>
        {page.loading ? (
          <div className="mx-auto w-full max-w-[46rem] py-24">
            <p className="text-[15px] text-muted">Loading…</p>
          </div>
        ) : page.error || !page.data ? (
          <div className="mx-auto flex w-full max-w-[46rem] flex-col gap-3 py-24">
            <h1 className="text-[1.6rem] leading-[1.2] text-ink">This page does not exist</h1>
            <p className="text-[15px] leading-[1.7] text-muted">
              It may have been renamed or taken down. Everything else is still where it was.
            </p>
          </div>
        ) : (
          <div className="mx-auto grid w-full max-w-[62rem] gap-12 py-16 lg:grid-cols-[minmax(0,1fr)_14rem] lg:py-24">
            <article className="min-w-0">
              {page.data.eyebrow && <Eyebrow>{page.data.eyebrow}</Eyebrow>}
              <h1 className="mt-4 text-[2rem] leading-[1.1] font-normal tracking-[-0.018em] text-ink sm:text-[2.6rem]">
                {page.data.title}
              </h1>
              <p className="mt-2 font-mono text-label text-faint uppercase">
                Last updated {updated}
              </p>
              {page.data.summary && (
                <p className="mt-6 text-[16px] leading-[1.7] text-muted">
                  {page.data.summary}
                </p>
              )}

              <div className="mt-10">
                <RichText html={body.html} />
              </div>
            </article>

            {/* Hidden below lg, where a contents list would take the width the
                body needs more. */}
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <OnThisPage headings={body.headings} />
              </div>
            </aside>
          </div>
        )}
      </Shell>
      <Closing />
    </main>
  );
}
