"use client";

/**
 * The overview.
 *
 * Deliberately no map and no movement path. Reconstructing indoor position
 * from phone sensors is not something this pipeline can honestly claim, so the
 * dashboard shows what was actually recorded rather than an inference it
 * cannot stand behind.
 */

import Link from "next/link";
import { useEffect, useState } from "react";

import {
  DeliveryTrendChart,
  OutcomeSplit,
  UsageArea,
} from "@/components/dashboard/charts";
import { useAuth, PageHead } from "@/components/dashboard/Shell";
import {
  Badge,
  DELIVERY_TONE,
  Empty,
  Failure,
  Label,
  Loading,
  Panel,
  Stat,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { dashboardApi, identityApi } from "@/lib/platform/api";
import { useAsync } from "@/lib/platform/useAsync";

/** A device not heard from in a week is not active, whatever it once was. */
const ACTIVE_WINDOW_DAYS = 7;

/** The ranges §21 asks for. "Today" is one point, which the charts handle. */
const RANGES = [
  { days: 1, label: "Today" },
  { days: 7, label: "7 days" },
  { days: 30, label: "30 days" },
  { days: 90, label: "90 days" },
] as const;

function Figure({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div>
      <p className="font-mono text-[10px] tracking-[0.08em] text-ink-2 uppercase">
        {label}
      </p>
      <p className="mt-1 font-display text-[1.1rem] text-ink tabular-nums">
        {value.toLocaleString()}
      </p>
      {hint && <p className="text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { token } = useAuth();
  const [days, setDays] = useState<number>(30);

  const summary = useAsync(() => dashboardApi.summary({ token }), [token]);

  // Only asked when the dashboard has already refused this account, so the
  // ordinary case costs nothing: a customer signing in normally never makes
  // this request.
  const [isStaff, setIsStaff] = useState(false);
  const adminUrl = (process.env.NEXT_PUBLIC_ADMIN_APP_URL ?? "").replace(/\/$/, "");
  useEffect(() => {
    if (summary.error?.code !== "NO_COMPANY" || !token) return;
    let live = true;
    void identityApi.isPlatformStaff({ token }).then((staff) => {
      if (live) setIsStaff(staff);
    });
    return () => {
      live = false;
    };
  }, [summary.error?.code, token]);
  const usage = useAsync(
    (signal) => dashboardApi.usage({ token }, days, signal),
    [token, days],
  );
  const stats = useAsync(() => dashboardApi.usageStats({ token }), [token]);
  const counts = useAsync(() => dashboardApi.counts({ token }), [token]);
  const trend = useAsync(
    (signal) => dashboardApi.trend({ token }, days, signal),
    [token, days],
  );
  // A way into the data. An overview with no route to a single delivery
  // makes people navigate away to find the thing they came for.
  const recent = useAsync(
    (signal) => dashboardApi.deliveries({ token }, { page_size: 5 }, signal),
    [token],
  );

  if (summary.loading) return <Loading label="Loading your dashboard" />;
  if (summary.error)
    return (
      <Failure
        message={
          // A member of staff is not a half-finished customer, and telling
          // them to finish signing up would have them create a company they
          // do not want. Worth distinguishing: the panel is a separate
          // application, and an administrator who lands here otherwise has no
          // route onwards and no reason to suspect one exists.
          isStaff
            ? "This is a platform administrator account. Those sign in to the admin panel, not to the company dashboard."
            : summary.error.message
        }
        code={summary.error.code}
        requestId={summary.error.requestId}
        // NO_COMPANY is not a transient failure: the signup was interrupted
        // before the company was created, and no amount of retrying creates
        // one. The way out is to finish signing up - unless this is staff.
        {...(summary.error.code === "NO_COMPANY"
          ? isStaff
            ? adminUrl
              ? { action: { label: "Open the admin panel", href: adminUrl } }
              : {}
            : { action: { label: "Finish setting up", href: "/signup" } }
          : { onRetry: summary.reload })}
      />
    );

  const s = summary.data!;
  const inconclusive =
    counts.data?.find((c) => c.status === "inconclusive")?.count ?? 0;
  const total = (counts.data ?? []).reduce((n, c) => n + c.count, 0);

  return (
    <>
      <PageHead
        title="Overview"
        description="What your fleet recorded, and how much of the API you are using."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Deliveries" value={s.total_deliveries} />
        <Stat label="Today" value={s.deliveries_today} />
        <Stat
          label="Active devices"
          value={s.active_devices}
          hint={`of ${s.total_devices.toLocaleString()} registered, seen in ${ACTIVE_WINDOW_DAYS} days`}
        />
        <Stat
          label="API calls this month"
          value={s.api_calls_this_month}
          hint={`${s.api_calls_today.toLocaleString()} today`}
        />
      </div>

      {/* The chart an operations lead actually opens this page for. Deliveries
          first; API usage is a billing question and sits lower down. */}
      <Panel className="mt-8 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Label>Activity</Label>
          <div className="flex gap-1" role="group" aria-label="Date range">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                aria-pressed={days === r.days}
                className={
                  "rounded-[3px] px-2.5 py-1 font-mono text-label uppercase transition-colors " +
                  (days === r.days
                    ? "bg-ink text-white"
                    : "text-ink-2 hover:text-ink")
                }
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {trend.loading ? (
            <p className="text-[14px] text-muted">Loading…</p>
          ) : (trend.data ?? []).some((d) => d.total > 0) ? (
            <DeliveryTrendChart data={trend.data ?? []} />
          ) : (
            <Empty
              title="No deliveries in this period"
              description="Once your app starts a delivery and uploads sensor data, every day appears here split by how it ended."
            />
          )}
        </div>
      </Panel>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <Label>Outcomes</Label>
          <div className="mt-4">
            {counts.data && counts.data.length > 0 ? (
              <OutcomeSplit counts={counts.data} />
            ) : (
              <p className="text-[14px] text-muted">
                Nothing recorded yet.
              </p>
            )}
          </div>

          {inconclusive > 0 && (
            <p className="mt-5 border-t border-rule pt-4 text-[13px] text-muted">
              <strong className="text-ink">
                {inconclusive.toLocaleString()} of {total.toLocaleString()}
              </strong>{" "}
              are inconclusive: no usable sensor data arrived, which happens
              when a phone was off, flat, in a bag, or force closed. A real
              outcome rather than a fault.{" "}
              <Link
                href="/dashboard/deliveries?status=inconclusive"
                className="text-signal underline underline-offset-2"
              >
                See them
              </Link>
              .
            </p>
          )}
        </Panel>

        <Panel className="p-5">
          {usage.loading ? (
            <p className="text-[14px] text-muted">Loading…</p>
          ) : (
            <UsageArea data={usage.data ?? []} />
          )}

          {stats.data && (
            <div className="mt-5 grid gap-x-6 gap-y-3 border-t border-rule pt-4 grid-cols-3">
              <Figure label="Today" value={stats.data.today} />
              <Figure label="This month" value={stats.data.this_month} />
              <Figure
                label="Average / day"
                value={stats.data.average_per_day}
                hint="days with traffic"
              />
            </div>
          )}
        </Panel>
      </div>

      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-4">
          <Label>Latest deliveries</Label>
          <Link
            href="/dashboard/deliveries"
            className="font-mono text-label text-signal uppercase underline underline-offset-2"
          >
            All deliveries
          </Link>
        </div>

        <div className="mt-3">
          {recent.loading ? (
            <p className="text-[14px] text-muted">Loading…</p>
          ) : (recent.data?.items ?? []).length === 0 ? (
            <Empty
              title="Nothing yet"
              description="Deliveries appear here as soon as your app opens one."
            />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Reference</Th>
                  <Th>Outcome</Th>
                  <Th>Delivery partner</Th>
                  <Th align="right">Batches</Th>
                  <Th align="right">Started</Th>
                </tr>
              </thead>
              <tbody>
                {(recent.data?.items ?? []).map((d) => (
                  <tr key={d.id}>
                    <Td>
                      <Link
                        href={`/dashboard/deliveries/detail?id=${d.id}`}
                        className="text-signal underline underline-offset-2"
                      >
                        {d.external_reference ?? d.id.slice(0, 8)}
                      </Link>
                    </Td>
                    <Td>
                      <Badge tone={DELIVERY_TONE[d.status] ?? "neutral"}>
                        {d.status}
                      </Badge>
                    </Td>
                    <Td mono>
                      {d.partner_reference ?? (
                        <span className="text-ink-2">not recorded</span>
                      )}
                    </Td>
                    <Td align="right">{d.batch_count.toLocaleString()}</Td>
                    <Td align="right">
                      {d.started_at
                        ? new Date(d.started_at).toLocaleString([], {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : "\u2014"}
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </div>
      </div>

    </>
  );
}
