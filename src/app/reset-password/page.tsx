"use client";

/** Lands here from the emailed link, which carries the token in the fragment. */

import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore } from "react";

import { Nav } from "@/components/sections/Nav";
import { Button, Field, Input, Panel } from "@/components/dashboard/ui";
import {
  SignInError,
  clearAuthLink,
  readAuthLink,
  setPasswordWithLink,
  type AuthLink,
} from "@/lib/platform/auth";

/**
 * The URL fragment is an external store, not React state: it exists before the
 * component and is read exactly once. Memoised because `useSyncExternalStore`
 * demands a referentially stable snapshot, and because the fragment is stripped
 * from the address bar immediately afterwards - a second read would find
 * nothing.
 */
let cachedLink: AuthLink | null = null;
function linkSnapshot(): AuthLink {
  if (cachedLink === null) cachedLink = readAuthLink();
  return cachedLink;
}
/** The fragment cannot change without a reload, so there is nothing to watch. */
const noSubscribe = () => () => {};

export default function ResetPasswordPage() {
  const router = useRouter();
  // `null` on the server and during hydration, which renders the waiting state.
  const link = useSyncExternalStore(noSubscribe, linkSnapshot, () => null);
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <main className="theme-marketing min-h-dvh bg-canvas">
      <Nav />
      <div className="mx-auto w-full max-w-[26rem] px-6 pt-24 pb-20">
        <h1 className="font-display text-[1.6rem] text-ink">Set a password</h1>

        <Panel className="mt-8 p-6">
          {link && link.kind === "none" ? (
            <p className="text-[14px] text-muted">
              This page needs the link from your email. Open the one we sent,
              or request another from the sign-in screen.
            </p>
          ) : (
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError(null);
                try {
                  if (link?.kind !== "tokens") {
                    throw new SignInError("That link is no longer valid.");
                  }
                  await setPasswordWithLink(link, password);
                  clearAuthLink();
                  router.replace("/dashboard");
                } catch (err) {
                  setError(
                    err instanceof SignInError
                      ? err.message
                      : "Could not set that password.",
                  );
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Field label="New password" hint="At least eight characters.">
                <Input
                  type="password"
                  autoComplete="new-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </Field>
              {error && <p className="text-[13px] text-alert">{error}</p>}
              <Button type="submit" busy={busy} className="w-full">
                Set password
              </Button>
            </form>
          )}
        </Panel>
      </div>
    </main>
  );
}
