"use client";

/**
 * Charts for the dashboard.
 *
 * Hand-built SVG rather than a charting library, for two reasons. The page has
 * a small, opinionated design system and every library arrives with its own -
 * fonts, tooltips, a palette, a legend - which then has to be fought back to
 * neutral. And the charts here are three simple shapes; the library would be
 * more code than they are.
 *
 * Colour carries meaning in all of them. `inconclusive` is deliberately not
 * red: a delivery where the phone was flat is a real outcome, not a failure,
 * and colouring it like an error teaches operations to chase the wrong thing.
 * Red is kept for the one series that genuinely is a fault - API errors.
 */

import type { DeliveryTrend } from "@/lib/platform/types";

/** Shared across every chart so a colour means the same thing everywhere. */
export const OUTCOME = {
  processed: { fill: "var(--color-signal)", label: "Processed" },
  in_progress: { fill: "var(--color-signal-soft)", label: "In progress" },
  inconclusive: { fill: "var(--color-blueprint-mid)", label: "Inconclusive" },
  cancelled: { fill: "var(--color-rule-strong)", label: "Cancelled" },
} as const;

type OutcomeKey = keyof typeof OUTCOME;
const ORDER: OutcomeKey[] = ["processed", "in_progress", "inconclusive", "cancelled"];

/* ------------------------------------------------------------------ */
/* Deliveries per day                                                   */
/* ------------------------------------------------------------------ */

/**
 * The headline chart: a stacked bar per day.
 *
 * Days with nothing are drawn as a baseline tick rather than skipped. A
 * quiet Sunday and a Sunday where the uploads never arrived look identical in
 * a chart that only plots the days it has rows for, and they are not the same
 * thing at all.
 */
export function DeliveryTrendChart({
  data,
  height = 168,
}: {
  data: DeliveryTrend[];
  height?: number;
}) {
  if (data.length === 0) return null;

  const peak = Math.max(1, ...data.map((d) => d.total));
  const gap = data.length > 45 ? 1 : 3;
  const slot = 100 / data.length;
  const width = Math.max(2, slot - (gap * 100) / (data.length * 12));

  const busiest = data.reduce((a, b) => (b.total > a.total ? b : a));
  const totals = data.reduce((n, d) => n + d.total, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-wide text-ink-2 uppercase">
          Deliveries a day
        </span>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          {totals.toLocaleString()} over {data.length} days
        </span>
      </div>

      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="mt-4 w-full"
        style={{ height }}
        role="img"
        aria-label={
          `Deliveries a day over ${data.length} days. ` +
          `${totals} in total, busiest ${busiest.day} with ${busiest.total}.`
        }
      >
        {/* Quarter lines, faint. Enough to read a height against, not a grid. */}
        {[0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1="0"
            x2="100"
            y1={height - f * height}
            y2={height - f * height}
            stroke="var(--color-rule)"
            strokeWidth="0.5"
            vectorEffect="non-scaling-stroke"
          />
        ))}

        {data.map((d, i) => {
          const x = i * slot + (slot - width) / 2;
          let y = height;
          return (
            <g key={d.day}>
              {d.total === 0 ? (
                <rect
                  x={x}
                  y={height - 1.5}
                  width={width}
                  height={1.5}
                  fill="var(--color-rule-strong)"
                />
              ) : (
                ORDER.map((key) => {
                  const value = d[key] ?? 0;
                  if (value === 0) return null;
                  const h = (value / peak) * (height - 8);
                  y -= h;
                  return (
                    <rect
                      key={key}
                      x={x}
                      y={y}
                      width={width}
                      height={h}
                      fill={OUTCOME[key].fill}
                    >
                      <title>
                        {`${d.day} · ${value} ${OUTCOME[key].label.toLowerCase()}`}
                      </title>
                    </rect>
                  );
                })
              )}
            </g>
          );
        })}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted tabular-nums">
        <span>{short(data[0].day)}</span>
        <span>{short(data[data.length - 1].day)}</span>
      </div>

      <Legend keys={ORDER.filter((k) => data.some((d) => (d[k] ?? 0) > 0))} />
    </div>
  );
}

