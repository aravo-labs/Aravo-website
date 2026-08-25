"use client";

/**
 * The elevation rail: the page's spine.
 *
 * A fixed scale down the left gutter naming every level of the ascent, with a
 * marker whose position IS the scroll position. It exists so the page reads as
 * one continuous climb rather than as six stacked sections — which is the
 * whole difference between this layout and a conventional one.
 *
 * The marker is driven by `animation-timeline: scroll()`, so its position is
 * derived from the scroller itself. No listener, no rAF loop, and it cannot
 * drift out of sync with the page the way a JS-driven equivalent does under
 * load. Where that is unsupported the rail still renders as a static scale,
 * which is a legitimate reading of it.
 *
 * Hidden below `lg`: at narrow widths the gutter it needs is the content.
 */

const LEVELS = [
  { id: "door", label: "DOOR", tone: "signal" },
  { id: "l03", label: "LEVEL 03", tone: "blueprint" },
  { id: "l02", label: "LEVEL 02", tone: "blueprint" },
  { id: "l01", label: "LEVEL 01", tone: "blueprint" },
  { id: "ground", label: "GROUND", tone: "blueprint" },
  { id: "kerb", label: "KERB", tone: "signal" },
] as const;

export function Rail() {
  return (
    <aside
      aria-hidden
      className="pointer-events-none fixed top-0 left-0 z-30 hidden h-svh w-[var(--rail-w)] lg:block"
    >
      <div className="relative flex h-full flex-col justify-center py-24">
        {/* the scale itself */}
        <div className="relative ml-6 h-[62%]">
          <div className="absolute inset-y-0 left-0 w-px bg-rule-strong" />

          {/* the climbing marker */}
          <div className="ascent-marker absolute left-0 -translate-x-1/2 -translate-y-1/2">
            <span className="relative block size-2 rounded-full bg-signal">
              <span className="pulse-signal absolute -inset-1.5 rounded-full bg-signal" />
            </span>
          </div>

          {/* level ticks, top (DOOR) to bottom (KERB) */}
          <ul className="flex h-full flex-col justify-between">
            {LEVELS.map((l) => (
              <li key={l.id} className="flex items-center gap-2">
                <span
                  className={`h-px ${
                    l.tone === "signal" ? "w-3 bg-signal" : "w-2 bg-rule-strong"
                  }`}
                />
                <span
                  className={`font-mono text-[9px] tracking-[0.14em] whitespace-nowrap uppercase ${
                    l.tone === "signal" ? "text-signal" : "text-faint"
                  }`}
                >
                  {l.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* the axis label, set along the rail */}
        <span className="mt-8 ml-6 origin-left rotate-180 font-mono text-[9px] tracking-[0.2em] text-faint uppercase [writing-mode:vertical-rl]">
          Elevation
        </span>
      </div>
    </aside>
  );
}
