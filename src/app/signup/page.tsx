"use client";

/**
 * Company registration.
 *
 * Two steps, because they are two different things: Supabase creates the
 * identity, and the platform API creates the company and attaches the identity
 * to it. Doing the second from the first would mean anyone who can sign up can
 * assert a membership, so the service decides it, not the auth provider.
 *
 * The API key is shown at the end and never again.
 */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { Nav } from "@/components/sections/Nav";
import {
  Button,
  Field,
  Input,
  Label,
  Loading,
  Panel,
} from "@/components/dashboard/ui";
import { accountApi } from "@/lib/platform/api";
import { SignInError, signIn, useSession } from "@/lib/platform/auth";
import { checkWorkEmail } from "@/lib/platform/workEmail";
import { ApiRequestError } from "@/lib/platform/client";
import type { RegistrationResult } from "@/lib/platform/types";

const CATEGORIES = [
  "E-commerce",
  "Grocery",
  "Food",
  "Pharmacy",
  "Documents",
  "Courier",
  "Other",
];

/**
 * The company details, parked while the address is confirmed.
 *
 * With email confirmation on, signup returns no session and the company cannot
 * be created yet. Everything typed into this form used to be discarded at that
 * point: the identity existed, the company never did, and the first thing the
 * new customer saw after confirming was the dashboard refusing them with
 * "This account is not a member of any company." There was no route out of
 * that through the interface.
 *
 * The server creates both in one request now, so nothing new is parked here.
 * What remains is the read side: anyone who started a signup under the old
 * flow may still have answers stored, and the completion form prefills from
 * them rather than making them type it all again.
 */
const PENDING_KEY = "Aravo.signup.pending";

type PendingCompany = {
  company: string; contact: string; location: string;
  category: string; partners: string; daily: string;
};

function readPending(): Partial<PendingCompany> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.sessionStorage.getItem(PENDING_KEY) ?? "{}");
  } catch {
    return {};
  }
}

