"use client";

/**
 * The public side of the SDK request queue.
 *
 * The endpoint, the rate limiting and the whole triage screen behind the admin
 * login already existed; nothing on the site posted to it, so that inbox could
 * never receive anything.
 *
 * Error keys are the API's field names, not shortened ones. Naming them after
 * the inputs is what left the careers form silently ignoring server
 * rejections, and there is no reason to repeat it here.
 */

import { useState } from "react";

import { ApiRequestError } from "@/lib/api/client";
import { publicApi } from "@/lib/api/public";
import { useAsync } from "@/lib/useAsync";

type FieldName = "name" | "email" | "company" | "platform" | "fleet_size" | "message";
type Errors = Partial<Record<FieldName, string>>;

/** The fields this form has somewhere to render an error. */
const FIELDS: readonly FieldName[] = [
  "name",
  "email",
  "company",
  "platform",
  "fleet_size",
  "message",
];

/**
 * Offered when the platform list has not answered yet, or has nothing in it.
 *
 * Not a list of platforms - it is the one answer that is true whatever the
 * product supports, so a slow request cannot leave somebody unable to submit
 * the form.
 */
const UNSURE = "Not sure yet";

const FLEET_SIZES = [
  "Under 25 drivers",
  "25 to 100",
  "100 to 500",
  "Over 500",
] as const;

const COPY = {
  eyebrow: "SDK access",
  title: "Request the SDK",
  intro:
    "Tell us what you are running and we will send integration keys and a sandbox to test against. No hardware, no rip-and-replace.",
  success: {
    title: "Request received.",
    body: "We will be in touch with your keys and a sandbox to test against, usually within a working day.",
  },
  submit: "Request access",
  submitting: "Sending",
};

export function RequestAccessForm() {
  /**
   * The platforms the panel says can be asked for.
   *
   * This was a list in this file - iOS, Android, Both, Not sure yet - which
   * had nothing to do with the platforms the site documents, and offered
   * combinations nobody could act on. It is the Platforms screen now, filtered
   * by the flag on each row, so what is offered here is a decision somebody
   * makes rather than a deploy.
   */
  const platforms = useAsync(() => publicApi.platforms(), []);
  const named = (platforms.data?.items ?? [])
    .filter((p) => p.request_enabled)
    .map((p) => p.name);

  /**
   * The platforms, then the two answers that are about the list rather than in
   * it.
   *
   * Both of them earn their place only when there is more than one platform to
   * choose between. Beside a single supported platform, "both" is meaningless
   * and "not sure yet" invites an answer that says nothing and reads as though
   * the list failed to load - which is also why an empty list still offers it:
   * a slow request must not leave somebody unable to submit.
   *
   * The combined option is worded by count rather than by name, so it stays
   * true when a third platform is added: two are "Both", more are "All
   * platforms". Nothing here knows that iOS and Android are the two.
   */
  const combined = named.length === 2 ? "Both" : "All platforms";

  let offered: string[];
  if (named.length === 0) offered = [UNSURE];
  else if (named.length === 1) offered = named;
  else offered = [...named, combined, UNSURE];

  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);

    const read = (field: FieldName) => String(data.get(field) ?? "").trim();
    const next: Errors = {};

    if (!read("name")) next.name = "Required";
    const email = read("email");
    if (!email) next.email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      next.email = "Enter a valid email";
    }

    setErrors(next);
    if (Object.keys(next).length) return;

    setBusy(true);
    setSubmitError(null);
    try {
      await publicApi.requestSdkAccess({
        name: read("name"),
        email,
        company: read("company") || null,
        platform: read("platform") || null,
        fleet_size: read("fleet_size") || null,
        message: read("message") || null,
      });
      setSent(true);
    } catch (err) {
      if (err instanceof ApiRequestError) {
        // Keep only what can be shown beside an input, and fall back to the
        // summary for anything that cannot be placed - otherwise a rejection
        // the form has no field for reads as the button doing nothing.
        const placeable: Errors = {};
        let unplaced = false;
        for (const [field, message] of Object.entries(err.fieldErrors)) {
          if ((FIELDS as readonly string[]).includes(field)) {
            placeable[field as FieldName] = message;
          } else {
            unplaced = true;
          }
        }
        setErrors(placeable);
        setSubmitError(
          Object.keys(placeable).length && !unplaced ? null : err.summary
        );
      } else {
        setSubmitError("Something went wrong sending your request.");
      }
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-xl border border-[var(--color-rule)] bg-white p-8 text-center">
        <p className="text-[17px] text-[var(--color-ink)]">{COPY.success.title}</p>
        <p className="mx-auto mt-2 max-w-[46ch] text-[15px] leading-[1.6] text-[var(--color-muted)]">
          {COPY.success.body}
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="flex flex-col gap-5 rounded-xl border border-[var(--color-rule)] bg-white p-6 sm:p-8"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Your name" name="name" required error={errors.name} />
        <Field
          label="Work email"
          name="email"
          type="email"
          required
          error={errors.email}
        />
        <Field label="Company" name="company" error={errors.company} />
        <Select label="Platform" name="platform" options={offered} error={errors.platform} />
      </div>

      <Select
        label="Fleet size"
        name="fleet_size"
        options={FLEET_SIZES}
        error={errors.fleet_size}
      />

      <div>
        <label htmlFor="message" className="mb-1.5 block text-[13px]">
          What are you trying to solve?
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder="Where deliveries are going wrong today, and what you have already tried."
          aria-invalid={!!errors.message}
          className={`w-full resize-y rounded-lg border px-3 py-2.5 text-[14px] leading-[1.6] outline-none transition-colors placeholder:text-[#b9b9b6] focus:border-[var(--color-accent)] ${
            errors.message ? "border-[#e8a0a0]" : "border-[var(--color-rule)]"
          }`}
        />
        {errors.message && (
          <p className="mt-1.5 text-[12px] text-[#c0392b]">{errors.message}</p>
        )}
      </div>

      {submitError && (
        <p className="rounded-lg bg-[#fdf0ee] px-3 py-2.5 text-[13px] text-[#c0392b]">
          {submitError}
        </p>
      )}

      <button
        type="submit"
        disabled={busy}
        className="self-start rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-[14px] text-white transition-opacity hover:opacity-90 disabled:opacity-60"
      >
        {busy ? COPY.submitting : COPY.submit}
      </button>
    </form>
  );
}

export const SDK_COPY = COPY;

/* ------------------------------------------------------------------ */

function Field({
  label,
  name,
  type = "text",
  required,
  error,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[13px]">
        {label} {required && <span className="text-[var(--color-accent)]">*</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        aria-invalid={!!error}
        className={`w-full rounded-lg border px-3 py-2.5 text-[14px] outline-none transition-colors placeholder:text-[#b9b9b6] focus:border-[var(--color-accent)] ${
          error ? "border-[#e8a0a0]" : "border-[var(--color-rule)]"
        }`}
      />
      {error && <p className="mt-1.5 text-[12px] text-[#c0392b]">{error}</p>}
    </div>
  );
}

function Select({
  label,
  name,
  options,
  error,
}: {
  label: string;
  name: string;
  options: readonly string[];
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-1.5 block text-[13px]">
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue=""
        aria-invalid={!!error}
        className={`w-full rounded-lg border bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-[var(--color-accent)] ${
          error ? "border-[#e8a0a0]" : "border-[var(--color-rule)]"
        }`}
      >
        <option value="">Select one</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      {error && <p className="mt-1.5 text-[12px] text-[#c0392b]">{error}</p>}
    </div>
  );
}
