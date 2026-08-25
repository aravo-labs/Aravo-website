"use client";

import { DeliveryConsole } from "@/components/art/DeliveryConsole";
import { site } from "@/content/site";

const { evidence } = site;

/**
 * LEVEL 02 — the record.
 *
 * This was a table of timestamps. A table is the one arrangement that hides
 * what the product actually knows: not that four events happened, but where
 * they happened and how far apart. Putting the floor on a vertical axis turns
 * the climb into a shape you read in a glance, which is the argument.
 *
 * Stepping through the events drives the drawing, so the reader can find the
 * moment they care about rather than reading four rows in order.
 *
 * It is still labelled a sample in the frame, not in a footnote. Presenting
 * illustrative data as though it came from a customer is the one thing a page
 * like this must not do.
 */
export function Evidence() {
  const { outcomes } = evidence;

  return (
    <section id="dashboard" className="relative border-t border-rule">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        <div className="grid gap-8 py-16 md:grid-cols-[1fr_minmax(0,24rem)] md:gap-16 lg:py-24">
          <div data-reveal className="flex flex-col items-start gap-5">
            {/* The dotted eyebrow the deck's sections use. "LEVEL 02" was a
                marker in the ascent arrangement, and that page is gone - a
                floor number on a page with no floors is a label pointing at
                nothing. */}
            <span className="flex items-center gap-2.5 font-mono text-label text-signal uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              {evidence.eyebrow}
            </span>
            <h2 className="max-w-[18ch] text-[1.9rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.4rem]">
              {evidence.heading.lead}{" "}
              <span className="text-signal">{evidence.heading.accent}</span>
            </h2>
          </div>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="self-end text-[15px] leading-[1.65] text-muted sm:text-lede"
          >
            {evidence.lede}
          </p>
        </div>

        <div data-reveal>
          <DeliveryConsole label={evidence.sample.label} reference={evidence.sample.reference} />
        </div>

        {/* What the record is for. The console shows the shape of the data;
            these say why anyone would want it. */}
        <div className="grid gap-px border-t border-rule bg-rule pt-px sm:grid-cols-3">
          {outcomes.map((o, i) => (
            <div
              key={o.title}
              data-reveal
              style={{ "--reveal-delay": `${i * 80}ms` } as React.CSSProperties}
              className="flex flex-col gap-2 bg-canvas px-1 py-8 sm:px-6"
            >
              <h3 className="text-[15px] leading-snug font-medium text-ink">{o.title}</h3>
              <p className="text-[14px] leading-[1.6] text-muted">{o.body}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
