"use client";

/**
 * The hero, as drawn in the deck.
 *
 * The illustration is a background rather than a panel beside the text. It was
 * drawn with an empty middle - the buildings sit at the two edges and the
 * street runs out through the centre - so type placed there lands in clear
 * space by the artist's design rather than by luck.
 *
 * It is behind the words, so it has to lose a fight it never enters: a wash
 * over the copy column keeps contrast up at every width, and the whole thing
 * is faded, because a background that competes with the sentence on top of it
 * is decoration that has been allowed to become an obstacle.
 *
 * From `lg` up the section is exactly the screen, less whatever the
 * announcement and the navigation took - `--chrome-h` in globals.css. It used
 * to carry a fixed 44rem minimum, which meant the layout ignored the display
 * it was on: at 1080 the next section was already showing before anybody
 * scrolled, and on a laptop the button sat under the fold. Below `lg` the
 * height is the content's, because a phone in landscape is 380px tall and
 * nothing good comes of insisting a headline fill it.
 */

import Image from "next/image";

import { home } from "@/content/home";

export function Hero() {
  const { hero } = home;

  return (
    <section className="relative isolate overflow-hidden border-b border-rule bg-canvas">
      {/* The drawing. `priority` because it is the largest thing above the
          fold and the page looks broken while it is missing. */}
      <Image
        src="/img/hero-street-2.jpg"
        alt=""
        aria-hidden
        fill
        priority
        sizes="100vw"
        quality={90}
        /*
          Anchored left and bottom, and not mirrored.

          The drawing puts the handover - the rider, the parcel, the customer
          at her door - in its left third, and `cover` has to throw away one
          side or the other as the window narrows. Centred, a phone keeps the
          empty middle of the street and loses the only part of the picture
          that shows the product; anchored left it keeps the handover at every
          width, behind the words, which is where the argument is.

          Bottom rather than centre for the same reason vertically: the top of
          the frame is sky, and sky is what a tall viewport can afford to lose.
        */
        className="pointer-events-none object-cover object-left-bottom"
      />

      {/* Two washes, not one. The vertical keeps the section joining the page
          cleanly at top and bottom; the horizontal protects the copy column
          without wiping out the drawing on the side nobody is reading. */}
      {/* A light scrim, not an eraser.

          The first version took the left third to solid canvas, which made
          the drawing disappear exactly where the artwork puts a building and
          a tree - the side of the frame a reader looks at first, showing
          nothing.

          Barely there now. It is not responsible for legibility - the copy
          carries its own ground - so its only job is to take the very top off
          the line work, and the drawing reads at close to full strength across
          the whole frame, which is the point of having it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(250,251,252,0.3)_0%,rgba(250,251,252,0.2)_50%,rgba(250,251,252,0)_100%)] sm:bg-[linear-gradient(to_right,rgba(250,251,252,0.22)_0%,rgba(250,251,252,0.12)_40%,rgba(250,251,252,0)_65%)]"
      />
      {/* A short fade at the bottom edge only, so the section meets the next
          one without a hard line through the pavement. Shorter on a phone,
          where the bottom of the frame is the handover rather than empty road
          and 96px of fade takes the rider with it. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-[linear-gradient(to_bottom,transparent,var(--color-canvas))] sm:h-24"
      />

      {/* The copy sits in the upper half at every width. The bottom padding is
          what does it - the block is centred in what is left, so a deeper
          floor lifts it - and the lower left of the frame, where the rider
          hands the parcel over, stays clear of the words. */}
      <div className="relative mx-auto flex w-full max-w-[var(--shell-max)] flex-col justify-center px-6 pt-20 pb-44 min-h-[36rem] sm:px-10 lg:min-h-[calc(100svh-var(--chrome-h))] lg:pt-24 lg:pb-56">
        <div className="relative flex max-w-[36rem] flex-col items-start gap-7">
          {/* Clear ground under the words, and only under the words.

              The page-wide veil is a horizontal fade, which is the wrong shape
              for this problem: strong enough at the left edge to read the
              small print, it would also wash out the rider standing in the
              same third. This one follows the copy block instead, and the
              block is now lifted clear of the handover - so it can be even
              across every line, including the small one, and still leave the
              lower left of the drawing at full strength. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-x-10 -top-10 -bottom-8 bg-[radial-gradient(60%_60%_at_30%_50%,rgba(250,251,252,0.9)_0%,rgba(250,251,252,0.72)_50%,rgba(250,251,252,0)_100%)]"
          />

          <h1 className="relative text-[2.1rem] leading-[1.12] font-normal tracking-[-0.02em] text-ink sm:text-[2.9rem] lg:text-[3.3rem]">
            {hero.headline[0]}
            <br />
            <span className="text-signal">{hero.headline[1]}</span>
          </h1>

          {/* The note, then the button: claim, qualification, action, in the
              order somebody reads them. It used to sit beside the button,
              which put the qualification and the action on the same rung.

              The rule down its left is the deck's, and it earns its place: it
              marks this as a note on the claim rather than a second claim.

              Set in the accent one step light, and at 600. Over a drawing,
              weight is contrast - thin strokes let the line work behind them
              show through and the sentence stops reading as one shape - which
              is what buys the lighter colour. */}
          <p className="relative max-w-[34ch] border-l-2 border-signal pl-5 text-[15px] leading-[1.6] font-semibold text-signal-light">
            {hero.lede}
          </p>

          <a
            href={hero.primary.href}
            className="relative h-fit shrink-0 rounded-[3px] bg-signal px-6 py-3.5 font-mono text-label text-white uppercase transition-colors hover:bg-signal-deep"
          >
            {hero.primary.label}
          </a>
        </div>
      </div>
    </section>
  );
}
