import StandalonePage from "./client";
import { publishedSlugs } from "@/lib/api/buildSlugs";

/**
 * The standalone page slugs, read from the CMS at build time.
 *
 * These are the pages written in the admin panel - privacy, terms, anything
 * added later - and a static export needs to know them before it is deployed,
 * so adding one needs a rebuild before it resolves.
 *
 * With the CMS switched off this returns a single placeholder instead.
 *
 * This file is a server component purely so it can export the function:
 * generateStaticParams cannot be exported from a client component, and the
 * page itself renders entirely in the browser.
 */
export async function generateStaticParams() {
  return publishedSlugs("pages");
}

export default function Page() {
  // Nothing is forwarded. The slug comes from the URL inside the client
  // component, so one pre-rendered shell can serve any slug - including a
  // page published after the last build. See lib/slug.ts.
  return <StandalonePage />;
}
