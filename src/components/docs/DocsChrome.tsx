"use client";

/**
 * The documentation's own header and sidebar.
 *
 * Docs get their own chrome rather than the marketing navigation. Somebody
 * reading an integration guide is not shopping: they want the page list, the
 * platform they are on, and a way back to the site - not "How it works" and a
 * request-access button following them down every page.
 *
 * The sidebar is grouped by platform, because that is the first decision a
 * reader makes and every page below it is conditional on the answer. Pages
 * belonging to no platform sit in their own group at the end: they are read
 * by everybody, and hiding them inside a platform would be a lie about who
 * they are for.
 */

import Link from "next/link";
import { useState } from "react";

import { Brand } from "@/components/Brand";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";
import type { DocPageSummary, PlatformPublic } from "@/lib/api/types";

export function DocsHeader() {
  // The label and destination are set in the admin panel. Defaults are used
  // until it answers, so the header never renders a button with no words in
  // it while a request is in flight.
  const settings = useAsync(() => publicApi.siteSettings(), []);
  const label = settings.data?.docs_cta_label || "Get a key";
  const href = settings.data?.docs_cta_url || "/sdk-access";

  return (
    <header className="sticky top-0 z-40 border-b border-rule bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-[100rem] items-center gap-4 px-5 sm:px-8">
        <Link href="/docs" className="flex items-center gap-2.5">
          <Brand />
          <span className="font-mono text-[11px] tracking-[0.12em] text-muted uppercase">
            SDK docs
          </span>
        </Link>

        <Link
          href="/"
          className="ml-auto flex items-center gap-1.5 text-[13px] text-muted transition-colors hover:text-ink"
        >
          Website
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none" aria-hidden>
            <path
              d="M4.5 1.5h6v6M10.5 1.5 5 7M9 7.5v3h-7.5V3h3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Link>

        <Link
          href={href as never}
          className="rounded-[3px] bg-signal px-3.5 py-2 font-mono text-[10px] tracking-[0.12em] text-white uppercase transition-colors hover:bg-signal-deep"
        >
          {label}
        </Link>
      </div>
    </header>
  );
}

/**
 * The documentation's own footer.
 *
 * The docs had none: a page ended at the previous/next pair and then stopped,
 * which leaves somebody who has finished reading with the sidebar or the back
 * button. This is the way out - to another platform, to the site, to a key.
 *
 * Every column is built from data. The platforms are the platforms, the
 * documentation column is the pages that belong to no platform (the ones
 * everybody reads), and the resources are the site settings and whichever
 * pages asked to be in a footer. Nothing here is a list somebody has to
 * remember to update when a platform is added.
 */
