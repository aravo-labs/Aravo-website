"use client";

import { useReveal } from "@/lib/useReveal";
import { Nav } from "@/components/sections/Nav";
import { Careers } from "@/components/careers/Careers";
import { Closing } from "@/components/sections/Closing";
import { careers } from "@/content/careers";

export default function CareersPage() {
  useReveal();

  return (
    <main className="theme-marketing w-full">
      <Nav />
      <Careers />
      <Closing heading={careers.cta.heading} actions={careers.cta.actions} />
    </main>
  );
}
