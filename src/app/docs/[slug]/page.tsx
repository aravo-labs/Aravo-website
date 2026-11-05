import DocPageRoute from "./client";
import { publishedSlugs } from "@/lib/api/buildSlugs";

/**
 * The documentation slugs, read from the CMS at build time.
 *
 * A static export needs every URL up front, so the list is fetched while the
 * site builds. Publishing a page in the admin panel therefore needs a rebuild
 * before it appears, which is the trade a static export makes.
 *
 * With the CMS switched off this returns a single placeholder instead: the
 * route exists, nothing lives at it, and a direct hit gets the 404 page rather
 * than a blank shell.
 *
 * This file is a server component purely so it can export the function:
 * generateStaticParams cannot be exported from a client component, and the
 * page itself renders entirely in the browser.
 */
export async function generateStaticParams() {
  return publishedSlugs("docs");
}

export default function Page() {
  // Nothing is forwarded. The slug comes from the URL inside the client
  // component, so one pre-rendered shell can serve any slug - including a
  // page published after the last build. See lib/slug.ts.
  return <DocPageRoute />;
}
