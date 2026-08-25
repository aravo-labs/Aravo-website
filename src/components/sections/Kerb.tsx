"use client";

import { useEffect, useState } from "react";

import { BuildingVolume } from "@/components/art/BuildingVolume";
import { Level } from "@/components/primitives";
import { site } from "@/content/site";
import { publicApi } from "@/lib/api/public";
import type { BannerPublic } from "@/lib/api/types";

const { hero, announcement } = site;

/**
 * The announcement bar, from the admin panel when something is published
 * there and from `content/site.ts` otherwise.
 *
 * Fails silently: a marketing page should not show an error strip, or an empty
 * bar, because a CMS call failed.
 */
function useAnnouncement() {
  const [banner, setBanner] = useState<BannerPublic | null>(null);

  useEffect(() => {
    let active = true;
    publicApi
      .banner()
      .then((data) => {
        if (active && data?.variant === "announcement") setBanner(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  if (banner) {
    return {
      text: banner.title,
      linkLabel: banner.cta_label ?? null,
      href: banner.cta_url ?? null,
    };
  }
  return announcement;
}

/**
 * KERB — the hero.
 *
 * The headline states the problem in four words and the drawing shows its
 * consequence, so neither has to carry the argument alone. The copy is set
 * hard left against the elevation rail rather than centred: centred display
 * type over a full-bleed illustration is the arrangement every site in this
 * sector uses, and the asymmetry is what makes the vertical axis legible.
 *
 * The drawing is placed twice rather than once, and that is deliberate. On
 * wide viewports it sits behind the copy, where there is room for both. Below
 * `lg` it moves into the flow underneath, because a section drawing carries
 * its own annotations — LEVEL 03, SIGNAL LOST, DOOR — and those collide with
 * body text at narrow widths no amount of gradient will fix. Two placements
 * with fixed frames also means no JS media query, so nothing shifts after
 * hydration.
 */
export function Kerb() {
  const note = useAnnouncement();

  return (
    <section className="relative flex min-h-svh flex-col">
      {note.text && (
        <div className="relative z-20 border-b border-rule bg-surface/70">
          <div className="mx-auto flex max-w-[var(--shell-max)] flex-wrap items-center justify-center gap-x-3 gap-y-1 px-6 py-2.5 text-center">
            <span aria-hidden className="size-1.5 rounded-full bg-signal" />
            <span className="text-[13px] text-ink-2">{note.text}</span>
            {note.href && note.linkLabel && (
              <a
                href={note.href}
                className="font-mono text-label text-signal uppercase underline underline-offset-2 hover:no-underline"
              >
                {note.linkLabel}
              </a>
            )}
          </div>
        </div>
      )}

      <div className="relative flex flex-1 flex-col">
        {/* drafting grid, under everything */}
        <div
          aria-hidden
          className="tex-grid pointer-events-none absolute inset-0 opacity-70"
        />

        {/* the drawing, wide viewports: behind the copy */}
        <div
          aria-hidden
          className="stage pointer-events-none absolute inset-y-0 right-0 hidden w-[50%] lg:block xl:w-[54%]"
          style={{ "--stage-delay": "80ms" } as React.CSSProperties}
        >
          <BuildingVolume className="h-full w-full" frame="wide" />
        </div>
        {/* wash, so the type stays legible over the drawing */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 hidden bg-[linear-gradient(to_right,var(--color-canvas)_0%,var(--color-canvas)_48%,transparent_70%)] lg:block"
        />

        {/* copy */}
        <div className="relative z-10 mx-auto flex w-full max-w-[var(--shell-max)] flex-1 items-center px-6 py-14 sm:px-10 lg:py-20 lg:pl-[calc(var(--rail-w)+1rem)]">
          <div
            className="stage flex flex-col items-start gap-6"
            style={{ "--stage-delay": "420ms" } as React.CSSProperties}
          >
            <div className="flex items-center gap-4">
              <Level tone="signal">{hero.level}</Level>
              <span className="font-mono text-label text-faint uppercase">
                {hero.elevation}
              </span>
            </div>

            <h1 className="max-w-[15ch] text-[2.4rem] leading-[1.0] font-normal tracking-[-0.022em] text-ink sm:text-[3.4rem] xl:text-[4rem]">
              {hero.headline.lead}{" "}
              <span className="text-signal">{hero.headline.accent}</span>
              <br />
              <span className="text-ink-2">{hero.headline.rest}</span>
            </h1>

            <p className="max-w-[46ch] text-[15px] leading-[1.65] text-muted sm:text-lede">
              {hero.body}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-3">
              <a
                href={hero.primary.href}
                className="rounded-[3px] bg-signal px-6 py-3.5 font-mono text-label text-white uppercase transition-colors hover:bg-signal-deep"
              >
                {hero.primary.label}
              </a>
              <a
                href={hero.secondary.href}
                className="rounded-[3px] border border-rule-strong bg-surface px-6 py-3.5 font-mono text-label text-ink uppercase transition-colors hover:border-ink hover:bg-ink hover:text-white"
              >
                {hero.secondary.label}
              </a>
              {/* Quieter than the other two on purpose: it goes to a section
                  of this same page, not to a form or another site. */}
              <a
                href={hero.tertiary.href}
                className="group flex items-center gap-2 px-2 py-3.5 font-mono text-label text-signal uppercase transition-colors hover:text-signal-deep"
              >
                {hero.tertiary.label}
                <span aria-hidden className="transition-transform group-hover:translate-y-0.5">
                  &darr;
                </span>
              </a>
            </div>

            {/* Signal decay, stated as data rather than left implied.
                The bars grow from their baseline, left to right, so the
                readout reads as a measurement being taken rather than a
                static legend. */}
            <dl className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4 border-t border-rule pt-6 lg:mt-8">
              {hero.signal.map((s, si) => (
                <div key={s.level} className="flex flex-col gap-2">
                  <dt className="font-mono text-[9px] tracking-[0.14em] text-faint uppercase">
                    {s.level}
                  </dt>
                  <dd
                    className="flex items-end gap-[3px]"
                    title={`${s.bars} of 4`}
                  >
                    {[0, 1, 2, 3].map((b) => (
                      <span
                        key={b}
                        style={
                          {
                            height: `${4 + b * 3}px`,
                            "--bar-delay": `${1200 + si * 90 + b * 45}ms`,
                          } as React.CSSProperties
                        }
                        className={`hero-bar w-[3px] ${
                          b < s.bars ? "bg-blueprint" : "bg-blueprint-soft"
                        }`}
                      />
                    ))}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* the drawing, narrow viewports: in the flow, with room of its own */}
        <div
          aria-hidden
          className="stage relative z-10 h-[320px] w-full border-t border-rule bg-canvas/60 lg:hidden"
          style={{ "--stage-delay": "80ms" } as React.CSSProperties}
        >
          <BuildingVolume className="h-full w-full" frame="narrow" />
        </div>
      </div>

      {/* the instruction the whole page depends on */}
      <div className="relative z-10 flex items-center justify-center gap-3 border-t border-rule py-4">
        <span className="font-mono text-label text-faint uppercase">
          {hero.scrollHint}
        </span>
        <span aria-hidden className="h-4 w-px bg-rule-strong" />
      </div>
    </section>
  );
}
