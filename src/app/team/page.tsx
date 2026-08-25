"use client";

import { useState } from "react";

import { Icons } from "@/components/art/Icons";
import { Eyebrow, Shell } from "@/components/primitives";
import { Closing } from "@/components/sections/Closing";
import { Nav } from "@/components/sections/Nav";
import { publicApi } from "@/lib/api/public";
import type { TeamMemberPublic } from "@/lib/api/types";
import { useAsync } from "@/lib/useAsync";
import { useReveal } from "@/lib/useReveal";

/** Page copy. The people themselves come from the admin panel. */
const COPY = {
  eyebrow: "The team",
  title: "The people behind Aravo",
  intro:
    "A small group of engineers and operators who spent long enough inside delivery networks to be irritated by the same problem.",
  empty: "We are putting this page together. Check back shortly.",
  failed: "We could not load the team just now. Please try again in a moment.",
};

export default function TeamPage() {
  useReveal();
  const state = useAsync(() => publicApi.team(), []);

  return (
    <main className="theme-marketing w-full">
      <Nav />

      <Shell>
        <div className="flex flex-col gap-5 px-6 pt-14 pb-10 sm:px-10 lg:pt-20">
          <Eyebrow>{COPY.eyebrow}</Eyebrow>
          <h1 className="text-[2rem] leading-[1.2] font-normal tracking-[-0.01em] text-[var(--color-accent)] sm:text-[2.5rem]">
            {COPY.title}
          </h1>
          <p className="max-w-[62ch] text-[16px] leading-[1.65] text-[var(--color-muted)]">
            {COPY.intro}
          </p>
        </div>

        {state.loading ? (
          <Notice text="Loading the team…" />
        ) : state.error ? (
          <Notice text={COPY.failed} />
        ) : state.data!.items.length === 0 ? (
          <Notice text={COPY.empty} />
        ) : (
          <ul className="grid border-t border-[var(--color-rule)] sm:grid-cols-2 lg:grid-cols-3">
            {state.data!.items.map((member, i) => (
              <li
                key={member.id}
                data-reveal
                style={{ "--reveal-delay": `${Math.min(i, 8) * 60}ms` } as React.CSSProperties}
                className="border-b border-[var(--color-rule)] p-6 sm:p-8 lg:[&:not(:nth-child(3n))]:border-r"
              >
                <MemberCard member={member} />
              </li>
            ))}
          </ul>
        )}
      </Shell>

      <Closing />
    </main>
  );
}

function Notice({ text }: { text: string }) {
  return (
    <div className="border-t border-[var(--color-rule)] px-6 py-20 text-center sm:px-10">
      <p className="text-[16px] text-[var(--color-muted)]">{text}</p>
    </div>
  );
}

function MemberCard({ member }: { member: TeamMemberPublic }) {
  const [imageFailed, setImageFailed] = useState(false);
  const initials = member.name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="flex flex-col gap-4">
      {/* Photos are arbitrary remote URLs entered in the admin panel, so one
          will eventually 404. Initials are a better failure than a broken
          image icon on a page about people. */}
      <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-full bg-[var(--color-accent-soft)] font-mono text-[15px] text-[var(--color-accent)]">
        {member.photo_url && !imageFailed ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photo_url}
            alt=""
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          initials
        )}
      </span>

      <div>
        <h2 className="text-[18px] text-[var(--color-ink)]">{member.name}</h2>
        <p className="mt-0.5 font-mono text-[12px] tracking-[0.06em] text-[var(--color-muted)] uppercase">
          {member.role_title}
        </p>
      </div>

      {member.bio && (
        <p className="text-[15px] leading-[1.6] text-[var(--color-muted)]">
          {member.bio}
        </p>
      )}

      {(member.linkedin_url || member.x_url) && (
        <div className="flex gap-2">
          {member.linkedin_url && (
            <SocialLink href={member.linkedin_url} label={`${member.name} on LinkedIn`}>
              <Icons.linkedin className="size-4" />
            </SocialLink>
          )}
          {member.x_url && (
            <SocialLink href={member.x_url} label={`${member.name} on X`}>
              <Icons.x className="size-4" />
            </SocialLink>
          )}
        </div>
      )}
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label={label}
      className="grid size-8 place-items-center rounded border border-[var(--color-rule)] bg-white text-[var(--color-muted)] transition-colors hover:text-[var(--color-ink)]"
    >
      {children}
    </a>
  );
}
