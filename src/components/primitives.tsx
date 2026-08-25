import type { ReactNode } from "react";

/**
 * Shared layout and text primitives.
 *
 * The careers, team, docs and SDK pages are built on these, so the exported
 * signatures are held stable deliberately: restyling here re-skins the whole
 * site in one place instead of leaving four pages behind on the old palette.
 */

/**
 * The centred content column, with the 1px rules down both gutters that give
 * the site its continuous grid.
 */
export function Shell({
  children,
  className = "",
  rules = true,
}: {
  children: ReactNode;
  className?: string;
  rules?: boolean;
}) {
  return (
    <div className="relative mx-auto w-full max-w-[1440px] px-4 sm:px-8">
      <div
        className={`relative mx-auto w-full max-w-[var(--shell-max)] ${
          rules ? "border-x border-rule" : ""
        } ${className}`}
      >
        {children}
      </div>
    </div>
  );
}

/**
 * A level marker: the mono label that names where you are in the ascent.
 *
 * Every section carries one, and they read as a sequence — KERB, GROUND,
 * LEVEL 01, LEVEL 02, LEVEL 03, DOOR — so the page announces its own
 * structure rather than relying on the reader to infer it.
 */
export function Level({
  children,
  tone = "blueprint",
}: {
  children: ReactNode;
  tone?: "blueprint" | "signal";
}) {
  const colour = tone === "signal" ? "text-signal" : "text-blueprint";
  return (
    <span
      className={`inline-flex items-center gap-2 font-mono text-label uppercase ${colour}`}
    >
      <span aria-hidden className="h-px w-5 bg-current opacity-50" />
      {children}
    </span>
  );
}

/**
 * UPPERCASE mono label with a leading rule.
 *
 * Kept for the pages that already use it. The old version had a filled square
 * bullet; a rule reads as an annotation leader on a drawing, which is the
 * register this site is now in.
 */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 font-mono text-label uppercase text-signal">
      <span aria-hidden className="h-px w-6 bg-signal" />
      {children}
    </span>
  );
}

/**
 * The section header: eyebrow and heading left, lede pinned right.
 *
 * `heading` takes a node so a caller can accent part of it.
 */
export function SectionHeader({
  eyebrow,
  heading,
  lede,
  level,
}: {
  eyebrow: string;
  heading: ReactNode;
  lede: string;
  /** Optional level marker, shown above the eyebrow. */
  level?: string;
}) {
  return (
    <div className="grid gap-8 px-6 py-16 sm:px-10 md:grid-cols-[1fr_minmax(0,24rem)] md:gap-16 lg:py-24">
      <div data-reveal className="flex flex-col items-start gap-5">
        {level && <Level>{level}</Level>}
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2 className="max-w-[18ch] text-[2rem] leading-[1.05] font-medium tracking-[-0.018em] text-ink sm:text-[2.6rem]">
          {heading}
        </h2>
      </div>
      <p
        data-reveal
        style={{ "--reveal-delay": "90ms" } as React.CSSProperties}
        className="self-end text-[15px] leading-[1.65] text-muted sm:text-lede"
      >
        {lede}
      </p>
    </div>
  );
}

/**
 * The site's button.
 *
 * Square-ish rather than a pill: the pill is the shape the rest of this
 * sector uses, and a 4px radius sits with the drawing language better.
 */
export function PillButton({
  children,
  href,
  variant = "solid",
  className = "",
}: {
  children: ReactNode;
  href?: string;
  variant?: "solid" | "outline" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[3px] px-6 py-3.5 font-mono text-label uppercase transition-colors duration-200";

  const styles = {
    solid: "bg-signal text-white hover:bg-signal-deep",
    outline:
      "border border-rule-strong bg-surface text-ink hover:border-ink hover:bg-ink hover:text-white",
    ghost: "text-ink hover:text-signal",
  }[variant];

  const cls = `${base} ${styles} ${className}`;
  return href ? (
    <a href={href} className={cls}>
      {children}
    </a>
  ) : (
    <button type="button" className={cls}>
      {children}
    </button>
  );
}

/**
 * The company name, set.
 *
 * A plain string rather than the three-part split it used to take. That split
 * existed to give a fourteen-character lowercase name a rhythm by weighting
 * its middle word; the name comes from the admin panel now, and nothing here
 * can know where a name somebody types has its middle. Weight carries it
 * instead, which works on any name.
 *
 * The mark that sits beside it lives in `Brand`, with the settings call that
 * supplies both.
 */
export function Wordmark({ name, className = "" }: { name: string; className?: string }) {
  return (
    <span className={`text-[17px] font-semibold tracking-[-0.018em] text-ink ${className}`}>
      {name}
    </span>
  );
}

/**
 * A monospaced event name, as it appears in the SDK payload.
 *
 * Rendered as code because that is what it is: these are the literal strings
 * a developer will match on, and dressing them up as prose loses that.
 */
export function EventCode({ children }: { children: ReactNode }) {
  return (
    <code className="rounded-[2px] bg-signal-soft px-1.5 py-0.5 font-mono text-[12px] tracking-normal text-signal-deep">
      {children}
    </code>
  );
}

/** Splits "Driver {strong} the building" into styled spans. */
export function EventLabel({
  label,
  strong,
}: {
  label: string;
  strong: string;
}) {
  const [before, after] = label.split("{strong}");
  return (
    <span>
      {before}
      <span className="font-medium text-ink">{strong}</span>
      {after}
    </span>
  );
}
