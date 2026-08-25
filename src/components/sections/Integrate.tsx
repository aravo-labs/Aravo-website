"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { Icons } from "@/components/art/Icons";
import { CodeBlock, type CodeTheme } from "@/components/code/CodeBlock";
import { RichText } from "@/components/docs/RichText";
import { home } from "@/content/home";
import { site } from "@/content/site";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";

const { integrate } = site;
/* Headline and lede come from the deck; the steps, snippet and questions
   stay where they were. */
const copy = home.integrate;

/**
 * The platform's own mark, chosen by its slug.
 *
 * Drawn rather than uploaded, so the row is one weight and one colour and
 * follows the text around it. A platform the site has no mark for falls back
 * to a generic device outline instead of a broken image; an admin who wants
 * something specific uploads it, and that wins.
 */
/** Which drawn mark belongs to a platform, by its slug. Null: we have none. */
function markFor(slug: string): "ios" | "android" | "flutter" | "react" | null {
  const key = slug.toLowerCase();
  if (key.includes("ios") || key.includes("apple") || key.includes("swift")) return "ios";
  if (key.includes("android") || key.includes("kotlin")) return "android";
  if (key.includes("flutter") || key.includes("dart")) return "flutter";
  if (key.includes("react") || key.includes("native")) return "react";
  return null;
}

function PlatformIcon({ slug, className }: { slug: string; className?: string }) {
  // Named rather than resolved into a local binding: a component held in a
  // variable and rendered from it reads to the linter as a component being
  // defined mid-render, and it is right to be suspicious of that.
  switch (markFor(slug)) {
    case "ios":
      return <Icons.ios className={className} />;
    case "android":
      return <Icons.android className={className} />;
    case "flutter":
      return <Icons.flutter className={className} />;
    case "react":
      return <Icons.react className={className} />;
    default:
      return <Icons.package className={className} />;
  }
}

/**
 * LEVEL 03 — integrate.
 *
 * A developer-facing section, so it leads with the code rather than with a
 * picture of code. The four steps sit alongside the snippet as a numbered
 * scale, which keeps the "four calls" claim in the headline verifiable at a
 * glance — you can count them.
 *
 * The FAQ is a real <details> list. It is keyboard operable, it is open to
 * find-in-page, and it needs no state, which is three reasons to prefer it
 * over a hand-built accordion.
 *
 * Platforms and questions come from the admin panel. Both fall back to what
 * is bundled here if the API is slow or unreachable: this is the section that
 * explains the product, and it going blank because a request failed would be
 * a worse failure than showing copy that is a week out of date.
 */
