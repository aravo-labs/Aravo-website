"use client";

/**
 * A role on its own page.
 *
 * The same three sections the careers list shows - what you'll do, what we're
 * looking for, nice to have - laid out for someone who arrived from a link
 * rather than by browsing. So: the title and the facts first, the description
 * in one column at a readable measure, and the form beside it on a wide
 * screen and under it on a narrow one.
 *
 * Sections with nothing in them are not rendered. A heading over an empty
 * list reads as something somebody forgot to finish, and not every role has
 * all three.
 */

import Link from "next/link";

import { ApplyForm } from "@/components/careers/ApplyForm";
import { Icons } from "@/components/art/Icons";
import { RichText } from "@/components/docs/RichText";
import { Closing } from "@/components/sections/Closing";
import { Nav } from "@/components/sections/Nav";
import type { JobPublic } from "@/lib/api/types";

export function RolePage({ job }: { job: JobPublic }) {
  const sections = [
    { title: "What you'll do", items: job.responsibilities },
    { title: "What we're looking for", items: job.requirements },
    { title: "Nice to have", items: job.nice_to_have },
  ].filter((s) => s.items.length > 0);

  return (
    <main className="theme-marketing w-full">
      <Nav />

      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10">
        <div className="flex flex-col gap-4 border-b border-rule py-10">
          <Link
            href="/careers"
            className="inline-flex w-fit items-center gap-2 text-[14px] text-muted transition-colors hover:text-ink"
          >
            <Icons.arrowLeft className="size-4" />
            All roles
          </Link>

          <span className="w-fit rounded bg-signal-soft px-2.5 py-1 font-mono text-[12px] tracking-[0.06em] text-signal-deep uppercase">
            {job.department}
          </span>

          <h1 className="max-w-[24ch] text-[2rem] leading-[1.1] font-normal tracking-[-0.018em] text-ink sm:text-[2.6rem]">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-muted">
            <span className="inline-flex items-center gap-1.5">
              <Icons.compass className="size-4" />
              {job.location}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Icons.package className="size-4" />
              {job.employment_type}
            </span>
          </div>
        </div>

        <div className="grid gap-12 py-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-16">
          <div className="flex max-w-[62ch] flex-col gap-10">
            <section className="flex flex-col gap-3">
              <h2 className="text-[17px] font-medium text-ink">About the role</h2>
              <RichText html={job.about} className="text-[15px]" />
            </section>

            {sections.map((section) => (
              <section key={section.title} className="flex flex-col gap-3">
                <h2 className="text-[17px] font-medium text-ink">{section.title}</h2>
                <ul className="flex flex-col gap-2.5">
                  {section.items.map((item) => (
                    <li key={item} className="flex gap-3 text-[15px] leading-[1.65] text-muted">
                      <span aria-hidden className="mt-[0.6em] size-1 shrink-0 rounded-full bg-signal" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>

          <div>
            <div className="lg:sticky lg:top-24">
              <ApplyForm job={job} />
            </div>
          </div>
        </div>
      </div>

      <Closing
        heading={{ lead: "Not this one?", accent: "See the others." }}
        actions={{
          primary: { label: "All roles", href: "/careers" },
          secondary: { label: "About the team", href: "/team" },
        }}
      />
    </main>
  );
}
