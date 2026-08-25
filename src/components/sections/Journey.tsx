"use client";

/**
 * The delivery replay.
 *
 * The film carries the visuals; everything around it is ours and is driven by
 * the same timeline. That split is deliberate. A looping clip shows one
 * fictional delivery and can do nothing else; wrapping it in real controls
 * makes it a replay you can scrub, step through and interrogate - which is the
 * behaviour the product actually sells, and the part a video can never do.
 *
 * The chapters below are the beats of the film expressed as data, so the same
 * component will drive a real delivery record when the API serves one. Nothing
 * here reads from the video except the clock.
 */

import { useCallback, useEffect, useRef, useState } from "react";

import { Level } from "@/components/primitives";

type Method = "stairs" | "lift" | null;

type Beat = {
  /** Where in the film this beat begins. */
  at: number;
  label: string;
  detail: string;
  /** Clock time as the courier's own record would show it. */
  clock: string;
  floor: string;
  method: Method;
};

/**
 * Two complete deliveries: one walked up four flights, one by lift to the
 * fifteenth. Timings are the film's, to the tenth of a second.
 */
const BEATS: readonly Beat[] = [
  { at: 0, label: "Approaching", detail: "Vehicle inbound, GPS still reliable", clock: "10:35", floor: "Street", method: null },
  { at: 7.5, label: "Parked", detail: "Kerbside stop detected, tracking begins", clock: "10:36", floor: "Street", method: null },
  { at: 11, label: "Entered the building", detail: "Threshold crossed, satellite fix lost", clock: "10:37", floor: "Ground", method: null },
  { at: 15.5, label: "Ascended 4 floors", detail: "Gait and barometer agree on stairs", clock: "10:39", floor: "Level 04", method: "stairs" },
  { at: 19.5, label: "Delivered to 4A", detail: "Stationary at the door, handover complete", clock: "10:40", floor: "Level 04", method: "stairs" },
  { at: 26, label: "Second stop", detail: "New address, taller building", clock: "10:41", floor: "Street", method: null },
  { at: 30, label: "Entered the building", detail: "Lobby detected, lift bank ahead", clock: "10:42", floor: "Ground", method: null },
  { at: 34, label: "Ascended 15 floors", detail: "No step cadence, pressure change is smooth", clock: "10:44", floor: "Level 15", method: "lift" },
  { at: 38, label: "Delivered to 15A", detail: "Door reached, order dropped off", clock: "10:45", floor: "Level 15", method: "lift" },
  { at: 42, label: "Journey recorded", detail: "Both stops resolved to floor and door", clock: "10:46", floor: "Recorded", method: null },
];

const DURATION = 46;

function activeIndex(t: number): number {
  let index = 0;
  for (let i = 0; i < BEATS.length; i++) if (t >= BEATS[i].at) index = i;
  return index;
}

function methodLabel(method: Method): string {
  return method === "stairs" ? "Staircase" : method === "lift" ? "Lift" : "—";
}