export function Integrate() {
  const platforms = useAsync(() => publicApi.platforms(), []);
  const questions = useAsync(() => publicApi.faqs(), []);

  const live = platforms.data?.items ?? [];
  const [selected, setSelected] = useState(0);
  const platform = live[Math.min(selected, Math.max(live.length - 1, 0))];

  const faqs = questions.data?.items.length
    ? questions.data.items.map((f) => ({
        q: f.question,
        a: f.answer_html,
        html: true,
      }))
    : integrate.faq.map((f) => ({ q: f.q, a: f.a, html: false }));

  return (
    <section id="integrate" className="relative border-t border-rule bg-sunken/40">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        <div className="grid gap-8 py-16 md:grid-cols-[1fr_minmax(0,24rem)] md:gap-16 lg:py-24">
          <div data-reveal className="flex flex-col items-start gap-5">
            <span className="flex items-center gap-2.5 font-mono text-label text-signal uppercase">
              <span aria-hidden className="size-1.5 rounded-full bg-signal" />
              {copy.eyebrow}
            </span>
            <h2 className="max-w-[18ch] text-[1.9rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.4rem]">
              {copy.heading.lead} <span className="text-signal">{copy.heading.accent}</span>{" "}
              {copy.heading.tail}
            </h2>
          </div>
          <p
            data-reveal
            style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
            className="self-end text-[15px] leading-[1.65] text-muted sm:text-lede"
          >
            {copy.lede}
          </p>
        </div>

        {/* What the four lines buy, before the four lines. The rail-offset
            padding above does not apply here, so the film spans the column. */}
        <figure
          data-reveal
          className="overflow-hidden rounded-[4px] border border-rule bg-canvas"
        >
          <IntegrationFilm />
        </figure>

        {/* steps + code */}
        <div
          data-reveal
          className="mt-10 grid gap-px border border-rule bg-rule lg:grid-cols-[minmax(0,20rem)_1fr]"
        >
          {/* the four calls, countable */}
          <ol className="flex flex-col divide-y divide-rule bg-canvas">
            {integrate.steps.map((s) => (
              <li key={s.code} className="flex gap-4 px-6 py-5">
                <span className="font-mono text-label text-signal">{s.code}</span>
                <div className="flex flex-col gap-1">
                  <h3 className="text-[15px] font-medium tracking-[-0.01em] text-ink">
                    {s.label}
                  </h3>
                  <p className="text-[13.5px] leading-[1.55] text-muted">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>

          {/* The snippet, with the platform picker on the block it changes.

              Choosing which language you are reading belongs on the code, the
              way it does in every set of API documentation. It used to live on
              the cards below, which meant clicking a platform did two
              unrelated things at once. Those cards are now a way to the docs
              and nothing else. */}
          <div className="flex min-w-0 flex-col bg-canvas">
            {live.length > 1 && (
              <div className="flex flex-wrap gap-px bg-rule">
                {live.map((p, i) => {
                  const current = p.id === platform?.id;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelected(i)}
                      aria-pressed={current}
                      /* The selected tab is painted in the code block's own
                         colour, so the two read as one object rather than as a
                         control sitting above an unrelated panel. */
                      className={`flex items-center gap-2 px-5 py-3 font-mono text-[10px] tracking-[0.12em] uppercase transition-colors ${
                        current
                          ? "bg-ink text-white"
                          : "bg-sunken text-muted hover:bg-canvas hover:text-ink"
                      }`}
                    >
                      <PlatformIcon slug={p.slug} className="size-3.5" />
                      {p.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* The bundled sample is a set: code, language and filename
                together. Taking the code from here and the label from the
                platform row printed Kotlin under the word SWIFT the moment a
                platform was added without a snippet, which is worse than
                showing the same sample twice. */}
            {(() => {
              const written = platform?.code_snippet?.trim();
              const sample = written
                ? {
                    code: written,
                    language: platform?.code_language ?? null,
                    filename: platform?.code_filename ?? null,
                  }
                : integrate.snippet;
              return (
                <CodeBlock
                  code={sample.code}
                  language={sample.language}
                  filename={sample.filename}
                  theme={(platform?.code_theme as CodeTheme) ?? "ink"}
                  className="flex-1"
                />
              );
            })()}
          </div>
        </div>

        {/* The platforms, managed in the admin panel.

            A mark and a name, and the whole tile is a link into that
            platform's documentation. The cards this replaces carried a
            picture, a tagline and a paragraph each, which made a row of three
            taller than the code sample it sat under and buried the one thing
            a developer wanted from it: is my platform on the list, and where
            are its docs. */}
        {live.length > 0 && (
          <div data-reveal className="mt-10 border-y border-rule py-8">
            <span className="font-mono text-label text-faint uppercase">Runs on</span>

            <ul className="mt-5 flex flex-wrap gap-3">
              {live.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/docs?platform=${p.slug}` as never}
                    className="group flex items-center gap-3 rounded-[4px] border border-rule bg-canvas py-3 pr-5 pl-4 transition-colors hover:border-signal/40 hover:bg-signal-wash"
                  >
                    {/* The platform's own mark, where the site has one. An
                        upload only stands in for a platform nothing here can
                        draw: the images already on these rows were banners for
                        the cards this replaced, and a landscape photograph
                        scaled to 28px is not a logo. */}
                    {markFor(p.slug) || !p.image_url ? (
                      <PlatformIcon
                        slug={p.slug}
                        className="size-6 shrink-0 text-ink transition-colors group-hover:text-signal"
                      />
                    ) : (
                      // An arbitrary uploaded URL, so a plain img rather than
                      // next/image and its host allowlist.
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image_url}
                        alt=""
                        className="size-7 shrink-0 rounded-[3px] object-contain"
                      />
                    )}
                    <span className="text-[15px] font-medium text-ink transition-colors group-hover:text-signal">
                      {p.name}
                    </span>
                    <span
                      aria-hidden
                      className="text-[13px] text-faint transition-colors group-hover:text-signal"
                    >
                      →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/*
          FAQ.

          Full width and numbered, rather than a heading in a narrow left
          column beside the list. The two-column version left a tall void
          under the heading, broke the heading across two lines mid-phrase,
          and sat outside the numbering every other list on this page uses.
          Numbering it ties it to the 01–04 steps directly above.
        */}
        <div className="mt-16 mb-20 lg:mb-28">
          <h3
            data-reveal
            className="mb-1 text-[1.35rem] leading-[1.2] font-medium tracking-[-0.015em] text-ink"
          >
            {integrate.faqHeading}
          </h3>

          <ul data-reveal className="mt-6 border-t border-rule">
            {faqs.map((item, i) => (
              <li key={item.q} className="border-b border-rule">
                <Faq index={i + 1} q={item.q} a={item.a} html={item.html} />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

/**
 * One FAQ row: a mono index, the question, and the answer indented beneath it.
 *
 * `<details>` does the disclosure, so it is keyboard operable and open to
 * find-in-page for free. The state here only drives the chevron rotation, so
 * losing JavaScript costs the rotation and nothing else.
 *
 * The grid is declared once on the row and reused by the answer, which is what
 * keeps the answer's text edge aligned with the question's rather than with
 * the index.
 */
function Faq({
  index,
  q,
  a,
  html,
}: {
  index: number;
  q: string;
  a: string;
  /** Answers from the admin panel are formatted; the bundled fallbacks are plain. */
  html: boolean;
}) {
  const [open, setOpen] = useState(false);
  const num = String(index).padStart(2, "0");

  return (
    <details
      className="group"
      onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
    >
      <summary className="grid cursor-pointer list-none grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-4 py-5 [&::-webkit-details-marker]:hidden">
        <span
          className={`font-mono text-label transition-colors ${
            open ? "text-signal" : "text-faint group-hover:text-signal"
          }`}
        >
          {num}
        </span>
        <span className="text-[15.5px] leading-[1.4] font-medium text-ink transition-colors group-hover:text-signal">
          {q}
        </span>
        <Icons.chevron
          className={`size-4 shrink-0 self-center text-muted transition-transform duration-300 ${
            open ? "rotate-180" : ""
          }`}
        />
      </summary>

      <div className="grid grid-cols-[2.5rem_1fr] gap-x-4 pb-6">
        <span aria-hidden />
        {html ? (
          <RichText html={a} className="max-w-[70ch] text-[14.5px]" />
        ) : (
          <p className="max-w-[70ch] text-[14.5px] leading-[1.7] text-muted">{a}</p>
        )}
      </div>
    </details>
  );
}

/**
 * The integration film.
 *
 * The whole journey with the SDK's own labels drawn over it: the fix landing
 * at the kerb, the entrance, the climb to the sixth floor, the drop-off
 * confirmed at a numbered door. It sits above the snippet because "four lines
 * of code" means nothing until you can see what the four lines are watching,
 * and this one names each event as it happens.
 *
 * Muted, looping, inline: the only combination browsers autoplay, and the
 * honest one, since there is no sound and nobody pressed play. Readers who
 * have asked for less motion get the still frame instead.
 */
function IntegrationFilm() {
  const video = useRef<HTMLVideoElement>(null);
  const [still, setStill] = useState(false);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => {
      setStill(reduced.matches);
      if (reduced.matches) video.current?.pause();
    };
    apply();
    reduced.addEventListener("change", apply);
    return () => reduced.removeEventListener("change", apply);
  }, []);

  if (still) {
    return (
      <Image
        src="/img/integrate-poster.jpg"
        alt="A courier tracked from the street to a sixth-floor door, each step labelled: GPS detected, entrance, floor, drop-off confirmed."
        width={1920}
        height={1080}
        sizes="(max-width: 1150px) 100vw, 1090px"
        className="h-auto w-full"
      />
    );
  }

  return (
    <video
      ref={video}
      className="h-auto w-full"
      autoPlay
      muted
      loop
      playsInline
      poster="/img/integrate-poster.jpg"
      aria-label="A courier is followed from the street to a sixth-floor door, with each detected event labelled in turn: the satellite fix, the entrance, the floors climbed, and the package delivered to apartment 6B."
    >
      <source src="/video/integrate.mp4" type="video/mp4" />
    </video>
  );
}
