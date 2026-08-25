"use client";

import { AnnouncementBar } from "@/components/AnnouncementBar";
import { SiteBanner } from "@/components/SiteBanner";
import { Evidence } from "@/components/sections/Evidence";
import { Action } from "@/components/home/Action";
import { Hero } from "@/components/home/Hero";
import { Problem } from "@/components/home/Problem";
import { Solution } from "@/components/home/Solution";
import { Closing } from "@/components/sections/Closing";
import { Integrate } from "@/components/sections/Integrate";
import { Nav } from "@/components/sections/Nav";
import { useReveal } from "@/lib/useReveal";

/**
 * The landing page, in the order the deck argues it.
 *
 *   hero       the claim
 *   action     the product, moving
 *   problem    what it costs not to have it, with the numbers
 *   solution   what it gives you instead
 *   dashboard  the record it produces, which the hero button opens
 *   integrate  what adopting it costs
 *
 * This replaces the "ascent" arrangement, where sections were floors of a
 * building and a rail down the left edge tracked the climb. That was a
 * stronger piece of design and a weaker piece of selling: it explained where
 * GPS fails before saying what the product is, and it never put a number on
 * the problem. The rail goes with it, because a spine marking levels is
 * pointing at a structure that no longer exists.
 *
 * `useReveal` is the fallback for browsers without scroll-driven animations;
 * where those are supported the CSS in globals.css takes over.
 */
export default function Home() {
  useReveal();

  return (
    <div className="theme-marketing relative w-full">
      {/* Navigation first, announcement under it. The strip is a notice on
          this page rather than a fixture above the whole site, and putting it
          over the navigation pushed the brand mark away from the top edge on
          every load. */}
      <Nav />
      <AnnouncementBar />
      <main>
        <Hero />
        <Action />
        <Problem />
        <Solution />
        <Evidence />
        {/* A logo strip or a showcase, when one is published. Below the
            argument and above the price of adopting it: proof that other
            people already have. An announcement is not drawn here - it
            belongs at the top of the page, where the bar is. */}
        <SiteBanner />
        <Integrate />
      </main>
      <Closing />
    </div>
  );
}
