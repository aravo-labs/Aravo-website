"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { Nav } from "@/components/sections/Nav";
import { Button, Field, Input, Loading, Panel } from "@/components/dashboard/ui";
import {
  SignInError,
  clearAuthLink,
  readAuthLink,
  requestPasswordReset,
  signIn,
} from "@/lib/platform/auth";
import { safeNext } from "@/lib/platform/redirect";

function LoginInner() {
  const router = useRouter();
  const params = useSearchParams();
  // Never the raw parameter: see safeNext.
  const next = safeNext(params.get("next"));

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // What a confirmation link leaves behind.
  //
  // Supabase sends people here after they confirm an address, with the outcome
  // in the URL fragment: tokens when it worked, an error when the link had
  // already expired. Neither ever reaches the server, so it is read here.
  //
  // The tokens are deliberately not used to sign anyone in. Landing straight
  // in the dashboard from an email link is a surprise, and the address is
  // usually confirmed on a phone while the work is happening on a laptop. The
  // page says what happened and asks for the password, which is what someone
  // arriving from their inbox expects.
  useEffect(() => {
    const link = readAuthLink();
    if (link.kind === "none" && !params.get("verified")) return;

    if (link.kind === "error") {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- see above
      setError(link.message);
    } else {
      setNotice("Your email is confirmed. Sign in to finish setting up.");
    }
    // Clears the fragment, so a refresh does not replay the message and the
    // tokens do not sit in the address bar or the browser history.
    clearAuthLink();
  }, [params]);

  return (
    <main className="theme-marketing min-h-dvh bg-canvas">
      <Nav />
      <div className="mx-auto w-full max-w-[26rem] px-6 pt-24 pb-20">
        <h1 className="font-display text-[1.6rem] text-ink">Sign in</h1>
        <p className="mt-2 text-[14px] text-muted">
          To your delivery tracking dashboard.
        </p>

        {notice && (
          <p
            role="status"
            className="mt-6 rounded-[4px] border border-signal/30 bg-signal/5 px-4 py-3 text-[13px] text-ink"
          >
            {notice}
          </p>
        )}

        <Panel className="mt-8 p-6">
          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setBusy(true);
              setError(null);
              try {
                await signIn(email.trim(), password);
                router.replace(next);
              } catch (err) {
                setError(
                  err instanceof SignInError
                    ? err.message
                    : "Could not sign you in.",
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            <Field label="Email">
              <Input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field>

            {error && <p className="text-[13px] text-alert">{error}</p>}

            <Button type="submit" busy={busy} className="w-full">
              Sign in
            </Button>

            <button
              type="button"
              className="text-center font-mono text-[11px] text-ink-2 underline underline-offset-2 hover:text-ink"
              onClick={async () => {
                if (!email.trim()) {
                  setError("Enter your email first.");
                  return;
                }
                setError(null);
                try {
                  await requestPasswordReset(email.trim());
                  setSent(true);
                } catch {
                  // Deliberately the same message whether or not the address
                  // is registered: a different one turns this into a way to
                  // discover who has an account.
                  setSent(true);
                }
              }}
            >
              {sent ? "Check your email" : "Forgot password?"}
            </button>
          </form>
        </Panel>

        <p className="mt-6 text-center text-[13px] text-muted">
          No account yet?{" "}
          <Link href="/signup" className="text-signal underline underline-offset-2">
            Get an API key
          </Link>
        </p>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<Loading />}>
      <LoginInner />
    </Suspense>
  );
}
