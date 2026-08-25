"use client";

/**
 * Back to the top.
 *
 * The page is built as a climb - kerb, ground, three levels, door - which
 * makes it long by design, and a long page needs a way back that is not the
 * scrollbar. It appears only once there is something to come back from, so it
 * is never a button floating over a hero nobody has scrolled past yet.
 *
 * The threshold is one viewport rather than a fixed pixel count: on a phone a
 * fixed 600px arrives halfway through the first screen, and on a desktop it
 * arrives before the reader has done anything worth undoing.
 */

import { useEffect, useState } from "react";

export function ScrollToTop() {
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const onScroll = () => setShown(window.scrollY > window.innerHeight);
    onScroll();
    // Passive: this handler never calls preventDefault, and saying so keeps it
    // off the critical path of the scroll itself.
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          // Honoured by the browser when the reader has asked for less motion,
          // which is the one case where a long smooth scroll is unpleasant.
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Back to top"
      // Hidden from everything, not just from view: a button that cannot be
      // seen should not be reachable by tab either.
      tabIndex={shown ? 0 : -1}
      aria-hidden={!shown}
      className={`fixed right-5 bottom-5 z-40 grid size-11 place-items-center rounded-full border border-rule-strong bg-surface text-ink shadow-[0_2px_12px_rgba(16,23,28,0.12)] transition-all duration-300 hover:border-signal hover:text-signal sm:right-8 sm:bottom-8 ${
        shown ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-2 opacity-0"
      }`}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
        <path
          d="M8 13V3M8 3 3.5 7.5M8 3l4.5 4.5"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
