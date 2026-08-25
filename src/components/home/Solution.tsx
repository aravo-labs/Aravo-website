"use client";

/**
 * The solution, against the building it is about.
 *
 * The film is the argument: a cutaway of the building with the route drawn up
 * the stairwell as it is detected, each event labelled as it happens. It is
 * the same sequence the product reports, so the four claims beside it are
 * legible before they are read - and animated, the route is the proof being
 * assembled rather than a diagram of one.
 *
 * It sits in its own column and sticks while the claims scroll past on a wide
 * screen, because the two are one argument: the words name what the drawing is
 * doing.
 */

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

import { home } from "@/content/home";

/** What the film shows, for anyone who cannot watch it. */
const FILM_DESCRIPTION =
  "An isometric cutaway of a five-storey residential building. A route is " +
  "traced from the entrance up through the stairwell to a door on the top " +
  "floor, each step labelled as it is detected: the stairs ascended, then the " +
  "drop-off point at the door.";

/**
 * The film, or a still of it where motion is unwelcome.
 *
 * The poster is the last frame rather than the first: the first frame is the
 * building with no route on it, and the route is the entire point. Somebody
 * who has asked their system for reduced motion gets that frame and not a
 * loop, and it still makes the argument.
 */
function ProofFilm() {
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
        src="/img/proof-poster.jpg"
        alt={FILM_DESCRIPTION}
        width={640}
        height={720}
        sizes="(max-width: 1024px) 100vw, 464px"
        className="h-auto w-full rounded-[4px] border border-rule"
      />
    );
  }

  return (
    <video
      ref={video}
      className="h-auto w-full rounded-[4px] border border-rule"
      autoPlay
      muted
      loop
      playsInline
      poster="/img/proof-poster.jpg"
      aria-label={FILM_DESCRIPTION}
    >
      <source src="/video/proof.mp4" type="video/mp4" />
    </video>
  );
}

export function Solution() {
  const { solution } = home;

  return (
    <section id="solution" className="relative border-b border-rule">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 py-16 sm:px-10 lg:py-24">
        <span className="flex items-center gap-2.5 font-mono text-label text-signal uppercase">
          <span aria-hidden className="size-1.5 rounded-full bg-signal" />
          {solution.eyebrow}
        </span>

        <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,29rem)] lg:gap-16">
          <div className="flex flex-col gap-10">
            <div className="flex flex-col gap-5">
              <h2 className="max-w-[20ch] text-[1.9rem] leading-[1.15] font-normal tracking-[-0.018em] text-ink sm:text-[2.4rem]">
                {solution.heading.lead}{" "}
                <span className="text-signal">{solution.heading.accent}</span>{" "}
                {solution.heading.tail}
              </h2>
              <p className="max-w-[52ch] text-[15px] leading-[1.7] text-muted sm:text-lede">
                {solution.lede}
              </p>
            </div>

            <ul className="grid gap-px border-t border-rule bg-rule sm:grid-cols-2">
              {solution.features.map((feature) => (
                <li key={feature.title} className="flex flex-col gap-2 bg-canvas py-7 sm:px-6">
                  <h3 className="text-[16px] leading-snug font-medium text-ink">
                    {feature.title}
                  </h3>
                  <p className="text-[14.5px] leading-[1.65] text-muted">{feature.body}</p>
                </li>
              ))}
            </ul>
          </div>

          <figure className="lg:sticky lg:top-24 lg:self-start">
            <ProofFilm />
          </figure>
        </div>
      </div>
    </section>
  );
}
