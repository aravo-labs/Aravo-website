import RoleRoute from "./client";
import { publishedSlugs } from "@/lib/api/buildSlugs";

/**
 * The open role slugs, read from the CMS at build time.
 *
 * Posting a role needs a rebuild before its page resolves. With no roles
 * published, or the CMS switched off, this returns a single placeholder and
 * every slug renders the not-found state.
 */
export async function generateStaticParams() {
  return publishedSlugs("jobs");
}

export default function Page() {
  // Nothing is forwarded. The slug comes from the URL inside the client
  // component, so one pre-rendered shell can serve any slug - including a
  // page published after the last build. See lib/slug.ts.
  return <RoleRoute />;
}
