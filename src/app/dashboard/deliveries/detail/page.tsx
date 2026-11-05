"use client";

/**
 * One delivery.
 *
 * This page shows what the sensors recorded: timing, how many batches arrived,
 * how many samples they carried, which streams were present, and where the
 * gaps are.
 *
 * There is no movement path, and that is not a missing feature. Phone motion
 * sensors measure acceleration and rotation, not position, so a position has
 * to be built by adding movement up over time and every small error compounds.
 * Indoors the compass is disturbed by steel, lift motors and wiring, so after
 * a few minutes of walking a drawn path can be fifteen metres out and pointing
 * the wrong way. Drawing it anyway would be the most convincing wrong answer
 * this product could give.
 */

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";

import { Coverage } from "@/components/dashboard/Coverage";
import { PageHead, useAuth } from "@/components/dashboard/Shell";
import {
  Badge,
  Button,
  DELIVERY_TONE,
  Empty,
  Failure,
  Label,
  Loading,
  Panel,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { dashboardApi } from "@/lib/platform/api";
import { ApiRequestError } from "@/lib/platform/client";
import { useAsync } from "@/lib/platform/useAsync";

/** One measured number, sized to be read before the words around it. */
function Stat({
  value,
  label,
  hint,
  tone,
}: {
  value: React.ReactNode;
  label: string;
  hint?: string;
  tone?: "alert";
}) {
  return (
    <div className="border-l border-line pl-4 first:border-0 first:pl-0">
      <div
        className={`font-display text-[1.75rem] leading-none tabular-nums ${
          tone === "alert" ? "text-alert" : "text-ink"
        }`}
      >
        {value}
      </div>
      <div className="mt-1.5 font-mono text-[10px] tracking-wide text-ink-2 uppercase">
        {label}
      </div>
      {hint && <div className="mt-0.5 text-[12px] text-muted">{hint}</div>}
    </div>
  );
}

/** What an outcome means, in the words someone would use out loud. */
const OUTCOME_MEANING: Record<string, string> = {
  processed: "The batches arrived and have been read.",
  processing: "The batches arrived and are still being read.",
  inconclusive: "Nothing usable was recorded. That is an outcome, not a fault.",
  cancelled: "The delivery partner cancelled this one.",
  started: "In progress.",
  tracking: "In progress, and sending data.",
  created: "Opened, not started.",
  completed: "Finished on the handset.",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-6 border-b border-rule py-2.5 last:border-0">
      <span className="text-[14px] text-muted">{label}</span>
      <span className="text-right text-[14px] text-ink">{value}</span>
    </div>
  );
}

function bytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default function DeliveryDetailPage() {
  // The delivery id is a query parameter rather than a path segment, so this
  // is one static file that any delivery opens in. As a path segment it would
  // need a page pre-rendered per delivery, and the ids are uuids that exist
  // only at runtime. The page fetches everything in the browser either way.
  const id = useSearchParams().get("id") ?? "";
  const { token } = useAuth();
  const [downloading, setDownloading] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);

  const state = useAsync(() => dashboardApi.delivery({ token }, id), [token, id]);

  if (state.loading) return <Loading label="Loading delivery" />;
  if (state.error)
    return (
      <Failure
        message={state.error.message}
        code={state.error.code}
        requestId={state.error.requestId}
        onRetry={state.reload}
      />
    );

  const d = state.data!;
  const summary = (d.summary ?? {}) as Record<string, unknown>;
  // Rates come off the batches, which carry the map the handset sent; the
  // summary keeps only the names. Showing 100 Hz next to "accelerometer" is
  // the difference between knowing a stream was on and knowing it was usable.
  const streams: Array<[string, number | null]> = (() => {
    const found = new Map<string, number | null>();
    for (const batch of d.batches) {
      const map = batch.sensors as Record<string, unknown> | null | undefined;
      if (!map) continue;
      for (const [name, rate] of Object.entries(map)) {
        if (!found.has(name) || found.get(name) === null) {
          found.set(name, typeof rate === "number" ? rate : null);
        }
      }
    }
    if (found.size === 0) {
      for (const name of (summary.sensors_present as string[] | null) ?? []) {
        found.set(name, null);
      }
    }
    return [...found.entries()].sort(([a], [b]) => a.localeCompare(b));
  })();

  async function openRaw(batchRowId: string) {
    setDownloading(batchRowId);
    setNote(null);
    try {
      const link = await dashboardApi.rawBatch({ token }, id, batchRowId);
      window.open(link.url, "_blank", "noopener,noreferrer");
    } catch (err) {
      setNote(
        err instanceof ApiRequestError
          ? err.message
          : "Could not produce a download link.",
      );
    } finally {
      setDownloading(null);
    }
  }

  return (
    <>
      <PageHead
        title={d.external_reference ?? `Delivery ${d.id.slice(0, 8)}`}
        description="What the sensors recorded during this session."
        actions={
          <Link href="/dashboard/deliveries">
            <Button variant="secondary">Back to history</Button>
          </Link>
        }
      />

      {/* The outcome first and in plain words, because it is the only thing
          most people open this page to find out. */}
      <Panel className="p-5">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <Badge tone={DELIVERY_TONE[d.status] ?? "neutral"}>{d.status}</Badge>
          <span className="text-[14px] text-ink">
            {OUTCOME_MEANING[d.status] ?? "\u2014"}
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Stat
            value={d.batch_count.toLocaleString()}
            label="Batches"
            hint={d.batch_count === 1 ? "upload" : "uploads"}
          />
          <Stat value={d.sample_count.toLocaleString()} label="Samples" />
          <Stat
            value={
              typeof summary.covered_seconds === "number"
                ? `${Math.round(summary.covered_seconds as number)}s`
                : "\u2014"
            }
            label="Recorded"
            hint="of sensor data"
          />
          <Stat
            value={
              d.duration_seconds === null || d.duration_seconds === undefined
                ? "\u2014"
                : `${Math.floor(d.duration_seconds / 60)}m ${d.duration_seconds % 60}s`
            }
            label="Delivery"
            hint="start to finish"
          />
        </div>

        {typeof summary.failed_batches === "number" &&
          (summary.failed_batches as number) > 0 && (
            <p className="mt-4 border-t border-rule pt-4 text-[13px] text-alert">
              {(summary.failed_batches as number).toLocaleString()} batch
              {(summary.failed_batches as number) === 1 ? "" : "es"} could not be
              read, so this record has holes in it.
            </p>
          )}
      </Panel>

      {d.batches.length > 0 && (
        <Panel className="mt-4 p-5">
          <Coverage
            batches={d.batches}
            startedAt={d.started_at ?? null}
            completedAt={d.completed_at ?? null}
          />
        </Panel>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <Label>Session</Label>
          <div className="mt-4">
            <Row label="Delivery ID" value={<span className="font-mono text-[12px]">{d.id}</span>} />
            <Row
              label="Device"
              value={
                d.device_model
                  ? `${d.device_identifier ?? "\u2014"} · ${d.device_model}`
                  : (d.device_identifier ?? "\u2014")
              }
            />
            <Row
              label="API key"
              value={
                // Which credential this arrived under, through the handset
                // enrolled with it. Blank if that key has since been deleted,
                // which must not make the delivery itself disappear.
                d.api_key_name ?? <span className="text-ink-2">not recorded</span>
              }
            />
            <Row
              label="Delivery partner"
              value={
                d.partner_reference ?? (
                  <span className="text-ink-2">not recorded</span>
                )
              }
            />
            <Row
              label="Started"
              value={d.started_at ? new Date(d.started_at).toLocaleString() : "\u2014"}
            />
            <Row
              label="Completed"
              value={
                d.completed_at ? new Date(d.completed_at).toLocaleString() : "\u2014"
              }
            />
            <Row
              label="Data stored"
              value={d.bytes_stored ? bytes(d.bytes_stored) : "\u2014"}
            />
            {d.address && <Row label="Address" value={d.address} />}
            {d.customer_reference && (
              <Row label="Customer" value={d.customer_reference} />
            )}
            {d.driver_reference && (
              <Row label="Driver" value={d.driver_reference} />
            )}
            {d.group && <Row label="Group" value={d.group} />}
            {d.sdk_version && <Row label="SDK" value={d.sdk_version} />}
          </div>
        </Panel>

        {(d.start_location || d.events.length > 0) && (
          <Panel className="p-5">
            <Label>Where and when</Label>
            <div className="mt-4">
              {d.start_location && (
                <Row
                  label="Started at"
                  value={
                    <a
                      className="underline underline-offset-2"
                      href={`https://www.google.com/maps?q=${d.start_location.latitude},${d.start_location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {d.start_location.latitude.toFixed(5)},{" "}
                      {d.start_location.longitude.toFixed(5)}
                    </a>
                  }
                />
              )}
              {d.end_location && (
                <Row
                  label="Finished at"
                  value={
                    <a
                      className="underline underline-offset-2"
                      href={`https://www.google.com/maps?q=${d.end_location.latitude},${d.end_location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {d.end_location.latitude.toFixed(5)},{" "}
                      {d.end_location.longitude.toFixed(5)}
                    </a>
                  }
                />
              )}
              {d.events.map((e) => (
                <Row
                  key={`${e.name}-${e.occurred_at}`}
                  label={e.name.replace(/_/g, " ")}
                  value={new Date(e.occurred_at).toLocaleString()}
                />
              ))}
            </div>
            {/* Only shown when the handset actually reported a position. Every
                delivery that arrived through the JSON API has none, and an
                empty map pin would be worse than no panel. */}
          </Panel>
        )}

        <Panel className="p-5">
          <Label>Streams</Label>
          {streams.length === 0 ? (
            <p className="mt-4 text-[14px] text-muted">
              The handset reported no stream list with these batches.
            </p>
          ) : (
            <>
              <ul className="mt-4 flex flex-wrap gap-2">
                {streams.map(([name, rate]) => (
                  <li
                    key={name}
                    className="rounded-[3px] border border-line bg-canvas-2 px-2.5 py-1.5 text-[13px] text-ink"
                  >
                    {name}
                    {rate !== null && (
                      <span className="ml-1.5 font-mono text-[11px] text-muted tabular-nums">
                        {rate} Hz
                      </span>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[13px] text-muted">
                What the phone said it was recording. A stream missing here
                cannot be inferred later.
              </p>
            </>
          )}
        </Panel>
      </div>

      {d.note && (
        <Panel className="mt-4 border-blueprint/40 bg-blueprint-wash p-5">
          <Label>Why this delivery looks like it does</Label>
          <p className="mt-3 text-[14px] text-ink">{d.note}</p>
        </Panel>
      )}

      <div className="mt-8">
        <Label>Sensor batches</Label>
        <div className="mt-3">
          {d.batches.length === 0 ? (
            <Empty
              title="No sensor data arrived"
              description="The handset uploaded nothing for this delivery. That usually means the phone was switched off, out of battery, left in a bag, or the app was force closed."
            />
          ) : (
            <>
              <Table>
                <thead>
                  <tr>
                    <Th>Batch</Th>
                    <Th>Window</Th>
                    <Th align="right">Samples</Th>
                    <Th align="right">Size</Th>
                    <Th align="right">Raw</Th>
                  </tr>
                </thead>
                <tbody>
                  {d.batches.map((b) => (
                    <tr key={b.id}>
                      <Td mono>{b.batch_id}</Td>
                      <Td>
                        {b.start_timestamp
                          ? new Date(b.start_timestamp).toLocaleTimeString()
                          : "—"}
                        {" → "}
                        {b.end_timestamp
                          ? new Date(b.end_timestamp).toLocaleTimeString()
                          : "—"}
                      </Td>
                      <Td align="right">{b.sample_count.toLocaleString()}</Td>
                      <Td align="right">{bytes(b.byte_size)}</Td>
                      <Td align="right">
                        <Button
                          variant="ghost"
                          busy={downloading === b.id}
                          ariaLabel={`Download raw sensor batch ${b.batch_id}`}
                          onClick={() => openRaw(b.id)}
                        >
                          Download
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <p className="mt-3 text-[13px] text-muted">
                Raw batches open through a link that expires in five minutes.
                Each one is a record of one person&rsquo;s movement inside a
                building, so every request for one is logged.
              </p>
            </>
          )}
          {note && <p className="mt-3 text-[13px] text-alert">{note}</p>}
        </div>
      </div>

      {/* Folded away. It answers "where is the map?", which is worth
          answering properly and once - not re-reading on every visit. */}
      <details className="group mt-8 border-t border-rule pt-4">
        <summary className="cursor-pointer list-none text-[13px] text-muted hover:text-ink">
          <span className="font-mono text-[10px] tracking-wide uppercase">
            Why there is no map
          </span>
          <span className="ml-2 text-ink-2 group-open:hidden">show</span>
          <span className="ml-2 hidden text-ink-2 group-open:inline">hide</span>
        </summary>
        <div className="mt-3 max-w-[68ch] space-y-3 text-[14px] text-muted">
          <p>
            Phone motion sensors measure acceleration and rotation, not
            position. A path has to be built by adding movement up over time,
            and every small error compounds into the next one.
          </p>
          <p>
            Indoors the compass is disturbed by steel, lift motors and wiring,
            so the direction is wrong as well as the distance. After a few
            minutes of walking, a drawn path can be well out and pointing the
            wrong way.
          </p>
          <p className="text-ink">
            Drawing it anyway would be the most convincing wrong answer this
            product could give. So this page shows what was measured and
            nothing that was guessed.
          </p>
        </div>
      </details>
    </>
  );
}
