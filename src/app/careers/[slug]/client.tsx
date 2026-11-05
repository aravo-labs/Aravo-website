"use client";

/**
 * One role, at its own address.
 *
 * Rendered in the browser rather than on the server, which is a change: it
 * used to fetch the role at request time so the title and description could
 * be real for a link posted anywhere. That is the better shape and should
 * come back when the CMS does.
 *
 * It moved because there is nothing to render today. The CMS is switched off,
 * so there are no roles, and a server component that fetches at build time
 * cannot be exported to static files at all.
 */


import { RolePage } from "@/components/careers/RolePage";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";
import { useSlug } from "@/lib/slug";

export default function RoleRoute() {
  // From the URL, not from `params`. A static export bakes one shell per known
  // slug, so a page published after the last build has no file of its own;
  // CloudFront serves a shell for it instead, and only the address bar knows
  // which page was asked for. See lib/slug.ts.
  const slug = useSlug();
  const job = useAsync(() => publicApi.job(slug).catch(() => null), [slug]);

  if (job.loading) return null;
  // Unpublished, renamed, or never existed. All of them are "not here".
  if (!job.data) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-24 text-center">
        <h1 className="text-2xl font-medium">Role not found</h1>
        <p className="mt-2 text-[var(--color-text-muted)]">
          This role may have closed or moved.
        </p>
      </main>
    );
  }
  return <RolePage job={job.data} />;
}
