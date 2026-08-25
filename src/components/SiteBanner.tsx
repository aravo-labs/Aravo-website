"use client";

/**
 * The two banner layouts that had nowhere to appear.
 *
 * The admin panel offers three: an announcement, a logo strip and a showcase.
 * Only the announcement was ever rendered, so publishing either of the others
 * retired the announcement, put a row in the database, and changed nothing on
 * the site - a control that appears to work and does not.
 *
 * One banner is live at a time, which is why this is a single component that
 * switches on the variant rather than three that each fetch and each decide to
 * stay quiet. The announcement is drawn elsewhere, at the top of the page,
 * because a notice belongs above the fold and these two do not.
 */

import Link from "next/link";

import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";
import type { BannerItem, BannerPublic } from "@/lib/api/types";

export function SiteBanner() {
  const banner = useAsync(() => publicApi.banner(), []);
  const live = banner.data;

  if (!live) return null;
  if (live.variant === "logo_strip") return <LogoStrip banner={live} />;
  if (live.variant === "showcase") return <Showcase banner={live} />;
  return null;
}

/** Wraps an item in its link, or leaves it alone when there is nowhere to go. */
function ItemLink({ item, children }: { item: BannerItem; children: React.ReactNode }) {
  if (!item.url) return <>{children}</>;

  const internal = item.url.startsWith("/");
  return internal ? (
    <Link href={item.url as never} className="block">
      {children}
    </Link>
  ) : (
    <a href={item.url} target="_blank" rel="noreferrer" className="block">
      {children}
    </a>
  );
}

/**
 * A row of logos, at the size a logo is legible and no larger.
 *
 * They are held to a single height rather than a single width: logos are
 * drawn to different proportions, and matching their widths makes a tall
 * narrow mark tower over a wide flat one.
 */
function LogoStrip({ banner }: { banner: BannerPublic }) {
  return (
    <section className="border-t border-rule bg-sunken/40">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-12 sm:px-10">
        <div className="flex flex-col items-center gap-8">
          <p className="text-center font-mono text-label text-faint uppercase">
            {banner.title}
          </p>

          <ul className="flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {banner.items.map((item, i) => (
              <li key={`${item.label}-${i}`}>
                <ItemLink item={item}>
                  {item.image_url ? (
                    // An arbitrary uploaded URL, so a plain img rather than
                    // next/image and its host allowlist. Greyed until hovered,
                    // so a row of brand colours does not outshout the page.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt={item.label}
                      className="h-8 w-auto max-w-[10rem] object-contain opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0"
                    />
                  ) : (
                    <span className="text-[15px] text-muted">{item.label}</span>
                  )}
                </ItemLink>
              </li>
            ))}
          </ul>

          {banner.cta_label && banner.cta_url && (
            <CtaLink href={banner.cta_url} label={banner.cta_label} />
          )}
        </div>
      </div>
    </section>
  );
}

/** Cards for selected work, with the picture only where there is one. */
function Showcase({ banner }: { banner: BannerPublic }) {
  return (
    <section className="border-t border-rule">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-16 sm:px-10 lg:py-20">
        <div className="flex flex-col gap-3">
          <h2 className="max-w-[24ch] text-[1.9rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.2rem]">
            {banner.title}
          </h2>
          {banner.subtitle && (
            <p className="max-w-[60ch] text-[15px] leading-[1.7] text-muted">
              {banner.subtitle}
            </p>
          )}
        </div>

        {/* Bordered cards with a gap rather than a one-pixel grid gap over a
            coloured background: that trick needs full rows to read as rules,
            and two cards in a row of three paints a grey slab where the third
            would be. */}
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {banner.items.map((item, i) => (
            <li key={`${item.label}-${i}`}>
              <ItemLink item={item}>
                <article className="group flex h-full flex-col overflow-hidden rounded-[4px] border border-rule bg-canvas transition-colors hover:border-rule-strong">
                  {item.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.image_url}
                      alt=""
                      className="h-40 w-full border-b border-rule object-cover"
                    />
                  )}
                  <div className="flex flex-col gap-2 p-5">
                    <h3 className="text-[16px] leading-snug font-medium text-ink transition-colors group-hover:text-signal">
                      {item.label}
                    </h3>
                    {item.description && (
                      <p className="text-[14px] leading-[1.6] text-muted">{item.description}</p>
                    )}
                  </div>
                </article>
              </ItemLink>
            </li>
          ))}
        </ul>

        {banner.cta_label && banner.cta_url && (
          <div className="mt-8">
            <CtaLink href={banner.cta_url} label={banner.cta_label} />
          </div>
        )}
      </div>
    </section>
  );
}

/** A path stays in the app; anything else is somebody else's site. */
function CtaLink({ href, label }: { href: string; label: string }) {
  const className =
    "inline-flex items-center gap-1.5 font-mono text-label text-signal uppercase underline underline-offset-2 transition-colors hover:text-signal-deep hover:no-underline";

  return href.startsWith("/") ? (
    <Link href={href as never} className={className}>
      {label}
      <span aria-hidden>→</span>
    </Link>
  ) : (
    <a href={href} target="_blank" rel="noreferrer" className={className}>
      {label}
      <span aria-hidden>↗</span>
    </a>
  );
}
