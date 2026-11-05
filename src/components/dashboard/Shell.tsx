"use client";

/**
 * The dashboard frame: session gate, navigation, sign out.
 *
 * The gate is client-side because the session lives in the browser and every
 * call to the platform API carries a bearer token. That is not the security
 * boundary and is not pretending to be one: the API refuses an unauthenticated
 * request regardless of what this renders. This only decides what a person
 * sees, so a rendered screen with no data is confusing rather than dangerous.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef } from "react";

import { Loading, cx } from "@/components/dashboard/ui";
import { signOut, useSession, type Session } from "@/lib/platform/auth";
import { setAuthFailureHandler } from "@/lib/platform/client";

const NAV = [
  { href: "/dashboard", label: "Overview", exact: true },
  { href: "/dashboard/deliveries", label: "Deliveries" },
  { href: "/dashboard/devices", label: "Devices" },
  { href: "/dashboard/api-keys", label: "API keys" },
  { href: "/dashboard/settings", label: "Settings" },
];

const SessionContext = createContext<Session | null>(null);

/** The signed-in session. Only valid inside the dashboard. */
export function useAuth(): { token: string; email: string | null } {
  const session = useContext(SessionContext);
  if (!session) {
    throw new Error("useAuth must be used inside the dashboard shell.");
  }
  return { token: session.accessToken, email: session.email };
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { session, loading } = useSession();
  // A ref rather than state: this only stops a second redirect being issued,
  // and nothing renders differently because of it.
  const redirecting = useRef(false);

  useEffect(() => {
    // A token can be refused after it was stored: expired, revoked, or the
    // company suspended. Without this the screen shows an error with a retry
    // button that can never succeed, and the dead session stays in storage.
    setAuthFailureHandler(() => {
      if (redirecting.current) return;
      redirecting.current = true;
      signOut();
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    });
    return () => setAuthFailureHandler(null);
  }, [router, pathname]);

  useEffect(() => {
    if (!loading && !session && !redirecting.current) {
      redirecting.current = true;
      // `next` so signing in returns to where they were trying to go, rather
      // than dumping them on the overview and making them navigate again.
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, session, router, pathname]);

  if (loading || !session) return <Loading label="Checking your session" />;

  const signOutNow = () => {
    signOut();
    router.replace("/login");
  };

  return (
    <SessionContext.Provider value={session}>
      <div className="min-h-dvh bg-canvas lg:flex">
        {/*
          A rail on large screens, a scrolling strip on small ones.

          A fixed sidebar on a phone spends a third of the width on navigation
          that is used once a session, so below `lg` the same list lies down
          and scrolls sideways instead of being hidden behind a menu button
          nobody presses.
        */}
        <aside
          className={cx(
            "border-rule bg-surface",
            "border-b lg:h-dvh lg:w-[15rem] lg:shrink-0 lg:border-r lg:border-b-0",
            "lg:sticky lg:top-0 lg:flex lg:flex-col",
          )}
        >
          <div className="flex items-center justify-between gap-4 px-6 py-4 lg:px-5">
            <Link href="/" className="font-display text-[1.05rem] text-ink">
              Aravo
              <span className="ml-2 font-mono text-label text-ink-2 uppercase">
                Dashboard
              </span>
            </Link>
            {/* Sign out lives at the foot of the rail on large screens. */}
            <button
              type="button"
              onClick={signOutNow}
              className="font-mono text-label text-ink-2 uppercase transition-colors hover:text-signal lg:hidden"
            >
              Sign out
            </button>
          </div>

          <nav
            aria-label="Dashboard"
            className={cx(
              "flex gap-1 overflow-x-auto px-4 pb-2",
              "lg:flex-col lg:gap-0.5 lg:overflow-visible lg:px-3 lg:pb-0",
            )}
          >
            {NAV.map((item) => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={cx(
                    "relative rounded-[3px] px-3 py-2.5 font-mono text-label whitespace-nowrap uppercase transition-colors",
                    active
                      ? "text-signal lg:bg-signal-wash"
                      : "text-ink-2 hover:text-ink lg:hover:bg-sunken",
                  )}
                >
                  {item.label}
                  {/* Underline while horizontal, a left marker once stacked. */}
                  {active && (
                    <>
                      <span className="absolute inset-x-3 bottom-0 block h-px bg-signal lg:hidden" />
                      <span className="absolute inset-y-1.5 -left-px hidden w-0.5 rounded-full bg-signal lg:block" />
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto hidden border-t border-rule px-5 py-4 lg:block">
            <p className="truncate font-mono text-[11px] text-ink-2" title={session.email ?? ""}>
              {session.email}
            </p>
            <button
              type="button"
              onClick={signOutNow}
              className="mt-2 font-mono text-label text-ink-2 uppercase transition-colors hover:text-signal"
            >
              Sign out
            </button>
          </div>
        </aside>

        <main className="w-full min-w-0 px-6 py-10 sm:px-10 lg:py-12">
          <div className="mx-auto w-full max-w-[var(--shell-max)]">{children}</div>
        </main>
      </div>
    </SessionContext.Provider>
  );
}

export function PageHead({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="font-display text-[1.6rem] text-ink">{title}</h1>
        {description && (
          <p className="mt-1.5 max-w-[60ch] text-[14px] text-muted">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}