function Legend({ keys }: { keys: OutcomeKey[] }) {
  if (keys.length === 0) return null;
  return (
    <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
      {keys.map((k) => (
        <li key={k} className="flex items-center gap-2 text-[12px] text-muted">
          <span
            aria-hidden="true"
            className="inline-block size-2.5 rounded-[1px]"
            style={{ background: OUTCOME[k].fill }}
          />
          {OUTCOME[k].label}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Outcome split                                                        */
/* ------------------------------------------------------------------ */

/**
 * One bar, divided by outcome, with the share written on it.
 *
 * A pie would need a legend to be read at all; this can be read straight
 * across, and the number that matters - what proportion came back conclusive -
 * is the width of the first segment.
 */
export function OutcomeSplit({
  counts,
}: {
  counts: Array<{ status: string; count: number }>;
}) {
  const total = counts.reduce((n, c) => n + c.count, 0);
  if (total === 0) return null;

  const known = ORDER.map((key) => ({
    key,
    count: counts
      .filter((c) =>
        key === "in_progress"
          ? !["processed", "inconclusive", "cancelled"].includes(c.status)
          : c.status === key,
      )
      .reduce((n, c) => n + c.count, 0),
  })).filter((s) => s.count > 0);

  return (
    <div>
      <div className="flex h-9 w-full overflow-hidden rounded-[2px]">
        {known.map((s) => (
          <div
            key={s.key}
            className="flex items-center justify-center"
            style={{
              width: `${(s.count / total) * 100}%`,
              background: OUTCOME[s.key].fill,
            }}
            title={`${OUTCOME[s.key].label}: ${s.count}`}
          >
            {s.count / total > 0.12 && (
              <span
                className="font-mono text-[10px] tabular-nums"
                style={{
                  color:
                    s.key === "processed" ? "var(--color-surface)" : "var(--color-ink)",
                }}
              >
                {Math.round((s.count / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>

      <ul className="mt-4 flex flex-col gap-2">
        {known.map((s) => (
          <li key={s.key} className="flex items-center gap-2.5 text-[13px]">
            <span
              aria-hidden="true"
              className="inline-block size-2.5 shrink-0 rounded-[1px]"
              style={{ background: OUTCOME[s.key].fill }}
            />
            <span className="text-ink-2">{OUTCOME[s.key].label}</span>
            <span className="ml-auto font-mono text-ink tabular-nums">
              {s.count.toLocaleString()}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* API usage                                                            */
/* ------------------------------------------------------------------ */

/**
 * Requests a day, with errors called out beneath.
 *
 * An area rather than bars: this is a rate somebody watches for a change in
 * shape, not a set of values they read individually. Errors get their own
 * marks in the one colour reserved for a genuine fault, because a run of them
 * is the reason to open this panel at all.
 */
export function UsageArea({
  data,
  height = 120,
}: {
  data: Array<{ day: string; request_count: number; error_count: number }>;
  height?: number;
}) {
  if (data.length === 0) return null;

  // A single day cannot be a line. Drawn as one it ramps from zero to the
  // value, which reads as a week of growth that did not happen - and the axis
  // says the same date at both ends. A new account sees exactly this, so it
  // is the first chart anyone ever looks at.
  if (data.length === 1) {
    const only = data[0];
    return (
      <div>
        <div className="flex items-baseline justify-between gap-4">
          <span className="font-mono text-[11px] tracking-wide text-ink-2 uppercase">
            API requests
          </span>
          <span className="font-mono text-[11px] text-muted tabular-nums">
            {short(only.day)}
          </span>
        </div>
        <p className="mt-4 font-display text-[2rem] leading-none text-ink tabular-nums">
          {only.request_count.toLocaleString()}
        </p>
        <p className="mt-2 text-[13px] text-muted">
          {only.error_count > 0 ? (
            <>
              <span className="text-alert">{only.error_count}</span> of them
              failed. A chart appears once there is a second day to compare.
            </>
          ) : (
            "All succeeded. A chart appears once there is a second day to compare."
          )}
        </p>
      </div>
    );
  }

  const peak = Math.max(1, ...data.map((d) => d.request_count));
  const step = 100 / (data.length - 1);
  const y = (v: number) => height - (v / peak) * (height - 10);

  const points = data.map((d, i) => `${i * step},${y(d.request_count)}`);
  const line = `M ${points.join(" L ")}`;
  const area = `${line} L 100,${height} L 0,${height} Z`;
  const errors = data.reduce((n, d) => n + d.error_count, 0);

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-wide text-ink-2 uppercase">
          API requests
        </span>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          peak {peak.toLocaleString()}/day
        </span>
      </div>

      <svg
        viewBox={`0 0 100 ${height}`}
        preserveAspectRatio="none"
        className="mt-4 w-full"
        style={{ height }}
        role="img"
        aria-label={`API requests a day, peaking at ${peak}. ${errors} errors in the period.`}
      >
        <path d={area} fill="var(--color-signal-wash)" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-signal)"
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
          strokeLinejoin="round"
        />
        {/* The last point, marked, because "where is it now" is the question. */}
        <circle
          cx={(data.length - 1) * step}
          cy={y(data[data.length - 1].request_count)}
          r="2.5"
          fill="var(--color-signal)"
          vectorEffect="non-scaling-stroke"
        />
        {data.map((d, i) =>
          d.error_count > 0 ? (
            <rect
              key={d.day}
              x={i * step - 0.6}
              y={height - 4}
              width="1.2"
              height="4"
              fill="var(--color-alert)"
            >
              <title>{`${d.day} · ${d.error_count} errors`}</title>
            </rect>
          ) : null,
        )}
      </svg>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted tabular-nums">
        <span>{short(data[0].day)}</span>
        <span>{short(data[data.length - 1].day)}</span>
      </div>

      <p className="mt-3 text-[13px] text-muted">
        {errors === 0 ? (
          "No failed requests in this period."
        ) : (
          <>
            <span className="text-alert">{errors.toLocaleString()}</span> failed
            request{errors === 1 ? "" : "s"}, marked along the baseline.
          </>
        )}
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function short(day: string): string {
  const d = new Date(day);
  return Number.isFinite(d.getTime())
    ? d.toLocaleDateString([], { day: "numeric", month: "short" })
    : day;
}
