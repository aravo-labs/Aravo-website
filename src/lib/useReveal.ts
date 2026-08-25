"use client";

import { useEffect } from "react";

/**
 * Adds data-visible="true" to every [data-reveal] element once it scrolls
 * into view. Pairs with the CSS transition in globals.css.
 *
 * It also watches for elements added later. That matters as soon as any part
 * of a page is fetched rather than rendered at mount: content that arrives
 * after the observer was set up would otherwise sit at opacity 0 forever,
 * which looks exactly like an empty page rather than a bug.
 */
export function useReveal() {
  useEffect(() => {
    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const show = (el: Element) => el.setAttribute("data-visible", "true");

    if (reducedMotion) {
      const revealAll = () =>
        document.querySelectorAll("[data-reveal]").forEach(show);
      revealAll();
      const mo = new MutationObserver(revealAll);
      mo.observe(document.body, { childList: true, subtree: true });
      return () => mo.disconnect();
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            show(entry.target);
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.08 }
    );

    const observeAll = () => {
      document
        .querySelectorAll("[data-reveal]:not([data-visible])")
        .forEach((el) => io.observe(el));
    };

    observeAll();

    // Pick up anything React renders after the first pass, such as a list
    // that had to be fetched.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.body, { childList: true, subtree: true });

    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);
}
