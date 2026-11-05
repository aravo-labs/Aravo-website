/**
 * The CloudFront viewer-request function's routing.
 *
 * This runs in front of every request to the site, and it is the piece that
 * lets a page published in the admin panel work without a rebuild. Getting it
 * wrong does not fail a build or throw anywhere - it quietly serves the wrong
 * file, or sends /login to a CMS lookup that will never find anything. So the
 * rewrites are asserted here rather than checked by hand after a deploy.
 *
 * The function is generated from the build output by
 * scripts/build-cf-function.mjs, so this test reads the generated file. If the
 * build has not run, it is skipped rather than failing: the generated file is
 * a deploy artefact, not source.
 */

import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

import { describe, expect, it } from "vitest";

const GENERATED = resolve(__dirname, "../../../scripts/cf-dir-index.js");

type Handler = (event: { request: { uri: string } }) => { uri: string };

function load(): Handler {
  const source = readFileSync(GENERATED, "utf8");
  // The file is CloudFront Functions JavaScript, not a module: it declares
  // `function handler` and exports nothing.
  return new Function(`${source}; return handler;`)() as Handler;
}

const cases: [string, string][] = [
  // The root, and ordinary directory-style routes.
  ["/", "/index.html"],
  ["/login/", "/login/index.html"],
  ["/signup/", "/signup/index.html"],
  ["/team/", "/team/index.html"],
  ["/docs/", "/docs/index.html"],
  ["/careers/", "/careers/index.html"],
  ["/dashboard/api-keys/", "/dashboard/api-keys/index.html"],
  ["/dashboard/deliveries/detail/", "/dashboard/deliveries/detail/index.html"],

  // A missing trailing slash still resolves.
  ["/docs", "/docs/index.html"],

  // Dynamic routes go to their shell, whether or not the slug existed at
  // build time. This is the part that makes publishing work without a rebuild.
  ["/docs/two-credentials/", "/docs/_shell/index.html"],
  ["/docs/a-page-added-after-the-build/", "/docs/_shell/index.html"],
  ["/careers/senior-android-engineer/", "/careers/_shell/index.html"],

  // A single unreserved segment at the root is a CMS page.
  ["/refund-policy/", "/_shell/index.html"],
  ["/refund-policy", "/_shell/index.html"],

  // Reserved top-level names are real pages and keep their own file, even
  // though they happen to be CMS-backed.
  ["/privacy/", "/privacy/index.html"],
  ["/terms/", "/terms/index.html"],

  // Next asks for a route's React payload as a sibling file when navigating.
  // A slug published since the last build has no copy of its own, and without
  // this the result is a 404 in the console of a page that otherwise works.
  [
    "/docs/rate-limits/__next.docs.$d$slug.__PAGE__.txt",
    "/docs/_shell/__next.docs.$d$slug.__PAGE__.txt",
  ],
  [
    "/careers/some-role/__next.careers.$d$slug.__PAGE__.txt",
    "/careers/_shell/__next.careers.$d$slug.__PAGE__.txt",
  ],
  ["/refund-policy/__next.$d$slug.__PAGE__.txt", "/_shell/__next.$d$slug.__PAGE__.txt"],

  // A reserved route's own payload is real and must not be redirected.
  ["/privacy/__next.$d$slug.__PAGE__.txt", "/privacy/__next.$d$slug.__PAGE__.txt"],
  ["/__next._tree.txt", "/__next._tree.txt"],

  // Anything with an extension is an asset and is left alone.
  ["/_next/static/chunks/a.js", "/_next/static/chunks/a.js"],
  ["/img/hero-street-2.jpg", "/img/hero-street-2.jpg"],
  ["/favicon.ico", "/favicon.ico"],
  ["/404.html", "/404.html"],
];

describe.skipIf(!existsSync(GENERATED))("the CloudFront directory-index function", () => {
  it.each(cases)("%s -> %s", (uri, expected) => {
    expect(load()({ request: { uri } }).uri).toBe(expected);
  });

  it("never sends a reserved route to a shell", () => {
    const handler = load();
    for (const route of ["/login/", "/signup/", "/team/", "/dashboard/", "/sdk-access/"]) {
      expect(handler({ request: { uri: route } }).uri).not.toContain("_shell");
    }
  });
});
