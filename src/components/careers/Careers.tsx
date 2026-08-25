"use client";

import { useEffect, useState } from "react";
import { careers } from "@/content/careers";
import { Shell, Eyebrow } from "@/components/primitives";
import { Icons } from "@/components/art/Icons";
import { ApplyForm } from "@/components/careers/ApplyForm";
import { RichText } from "@/components/docs/RichText";
import { publicApi } from "@/lib/api/public";
import type { JobPublic, JobSummary } from "@/lib/api/types";
import { useAsync } from "@/lib/useAsync";

/**
 * The roles come from the API, so publishing one in the admin panel puts it
 * here. The surrounding copy - the intro, the note about applying - stays in
 * `content/careers.ts`, because that is page writing rather than content
 * someone edits between deploys.
 */
export function Careers() {
  const [openSlug, setOpenSlug] = useState<string | null>(null);

  // jump back to the top when switching between list and detail
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "auto" });
  }, [openSlug]);

  return (
    <Shell>
      {openSlug ? (
        <JobDetailLoader slug={openSlug} onBack={() => setOpenSlug(null)} />
      ) : (
        <JobList onOpen={setOpenSlug} />
      )}
    </Shell>
  );
}

/** Shared empty/failed state, styled to match the page rather than the panel. */
function Notice({ title, body }: { title: string; body?: string }) {
  return (
    <div className="px-6 py-20 text-center sm:px-10">
      <p className="text-[17px] text-[var(--color-ink)]">{title}</p>
      {body && (
        <p className="mt-2 text-[15px] text-[var(--color-muted)]">{body}</p>
      )}
    </div>
  );
}

function JobDetailLoader({
  slug,
  onBack,
}: {
  slug: string;
  onBack: () => void;
}) {
  const state = useAsync(() => publicApi.job(slug), [slug]);

  if (state.loading) return <Notice title="Loading this role…" />;
  if (state.error || !state.data) {
    return (
      <Notice
        title="That role is no longer open."
        body="It may have been filled or withdrawn since you opened this page."
      />
    );
  }
  return <JobDetail job={state.data} onBack={onBack} />;
}

/* ---------------- list view ---------------- */

function JobList({ onOpen }: { onOpen: (slug: string) => void }) {
  const state = useAsync(() => publicApi.jobs(), []);

  return (
    <div>
      <div className="flex flex-col gap-5 px-6 pt-14 pb-10 sm:px-10 lg:pt-20">
        <Eyebrow>{careers.eyebrow}</Eyebrow>
        <h1 className="text-[2rem] leading-[1.2] font-normal tracking-[-0.01em] text-[var(--color-accent)] sm:text-[2.5rem]">
          {careers.title}
        </h1>

        <div className="flex max-w-[68ch] flex-col gap-4">
          {careers.intro.map((p) => (
            <p key={p} className="text-[15px] leading-[1.65] text-[var(--color-muted)] sm:text-base">
              {p}
            </p>
          ))}
        </div>

        <div className="mt-6 flex max-w-[68ch] flex-col gap-2">
          {careers.note.map((p) => (
            <p key={p} className="text-[15px] leading-[1.65] text-[var(--color-muted)] sm:text-base">
              {p}
            </p>
          ))}
        </div>
      </div>

      {/* roles. The anchor is what the page's own call to action points at,
          so it has to sit on something that is always rendered rather than on
          the list, which is absent while it loads and when it is empty. */}
      <div id="roles" className="scroll-mt-24" />
      {state.loading ? (
        <Notice title="Loading open roles…" />
      ) : state.error ? (
        <Notice
          title="We could not load our open roles just now."
          body="Please try again in a moment."
        />
      ) : state.data!.items.length === 0 ? (
        <Notice
          title="No open roles right now."
          body="Nothing is open at the moment, but we are always glad to hear from good people."
        />
      ) : (
      <ul className="border-t border-[var(--color-rule)]">
        {state.data!.items.map((j: JobSummary, i: number) => (
          <li
            key={j.slug}
            data-reveal
            style={{ "--reveal-delay": `${Math.min(i, 6) * 55}ms` } as React.CSSProperties}
            className="border-b border-[var(--color-rule)] last:border-b-0"
          >
            <button
              type="button"
              onClick={() => onOpen(j.slug)}
              className="group grid w-full items-center gap-x-6 gap-y-2 px-6 py-6 text-left transition-colors hover:bg-white/70 sm:px-10 lg:grid-cols-[10rem_minmax(0,1fr)_13rem_8rem_auto]"
            >
              <span className="font-mono text-[12px] tracking-[0.06em] text-[var(--color-muted)] uppercase">
                {j.department}
              </span>

              <h3 className="text-[17px] font-medium text-[var(--color-ink)] transition-colors group-hover:text-[var(--color-accent)] sm:text-[18px]">
                {j.title}
              </h3>

              <span className="text-[14px] text-[var(--color-muted)]">{j.location}</span>
              <span className="text-[14px] text-[var(--color-ink)]">
                {j.employment_type}
              </span>

              <span className="mt-2 inline-flex items-center gap-2 justify-self-start rounded-full border border-[var(--color-rule)] bg-white px-5 py-2.5 font-mono text-[14px] uppercase transition-colors group-hover:border-[var(--color-ink)] lg:mt-0 lg:justify-self-end">
                Apply now
                <svg viewBox="0 0 24 24" className="size-3" fill="none" aria-hidden>
                  <path
                    d="M7 17 17 7M9 7h8v8"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </button>
          </li>
        ))}
      </ul>
      )}
    </div>
  );
}

