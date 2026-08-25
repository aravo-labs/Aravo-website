"use client";

/**
 * The delivery console.
 *
 * This is what the product looks like in use, which is the fastest way to make
 * an abstract capability legible: a reader who cannot follow a section drawing
 * can follow a screen with an address at the top and a list of what happened.
 *
 * Three panels, left to right in the order a question gets answered: which
 * delivery, when each thing happened, and where in the building. The plan is
 * drawn from the same event data as the list, so a marker cannot describe a
 * step the timeline does not contain.
 *
 * It is a real component, not a picture of one - hovering an event lights its
 * marker, because the point being made is that this data is queryable rather
 * than that it is pretty.
 */

import { useState } from "react";

import { Icons } from "@/components/art/Icons";

type Event = {
  id: string;
  icon: keyof typeof Icons;
  lead: string;
  strong: string;
  trail: string;
  time: string;
  badge?: { label: string; tone: "neutral" | "good" };
  /** Storey it happened on. 0 is the street. */
  floor: number;
  /** Where on the plan this happened, in the plan's own coordinates. */
  mark: [number, number];
  /** Where the caption sits, when "below" would land on an outline or another caption. */
  labelAt?: "below" | "right";
};

const ADDRESS = "9 Stuyvesant Oval, 10009";

const EVENTS: readonly Event[] = [
  {
    id: "entered",
    icon: "door",
    lead: "Driver",
    strong: "entered",
    trail: "the building",
    time: "4:06:47 PM",
    floor: 0,
    mark: [96, 104],
  },
  {
    id: "ascended",
    icon: "stairs",
    lead: "Driver",
    strong: "ascended",
    trail: "~3 floors",
    time: "4:07:12 PM",
    badge: { label: "Staircase", tone: "neutral" },
    floor: 3,
    mark: [170, 104],
  },
  {
    id: "dropped",
    icon: "package",
    lead: "Driver",
    strong: "dropped off",
    trail: "package",
    time: "4:10:12 PM",
    badge: { label: "In-building", tone: "good" },
    floor: 3,
    mark: [226, 152],
    labelAt: "right",
  },
];

const SNAPSHOT = [
  { icon: "calendar" as const, label: "Date", value: "Jul 31 2026" },
  { icon: "clock" as const, label: "Total time", value: "07m 34s" },
  { icon: "building" as const, label: "In building", value: "04m 13s" },
  { icon: "stairs" as const, label: "Elevation", value: "~3 floors" },
];

/** Timeline ticks, as a fraction of the window shown. */
const TICKS = [
  { at: 0, label: "4:05 PM" },
  { at: 0.28, label: "Entrance" },
  { at: 0.45, label: "Ascend" },
  { at: 0.72, label: "Descend" },
  { at: 1, label: "4:12 PM" },
];
const IN_BUILDING = { from: 0.28, to: 0.72 };

