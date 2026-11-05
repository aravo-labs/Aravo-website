"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import { PageHead, useAuth } from "@/components/dashboard/Shell";
import {
  Badge,
  DELIVERY_TONE,
  Empty,
  Failure,
  Input,
  Loading,
  Pager,
  Select,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { dashboardApi } from "@/lib/platform/api";
import { useAsync } from "@/lib/platform/useAsync";
import { useDebounced } from "@/lib/platform/useDebounced";

function duration(seconds: number | null | undefined): string {
  if (seconds === null || seconds === undefined) return "—";
  const m = Math.floor(seconds / 60);
  return `${m}m ${seconds % 60}s`;
}

function DeliveriesInner() {
  const { token } = useAuth();
  const params = useSearchParams();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState(params.get("status") ?? "");
  // Set when arriving from a handset on the devices page. Not a control on
  // this screen, so it stays in the URL rather than in state somebody can
  // change here and then wonder why the list does not match the link.
  const device = params.get("device") ?? undefined;
  const [partner, setPartner] = useState("");
  const [since, setSince] = useState("");

  // The free-text box settles before it is searched on; the selects do not
  // need to, because a change there is already one deliberate action.
  const partnerQuery = useDebounced(partner);

  const state = useAsync(
    (signal) =>
      dashboardApi.deliveries(
        { token },
        {
          page,
          page_size: 25,
          status: status || null,
          device_id: device,
          partner_reference: partnerQuery || undefined,
          since: since || undefined,
        },
        signal,
      ),
    [token, page, status, partnerQuery, since, device],
  );

  return (
    <>
      <PageHead
        title="Deliveries"
        description="Every tracked session, newest first."
      />

      {/* Says why the list is short. A filter that came in on the URL and is
          not drawn anywhere reads as missing data. */}
      {device && (
        <div className="mb-4 flex flex-wrap items-center gap-3 rounded-md border border-rule bg-surface px-4 py-3">
          <span className="text-[14px]">
            Showing one handset only.
          </span>
          <Link
            href="/dashboard/deliveries"
            className="text-[14px] underline-offset-2 hover:underline"
          >
            Show all deliveries
          </Link>
        </div>
      )}

      <div className="mb-4 flex flex-wrap gap-3">
        <div className="w-44">
          <Select
            aria-label="Filter by outcome"
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
          >
            <option value="">Any outcome</option>
            <option value="processed">Processed</option>
            <option value="processing">Processing</option>
            <option value="inconclusive">Inconclusive</option>
            <option value="tracking">Tracking</option>
            <option value="cancelled">Cancelled</option>
            <option value="failed">Failed</option>
          </Select>
        </div>
        <div className="w-52">
          <Input
            aria-label="Filter by delivery partner reference"
            placeholder="Delivery partner reference"
            value={partner}
            onChange={(e) => {
              setPartner(e.target.value);
              setPage(1);
            }}
          />
        </div>
        <div className="w-44">
          <Input
            aria-label="Only deliveries started on or after this date"
            type="date"
            value={since}
            onChange={(e) => {
              setSince(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {state.loading ? (
        <Loading label="Loading deliveries" />
      ) : state.error ? (
        <Failure
          message={state.error.message}
          code={state.error.code}
          requestId={state.error.requestId}
          onRetry={state.reload}
        />
      ) : state.data!.items.length === 0 ? (
        <Empty
          title="Nothing here"
          description={
            status || partner || since
              ? "No deliveries match those filters."
              : "Deliveries appear as soon as a handset or your dispatch system opens a session."
          }
        />
      ) : (
        <>
          <Table>
            <thead>
              <tr>
                <Th>Reference</Th>
                <Th>Delivery partner</Th>
                <Th>Outcome</Th>
                <Th>Started</Th>
                <Th align="right">Duration</Th>
                <Th align="right">Batches</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {state.data!.items.map((d) => (
                <tr key={d.id}>
                  <Td mono>
                    <Link
                      href={`/dashboard/deliveries/detail?id=${d.id}`}
                      className="text-signal underline underline-offset-2"
                    >
                      {d.external_reference ?? d.id.slice(0, 8)}
                    </Link>
                  </Td>
                  <Td>
                    {/* The reference their own system supplies. Never a name
                        or a number: this is a real person and we are told as
                        little about them as the job needs. */}
                    {d.partner_reference ?? (
                      <span className="text-faint">not recorded</span>
                    )}
                  </Td>
                  <Td>
                    <Badge tone={DELIVERY_TONE[d.status] ?? "neutral"}>
                      {d.status}
                    </Badge>
                  </Td>
                  <Td>
                    {d.started_at
                      ? new Date(d.started_at).toLocaleString([], {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </Td>
                  <Td align="right">{duration(d.duration_seconds)}</Td>
                  <Td align="right">{d.batch_count.toLocaleString()}</Td>
                  <Td align="right">
                    <Link
                      href={`/dashboard/deliveries/detail?id=${d.id}`}
                      // Every row's link says "Open". Without a name that
                      // includes the delivery, tabbing through announces the
                      // same word twenty-five times.
                      aria-label={`Open delivery ${
                        d.external_reference ?? d.id.slice(0, 8)
                      }`}
                      className="font-mono text-label text-signal uppercase underline-offset-2 hover:underline"
                    >
                      Open
                    </Link>
                  </Td>
                </tr>
              ))}
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
        </>
      )}
    </>
  );
}

export default function DeliveriesPage() {
  // useSearchParams needs a suspense boundary, or the whole route opts out of
  // static rendering and the build says so.
  return (
    <Suspense fallback={<Loading label="Loading deliveries" />}>
      <DeliveriesInner />
    </Suspense>
  );
}
