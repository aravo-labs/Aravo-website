"use client";

import { usePathname } from "next/navigation";

export { SHELL_SLUG } from "@/lib/shell";

/**
 * The slug from the address bar, rather than from the build.
 *
 * A static export pre-renders one HTML file per known slug, which means a page
 * published in the admin panel after the last build has no file and answers
 * 404. The content itself is fetched in the browser, so the HTML for every one
 * of these pages is the same shell - only the slug baked into `params` differs.
 *
 * Reading the slug from the URL instead makes that shell work for any slug,
 * which lets CloudFront serve one of them for a path it has no file for. A new
 * page then works the moment it is published, with no rebuild.
 *
 * The pre-rendered per-slug files are still generated, so the site is also
 * correct served from plain storage with no rewrite in front of it.
 */
export function useSlug(): string {
  const pathname = usePathname() ?? "";
  const segments = pathname.split("/").filter(Boolean);
  return segments.length > 0 ? decodeURIComponent(segments[segments.length - 1]) : "";
}

