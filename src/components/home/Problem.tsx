"use client";

/**
 * The problem, with the numbers the deck puts on it.
 *
 * Two figures and three failures. The figures are the reason anybody keeps
 * reading, so they are set large and given their source underneath: a rupee
 * number on a marketing page with no provenance is a claim somebody will
 * eventually be asked to defend, and "estimated" is a cheap word to include
 * now and an expensive one to add later.
 *
 * The three failures are a numbered list rather than three cards. They are not
 * parallel options to choose between; they are one argument in three steps -
 * the fix does not work, the workaround does not work, so the dispute cannot
 * be settled - and reading order carries that.
 */

import Image from "next/image";

import { home } from "@/content/home";

export function Problem() {
  const { problem } = home;

  return (
    <section id="problem" className="relative border-b border-rule bg-sunken/40">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-16 sm:px-10 lg:py-24">
        <span className="flex items-center gap-2.5 font-mono text-label text-alert uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-alert" />
          {problem.eyebrow}
        </span>

        <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-16">
          <h2 className="max-w-[20ch] text-[1.75rem] leading-[1.2] font-normal tracking-[-0.018em] text-ink sm:text-[2.2rem]">
            {problem.heading}
          </h2>
          <p className="self-end text-[15px] leading-[1.7] text-muted sm:text-lede">
            {problem.lede}
          </p>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,30rem)] lg:gap-16">
          <div className="flex flex-col gap-10">
            {/* the numbers */}
            <dl className="flex flex-col gap-6 border-y border-rule py-8">
              {problem.stats.map((stat) => (
                <div key={stat.value} className="flex flex-col gap-1">
                  <dt className="text-[2rem] leading-none font-normal tracking-[-0.02em] text-alert tabular-nums sm:text-[2.4rem]">
                    {stat.value}
                  </dt>
                  <dd className="flex flex-col gap-0.5">
                    <span className="text-[15px] text-ink">{stat.label}</span>
                    <span className="text-[13px] text-faint">{stat.note}</span>
                  </dd>
                </div>
              ))}
            </dl>

            {/* the three failures, in order */}
            <ol className="flex flex-col divide-y divide-rule border-t border-rule">
              {problem.failures.map((failure, i) => (
                <li key={failure.title} className="flex gap-5 py-6">
                  <span className="font-mono text-label text-alert">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-[16px] leading-snug font-medium text-ink">
                      {failure.title}
                    </h3>
                    <p className="text-[14.5px] leading-[1.65] text-muted">{failure.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <figure className="flex flex-col gap-3 lg:sticky lg:top-24 lg:self-start">
            <Image
              src="/img/gps-vs-actual.jpg"
              alt="An aerial view of a block. The actual drop-off is marked at apartment 6A on the sixth floor; what GPS detected is marked out on the street, a building away."
              width={971}
              height={1086}
              sizes="(max-width: 1024px) 100vw, 480px"
              quality={90}
              className="h-auto w-full rounded-[4px] border border-rule"
            />
            <figcaption className="text-[13px] text-faint">
              Same address. Different floor, different door.
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
