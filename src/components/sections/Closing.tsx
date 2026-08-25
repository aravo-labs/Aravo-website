"use client";

import Link from "next/link";

import { Icons } from "@/components/art/Icons";
import { Brand } from "@/components/Brand";
import { Level } from "@/components/primitives";
import { site } from "@/content/site";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";

const { cta, footer } = site;

/**
 * DOOR — arrival, then the footer.
 *
 * The last level of the ascent, so it is marked as one. The CTA sits on the
 * hatched ground plane the hero started from, which closes the drawing: you
 * left the kerb at the top of the page and you are at the door at the bottom.
 */
type Action = { label: string; href: string };

export function Closing({
  heading,
  actions,
}: {
  /** Override the CTA headline; falls back to the site-wide one. */
  heading?: { lead: string; accent: string };
  /**
   * Override the two buttons. The careers page needs this: the site-wide pair
   * asks for SDK access, which is not what someone reading a job advert came
   * to do, and a call to action aimed at the wrong reader is worse than none.
   */
  actions?: { primary: Action; secondary: Action };
}) {
  const head = heading ?? cta.heading;

  /**
   * The site's own settings. Undefined until the API answers, which is why
   * the hiring link renders on `!== false` rather than on `=== true`: the
   * common case is that it is on, and flashing it away and back on every page
   * load would be worse than showing it a moment early.
   */
  const settings = useAsync(() => publicApi.siteSettings(), []);
  const hiringShown = settings.data?.hiring_enabled !== false;
  const companyName = settings.data?.company_name ?? "Aravo";
  const primary = actions?.primary ?? cta.primary;
  const secondary = actions?.secondary ?? cta.secondary;

  // The two profiles, if they exist. An unset one is not a link.
  const socials = [
    {
      id: "linkedin",
      label: "LinkedIn",
      href: settings.data?.linkedin_url,
      Icon: Icons.linkedin,
    },
    { id: "x", label: "X", href: settings.data?.x_url, Icon: Icons.x },
  ].filter((s): s is typeof s & { href: string } => Boolean(s.href));

  /**
   * The pages written in the panel that asked to be in the footer.
   *
   * The policies used to be two hard-coded links to two hard-coded routes.
   * Reading them from the same place the pages themselves come from is what
   * lets somebody rename, add or retire one without a deploy - and what makes
   * a rename safe, since the link follows the page rather than pointing at
   * where it used to be.
   */
  const pages = useAsync(() => publicApi.pages(), []);
  const standalonePages = (pages.data?.items ?? []).filter((p) => p.show_in_footer);

  return (
    <>
      <section className="relative border-t border-rule">
        <div className="tex-ticks h-8 border-b border-rule opacity-60" />

        <div className="relative overflow-hidden">
          <div className="tex-hatch absolute inset-0 opacity-70" />

          <div className="relative mx-auto w-full max-w-[var(--shell-max)] px-6 py-20 sm:px-10 lg:py-28 lg:pl-[calc(var(--rail-w)+1rem)]">
            <div
              data-reveal
              className="flex flex-col items-start gap-7 md:flex-row md:items-end md:justify-between md:gap-12"
            >
              <div className="flex flex-col items-start gap-5">
                <Level tone="signal">{cta.level}</Level>
                {/* Two sentences, so they get a line each rather than
                    wrapping mid-phrase. */}
                <h2 className="max-w-[20ch] text-[2rem] leading-[1.02] font-normal tracking-[-0.022em] text-ink sm:text-[2.75rem]">
                  {head.lead}
                  <br />
                  <span className="text-signal">{head.accent}</span>
                </h2>
                {!heading && (
                  <p className="max-w-[42ch] text-[15px] leading-[1.6] text-muted">
                    {cta.body}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 flex-wrap items-center gap-3">
                <a
                  href={secondary.href}
                  className="rounded-[3px] border border-rule-strong bg-surface px-6 py-3.5 font-mono text-label text-ink uppercase transition-colors hover:border-ink"
                >
                  {secondary.label}
                </a>
                <a
                  href={primary.href}
                  className="rounded-[3px] bg-signal px-6 py-3.5 font-mono text-label text-white uppercase transition-colors hover:bg-signal-deep"
                >
                  {primary.label}
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* the ground plane the ascent started from */}
        <div className="tex-ground h-10 border-t border-ink/70 opacity-70" />
      </section>

      <footer className="border-t border-rule bg-sunken/40">
        <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-14 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
          <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <Brand />
              <p className="mt-3.5 max-w-[38ch] text-[13.5px] leading-[1.6] text-muted">
                {footer.tagline}
              </p>
            </div>

            {/* Only the profiles that exist. The version this replaces listed
                both networks unconditionally and pointed them at
                linkedin.com and x.com, which reads as a real link right up
                until somebody clicks it. */}
            <div className="flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.id}
                  href={s.href}
                  aria-label={s.label}
                  target="_blank"
                  rel="noreferrer"
                  className="grid size-9 place-items-center rounded-[3px] border border-rule bg-surface text-muted transition-colors hover:border-ink hover:text-ink"
                >
                  <s.Icon className="size-4" />
                </a>
              ))}
            </div>
          </div>

          {/* One row: the links, then the notice at the far end of it. The
              copyright used to sit on a rule of its own underneath, which gave
              a single line of small grey type a whole band of the page. */}
          <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-rule pt-6">
            {footer.links.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-[14px] text-ink-2 transition-colors hover:text-signal"
              >
                {l.label}
              </a>
            ))}

            {/* The policies, and anything else written in the panel that asked
                to be here. Their titles are the author's too: renaming the
                privacy policy renames the link rather than leaving the footer
                saying something the page no longer says. */}
            {standalonePages.map((p) => (
              <Link
                key={p.slug}
                href={`/${p.slug}` as never}
                className="text-[14px] text-ink-2 transition-colors hover:text-signal"
              >
                {p.title}
              </Link>
            ))}
            {hiringShown && (
              <a
                href={footer.hiring.href}
                className="flex items-center gap-2.5 text-[14px] text-ink-2 transition-colors hover:text-signal"
              >
                {footer.hiring.label}
                <span className="rounded-[2px] border border-signal/25 bg-signal-soft px-2 py-0.5 font-mono text-[9px] tracking-[0.12em] text-signal-deep uppercase">
                  {footer.hiring.badge}
                </span>
              </a>
            )}

            {/* `sm:ml-auto` rather than a spacer on the last link: the
                hiring entry is conditional, so anything that leaned on it
                would stop pushing the moment hiring was switched off. Below
                sm it sits in the flow with the links instead of being right
                aligned on a line of its own. */}
            <span className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase sm:ml-auto">
              {footer.copyright.replace("Aravo", companyName)}
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
