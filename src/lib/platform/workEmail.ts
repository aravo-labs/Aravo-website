/**
 * Is this a work address, or a personal one?
 *
 * Aravo sells to companies, and an account opened on a personal address is one
 * nobody at that company can recover when the person leaves. So signup asks
 * for a work address and says so when it does not get one.
 *
 * This is a list of consumer mailbox providers, which makes it a heuristic
 * rather than a rule: it cannot tell a real company domain from an invented
 * one, and a genuine small business running on Gmail is refused by it. That
 * trade is deliberate - the common case is somebody typing their personal
 * address out of habit, and a sentence explaining why is more useful to them
 * than silently accepting it.
 *
 * Kept deliberately short. A long list looks thorough and mostly adds domains
 * nobody signs up with, while still missing the next one.
 */
const CONSUMER_DOMAINS = new Set([
  "gmail.com",
  "googlemail.com",
  "yahoo.com",
  "yahoo.co.in",
  "yahoo.co.uk",
  "hotmail.com",
  "outlook.com",
  "live.com",
  "msn.com",
  "aol.com",
  "icloud.com",
  "me.com",
  "mac.com",
  "proton.me",
  "protonmail.com",
  "zoho.com",
  "gmx.com",
  "yandex.com",
  "rediffmail.com",
]);

/**
 * Throwaway inboxes. Separate from the list above because the reason differs:
 * these are not somebody's personal address, they are an address that will not
 * exist next week, and a confirmation link sent to one is a support ticket
 * waiting to happen.
 */
const DISPOSABLE_DOMAINS = new Set([
  "mailinator.com",
  "yopmail.com",
  "guerrillamail.com",
  "10minutemail.com",
  "tempmail.com",
  "trashmail.com",
  "sharklasers.com",
  "getnada.com",
  "maildrop.cc",
]);

export type WorkEmailVerdict =
  | { ok: true }
  | { ok: false; reason: string };

export function checkWorkEmail(value: string): WorkEmailVerdict {
  const email = value.trim().toLowerCase();
  if (!email) return { ok: true }; // let `required` speak for an empty field

  const at = email.lastIndexOf("@");
  if (at < 1 || at === email.length - 1) {
    return { ok: false, reason: "That does not look like an email address." };
  }

  const domain = email.slice(at + 1);

  if (DISPOSABLE_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason:
        "That is a temporary inbox. Use an address you will still have access to, because your API key and your account recovery both depend on it.",
    };
  }

  if (CONSUMER_DOMAINS.has(domain)) {
    return {
      ok: false,
      reason:
        "Please use your work address. An account opened on a personal one cannot be recovered by anyone else at your company.",
    };
  }

  return { ok: true };
}