export function DocsFooter() {
  const platforms = useAsync(() => publicApi.platforms(), []);
  const settings = useAsync(() => publicApi.siteSettings(), []);
  const pages = useAsync(() => publicApi.pages(), []);
  const docs = useAsync(async () => (await publicApi.docs()).items, []);

  const company = settings.data?.company_name || "Aravo";
  const shared = (docs.data ?? []).filter((d) => !d.platform_id);
  const sitePages = (pages.data?.items ?? []).filter((p) => p.show_in_footer);

  return (
    <footer className="border-t border-rule bg-sunken/40">
      <div className="mx-auto w-full max-w-[100rem] px-5 py-12 sm:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex flex-col gap-3">
            <Brand />
            <p className="max-w-[34ch] text-[13px] leading-[1.6] text-muted">
              {settings.data?.docs_intro?.trim() ||
                "Everything needed to add delivery event detection to a driver app you already ship."}
            </p>
          </div>

          <FooterColumn title="Documentation">
            <FooterLink href="/docs">
              {settings.data?.docs_title || "SDK documentation"}
            </FooterLink>
            {shared.map((page) => (
              <FooterLink key={page.slug} href={`/docs/${page.slug}`}>
                {page.title}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Platforms">
            {(platforms.data?.items ?? []).map((p) => (
              <FooterLink key={p.id} href={`/docs?platform=${p.slug}`}>
                {p.name}
              </FooterLink>
            ))}
          </FooterColumn>

          <FooterColumn title="Resources">
            <FooterLink href="/">Website</FooterLink>
            <FooterLink href={settings.data?.docs_cta_url || "/sdk-access"}>
              {settings.data?.docs_cta_label || "Get a key"}
            </FooterLink>
            {sitePages.map((page) => (
              <FooterLink key={page.slug} href={`/${page.slug}`}>
                {page.title}
              </FooterLink>
            ))}
          </FooterColumn>
        </div>

        <p className="mt-10 border-t border-rule pt-6 font-mono text-[10px] tracking-[0.14em] text-faint uppercase">
          © {new Date().getFullYear()} {company}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function FooterColumn({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="font-mono text-[10px] tracking-[0.14em] text-faint uppercase">{title}</h2>
      <ul className="flex flex-col gap-2">{children}</ul>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link
        href={href as never}
        className="text-[13.5px] leading-snug text-muted transition-colors hover:text-signal"
      >
        {children}
      </Link>
    </li>
  );
}

/**
 * The page list, grouped the way documentation is actually read.
 *
 * Two levels, because a reader makes two decisions in order: which platform
 * they are integrating, and which part of the job they are on - installing,
 * configuring, calling, or looking a method up. A flat list of every page
 * makes them read all of it to find either.
 *
 * Neither level is ordered here. Pages arrive in the order the API sorted
 * them, which is the order set in the admin panel, and the sections appear in
 * the order their pages first do. Sorting anything alphabetically at this
 * point would quietly overrule that and put the API reference before the
 * installation guide.
 */
export type DocsSection = {
  key: string;
  label: string;
  pages: readonly DocPageSummary[];
};
export type DocsGroup = {
  key: string;
  label: string;
  sections: readonly DocsSection[];
  /** Every page under the platform, in order, whatever its section. */
  pages: readonly DocPageSummary[];
  /** The pages belonging to no platform. Everybody's, so never folded away. */
  shared: boolean;
  /**
   * Whether to show the section headings at all.
   *
   * Sections are a way of managing length, not a rung every page has to be
   * reached through. A platform with four pages and four one-page sections is
   * a list wearing a filing cabinet: two clicks to reach anything, and a
   * heading above every entry repeating what the entry says. So the headings
   * appear once there is enough to sort - more than one real section, and
   * more pages than sections - and otherwise the pages are the list.
   */
  sectioned: boolean;
};

/** Pages belonging to no platform, grouped last: they are read by everybody. */
const SHARED = "\uffff-shared";

/** A section name that says nothing. These never produce a heading. */
const UNSECTIONED = new Set(["", "general", "other", "misc", "pages", "docs"]);

export function groupByPlatform(
  pages: readonly DocPageSummary[],
  platforms: readonly PlatformPublic[],
): DocsGroup[] {
  const byId = new Map(platforms.map((p) => [p.id, p]));
  const groups = new Map<
    string,
    { label: string; sections: Map<string, DocsSection>; pages: DocPageSummary[] }
  >();

  for (const page of pages) {
    const platform = page.platform_id ? byId.get(page.platform_id) : undefined;
    const key = platform ? platform.slug : SHARED;
    const label = platform ? platform.name : "For every platform";

    const group = groups.get(key) ?? { label, sections: new Map(), pages: [] };
    const sectionKey = page.section?.trim() || "General";
    const section = group.sections.get(sectionKey) ?? {
      key: sectionKey,
      label: sectionKey,
      pages: [],
    };
    group.sections.set(sectionKey, {
      ...section,
      pages: [...section.pages, page],
    });
    groups.set(key, { ...group, pages: [...group.pages, page] });
  }

  // Platforms in the order the admin panel arranged them; shared pages after
  // all of them.
  const rank = new Map(platforms.map((p, i) => [p.slug, i]));
  return [...groups.entries()]
    .sort(
      ([a], [b]) =>
        (rank.get(a) ?? (a === SHARED ? 1e6 : 1e5)) -
        (rank.get(b) ?? (b === SHARED ? 1e6 : 1e5)),
    )
    .map(([key, group]) => {
      const sections = [...group.sections.values()];
      const named = sections.filter((s) => !UNSECTIONED.has(s.key.toLowerCase()));
      return {
        key,
        label: group.label,
        sections,
        pages: group.pages,
        shared: key === SHARED,
        sectioned: named.length > 1 && group.pages.length > named.length,
      };
    });
}

/** Every page in the order the sidebar shows it. What "next" means. */
export function flattenNav(groups: readonly DocsGroup[]): DocPageSummary[] {
  return groups.flatMap((g) => g.pages);
}

/** The disclosure arrow. Points right when closed, down when open. */
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className={`shrink-0 transition-transform duration-150 ${open ? "rotate-90" : ""}`}
    >
      <path
        d="m4.5 2.5 4 3.5-4 3.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DocsSidebar({
  groups,
  activeSlug,
  platform,
  atHome = false,
}: {
  groups: readonly DocsGroup[];
  activeSlug?: string;
  /** Carried into every link so the reader stays on their platform. */
  platform?: string;
  /** True on the documentation's own front page, which is a page like any other. */
  atHome?: boolean;
}) {
  const suffix = platform ? `?platform=${platform}` : "";

  /**
   * What the reader has opened or closed by hand.
   *
   * Only the overrides are kept, not the whole open/closed state. What is open
   * by default depends on which page is being read, and that changes on every
   * navigation; storing the resolved state would mean writing it again from an
   * effect after each one, which is how a sidebar ends up collapsing the
   * section you just clicked into.
   */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const toggle = (key: string, open: boolean) =>
    setToggled((t) => ({ ...t, [key]: !open }));

  const pageLink = (page: DocPageSummary) => {
    const current = page.slug === activeSlug;
    return (
      <li key={page.slug}>
        <Link
          href={`/docs/${page.slug}${suffix}` as never}
          aria-current={current ? "page" : undefined}
          className={`-ml-px block border-l py-1.5 pl-3 text-[13.5px] leading-snug transition-colors ${
            current
              ? "border-signal font-medium text-signal"
              : "border-transparent text-muted hover:border-rule-strong hover:text-ink"
          }`}
        >
          {page.title}
        </Link>
      </li>
    );
  };

  return (
    <nav aria-label="Documentation" className="flex flex-col gap-6">
      {/* The front page, in the list with everything else. It is where a
          reader is told which platform to pick, so it has to be somewhere
          they can get back to. */}
      <Link
        href={`/docs${suffix}` as never}
        aria-current={atHome ? "page" : undefined}
        className={`-mb-2 flex items-center gap-2 rounded-[3px] px-2 py-1.5 text-[13.5px] transition-colors ${
          atHome
            ? "bg-signal-wash font-medium text-signal"
            : "text-muted hover:bg-sunken hover:text-ink"
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden>
          <path
            d="M2.5 7 8 2.5 13.5 7v6a.5.5 0 0 1-.5.5h-3v-4H6v4H3a.5.5 0 0 1-.5-.5z"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        Home
      </Link>

      {groups.map((group) => {
        const holdsActive = group.pages.some((p) => p.slug === activeSlug);
        // A platform opens when you are reading it, and always for the pages
        // that belong to no platform, because those are everybody's. On the
        // front page they fold away: that page names the platforms itself, so
        // a sidebar repeating all of them underneath is the same list twice.
        const groupOpen =
          toggled[group.key] ?? (holdsActive || group.shared || (!activeSlug && !atHome));

        return (
          <div key={group.key} className="flex flex-col gap-2">
            <button
              type="button"
              onClick={() => toggle(group.key, groupOpen)}
              aria-expanded={groupOpen}
              className="flex items-center gap-1.5 py-0.5 font-mono text-[10px] tracking-[0.14em] text-faint uppercase transition-colors hover:text-ink"
            >
              <Chevron open={groupOpen} />
              {group.label}
            </button>

            {/* No sections worth the name: the platform's pages are the list,
                and every one of them is a single click from here. */}
            {groupOpen && !group.sectioned && (
              <ul className="ml-[3px] flex flex-col border-l border-rule pl-0">
                {group.pages.map(pageLink)}
              </ul>
            )}

            {groupOpen &&
              group.sectioned &&
              group.sections.map((section) => {
                const key = `${group.key}/${section.key}`;
                // Open unless the reader shut it. A section closed by default
                // makes every page two clicks away and hides the one thing the
                // sidebar is for: seeing what is there.
                const sectionOpen = toggled[key] ?? true;

                return (
                  <div key={section.key} className="flex flex-col gap-1 pl-3.5">
                    <button
                      type="button"
                      onClick={() => toggle(key, sectionOpen)}
                      aria-expanded={sectionOpen}
                      className="flex items-center gap-1.5 py-0.5 text-left text-[12.5px] font-medium tracking-[-0.005em] text-ink-2 transition-colors hover:text-signal"
                    >
                      <Chevron open={sectionOpen} />
                      {section.label}
                    </button>

                    {sectionOpen && (
                      <ul className="ml-[3px] flex flex-col border-l border-rule">
                        {section.pages.map(pageLink)}
                      </ul>
                    )}
                  </div>
                );
              })}
          </div>
        );
      })}
    </nav>
  );
}

/**
 * Where you are, and the way back up.
 *
 * Two levels only. A trail that repeats the page title you are already
 * looking at is decoration; this exists to name the platform and get you back
 * to the index.
 */
export function Breadcrumbs({
  platformName,
  platformSlug,
  title,
}: {
  platformName?: string;
  platformSlug?: string;
  title: string;
}) {
  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-[13px]">
      <Link href="/docs" className="text-muted transition-colors hover:text-ink">
        Docs
      </Link>
      {platformName && (
        <>
          <span aria-hidden className="text-faint">
            /
          </span>
          <Link
            href={`/docs?platform=${platformSlug}` as never}
            className="text-muted transition-colors hover:text-ink"
          >
            {platformName}
          </Link>
        </>
      )}
      <span aria-hidden className="text-faint">
        /
      </span>
      <span className="text-ink">{title}</span>
    </nav>
  );
}
