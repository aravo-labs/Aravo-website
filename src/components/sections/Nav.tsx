"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { Brand } from "@/components/Brand";
import { site } from "@/content/site";

/**
 * The site header.
 *
 * Set flush left past the elevation rail rather than centred in a container,
 * so the header sits on the same axis as every section below it. Gains a rule
 * and a blur once the page has moved, which is the only state it has.
 */
export function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      /* Near-opaque rather than translucent: the integrate section puts a
         dark code panel directly under this bar, and at /85 it read through
         the blur as a grey smear across the nav. */
      className={`sticky top-0 z-40 transition-colors duration-300 ${
        scrolled
          ? "border-b border-rule bg-canvas/95 backdrop-blur-md"
          : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex w-full max-w-[var(--shell-max)] items-center justify-between gap-6 px-6 py-4 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        <Link href="/">
          <Brand />
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {site.nav.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              className="font-mono text-label text-ink-2 uppercase transition-colors hover:text-signal"
            >
              {l.label}
            </a>
          ))}
          <a
            href={site.nav.cta.href}
            className="rounded-[3px] bg-ink px-5 py-2.5 font-mono text-label text-white uppercase transition-colors hover:bg-signal"
          >
            {site.nav.cta.label}
          </a>
        </nav>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
          className="flex size-9 items-center justify-center md:hidden"
        >
          <span className="relative block h-3 w-5">
            <span
              className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                open ? "top-1.5 rotate-45" : "top-0"
              }`}
            />
            <span
              className={`absolute left-0 block h-px w-5 bg-ink transition-transform duration-300 ${
                open ? "top-1.5 -rotate-45" : "top-3"
              }`}
            />
          </span>
        </button>
      </div>

      {/* mobile drawer */}
      <div
        className={`overflow-hidden border-t border-rule bg-canvas transition-[max-height] duration-300 md:hidden ${
          open ? "max-h-72" : "max-h-0 border-t-transparent"
        }`}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {site.nav.links.map((l) => (
            <a
              key={l.label}
              href={l.href}
              onClick={() => setOpen(false)}
              className="py-2.5 font-mono text-label text-ink-2 uppercase"
            >
              {l.label}
            </a>
          ))}
          <a
            href={site.nav.cta.href}
            className="mt-2 rounded-[3px] bg-ink px-5 py-3 text-center font-mono text-label text-white uppercase"
          >
            {site.nav.cta.label}
          </a>
        </nav>
      </div>
    </header>
  );
}