export function Journey() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [time, setTime] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);

  const index = activeIndex(time);
  const beat = BEATS[index];

  // The video is the clock. Reading it on rAF while playing keeps the progress
  // bar smooth instead of stepping four times a second - but rAF alone leaves
  // the readout stale the moment the film is paused, so a scrub on a paused
  // video showed the floor and time from wherever it had stopped. `seeked`
  // covers that, and covers anything that moves the clock from outside this
  // component.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;

    let frame = 0;
    const tick = () => {
      if (!v.paused) setTime(v.currentTime);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    // The metadata event can fire before React attaches its handler, which
    // left the loading line on screen for a video that had already loaded.
    // Reading readyState covers the race in both directions.
    if (v.readyState >= 1) setReady(true);

    const sync = () => setTime(v.currentTime);
    v.addEventListener("seeked", sync);
    v.addEventListener("timeupdate", sync);
    return () => {
      cancelAnimationFrame(frame);
      v.removeEventListener("seeked", sync);
      v.removeEventListener("timeupdate", sync);
    };
  }, []);

  const seek = useCallback((seconds: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = seconds;
    setTime(seconds);
  }, []);

  const toggle = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) {
      void v.play();
      setPlaying(true);
    } else {
      v.pause();
      setPlaying(false);
    }
  }, []);

  const progress = Math.min(100, (time / DURATION) * 100);

  return (
    <section id="journey" className="relative border-t border-rule bg-canvas">
      <div className="mx-auto w-full max-w-[var(--shell-max)] px-6 sm:px-10 lg:pl-[calc(var(--rail-w)+1rem)]">
        <div className="flex flex-col gap-6 py-16 lg:py-24">
          <div data-reveal className="flex flex-col items-start gap-5">
            <Level>Level 02</Level>
            <span className="font-mono text-label text-signal uppercase">
              The replay
            </span>
            <h2 className="max-w-[20ch] text-[2rem] leading-[1.05] font-normal tracking-[-0.018em] text-ink sm:text-[2.6rem]">
              Watch a delivery{" "}
              <span className="text-signal">from the kerb to the door</span>
            </h2>
            <p className="max-w-[58ch] text-[15px] leading-[1.65] text-muted sm:text-lede">
              Two stops, recorded end to end. Scrub the timeline or step through
              the events; the position, floor and method come from the record,
              not from a guess.
            </p>
          </div>

          {/* ---- the replay itself ---- */}
          <div
            data-reveal
            style={{ "--reveal-delay": "120ms" } as React.CSSProperties}
            className="overflow-hidden rounded-xl border border-rule bg-surface shadow-[0_1px_2px_rgba(16,23,28,0.04),0_24px_48px_-32px_rgba(16,23,28,0.28)]"
          >
            <div className="relative">
              <video
                ref={videoRef}
                className="block h-auto w-full bg-blueprint-wash"
                src="/video/journey.mp4"
                poster="/video/journey-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                onLoadedMetadata={() => setReady(true)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
              />

              {/* Current state, over the film. Pinned to the corner so it never
                  covers the courier, who is always centre-left or centre. */}
              <div className="pointer-events-none absolute top-4 left-4 flex items-center gap-2 rounded-full border border-rule/70 bg-surface/90 px-3 py-1.5 backdrop-blur-sm sm:top-5 sm:left-5">
                <span
                  className={`size-1.5 rounded-full ${playing ? "animate-pulse bg-signal" : "bg-faint"}`}
                />
                <span className="font-mono text-[11px] tracking-[0.08em] text-ink uppercase">
                  {beat.floor}
                </span>
                <span className="text-faint">·</span>
                <span className="font-mono text-[11px] text-muted tabular-nums">
                  {beat.clock}
                </span>
              </div>
            </div>

            {/* ---- transport ---- */}
            <div className="flex flex-col gap-3 border-t border-rule px-4 py-4 sm:px-5">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={toggle}
                  aria-label={playing ? "Pause the replay" : "Play the replay"}
                  className="grid size-8 shrink-0 place-items-center rounded-full bg-signal text-white transition-colors hover:bg-signal-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal"
                >
                  {playing ? (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                      <rect x="6" y="5" width="4" height="14" rx="1" />
                      <rect x="14" y="5" width="4" height="14" rx="1" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" className="size-3.5" fill="currentColor">
                      <path d="M8 5.14v13.72L19 12z" />
                    </svg>
                  )}
                </button>

                {/* The track is a real control: click anywhere to seek. Beat
                    markers sit on it so the shape of the journey is legible
                    before you press anything. */}
                <div
                  role="slider"
                  tabIndex={0}
                  aria-label="Delivery timeline"
                  aria-valuemin={0}
                  aria-valuemax={DURATION}
                  aria-valuenow={Math.round(time)}
                  aria-valuetext={`${beat.label}, ${beat.clock}`}
                  onKeyDown={(e) => {
                    if (e.key === "ArrowRight") seek(Math.min(DURATION, time + 2));
                    if (e.key === "ArrowLeft") seek(Math.max(0, time - 2));
                  }}
                  onClick={(e) => {
                    const box = e.currentTarget.getBoundingClientRect();
                    seek(((e.clientX - box.left) / box.width) * DURATION);
                  }}
                  className="relative h-6 flex-1 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-signal"
                >
                  <div className="absolute top-1/2 h-[3px] w-full -translate-y-1/2 rounded-full bg-rule" />
                  <div
                    className="absolute top-1/2 h-[3px] -translate-y-1/2 rounded-full bg-signal"
                    style={{ width: `${progress}%` }}
                  />
                  {BEATS.map((b, i) => (
                    <span
                      key={b.at}
                      className={`absolute top-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 transition-colors ${
                        i <= index
                          ? "border-signal bg-signal"
                          : "border-rule-strong bg-surface"
                      }`}
                      style={{ left: `${(b.at / DURATION) * 100}%` }}
                    />
                  ))}
                </div>

                <span className="shrink-0 font-mono text-[11px] text-muted tabular-nums">
                  {String(Math.floor(time / 60)).padStart(2, "0")}:
                  {String(Math.floor(time % 60)).padStart(2, "0")}
                </span>
              </div>
            </div>

            {/* ---- what is true right now ---- */}
            <dl className="grid grid-cols-2 border-t border-rule sm:grid-cols-4">
              {[
                ["Event", beat.label],
                ["Floor", beat.floor],
                ["Method", methodLabel(beat.method)],
                ["Elapsed", `${Math.max(0, Math.round(time - 7.5))}s inside`],
              ].map(([label, value], i) => (
                <div
                  key={label}
                  className={`px-4 py-3 sm:px-5 sm:py-4 ${i > 0 ? "border-l border-rule" : ""} ${i === 2 ? "border-t sm:border-t-0" : ""} ${i === 3 ? "border-t sm:border-t-0" : ""}`}
                >
                  <dt className="font-mono text-[10px] tracking-[0.1em] text-faint uppercase">
                    {label}
                  </dt>
                  <dd className="mt-1 text-[14px] leading-snug text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* ---- the beats, as a steppable list ---- */}
          <ol
            data-reveal
            style={{ "--reveal-delay": "180ms" } as React.CSSProperties}
            className="grid gap-px overflow-hidden rounded-xl border border-rule bg-rule sm:grid-cols-2 lg:grid-cols-5"
          >
            {BEATS.filter((b) => b.method !== null || b.at === 7.5 || b.at === 11)
              .slice(0, 5)
              .map((b) => {
                const isActive = b.at === beat.at;
                return (
                  <li key={b.at}>
                    <button
                      type="button"
                      onClick={() => seek(b.at + 0.2)}
                      className={`flex h-full w-full flex-col gap-1.5 px-4 py-4 text-left transition-colors ${
                        isActive ? "bg-signal-wash" : "bg-surface hover:bg-sunken"
                      }`}
                    >
                      <span className="font-mono text-[11px] text-muted tabular-nums">
                        {b.clock}
                      </span>
                      <span
                        className={`text-[14px] leading-snug ${isActive ? "text-signal" : "text-ink"}`}
                      >
                        {b.label}
                      </span>
                      <span className="text-[12px] leading-[1.5] text-muted">
                        {b.detail}
                      </span>
                    </button>
                  </li>
                );
              })}
          </ol>

          {!ready && (
            <p className="font-mono text-[11px] text-faint">Loading the replay…</p>
          )}
        </div>
      </div>
    </section>
  );
}