function clearPending() {
  try {
    window.sessionStorage.removeItem(PENDING_KEY);
  } catch {
    /* nothing to do */
  }
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    company: "",
    contact: "",
    email: "",
    password: "",
    location: "",
    category: "",
    partners: "",
    daily: "",
  });
  const [busy, setBusy] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  // Errors appear on blur, not on every keystroke: telling somebody their
  // address is wrong while they are still typing the @ is noise.
  const [emailTouched, setEmailTouched] = useState(false);
  const [confirmTouched, setConfirmTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<RegistrationResult | null>(null);
  const [copied, setCopied] = useState(false);
  const [confirmNeeded, setConfirmNeeded] = useState(false);

  // Someone arriving here already signed in has confirmed their address and
  // come back to finish. They need the company half of this form and not the
  // account half - they already have an account.
  const { session, loading: sessionLoading } = useSession();
  const finishing = Boolean(session?.accessToken);

  // Reading back what was parked before the confirmation email. This is a
  // synchronise-from-an-external-store effect, which is what effects are for:
  // sessionStorage cannot be read during render without risking a hydration
  // mismatch, since the server has no access to it and would render empty.
  // It runs once, when the session resolves and we learn which form this is.
  useEffect(() => {
    if (!finishing) return;
    const pending = readPending();
    if (!Object.keys(pending).length) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
    setForm((f) => ({ ...f, ...pending }));
  }, [finishing]);

  const set = (k: keyof typeof form) => (v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const emailVerdict = checkWorkEmail(form.email);
  const emailProblem =
    emailTouched && !emailVerdict.ok ? emailVerdict.reason : null;
  const passwordProblem =
    confirmTouched && confirmPassword && confirmPassword !== form.password
      ? "The two passwords do not match."
      : null;
  const canSubmit =
    finishing ||
    (emailVerdict.ok &&
      form.password.length >= 8 &&
      confirmPassword === form.password);

  /** The company half, which is the same whichever route got us here. */
  const companyPayload = () => ({
    name: form.company.trim(),
    contact_name: form.contact.trim(),
    location: form.location.trim() || null,
    delivery_category: form.category || null,
    delivery_partner_count: form.partners ? Number(form.partners) : null,
    average_daily_deliveries: form.daily ? Number(form.daily) : null,
  });

  // Until the session is read we do not know which of the two forms this is,
  // and rendering the wrong heading first makes the page look like it changed
  // its mind.
  if (sessionLoading) {
    return (
      <main className="theme-marketing min-h-dvh bg-canvas">
        <Nav />
        <Loading label="Loading" />
      </main>
    );
  }

  if (result) {
    return (
      <main className="theme-marketing min-h-dvh bg-canvas">
        <Nav />
        <div className="mx-auto w-full max-w-[40rem] px-6 pt-24 pb-20">
          <h1 className="font-display text-[1.6rem] text-ink">
            {result.company.name} is set up
          </h1>

          <Panel className="mt-8 border-signal/50 bg-signal-wash p-6">
            <Label>Your API key</Label>
            <p className="mt-2 text-[14px] text-ink">
              Copy it now. This is the only time it will ever be shown: only a
              hash of it is stored, so it cannot be recovered later by you, by
              us, or by support. If you lose it, issue a new one from the
              dashboard.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <code className="flex-1 overflow-x-auto rounded-[3px] border border-rule bg-canvas px-3 py-2.5 font-mono text-[13px] text-ink">
                {result.api_key}
              </code>
              <Button
                variant="secondary"
                onClick={() => {
                  void navigator.clipboard.writeText(result.api_key);
                  setCopied(true);
                }}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </Panel>

          <Panel className="mt-4 p-6">
            <Label>What happens next</Label>
            <ol className="mt-3 flex flex-col gap-2 text-[14px] text-muted">
              <li>1. Put this key into your Android application.</li>
              <li>
                2. Each handset registers once with it and receives its own
                short-lived token. The key itself never uploads anything, so a
                key lifted out of an APK cannot write deliveries on its own.
              </li>
              <li>
                3. Open a delivery from your dispatch system, or from the
                handset, and the sensor data starts arriving here.
              </li>
            </ol>
            <div className="mt-6 flex gap-3">
              <Button onClick={() => router.push("/dashboard")}>
                Go to the dashboard
              </Button>
              <Link href="/docs">
                <Button variant="secondary">Read the docs</Button>
              </Link>
            </div>
          </Panel>
        </div>
      </main>
    );
  }

  if (confirmNeeded) {
    return (
      <main className="theme-marketing min-h-dvh bg-canvas">
        <Nav />
        <div className="mx-auto w-full max-w-[28rem] px-6 pt-24 pb-20">
          <h1 className="font-display text-[1.6rem] text-ink">
            Confirm your email
          </h1>
          <p className="mt-3 text-[14px] text-muted">
            <strong className="text-ink">
              {form.company || "Your company"}
            </strong>{" "}
            is created. We sent a link to{" "}
            <strong className="text-ink">{form.email}</strong> - open it, then
            sign in and your dashboard is ready.
          </p>
          <p className="mt-3 text-[14px] text-muted">
            You will create your API key from the dashboard, whenever you are
            ready to start integrating.
          </p>
          <div className="mt-6">
            <Link href="/login">
              <Button variant="secondary">Go to sign in</Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="theme-marketing min-h-dvh bg-canvas">
      <Nav />
      <div className="mx-auto w-full max-w-[52rem] px-6 pt-6 pb-10 [@media(min-height:820px)]:pt-14 [@media(min-height:820px)]:pb-16">
        <h1 className="font-display text-[1.6rem] text-ink">
          {finishing ? "Finish setting up your company" : "Get an API key"}
        </h1>
        <p className="mt-1.5 max-w-[62ch] text-[14px] text-muted">
          {finishing
            ? "Your email is confirmed. Tell us about the company and we will issue your key."
            : "Create your company account. You will get a key at the end, and a dashboard to watch deliveries arrive."}
        </p>

        <Panel className="mt-4 p-5 [@media(min-height:820px)]:mt-6 [@media(min-height:820px)]:p-7">
          <form
            className="flex flex-col gap-3.5 [@media(min-height:820px)]:gap-5"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              try {
                // Already signed in: the account exists and only the company
                // is missing. This is the path back from a confirmation link.
                if (finishing && session) {
                  const registered = await accountApi.register(
                    { token: session.accessToken },
                    companyPayload(),
                  );
                  clearPending();
                  setResult(registered);
                  return;
                }

                // One request. The server creates the identity, sends the
                // confirmation email and creates the company together, because
                // the second part needs a session the browser does not have
                // until the link is opened.
                const accepted = await accountApi.signup({
                  email: form.email.trim(),
                  password: form.password,
                  ...companyPayload(),
                });
                clearPending();

                if (accepted.confirmation_required) {
                  setConfirmNeeded(true);
                  return;
                }

                // Confirmation is off for this project, so they can go
                // straight in.
                await signIn(form.email.trim(), form.password);
                router.replace("/dashboard");
              } catch (err) {
                setError(
                  err instanceof SignInError || err instanceof ApiRequestError
                    ? err.message
                    : "Could not complete that signup.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Company name">
                <Input
                  required
                  minLength={2}
                  value={form.company}
                  onChange={(e) => set("company")(e.target.value)}
                />
              </Field>
              <Field label="Your name">
                <Input
                  required
                  value={form.contact}
                  onChange={(e) => set("contact")(e.target.value)}
                />
              </Field>
            </div>

            {/* Not asked for when the account already exists. */}
            {!finishing && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Work email"
                  hint="Your company address, not a personal one."
                  error={emailProblem ?? undefined}
                >
                  <Input
                    type="email"
                    required
                    autoComplete="email"
                    value={form.email}
                    onChange={(e) => set("email")(e.target.value)}
                    onBlur={() => setEmailTouched(true)}
                  />
                </Field>
                <Field label="Password" hint="At least eight characters.">
                  <Input
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    value={form.password}
                    onChange={(e) => set("password")(e.target.value)}
                  />
                </Field>
                <div className="sm:col-span-2">
                  <Field
                    label="Confirm password"
                    error={passwordProblem ?? undefined}
                  >
                    <Input
                      type="password"
                      required
                      autoComplete="new-password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      onBlur={() => setConfirmTouched(true)}
                    />
                  </Field>
                </div>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="City">
                <Input
                  value={form.location}
                  onChange={(e) => set("location")(e.target.value)}
                />
              </Field>
              <Field label="What you deliver">
                <select
                  value={form.category}
                  onChange={(e) => set("category")(e.target.value)}
                  className="w-full rounded-[3px] border border-rule bg-canvas px-3 py-2.5 text-[15px] text-ink outline-none focus:border-signal"
                >
                  <option value="">Select</option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Delivery partners" hint="Roughly. You can change it later.">
                <Input
                  type="number"
                  min={0}
                  value={form.partners}
                  onChange={(e) => set("partners")(e.target.value)}
                />
              </Field>
              <Field label="Deliveries a day" hint="Roughly.">
                <Input
                  type="number"
                  min={0}
                  value={form.daily}
                  onChange={(e) => set("daily")(e.target.value)}
                />
              </Field>
            </div>

            {error && <p className="text-[13px] text-alert">{error}</p>}

            <Button
              type="submit"
              busy={busy}
              disabled={busy || !canSubmit}
              className="w-full"
            >
              {finishing ? "Create company and issue key" : "Create account"}
            </Button>

            {/*
              Signup takes three to four seconds, nearly all of it waiting for
              the confirmation email to be sent before the account exists. A
              spinner alone reads as a hang at that length, so the wait says
              what it is waiting for.
            */}
            {busy && (
              <p role="status" className="text-center text-[13px] text-muted">
                Creating your account and sending your confirmation email. This
                takes a few seconds.
              </p>
            )}
          </form>
        </Panel>

        <p className="mt-5 text-center text-[13px] text-muted">
          Already have an account?{" "}
          <Link href="/login" className="text-signal underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
}
