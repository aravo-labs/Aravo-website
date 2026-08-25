"use client";

/**
 * The strip above the page, when the admin panel has something to say.
 *
 * This lived inside the old hero and was lost when the homepage was rebuilt
 * from the deck: a banner could be published, the API would serve it, and
 * nothing would appear. Its own component now, mounted beside the navigation
 * rather than inside whichever section happens to be first, so replacing a
 * section cannot take the banner with it again.
 *
 * Nothing renders until an announcement exists. It fails silently too - a
 * marketing page should not show an error strip, or an empty bar, because a
 * CMS call did not come back.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

import { site } from "@/content/site";
import { publicApi } from "@/lib/api/public";
import type { BannerPublic } from "@/lib/api/types";

const LINK_CLASS =
  "flex items-center gap-1.5 font-mono text-label text-signal uppercase underline underline-offset-2 transition-colors hover:text-signal-deep hover:no-underline";

export function AnnouncementBar() {
  const [banner, setBanner] = useState<BannerPublic | null>(null);

  useEffect(() => {
    let live = true;
    publicApi
      .banner()
      .then((data) => {
        if (live && data?.variant === "announcement") setBanner(data);
      })
      .catch(() => {});
    return () => {
      live = false;
    };
  }, []);

  const note = banner
    ? {
        text: banner.title,
        // The subtitle is a short word in front of the sentence here, not a
        // second line: at this size two lines of prose in a strip is a
        // paragraph nobody asked for.
        tag: banner.subtitle?.trim() || null,
        linkLabel: banner.cta_label ?? null,
        href: banner.cta_url ?? null,
      }
    : { ...site.announcement, tag: null };

  if (!note.text) return null;

  return (
    // `data-announcement` is read by a `:has` rule in globals.css: the hero
    // sizes itself against whatever sits above it, and that includes this
    // strip only when there is something to announce.
    // The band spans the screen; the words inside it do not.
    //
    // Two different things are being asked of this strip. As a band it should
    // read as one horizontal move across the whole window, which is what makes
    // it a notice rather than a floating card. As text it belongs in the same
    // column as the navigation above it and the headline below it - text that
    // starts at the very edge of a wide display has nothing to line up with
    // and reads as a stray line rather than as part of the page.
    //
    // So the hatch, the border and the ground go edge to edge, and the content
    // sits in the page's own column inside them.
    <div
      data-announcement
      className="relative z-20 w-full overflow-hidden border-y border-rule bg-surface"
    >
      {/* The same texture the closing section stands on, so the band reads as
          part of the drawing rather than as a browser fixture. */}
      <div aria-hidden className="tex-hatch absolute inset-0 opacity-70" />

      <div className="relative mx-auto flex w-full max-w-[var(--shell-max)] flex-wrap items-center justify-center gap-x-3 gap-y-1.5 px-6 py-2.5 text-center sm:px-10">
        <span className="rounded-[2px] bg-signal px-2 py-0.5 font-mono text-[9px] tracking-[0.14em] text-white uppercase">
          {note.tag ?? "News"}
        </span>
        <span className="text-[13.5px] text-ink">{note.text}</span>

        {/* A path goes through the router, so following an announcement to
            the page it is about does not reload the whole site. Anything else
            is somebody else's address and opens in a new tab, because losing
            the page you were reading to an outbound link is not what a strip
            at the top of the screen should be able to do. */}
        {note.href &&
          note.linkLabel &&
          (note.href.startsWith("/") ? (
            <Link href={note.href as never} className={LINK_CLASS}>
              {note.linkLabel}
              <span aria-hidden>→</span>
            </Link>
          ) : (
            <a href={note.href} target="_blank" rel="noreferrer" className={LINK_CLASS}>
              {note.linkLabel}
              <span aria-hidden>↗</span>
            </a>
          ))}
      </div>
    </div>
  );
}
