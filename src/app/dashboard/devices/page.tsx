"use client";

import { useState } from "react";

import { PageHead, useAuth } from "@/components/dashboard/Shell";
import {
  Badge,
  Empty,
  Failure,
  Loading,
  Pager,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { devicesApi } from "@/lib/platform/api";
import { useAsync } from "@/lib/platform/useAsync";
import Link from "next/link";

/** Bytes, at a size a person reads rather than counts digits in. */
function bytes(value: number | undefined): string {
  const n = value ?? 0;
  if (n === 0) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let size = n;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i += 1;
  }
  return `${size < 10 && i > 0 ? size.toFixed(1) : Math.round(size)} ${units[i]}`;
}

function seen(value: string | null | undefined): string {
  if (!value) return "never";
  const mins = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
  if (mins < 2) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (mins < 60 * 24) return `${Math.floor(mins / 60)}h ago`;
  return new Date(value).toLocaleDateString();
}

export default function DevicesPage() {
  const { token } = useAuth();
  const [page, setPage] = useState(1);
  const state = useAsync(
    (signal) => devicesApi.list({ token }, { page, page_size: 25 }, signal),
    [token, page],
  );

  return (
    <>
      <PageHead
        title="Devices"
        description="Every handset that has registered with one of your API keys."
      />

      {state.loading ? (
        <Loading label="Loading devices" />
      ) : state.error ? (
        <Failure
          message={state.error.message}
          code={state.error.code}
          requestId={state.error.requestId}
          onRetry={state.reload}
        />
      ) : state.data!.items.length === 0 ? (
        <Empty
          title="No devices yet"
          description="A handset appears here the first time your app presents an API key and registers."
        />
      ) : (
        <>
          {/* The three numbers somebody scans for before reading any row. */}
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Stat
              label="Handsets"
              value={state.data!.pagination?.total_items ?? state.data!.items.length}
            />
            <Stat
              label="Carrying deliveries"
              value={state.data!.items.filter((d) => d.deliveries_7d > 0).length}
              hint="in the last 7 days"
            />
            <Stat
              label="Silent"
              value={state.data!.items.filter((d) => d.deliveries_7d === 0).length}
              hint="registered, nothing carried"
            />
          </div>

          <Table>
            <thead>
              <tr>
                <Th>Device</Th>
                <Th>Handset</Th>
                <Th>Sensors</Th>
                <Th>Key</Th>
                <Th>Status</Th>
                <Th align="right">Deliveries</Th>
                <Th align="right">Uploaded</Th>
                <Th align="right">Last seen</Th>
              </tr>
            </thead>
            <tbody>
              {state.data!.items.map((d) => {
                const caps = (d.capabilities ?? {}) as Record<string, unknown>;
                const present = Object.entries(caps)
                  .filter(([, v]) => v === true)
                  .map(([k]) => k);
                // A handset with no barometer cannot report floor changes.
                // Saying so here is what stops it being read as a gap in the
                // data rather than a fact about the phone.
                const noBarometer =
                  Object.keys(caps).length > 0 && caps.barometer !== true;
                return (
                  <tr key={d.id}>
                    <Td mono>{d.device_identifier}</Td>
                    <Td>
                      {d.model ?? "unknown"}
                      {d.os_version && (
                        <span className="text-muted">
                          {" "}
                          · {d.platform} {d.os_version}
                        </span>
                      )}
                    </Td>
                    <Td>
                      {present.length === 0 ? (
                        <span className="text-muted">not reported</span>
                      ) : (
                        <span className="text-[13px]">
                          {present.length} available
                          {noBarometer && (
                            <span className="ml-2">
                              <Badge tone="warn">no barometer</Badge>
                            </span>
                          )}
                        </span>
                      )}
                    </Td>
                    <Td>
                      {/* Which credential enrolled this handset. When a key is
                          in question, "what is out there using it" is the next
                          thing anybody asks. Blank once that key is deleted:
                          the handset keeps working on the token it holds, and
                          there is then nothing to point at. */}
                      {d.api_key_name ?? (
                        <span className="text-muted">—</span>
                      )}
                    </Td>
                    <Td>
                      <Badge tone={d.status === "active" ? "good" : "neutral"}>
                        {d.status}
                      </Badge>
                    </Td>
                    <Td align="right">
                      {d.deliveries_7d > 0 ? (
                        // Opens this handset's deliveries. The count was a
                        // dead end before: seeing that a phone carried two
                        // meant opening the history in another tab and
                        // searching for the handset by hand.
                        <Link
                          href={`/dashboard/deliveries?device=${d.id}`}
                          className="tabular-nums underline-offset-2 hover:underline"
                        >
                          {d.deliveries_7d}
                        </Link>
                      ) : (
                        // Registered, checking in, carrying nothing. The row
                        // worth finding in a list of two hundred.
                        <span className="text-alert">none in 7 days</span>
                      )}
                    </Td>
                    <Td align="right">
                      {/* Status says a handset is reachable. This says whether
                          it is actually sending anything, which is a different
                          question and the one that goes wrong quietly. */}
                      <span className="tabular-nums">{bytes(d.bytes_uploaded)}</span>
                      <span className="block text-[11px] text-muted">
                        {d.batches_total.toLocaleString()} batches
                      </span>
                    </Td>
                    <Td align="right">{seen(d.last_seen_at)}</Td>
                  </tr>
                );
              })}
            </tbody>
          </Table>
          {state.data!.pagination && (
            <Pager
              page={state.data!.pagination.page}
              totalPages={state.data!.pagination.total_pages}
              totalItems={state.data!.pagination.total_items}
              onChange={setPage}
            />
          )}
          <p className="mt-3 text-[13px] text-muted">
            A handset without a barometer cannot report which floor it moved
            between. That is a fact about the phone, not a gap in your data.
          </p>
        </>
      )}
    </>
  );
}
