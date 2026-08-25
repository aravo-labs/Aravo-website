"use client";

/**
 * Aravo in action.
 *
 * The replay of a real delivery: a rider crossing the ground floor, climbing,
 * and reaching a door, with the events appearing as they are detected. It is
 * the product doing the thing the section claims, which is why it sits here
 * rather than the integration film - that one is about adding four lines of
 * code, and belongs where the code is.
 *
 * It autoplays, muted, looping and inline, which is the only combination
 * browsers allow without a gesture, and it is the honest one: there is no
 * sound, nothing is being narrated, and it is an illustration that happens to
 * move rather than a video anybody chose to watch. `prefers-reduced-motion` is
 * respected by showing the poster and never starting it.
 *
 * The file is thirteen megabytes, because it is a full-quality master rather
 * than something squeezed until the line work broke. So it is not requested
 * until the section is close to the viewport: the poster holds the space and
 * the video replaces it. A visitor who never scrolls this far pays nothing
 * for it, and one who does has usually started the fetch before arriving.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { home } from "@/content/home";

export function Action() {
  const { action } = home;
  const video = useRef<HTMLVideoElement>(null);
  const frame = useRef<HTMLElement>(null);
  const [still, setStill] = useState(false);
  const [near, setNear] = useState(false);

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

  // A screen's height of warning, so the fetch usually starts before the
  // section is reached rather than when it is already on screen.
  useEffect(() => {
    const el = frame.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      // Deferred rather than set here: a synchronous state change inside an
      // effect re-renders before paint, and on an older browser the honest
      // answer is simply "load it".
      const soon = setTimeout(() => setNear(true), 0);
      return () => clearTimeout(soon);
    }
    const watch = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setNear(true);
          watch.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    watch.observe(el);
    return () => watch.disconnect();
  }, []);

  return (
    <section id="action" className="relative border-b border-rule">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-16 sm:px-10 lg:py-24">
        <span className="flex items-center gap-2.5 font-mono text-label text-signal uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          {action.eyebrow}
        </span>

        <div className="mt-8 grid gap-8 md:grid-cols-2 md:gap-16">
          <h2 className="text-[1.5rem] leading-[1.3] font-normal tracking-[-0.015em] text-ink sm:text-[1.75rem]">
            {action.heading[0]}
            <br />
            <span className="text-muted">{action.heading[1]}</span>
          </h2>

          <p className="self-end text-[15px] leading-[1.7] text-muted">
            {action.body.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </p>
        </div>

        <figure
          ref={frame}
          className="relative mt-12 overflow-hidden rounded-[4px] border border-rule bg-sunken"
        >
          {still || !near ? (
            <Image
              src="/video/journey-poster.jpg"
              alt="A delivery being replayed: the rider crosses the ground floor, climbs, and reaches the door."
              width={1280}
              height={720}
              sizes="(max-width: 1150px) 100vw, 1090px"
              className="h-auto w-full"
            />
          ) : (
            <video
              ref={video}
              className="h-auto w-full"
              autoPlay
              muted
              loop
              playsInline
              poster="/video/journey-poster.jpg"
              preload="auto"
              /* Described rather than captioned: there is no speech to caption,
                 and a reader using a screen reader needs to know what the
                 moving thing is showing. */
              aria-label="A delivery replayed from the entrance to the door, with each event appearing as it is detected."
            >
              <source src="/video/journey.mp4" type="video/mp4" />
            </video>
          )}
        </figure>
      </div>
    </section>
  );
}
