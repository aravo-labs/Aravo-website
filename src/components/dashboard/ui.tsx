"use client";

/**
 * Dashboard primitives, in the site's own design language.
 *
 * Deliberately not the admin panel's component library. That one has its own
 * token names, and importing it here would put two design systems in one
 * repo where every component would have to be checked against both. These are
 * small and built on the tokens the marketing pages already use, so the
 * dashboard reads as the same product rather than a bolted-on application.
 */

import Link from "next/link";
import type { ReactNode } from "react";

export type Tone = "neutral" | "good" | "warn" | "bad" | "info";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "border-rule text-ink-2",
  good: "border-signal/40 bg-signal-wash text-signal-deep",
  warn: "border-blueprint/40 bg-blueprint-wash text-blueprint-mid",
  bad: "border-alert/30 bg-alert/5 text-alert-deep",
  info: "border-blueprint/30 bg-blueprint-soft/40 text-blueprint-mid",
};

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

export function Label({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-label text-ink-2 uppercase">{children}</p>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("border border-rule bg-surface", className)}>
      {children}
    </div>
  );
}

export function Stat({
  label,
  value,
  hint,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: Tone;
}) {
  return (
    <Panel className="p-5">
      <Label>{label}</Label>
      <p
        className={cx(
          "mt-3 font-display text-[2rem] leading-none tabular-nums",
          tone === "bad"
            ? "text-alert"
            : tone === "warn"
              ? "text-blueprint-mid"
              : "text-ink",
        )}
      >
        {typeof value === "number" ? value.toLocaleString() : value}
      </p>
      {hint && <p className="mt-2 text-[13px] text-muted">{hint}</p>}
    </Panel>
  );
}

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-[2px] border px-2 py-0.5",
        "font-mono text-[10px] tracking-[0.08em] uppercase",
        TONE_CLASS[tone],
      )}
    >
      {children}
    </span>
  );
}

export function Button({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled,
  busy,
  className,
  ariaLabel,
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit";
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  busy?: boolean;
  className?: string;
  /** For buttons that repeat down a table and need telling apart. */
  ariaLabel?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[3px] px-5 py-2.5 font-mono text-label uppercase transition-colors disabled:cursor-not-allowed disabled:opacity-50";
  const styles = {
    primary: "bg-ink text-white hover:bg-signal",
    secondary: "border border-rule-strong text-ink hover:border-ink",
    ghost: "text-ink-2 hover:text-ink",
    danger: "border border-alert/40 text-alert hover:bg-alert/5",
  }[variant];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || busy}
      aria-label={ariaLabel}
      aria-busy={busy || undefined}
      className={cx(base, styles, className)}
    >
      {busy ? "Working…" : children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="font-mono text-label text-ink-2 uppercase">{label}</span>
      <div className="mt-2">{children}</div>
      {(error || hint) && (
        <span
          className={cx(
            "mt-1.5 block text-[13px]",
            error ? "text-alert" : "text-muted",
          )}
        >
          {error ?? hint}
        </span>
      )}
    </label>
  );
}

const CONTROL =
  "w-full rounded-[3px] border border-rule bg-canvas px-3 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-faint focus:border-signal";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(CONTROL, props.className)} />;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={cx(CONTROL, props.className)} />;
}

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto border border-rule bg-surface">
      <table className="w-full border-collapse text-left">{children}</table>
    </div>
  );
}

export function Th({
  children,
  align = "left",
}: {
  children?: ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cx(
        "border-b border-rule px-4 py-3 font-mono text-[10px] font-normal tracking-[0.08em] text-ink-2 uppercase",
        align === "right" && "text-right",
      )}
    >
      {children}
    </th>
  );
}

export function Td({
  children,
  align = "left",
  mono,
}: {
  children?: ReactNode;
  align?: "left" | "right";
  mono?: boolean;
}) {
  return (
    <td
      className={cx(
        "border-b border-rule px-4 py-3 text-[14px] text-ink",
        align === "right" && "text-right tabular-nums",
        mono && "font-mono text-[12px]",
      )}
    >
      {children}
    </td>
  );
}

export function Loading({ label = "Loading" }: { label?: string }) {
  return (
    // `role="status"` so the change is announced. Without it the page silently
    // swaps its whole contents and anyone not watching the screen is told
    // nothing at all.
    <div role="status" aria-live="polite" className="px-6 py-20 text-center">
      <p className="font-mono text-label text-ink-2 uppercase">{label}…</p>
    </div>
  );
}

export function Empty({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border border-dashed border-rule px-6 py-16 text-center">
      <p className="font-display text-[1.25rem] text-ink">{title}</p>
      {description && (
        <p className="mx-auto mt-2 max-w-[48ch] text-[14px] text-muted">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function Failure({
  message,
  code,
  requestId,
  onRetry,
  action,
}: {
  message: string;
  code?: string;
  requestId?: string | null;
  onRetry?: () => void;
  /**
   * Offered instead of a retry when retrying cannot help.
   *
   * Some failures are a state the person is in rather than something that
   * went wrong in transit, and for those a "Try again" button is a loop with
   * no exit: it was on screen when an account with no company reached the
   * dashboard, and pressing it produced the same 403 every time.
   */
  action?: { label: string; href: string };
}) {
  return (
    // `role="alert"` rather than "status": a failure should interrupt, because
    // the alternative is someone waiting for a result that is never coming.
    <div
      role="alert"
      className="border border-alert/30 bg-alert/5 px-6 py-10 text-center"
    >
      <p className="text-[15px] text-alert-deep">{message}</p>
      {(code || requestId) && (
        <p className="mt-2 font-mono text-[11px] text-muted">
          {code}
          {requestId ? ` · ${requestId}` : ""}
        </p>
      )}
      {action ? (
        <div className="mt-5">
          <Link href={action.href}>
            <Button variant="secondary">{action.label}</Button>
          </Link>
        </div>
      ) : (
        onRetry && (
          <div className="mt-5">
            <Button variant="secondary" onClick={onRetry}>
              Try again
            </Button>
          </div>
        )
      )}
    </div>
  );
}

export function Pager({
  page,
  totalPages,
  totalItems,
  onChange,
}: {
  page: number;
  totalPages: number;
  totalItems: number;
  onChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-4 border-x border-b border-rule bg-surface px-4 py-3">
      <p className="font-mono text-[11px] text-ink-2">
        Page {page} of {totalPages} · {totalItems.toLocaleString()} total
      </p>
      <div className="flex gap-2">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >
          Previous
        </Button>
        <Button
          variant="secondary"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}

/**
 * How a delivery status is coloured.
 *
 * `inconclusive` is a warning, never an error. It means the sensor data could
 * not be used - a phone that was off, out of battery, in a bag or force
 * closed - which is a real outcome of a real delivery, not a fault in the
 * platform. Showing it in red teaches a dispatcher to chase the wrong thing.
 */
export const DELIVERY_TONE: Record<string, Tone> = {
  created: "neutral",
  started: "info",
  tracking: "info",
  completed: "info",
  processing: "info",
  processed: "good",
  inconclusive: "warn",
  failed: "bad",
  cancelled: "neutral",
};