/* ---------------- detail view ---------------- */

function JobDetail({ job, onBack }: { job: JobPublic; onBack: () => void }) {
  return (
    <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)]">
      {/* left: the role */}
      <div className="border-b border-[var(--color-rule)] lg:border-r lg:border-b-0">
        <div className="flex flex-col gap-4 px-6 pt-10 pb-8 sm:px-10">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 text-[14px] text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
          >
            <Icons.arrowLeft className="size-4" />
            Back to Jobs
          </button>

          <span className="w-fit rounded bg-[var(--color-accent-soft)] px-2.5 py-1 font-mono text-[12px] tracking-[0.06em] text-[var(--color-accent)] uppercase">
            {job.department}
          </span>

          <h1 className="text-[1.75rem] leading-tight font-normal tracking-[-0.01em] sm:text-[2rem]">
            {job.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[14px] text-[var(--color-muted)]">
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

        <div className="flex flex-col gap-8 border-t border-[var(--color-rule)] px-6 py-8 sm:px-10">
          {/* The description is formatted HTML now, so it cannot sit inside a
              <p>: a div nested in a paragraph is closed by the browser at the
              opening tag and the rest of the copy lands outside it. */}
          <Block title="About the role">
            <RichText html={job.about} className="text-[15px]" />
          </Block>

          {/* A heading over an empty list reads as a section somebody forgot
              to fill in. Not every role has all three. */}
          {job.responsibilities.length > 0 && (
            <Block title="What you'll do">
              <Bullets items={job.responsibilities} />
            </Block>
          )}

          {job.requirements.length > 0 && (
            <Block title="What we're looking for">
              <Bullets items={job.requirements} />
            </Block>
          )}

          {job.nice_to_have.length > 0 && (
            <Block title="Nice to have">
              <Bullets items={job.nice_to_have} />
            </Block>
          )}
        </div>
      </div>

      {/* right: the form */}
      <div className="px-6 py-10 sm:px-10">
        <div className="lg:sticky lg:top-24">
          <ApplyForm job={job} />
        </div>
      </div>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 text-[17px] font-medium">{title}</h2>
      {children}
    </section>
  );
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {items.map((t) => (
        <li key={t} className="flex gap-3 text-[15px] leading-[1.6] text-[var(--color-muted)]">
          <span className="mt-[0.55em] size-1.5 shrink-0 rounded-full bg-[var(--color-accent)]" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
