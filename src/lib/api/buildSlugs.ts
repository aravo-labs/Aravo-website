/**
 * Slugs for the statically exported dynamic routes, read at build time.
 *
 * A static export has to know every URL before it is deployed, so the CMS is
 * asked for its slugs while the site is being built rather than in the
 * browser. The trade is the obvious one and worth stating: publishing a new
 * documentation page in the admin panel does not appear on the site until the
 * site is rebuilt.
 *
 * Not used in the browser. These functions run in `generateStaticParams`,
 * which Next only ever calls on the server during the build.
 */

import { SHELL_SLUG } from "@/lib/shell";

const CMS_ENABLED = process.env.NEXT_PUBLIC_CMS_ENABLED === "true";
const BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

/**
 * Always pre-rendered, alongside whatever the CMS has published.
 *
 * Two jobs. It satisfies the export, which refuses a dynamic route with no
 * routes at all. And it gives CloudFront a real file to serve for a path that
 * has none - a page published after the last build - which is what lets the
 * admin panel publish without a rebuild. The slug inside it is read from the
 * URL, so the shell renders whichever page was actually asked for.
 */
const SHELL = { slug: SHELL_SLUG };

const PAGE_SIZE = 100;

type Listed = { slug?: string | null };

async function page(path: string, n: number): Promise<{ items: Listed[]; totalPages: number }> {
  const url = `${BASE}/api/v1/public/${path}?page=${n}&page_size=${PAGE_SIZE}`;
  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`${url} answered ${response.status}`);
  }
  const body = await response.json();
  // `data` is a bare list and the page count lives in `meta.pagination`.
  const items: Listed[] = Array.isArray(body?.data) ? body.data : (body?.data?.items ?? []);
  return { items, totalPages: body?.meta?.pagination?.total_pages ?? 1 };
}

/**
 * Every slug the CMS publishes at `path`, or the placeholder when there is no
 * CMS to ask.
 *
 * Throws rather than falling back when the CMS is switched on and does not
 * answer. Returning the placeholder there would publish a site whose
 * documentation section is empty and whose only symptom is a quiet one, which
 * is precisely the state this function exists to end. A failed build asks for
 * attention; a silently empty docs page does not get it.
 */
export async function publishedSlugs(path: string): Promise<{ slug: string }[]> {
  if (!CMS_ENABLED) return [SHELL];
  if (!BASE) {
    throw new Error(
      `NEXT_PUBLIC_CMS_ENABLED is true but NEXT_PUBLIC_API_URL is empty, so the ` +
        `${path} slugs cannot be read. Set it, or turn the CMS off.`,
    );
  }

  const first = await page(path, 1);
  const items = [...first.items];
  for (let n = 2; n <= first.totalPages; n += 1) {
    items.push(...(await page(path, n)).items);
  }

  const slugs = items
    .map((item) => item.slug)
    .filter((slug): slug is string => typeof slug === "string" && slug.length > 0);

  // The shell is always included, not only when nothing is published: it is
  // what CloudFront serves for a slug published after this build ran.
  //
  // Nothing published is a legitimate answer - no open roles, no docs written
  // yet - and differs from the CMS being unreachable, which threw above.
  return [SHELL, ...slugs.map((slug) => ({ slug }))];
}
