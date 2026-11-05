/**
 * Where a `?next=` parameter is allowed to send someone.
 *
 * Taken straight from the query string, `next` is an open redirect: anyone can
 * send `/login?next=https://evil.example/phish`, and a person who signs in
 * lands on an attacker's page having just typed their password on ours. That
 * is the classic setup for a convincing credential-harvesting flow, because
 * every visible step up to the redirect really was the genuine site.
 *
 * So only same-site paths are honoured.
 *
 * The prefix checks below are not enough on their own, and an earlier version
 * of this file shipped with only those. Browsers delete tab, newline and
 * carriage return from a URL before resolving it, so `/<tab>/evil.example`
 * does not start with `//` when this code inspects it and is `//evil.example`
 * by the time the browser acts on it - which is an absolute URL. `?next=`
 * carries percent-encoded bytes, so `%09` was all it took.
 *
 * The authority is therefore the URL parser rather than string inspection:
 * resolve the candidate against a base that is definitely not us, and require
 * that it stayed there. Anything that escapes to another origin, by any trick
 * the parser knows about and this comment does not, fails that check.
 */
const FALLBACK = "/dashboard";

/** Deliberately unreachable: only ever a yardstick for "did this stay put". */
const BASE = "https://redirect-check.invalid";

export function safeNext(value: string | null | undefined, fallback = FALLBACK): string {
  if (!value) return fallback;

  // Strip exactly what a browser strips, so this sees what the browser sees.
  const cleaned = value.replace(/[\t\n\r]/g, "");

  if (!cleaned.startsWith("/")) return fallback;
  // Cheap rejections first: both are absolute to a browser.
  if (cleaned.startsWith("//") || cleaned.startsWith("/\\")) return fallback;

  try {
    const resolved = new URL(cleaned, BASE);
    if (resolved.origin !== BASE) return fallback;
    // Rebuilt from the parsed parts rather than returned as given, so what
    // ships is a normalised path and not the original string.
    return `${resolved.pathname}${resolved.search}${resolved.hash}`;
  } catch {
    return fallback;
  }
}
