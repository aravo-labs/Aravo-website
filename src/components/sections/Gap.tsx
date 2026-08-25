import Image from "next/image";

import { Level } from "@/components/primitives";
import { site } from "@/content/site";

const { gap } = site;

/**
 * GROUND — the gap.
 *
 * The hero showed a section; this shows the same building in PLAN, because the
 * discrepancy it has to communicate is horizontal: the fix lands somewhere in
 * the footprint, the package went somewhere else. Switching drawing type
 * rather than repeating one is what keeps the two figures from reading as the
 * same picture twice.
 *
 * The three failures are set as a numbered vertical list rather than a row of
 * cards. Cards imply three parallel, equivalent things; this is one argument
 * in three steps, and the reading order matters.
 */
export function Gap() {
  return (
    <section id="gap" className="relative border-t border-rule">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        {/* header */}
        <div className="grid gap-8 py-16 md:grid-cols-[1fr_minmax(0,24rem)] md:gap-16 lg:py-24">
          <div data-reveal className="flex flex-col items-start gap-5">
            <Level>{gap.level}</Level>
            <span className="font-mono text-label text-signal uppercase">
              {gap.eyebrow}
            </span>
            <h2 className="max-w-[18ch] text-[2rem] leading-[1.05] font-normal tracking-[-0.018em] text-ink sm:text-[2.6rem]">
              {gap.heading.lead}{" "}
              <span className="text-signal">{gap.heading.accent}</span>
            </h2>
          </div>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="self-end text-[15px] leading-[1.65] text-muted sm:text-lede"
          >
            {gap.lede}
          </p>
        </div>

        {/* the divergence figure */}
        <figure
          data-reveal
          className="relative mx-auto w-full max-w-[724px] overflow-hidden border border-rule bg-surface"
        >
            <div className="relative">
            {/* Sized to the file rather than to the column. The source is
                1448px wide, so 724 CSS pixels is exactly two device pixels per
                image pixel - the sharpest this artwork can be on a retina
                screen. Any wider and the browser is inventing detail, which on
                fine blue linework reads immediately as mush. Quality is raised
                from the default too: flat colour and hairlines are what JPEG
                compression damages most visibly. */}
            <Image
              src="/img/gps-vs-actual.jpg"
              alt={`An aerial view of a block. ${gap.figure.actualLabel} marks apartment 6A on the sixth floor; ${gap.figure.fixLabel} marks a pin out on the street, a building away.`}
              width={1448}
              height={1086}
              sizes="(max-width: 760px) 100vw, 724px"
              quality={90}
              priority={false}
              className="h-auto w-full"
            />
          </div>
          <figcaption className="relative flex flex-wrap items-center justify-between gap-3 border-t border-rule bg-surface px-5 py-3">
            <span className="font-mono text-label text-faint uppercase">
              {gap.figure.caption}
            </span>
            <span className="text-[13px] text-muted">{gap.figure.note}</span>
          </figcaption>
        </figure>

        {/* the three failures */}
        <ol className="mt-16 mb-20 divide-y divide-rule border-t border-rule lg:mb-28">
          {gap.items.map((item, i) => (
            <li
              key={item.code}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
              className="grid gap-4 py-9 md:grid-cols-[4rem_1fr_minmax(0,32rem)] md:gap-8"
            >
              <span className="font-mono text-label text-signal">{item.code}</span>
              <h3 className="max-w-[22ch] text-[1.2rem] leading-[1.25] font-medium tracking-[-0.02em] text-ink">
                {item.title}
              </h3>
              <p className="text-[15px] leading-[1.65] text-muted">{item.body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
