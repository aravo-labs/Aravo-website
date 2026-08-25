"use client";

import { Icons } from "@/components/art/Icons";
import { EventCode, Level } from "@/components/primitives";
import { site } from "@/content/site";

const { sequence } = site;

/**
 * LEVEL 01 — the four events.
 *
 * Laid out as an actual vertical sequence with a connecting spine, because the
 * events happen in an order and that order is the product. The conventional
 * four-across feature row would flatten the one thing worth communicating
 * here: that these are consecutive, and that each is detected from a
 * different signal.
 *
 * Each row names the sensor evidence it comes from. That is the detail a
 * developer evaluating this actually wants, and it is what separates a claim
 * from a mechanism.
 */
export function Sequence() {
  return (
    <section id="sequence" className="relative border-t border-rule bg-sunken/40">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        <div className="grid gap-8 py-16 md:grid-cols-[1fr_minmax(0,24rem)] md:gap-16 lg:py-24">
          <div data-reveal className="flex flex-col items-start gap-5">
            <Level>{sequence.level}</Level>
            <span className="font-mono text-label text-signal uppercase">
              {sequence.eyebrow}
            </span>
            <h2 className="max-w-[18ch] text-[2rem] leading-[1.05] font-normal tracking-[-0.018em] text-ink sm:text-[2.6rem]">
              {sequence.heading.lead}{" "}
              <span className="text-signal">{sequence.heading.accent}</span>
            </h2>
          </div>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="self-end text-[15px] leading-[1.65] text-muted sm:text-lede"
          >
            {sequence.lede}
          </p>
        </div>

        {/* the sequence itself */}
        <ol className="relative pb-6">
          {/* the spine that makes it a sequence rather than a list */}
          <span
            aria-hidden
            className="absolute top-3 bottom-14 left-[15px] w-px bg-rule-strong sm:left-[19px]"
          />

          {sequence.events.map((ev, i) => {
            const Icon = Icons[ev.icon as keyof typeof Icons];
            const last = i === sequence.events.length - 1;
            return (
              <li
                key={ev.id}
                data-reveal
                style={{ "--reveal-delay": `${i * 70}ms` } as React.CSSProperties}
                className="relative grid grid-cols-[2rem_1fr] gap-x-5 pb-11 sm:grid-cols-[2.5rem_1fr] sm:gap-x-7"
              >
                {/* the node */}
                <span
                  className={`relative z-10 grid size-8 place-items-center rounded-full border sm:size-10 ${
                    last
                      ? "border-signal bg-signal text-white"
                      : "border-rule-strong bg-surface text-blueprint"
                  }`}
                >
                  <Icon className="size-[17px] sm:size-[19px]" />
                  {last && (
                    <span className="pulse-signal absolute -inset-1 rounded-full bg-signal" />
                  )}
                </span>

                <div className="grid gap-x-10 gap-y-3 pt-1 md:grid-cols-[1fr_minmax(0,30rem)]">
                  <div className="flex flex-col gap-2.5">
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                      <h3 className="text-[1.2rem] leading-[1.2] font-medium tracking-[-0.02em] text-ink">
                        {ev.title}
                      </h3>
                      <EventCode>{ev.event}</EventCode>
                    </div>
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.1em] text-blueprint uppercase">
                      <span aria-hidden className="h-px w-3 bg-blueprint-mid" />
                      {ev.detected}
                    </span>
                  </div>
                  <p className="text-[15px] leading-[1.65] text-muted">{ev.body}</p>
                </div>
              </li>
            );
          })}
        </ol>

        <p
          data-reveal
          className="mb-20 max-w-[62ch] border-t border-rule pt-6 text-[14px] leading-[1.6] text-muted lg:mb-28"
        >
          {sequence.footnote}
        </p>
      </div>
    </section>
  );
}