export function DeliveryConsole({
  label,
  reference,
}: {
  /** Stated in the chrome, so illustrative data is never mistaken for a customer's. */
  label: string;
  reference: string;
}) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-xl border border-rule bg-surface shadow-[0_1px_2px_rgba(16,23,28,0.04),0_28px_56px_-36px_rgba(16,23,28,0.3)]">
      {/* window chrome: says "this is software" in one line, without a caption */}
      <div className="flex items-center gap-3 border-b border-rule bg-sunken/70 px-4 py-2.5">
        <span className="flex shrink-0 items-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <span key={i} className="size-2.5 rounded-full bg-rule-strong/60" />
          ))}
        </span>
        <span className="truncate font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
          {label}
        </span>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        {/* ---------------- left: the record ---------------- */}
        <div className="min-w-0 border-b border-rule lg:border-r lg:border-b-0">
          <div className="px-5 pt-5 pb-4">
            <h3 className="font-mono text-[13px] tracking-[0.06em] text-ink uppercase">
              {ADDRESS}
            </h3>
            <p className="mt-1 font-mono text-[11px] text-faint">{reference}</p>
          </div>

          {/* the window, with the in-building stretch called out */}
          <div className="px-5 pb-5">
            <div className="relative h-14 overflow-hidden rounded-md border border-rule bg-sunken/60">
              <div
                className="absolute inset-y-0 bg-signal/12"
                style={{
                  left: `${IN_BUILDING.from * 100}%`,
                  width: `${(IN_BUILDING.to - IN_BUILDING.from) * 100}%`,
                }}
              />
              <div
                className="absolute inset-y-0 border-x border-signal/50"
                style={{
                  left: `${IN_BUILDING.from * 100}%`,
                  width: `${(IN_BUILDING.to - IN_BUILDING.from) * 100}%`,
                }}
              />
              <div className="absolute inset-x-0 top-2 px-3">
                <p
                  className="text-[11px] leading-tight font-medium text-signal"
                  style={{ marginLeft: `${IN_BUILDING.from * 100}%` }}
                >
                  In-building
                </p>
                <p
                  className="font-mono text-[10px] text-muted"
                  style={{ marginLeft: `${IN_BUILDING.from * 100}%` }}
                >
                  4:06 - 4:10 PM
                </p>
              </div>
            </div>
            <div className="relative mt-1.5 h-4">
              {TICKS.map((t) => (
                <span
                  key={t.label}
                  className="absolute font-mono text-[9px] whitespace-nowrap text-faint"
                  style={{
                    left: `${t.at * 100}%`,
                    transform:
                      t.at === 0
                        ? "none"
                        : t.at === 1
                          ? "translateX(-100%)"
                          : "translateX(-50%)",
                  }}
                >
                  {t.label}
                </span>
              ))}
            </div>
          </div>

          {/* the journey */}
          <div className="border-t border-rule px-5 py-4">
            <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
              Driver journey
            </p>
            <p className="mt-0.5 text-[12px] text-faint">Delivered to {ADDRESS}</p>

            <ol className="mt-4 flex flex-col">
              {EVENTS.map((e, i) => {
                const Icon = Icons[e.icon];
                const on = active === e.id;
                return (
                  <li
                    key={e.id}
                    onMouseEnter={() => setActive(e.id)}
                    onMouseLeave={() => setActive(null)}
                    className="relative flex gap-3 pb-5 last:pb-0"
                  >
                    {/* the spine, which is what makes these consecutive rather
                        than a list of four unrelated facts */}
                    {i < EVENTS.length - 1 && (
                      <span className="absolute top-7 bottom-1 left-[13px] w-px bg-rule" />
                    )}
                    <span
                      className={`relative z-10 grid size-[26px] shrink-0 place-items-center rounded-full transition-colors ${
                        on ? "bg-signal text-white" : "bg-signal-soft text-signal"
                      }`}
                    >
                      <Icon className="size-3.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-[13px] text-ink-2">
                          {e.lead} <strong className="font-medium text-ink">{e.strong}</strong>{" "}
                          {e.trail}
                        </span>
                        <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
                          {e.time}
                        </span>
                      </span>
                      {e.badge && (
                        <span
                          className={`mt-1.5 inline-flex items-center rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                            e.badge.tone === "good"
                              ? "border-[#bcdccb] bg-[#eef6f1] text-[#1f6b4a]"
                              : "border-rule bg-sunken text-muted"
                          }`}
                        >
                          {e.badge.label}
                        </span>
                      )}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* the snapshot */}
          <div className="border-t border-rule px-5 py-4">
            <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">
              Delivery snapshot
            </p>
            <p className="mt-0.5 text-[12px] text-faint">
              Times and locations reflect observed device readings
            </p>
            <dl className="mt-3 flex flex-col gap-2.5">
              {SNAPSHOT.map((r) => {
                const Icon = Icons[r.icon];
                return (
                  <div key={r.label} className="flex items-center gap-2.5">
                    <Icon className="size-3.5 shrink-0 text-faint" />
                    <dt className="text-[12px] text-muted">{r.label}</dt>
                    <dd className="ml-auto font-mono text-[12px] text-ink tabular-nums">
                      {r.value}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>

        {/* ---------------- right: where, on the building ---------------- */}
        <div className="relative min-h-[320px] bg-blueprint-wash/60">
          <PlanView active={active} onHover={setActive} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/**
 * The building from above, with the three events pinned where they happened.
 *
 * A cruciform block, because that shape is the reason the problem exists: a
 * single rooftop coordinate can sit sixty metres from the door you wanted, and
 * a plan makes that obvious in a way a pin on a street map never does.
 */
function PlanView({
  active,
  onHover,
}: {
  active: string | null;
  onHover: (id: string | null) => void;
}) {
  // A cruciform block, because that shape is the reason the problem exists: one
  // rooftop coordinate can sit sixty metres from the door you wanted, and a
  // plan makes that obvious in a way a pin on a street map never does.
  const BLOCK =
    "M40 62 h46 v-32 h56 v32 h56 v-32 h56 v32 h46 v76 h-46 v32 h-56 v-32 h-56 v32 h-56 v-32 h-46 Z";

  const shown = EVENTS.find((e) => e.id === active) ?? EVENTS[EVENTS.length - 1];
  // Right angles, because a person walks corridors: a straight diagonal
  // between two pins would draw a path through the walls.
  const route = EVENTS.reduce<string[]>((acc, e, i) => {
    const [x, y] = e.mark;
    if (i === 0) return [`${x},${y}`];
    const [, py] = EVENTS[i - 1].mark;
    return [...acc, `${x},${py}`, `${x},${y}`];
  }, []).join(" ");

  return (
    <>
      {/* Which level the markers are on. Without this the plan is ambiguous:
          the whole argument is that the floor is known, so it has to be said. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-5 py-4">
        <p className="font-mono text-[10px] tracking-[0.12em] text-muted uppercase">Plan view</p>
        <span className="rounded border border-rule bg-surface/90 px-2 py-1 font-mono text-[10px] tracking-[0.08em] text-signal uppercase">
          {shown.floor === 0 ? "Ground" : `Level 0${shown.floor}`}
        </span>
      </div>

      {/* Scale, so "sixty metres from the door" is a distance and not a phrase. */}
      <div className="pointer-events-none absolute bottom-4 left-5 z-10 flex items-center gap-2">
        <span className="block h-[7px] w-14 border-x border-b border-rule-strong" />
        <span className="font-mono text-[9px] text-faint">20 m</span>
      </div>

      <svg
        viewBox="0 0 340 200"
        className="h-full w-full"
        role="img"
        aria-label="The building drawn in plan, with the entrance, the staircase and the drop-off pinned where each happened."
      >
        <defs>
          <pattern
            id="dc-hatch"
            width="7"
            height="7"
            patternTransform="rotate(45)"
            patternUnits="userSpaceOnUse"
          >
            <line x1="0" y1="0" x2="0" y2="7" stroke="var(--color-signal)" strokeWidth="1" opacity="0.16" />
          </pattern>
        </defs>

        {/* neighbours and the kerb, so the block reads as part of a street
            rather than a floating diagram */}
        {["M-20 152 h48 v72 h-48 Z", "M300 8 h60 v58 h-60 Z", "M286 160 h74 v56 h-74 Z"].map(
          (d, i) => (
            <path key={i} d={d} fill="var(--color-rule)" opacity={0.45} />
          ),
        )}
        <line
          x1={-20}
          x2={360}
          y1={186}
          y2={186}
          stroke="var(--color-rule-strong)"
          strokeWidth={1}
          strokeDasharray="1 6"
          strokeLinecap="round"
        />

        <path d={BLOCK} fill="url(#dc-hatch)" stroke="var(--color-signal)" strokeWidth={1.5} />

        {/* the walked route, dashed because it is inferred from the handset
            rather than surveyed */}
        <polyline
          points={route}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth={1.5}
          strokeDasharray="4 5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity={0.55}
        />

        {EVENTS.map((e) => {
          const [x, y] = e.mark;
          const on = active === e.id;
          const Icon = Icons[e.icon];
          return (
            <g
              key={e.id}
              onMouseEnter={() => onHover(e.id)}
              onMouseLeave={() => onHover(null)}
              style={{ cursor: "pointer" }}
            >
              <circle
                cx={x}
                cy={y}
                r={on ? 22 : 16}
                fill="var(--color-signal)"
                opacity={on ? 0.18 : 0.1}
                style={{ transition: "r 220ms, opacity 220ms" }}
              />
              <circle cx={x} cy={y} r={12} fill="var(--color-signal)" />
              <foreignObject x={x - 7} y={y - 7} width={14} height={14}>
                <Icon className="size-3.5 text-white" />
              </foreignObject>
              <text
                x={e.labelAt === "right" ? x + 19 : x}
                y={e.labelAt === "right" ? y + 3 : y + 25}
                textAnchor={e.labelAt === "right" ? "start" : "middle"}
                className="fill-[var(--color-muted)] font-mono"
                style={{ fontSize: 7.5, letterSpacing: "0.1em" }}
              >
                {e.strong.toUpperCase()}
              </text>
            </g>
          );
        })}
      </svg>
    </>
  );
}
