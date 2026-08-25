"use client";

/**
 * The anonymous half of the API.
 *
 * No token is ever sent from here. These endpoints only return published
 * content, and the two writes are rate limited per IP by the server.
 */

import { request, requestPaged, type Paged } from "./client";
import type {
  ApplicationReceipt,
  BannerPublic,
  DocPagePublic,
  DocPageSummary,
  FaqPublic,
  JobPublic,
  JobSummary,
  PagePublic,
  PageSummary,
  PlatformPublic,
  SdkRequestReceipt,
  SiteSettingsPublic,
  TeamMemberPublic,
} from "./types";

/** Published content changes rarely; a short window keeps the page quick. */
const CACHED = { revalidate: 30 };

/** The API's own ceiling. Asking for more than this is silently clamped. */
const MAX_PAGE_SIZE = 100;

/**
 * Fetch every page of a list, not just the first.
 *
 * These pages render a complete set - all open roles, the whole team, the full
 * documentation index - so a single request for 100 items was a silent cutoff:
 * the 101st role simply did not exist as far as a visitor was concerned, with
 * nothing to indicate more were there. Paginating the careers page instead
 * would be the wrong answer for a docs sidebar, so the list is completed here
 * and the callers stay unchanged.
 */
async function fetchAll<T>(
  path: string,
  /** Extra query values carried onto every page of the walk, e.g. a platform. */
  extra?: Record<string, string>,
): Promise<Paged<T>> {
  const first = await requestPaged<T>(path, {
    query: { ...extra, page: 1, page_size: MAX_PAGE_SIZE },
    ...CACHED,
  });

  const totalPages = first.pagination?.total_pages ?? 1;
  if (totalPages <= 1) return first;

  const rest = await Promise.all(
    Array.from({ length: totalPages - 1 }, (_, index) =>
      requestPaged<T>(path, {
        query: { ...extra, page: index + 2, page_size: MAX_PAGE_SIZE },
        ...CACHED,
      }),
    ),
  );

  return {
    items: [...first.items, ...rest.flatMap((page) => page.items)],
    pagination: first.pagination,
  };
}

/** In-flight or resolved settings for this page load. See `siteSettings`. */
let settingsOnce: Promise<SiteSettingsPublic> | null = null;

export const publicApi = {
  jobs: (): Promise<Paged<JobSummary>> => fetchAll<JobSummary>("/public/jobs"),

  job: (slug: string): Promise<JobPublic> =>
    request<JobPublic>(`/public/jobs/${slug}`, CACHED),

  team: (): Promise<Paged<TeamMemberPublic>> => fetchAll<TeamMemberPublic>("/public/team"),

  docs: (platform?: string): Promise<Paged<DocPageSummary>> =>
    fetchAll<DocPageSummary>("/public/docs", platform ? { platform } : undefined),

  doc: (slug: string): Promise<DocPagePublic> =>
    request<DocPagePublic>(`/public/docs/${slug}`, CACHED),

  banner: (): Promise<BannerPublic | null> =>
    request<BannerPublic | null>("/public/banner", CACHED),

  platforms: (): Promise<Paged<PlatformPublic>> =>
    fetchAll<PlatformPublic>("/public/platforms"),

  platform: (slug: string): Promise<PlatformPublic> =>
    request<PlatformPublic>(`/public/platforms/${slug}`, CACHED),

  faqs: (): Promise<Paged<FaqPublic>> => fetchAll<FaqPublic>("/public/faqs"),

  /**
   * Standalone pages written in the admin panel - the policies, an
   * announcement, whatever gets written next. The list carries titles and
   * addresses only; a body is fetched one page at a time.
   */
  pages: (): Promise<Paged<PageSummary>> => fetchAll<PageSummary>("/public/pages"),

  page: (slug: string): Promise<PagePublic> =>
    request<PagePublic>(`/public/pages/${slug}`, CACHED),

  /**
   * The company name, the icon, and whether the hiring section appears.
   * Never throws for an unconfigured site: the API answers with defaults, and
   * a page should not fail because a settings row is missing.
   *
   * Shared, because three components want it - the footer for the hiring
   * link, the WhatsApp button for its number, the layout for the tab title -
   * and each asking separately made four identical requests per page load.
   * One promise, reused; a failure is not cached, so the next caller retries.
   */
  siteSettings: (): Promise<SiteSettingsPublic> => {
    settingsOnce ??= request<SiteSettingsPublic>("/public/site-settings", CACHED).catch(
      (error: unknown) => {
        settingsOnce = null;
        throw error;
      },
    );
    return settingsOnce;
  },

  /** Request SDK access or a demo. Rate limited per IP by the server. */
  requestSdkAccess: (body: {
    name: string;
    email: string;
    company?: string | null;
    platform?: string | null;
    fleet_size?: string | null;
    message?: string | null;
  }): Promise<SdkRequestReceipt> =>
    request<SdkRequestReceipt>("/public/sdk-requests", {
      method: "POST",
      body,
      cache: "no-store",
    }),

  /** Step one of applying. Returns the id needed to attach a resume. */
  apply: (body: {
    job_id: string;
    first_name: string;
    last_name: string;
    email: string;
    // Required by the API, so required here: an optional type would let a
    // caller omit them and find out at runtime.
    phone: string;
    linkedin_url: string;
    github_url: string;
  }): Promise<ApplicationReceipt> =>
    request<ApplicationReceipt>("/public/applications", {
      method: "POST",
      body,
      cache: "no-store",
    }),

  /**
   * Step two: attach the file.
   *
   * Split from `apply` on purpose - the details are saved even if the upload
   * then fails, so a candidate is never lost to a flaky connection at the
   * last moment.
   */
  uploadResume: (applicationId: string, file: File): Promise<ApplicationReceipt> => {
    const form = new FormData();
    form.append("file", file);
    return request<ApplicationReceipt>(`/public/applications/${applicationId}/resume`, {
      method: "POST",
      body: form,
      cache: "no-store",
    });
  },
};
