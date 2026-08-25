/** Original line icons, 24x24 grid, 1.5 stroke. */

type P = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export const Icons = {
  /**
   * The logo mark.
   *
   * The name says what the drawing has to say: a route that gets INSIDE. So
   * the mark is an enclosure with a gap in its wall — the entrance — and a
   * path that comes in through the gap, turns, and goes up, ending at the
   * drop-off. It is the product in two strokes.
   *
   * Built to survive being small. The enclosure is a single closed form, the
   * route is one polyline, and there is no detail below about 2px at a 20px
   * render, which is where a mark with more in it turns to mush in a browser
   * tab.
   *
   * The enclosure takes `currentColor` so the mark inherits whatever text
   * colour it sits in; only the route is fixed to the signal colour, which
   * keeps the two-colour rule of the design system intact — structure is ink,
   * the detected route is signal.
   */
  logo: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      {/* The enclosure, with a doorway low in the left wall.
          The opening sits at the bottom of that wall, not the middle: you
          enter a building at ground level, and putting it mid-height made the
          mark read as a plug going into a socket. A short stub is left before
          the corner so the form still closes. */}
      <path
        d="M7 4 H17 A3 3 0 0 1 20 7 V17 A3 3 0 0 1 17 20 H7 A3 3 0 0 1 4 17 V15.8 M4 12.5 V7 A3 3 0 0 1 7 4"
        stroke="currentColor"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* In through the doorway, then up. The riser is close to the length of
          the approach on purpose — the ascent is the half that matters, and
          the first attempt had a long run into a stub, which read as a pin
          rather than a climb. Starting outside the wall says "arriving". */}
      <path
        d="M3 14.2 H12.5 V8.9"
        stroke="var(--color-signal, #367588)"
        strokeWidth={1.7}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* the drop-off */}
      <circle cx={12.5} cy={8} r={1.45} fill="var(--color-signal, #367588)" />
    </svg>
  ),

  door: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17" />
      <path d="M4 21h16" />
      <circle cx="14.5" cy="12.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  ),

  car: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 17h14M4 17v-4.2a2 2 0 0 1 .2-.9l1.9-3.8A2 2 0 0 1 7.9 7h8.2a2 2 0 0 1 1.8 1.1l1.9 3.8a2 2 0 0 1 .2.9V17" />
      <circle cx="7.5" cy="17" r="1.6" />
      <circle cx="16.5" cy="17" r="1.6" />
    </svg>
  ),

  review: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5M8.5 11h5M11 8.5v5" />
    </svg>
  ),

  clock: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  ),

  compass: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.8 4.2L9 15l1.8-4.2z" />
    </svg>
  ),

  chart: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 20h16M7 20v-5.5M12 20V8m5 12v-8.5" />
    </svg>
  ),

  stairs: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M4 19h4v-4h4v-4h4V7h4" />
    </svg>
  ),

  building: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16M15 10h3a1 1 0 0 1 1 1v10M3 21h18" />
      <path d="M8 8h3M8 12h3M8 16h3" />
    </svg>
  ),

  package: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 3 4 7v10l8 4 8-4V7z" />
      <path d="M12 12 4 7m8 5 8-5m-8 5v9" />
    </svg>
  ),

  close: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity={0.9} />
      <path
        d="m9.5 9.5 5 5m0-5-5 5"
        stroke="#ffffff"
        strokeWidth={1.6}
        strokeLinecap="round"
      />
    </svg>
  ),

  chevron: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="m6 9 6 6 6-6" />
    </svg>
  ),

  arrowLeft: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),

  share: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <path d="M12 15V4m0 0L8.5 7.5M12 4l3.5 3.5M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </svg>
  ),

  help: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M10 9.5a2 2 0 1 1 2.6 1.9c-.4.2-.6.6-.6 1v.6" />
      <circle cx="12" cy="16.2" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  ),

  calendar: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <rect x="4" y="5.5" width="16" height="14" rx="2" />
      <path d="M4 10h16M9 3.5v3M15 3.5v3" />
    </svg>
  ),

  grid: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <rect x="4" y="4" width="7" height="7" rx="1" />
      <rect x="13" y="4" width="7" height="7" rx="1" />
      <rect x="4" y="13" width="7" height="7" rx="1" />
      <rect x="13" y="13" width="7" height="7" rx="1" />
    </svg>
  ),

  globe: ({ className }: P) => (
    <svg {...base} className={className} aria-hidden>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17M12 3.5c2.2 2.3 3.3 5.3 3.3 8.5S14.2 18.2 12 20.5c-2.2-2.3-3.3-5.3-3.3-8.5S9.8 5.8 12 3.5Z" />
    </svg>
  ),

  linkedin: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6.94 8.5H4.4V20h2.54zM5.67 4a1.47 1.47 0 1 0 0 2.94 1.47 1.47 0 0 0 0-2.94M20 13.9c0-3.02-1.61-4.42-3.76-4.42-1.73 0-2.51.95-2.94 1.62V8.5h-2.54c.03.72 0 11.5 0 11.5h2.54v-6.42c0-.23.02-.46.08-.62.19-.46.6-.93 1.32-.93.93 0 1.3.71 1.3 1.75V20H20z" />
    </svg>
  ),

  x: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.2 4h2.9l-6.3 7.2L21 20h-5.6l-4.4-5.7L5.9 20H3l6.7-7.7L3.3 4H9l4 5.3zm-1 14.2h1.6L8.4 5.7H6.7z" />
    </svg>
  ),

  react: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <circle cx="12" cy="12" r="1.9" fill="currentColor" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.7" stroke="currentColor" strokeWidth={1.1} />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.7" stroke="currentColor" strokeWidth={1.1} transform="rotate(60 12 12)" />
      <ellipse cx="12" cy="12" rx="9.5" ry="3.7" stroke="currentColor" strokeWidth={1.1} transform="rotate(120 12 12)" />
    </svg>
  ),

  ios: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M16.4 12.7c0-2 1.6-3 1.7-3-.9-1.4-2.4-1.5-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7c-1.3 0-2.6.8-3.2 2-1.4 2.4-.4 6 1 8 .7 1 1.5 2 2.5 2 1 0 1.4-.6 2.6-.6s1.5.6 2.6.6 1.7-.9 2.4-1.8c.7-1.1 1-2.1 1-2.2 0 0-2-.8-2.1-3.4M14.6 6.3c.5-.7.9-1.6.8-2.5-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.2" />
    </svg>
  ),

  android: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M6 10.5h12v6.2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zM4.6 10.6a1.1 1.1 0 0 1 2.2 0v4.6a1.1 1.1 0 0 1-2.2 0zm12.6 0a1.1 1.1 0 0 1 2.2 0v4.6a1.1 1.1 0 0 1-2.2 0zM9 18.6h1.9v2.3a1 1 0 0 1-1.9 0zm4.1 0H15v2.3a1 1 0 0 1-1.9 0zM8.2 5.3 7.4 4a.35.35 0 0 1 .6-.36l.85 1.35A6 6 0 0 1 12 4.4c.8 0 1.5.2 2.15.6L15 3.65a.35.35 0 0 1 .6.35l-.8 1.3A4.6 4.6 0 0 1 17.3 9.4H6.7a4.6 4.6 0 0 1 1.5-4.1M9.6 7.4a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2m4.8 0a.6.6 0 1 0 0-1.2.6.6 0 0 0 0 1.2" />
    </svg>
  ),

  flutter: ({ className }: P) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.9 2 4.6 11.3l2.9 2.9L19.6 2zM13.8 12.3 8.9 17.2l4.9 4.8h5.8l-4.9-4.8 4.9-4.9z" />
    </svg>
  ),
};

export type IconName = keyof typeof Icons;
