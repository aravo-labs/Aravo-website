"use client";

import type { SensorBatch } from "@/lib/platform/types";

/**
 * When sensor data actually exists across a delivery, and where it does not.
 *
 * The page it sits on cannot draw a route, and says so. But "what did we
 * record" is still the question everyone opens a delivery to answer, and a
 * list of counts answers it badly: three hundred samples reads the same
 * whether they arrived evenly across four minutes or all in the first six
 * seconds before the phone went into a pocket.
 *
 * So this draws the one thing the data supports without inference - the
 * delivery window, and which parts of it have sensor data behind them. A gap
 * here is a real finding, not a rendering artefact: it is the partner's phone
 * not reporting, which is exactly what a dispute turns on.
 */
export function Coverage({
  batches,
  startedAt,
  completedAt,
}: {
  batches: SensorBatch[];
  startedAt: string | null;
  completedAt: string | null;
}) {
  const windows = batches
    .map((b) => ({
      id: b.id,
      label: b.batch_id,
      samples: b.sample_count,
      from: ms(b.start_timestamp ?? b.uploaded_at),
      to: ms(b.end_timestamp ?? b.start_timestamp ?? b.uploaded_at),
    }))
    .filter((w) => w.from !== null && w.to !== null)
    .map((w) => ({ ...w, from: w.from as number, to: w.to as number }))
    .sort((a, b) => a.from - b.from);

  if (windows.length === 0) return null;

  const deliveryFrom = ms(startedAt);
  const deliveryTo = ms(completedAt);

  // The axis spans everything there is, not just the delivery window. A
  // handset whose clock is out, or one sending timestamps from its own epoch,
  // produces batches outside the window entirely - and silently clipping them
  // would hide the very thing worth noticing.
  const lo = Math.min(...windows.map((w) => w.from), deliveryFrom ?? Infinity);
  const hi = Math.max(...windows.map((w) => w.to), deliveryTo ?? -Infinity);
  const span = Math.max(1, hi - lo);

  const outsideWindow =
    deliveryFrom !== null &&
    deliveryTo !== null &&
    windows.some((w) => w.to < deliveryFrom || w.from > deliveryTo);

  const pct = (value: number) => ((value - lo) / span) * 100;
  const covered = windows.reduce((total, w) => total + (w.to - w.from), 0);
  const share = Math.min(100, Math.round((covered / span) * 100));

  // The longest stretch with nothing behind it. Visible on the bar already,
  // but worth naming: "the phone reported nothing for a minute and a half" is
  // the sentence a disputed delivery turns on, and nobody should have to
  // measure it off a graphic by eye.
  let longestGap = 0;
  for (let i = 1; i < windows.length; i += 1) {
    longestGap = Math.max(longestGap, windows[i].from - windows[i - 1].to);
  }

  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <span className="font-mono text-[11px] tracking-wide text-ink-2 uppercase">
          Sensor coverage
        </span>
        <span className="font-mono text-[11px] text-muted tabular-nums">
          {share}% of the recorded span
        </span>
      </div>

      <div
        className="relative mt-3 h-11 rounded-[3px] border border-line bg-canvas-2"
        role="img"
        aria-label={
          `${windows.length} batch${windows.length === 1 ? "" : "es"} covering ` +
          `${share}% of the span from ${stamp(lo)} to ${stamp(hi)}`
        }
      >
        {/* The delivery itself, behind the batches. */}
        {deliveryFrom !== null && deliveryTo !== null && deliveryTo > deliveryFrom && (
          <div
            className="absolute inset-y-0 border-x border-dashed border-line-strong bg-canvas"
            style={{
              left: `${pct(deliveryFrom)}%`,
              width: `${Math.max(0.4, pct(deliveryTo) - pct(deliveryFrom))}%`,
            }}
          />
        )}

        {windows.map((w) => (
          <div
            key={w.id}
            title={`${w.label} · ${w.samples} samples · ${stamp(w.from)} to ${stamp(w.to)}`}
            className="absolute inset-y-[7px] rounded-[2px] bg-signal/75"
            style={{
              left: `${pct(w.from)}%`,
              // A three-second batch across a ten-minute delivery is a sliver
              // half a pixel wide. Floored so it stays visible as a mark.
              width: `${Math.max(0.8, pct(w.to) - pct(w.from))}%`,
            }}
          />
        ))}
      </div>

      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted tabular-nums">
        <span>{stamp(lo)}</span>
        <span>{stamp(hi)}</span>
      </div>

      <p className="mt-3 text-[13px] text-muted">
        {windows.length} batch{windows.length === 1 ? "" : "es"}
        {longestGap >= 1000 ? (
          <>
            , and a {duration(longestGap)} stretch with nothing recorded. The
            handset was not reporting for that time.
          </>
        ) : (
          <>, with no gap between them.</>
        )}
      </p>

      {outsideWindow && (
        <p className="mt-3 text-[13px] text-alert">
          Some batches are timestamped outside the delivery window. The handset
          clock and the server disagree, so the times on this page are the
          handset&rsquo;s own and cannot be lined up against the delivery.
        </p>
      )}
    </div>
  );
}

function ms(value: string | null | undefined): number | null {
  if (!value) return null;
  const parsed = new Date(value).getTime();
  return Number.isFinite(parsed) ? parsed : null;
}

/** Milliseconds as something a person would say out loud. */
function duration(value: number): string {
  const seconds = Math.round(value / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return rest === 0 ? `${minutes}m` : `${minutes}m ${rest}s`;
}

function stamp(value: number): string {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}
