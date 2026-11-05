import type { NextConfig } from "next";

/**
 * Static export is opt in, through NEXT_OUTPUT=export.
 *
 * Not permanent, because Vercel still serves this and flipping the config
 * outright would change how it builds there on the same day. The two targets
 * can exist together instead of one replacing the other.
 *
 * The three slug routes below are CMS pages. The CMS is switched off
 * (NEXT_PUBLIC_CMS_ENABLED), so they have no content to pre-render and the
 * export needs an empty generateStaticParams on each. If the CMS is ever
 * turned on, those routes need real slugs at build time - or a server.
 */
const nextConfig: NextConfig = {
  output: process.env.NEXT_OUTPUT === "export" ? "export" : undefined,
  // S3 serves /path/ as a directory; without this a refresh on a nested route
  // asks for an object that is not there and answers 404.
  trailingSlash: process.env.NEXT_OUTPUT === "export" ? true : undefined,
  images: {
    // No Next server to resize them once exported.
    unoptimized: process.env.NEXT_OUTPUT === "export",
  },
};

export default nextConfig;
