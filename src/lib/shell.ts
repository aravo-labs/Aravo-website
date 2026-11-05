/**
 * The slug a dynamic route's shell is pre-rendered under.
 *
 * An export refuses a dynamic route with no routes at all, and CloudFront
 * needs a real file to point at for a path the build knew nothing about - a
 * page published in the admin panel since. Deliberately not a plausible slug:
 * anybody who publishes a page called this gets the shell, which renders their
 * page anyway, so the collision is harmless either way.
 *
 * In its own module, with no "use client", because both halves need it: the
 * client hook that reads the slug from the URL, and the build-time function
 * that decides which pages to pre-render.
 */
export const SHELL_SLUG = "_shell";
