"use client";

/**
 * API keys.
 *
 * A key is shown once, at the moment it is created, and never again: only a
 * hash of it is stored, so nobody here can recover it later. The screen has to
 * make that unmistakable at the moment it matters, because the alternative is
 * a customer who closes the panel and then asks support to read their key back.
 */

import { useState } from "react";

import { PageHead, useAuth } from "@/components/dashboard/Shell";
import {
  Badge,
  Button,
  Empty,
  Failure,
  Field,
  Input,
  Label,
  Loading,
  Panel,
  Select,
  Table,
  Td,
  Th,
} from "@/components/dashboard/ui";
import { keysApi } from "@/lib/platform/api";
import { ApiRequestError } from "@/lib/platform/client";
import type { ApiKeyIssued } from "@/lib/platform/types";
import { useAsync } from "@/lib/platform/useAsync";

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

function when(value: string | null | undefined): string {
  return value ? new Date(value).toLocaleString() : "never";
}

export default function ApiKeysPage() {
  const { token } = useAuth();
  const state = useAsync(() => keysApi.list({ token }), [token]);
  // Its own request, so a slow aggregate never delays the list a person came
  // to use. The table renders with zeroes and fills in.
  const usage = useAsync((signal) => keysApi.usage({ token }, 30, signal), [token]);
  const byKey = new Map((usage.data ?? []).map((u) => [u.key_id, u]));

  const [issued, setIssued] = useState<ApiKeyIssued | null>(null);
  const [copied, setCopied] = useState(false);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rotating, setRotating] = useState<string | null>(null);
  const [overlap, setOverlap] = useState("168");
  const [revoking, setRevoking] = useState<string | null>(null);
  // Off by default. Retiring devices is the right answer for a leaked key and
  // the wrong one for routine tidying, and the costly option should be the one
  // somebody chooses rather than the one they fail to notice.
  const [retireDevices, setRetireDevices] = useState(false);

  async function run(fn: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      state.reload();
    } catch (err) {
      setError(
        err instanceof ApiRequestError ? err.message : "Something went wrong.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <PageHead
        title="API keys"
        description="Your application presents one of these to register a handset. After that each device carries its own short-lived token."
      />

      {issued && (
        <Panel className="mb-6 border-signal/50 bg-signal-wash p-5">
          <Label>Copy this now</Label>
          <p className="mt-2 max-w-[70ch] text-[14px] text-ink">
            This is the only time this key will ever be shown. Only a hash of it
            is stored, so it cannot be recovered later by you, by us, or by
            support. If you lose it, issue a new one.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <code className="flex-1 overflow-x-auto rounded-[3px] border border-rule bg-canvas px-3 py-2.5 font-mono text-[13px] text-ink">
              {issued.secret}
            </code>
            <Button
              variant="secondary"
              onClick={() => {
                void navigator.clipboard.writeText(issued.secret);
                setCopied(true);
              }}
            >
              {copied ? "Copied" : "Copy"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setIssued(null);
                setCopied(false);
              }}
            >
              Done
            </Button>
          </div>
        </Panel>
      )}

      <Panel className="mb-6 p-5">
        <Label>Issue a key</Label>
        <div className="mt-4 flex flex-wrap items-end gap-3">
          <div className="w-64">
            <Field label="Name" hint="So you can tell two keys apart later.">
              <Input
                value={name}
                placeholder="Production"
                onChange={(e) => setName(e.target.value)}
              />
            </Field>
          </div>
          <Button
            busy={busy}
            disabled={!name.trim()}
            onClick={() =>
              run(async () => {
                setIssued(await keysApi.create({ token }, name.trim()));
                setCopied(false);
                setName("");
              })
            }
          >
            Issue
          </Button>
        </div>
      </Panel>

      {error && <p className="mb-4 text-[14px] text-alert">{error}</p>}

      {state.loading ? (
        <Loading label="Loading keys" />
      ) : state.error ? (
        <Failure
          message={state.error.message}
          code={state.error.code}
          requestId={state.error.requestId}
          onRetry={state.reload}
        />
      ) : state.data!.length === 0 ? (
        <Empty title="No keys yet" description="Issue one to get started." />
      ) : (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Key</Th>
              <Th>Status</Th>
              <Th>Deliveries</Th>
              <Th>Data</Th>
              <Th>Last used</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {state.data!.map((k) => {
              const expiring = k.expires_at && k.status === "active";
              return (
                <tr key={k.id}>
                  <Td>{k.name}</Td>
                  <Td mono>{k.prefix}…</Td>
                  <Td>
                    <Badge
                      tone={
                        k.status === "revoked"
                          ? "neutral"
                          : expiring
                            ? "warn"
                            : "good"
                      }
                    >
                      {k.status === "revoked"
                        ? "revoked"
                        : expiring
                          ? "retiring"
                          : "active"}
                    </Badge>
                    {expiring && (
                      <span className="ml-2 text-[12px] text-muted">
                        until {when(k.expires_at)}
                      </span>
                    )}
                  </Td>
                  <Td>
                    {byKey.get(k.id)?.deliveries ?? 0}
                    <span className="block text-[11px] text-muted">
                      {(byKey.get(k.id)?.devices ?? 0)} handset
                      {(byKey.get(k.id)?.devices ?? 0) === 1 ? "" : "s"}
                    </span>
                  </Td>
                  <Td>
                    {bytes(byKey.get(k.id)?.bytes_in)}
                    <span className="block text-[11px] text-muted">
                      {(byKey.get(k.id)?.batches ?? 0).toLocaleString()} batches
                    </span>
                  </Td>
                  <Td>{when(k.last_used_at)}</Td>
                  <Td align="right">
                    {k.status === "active" && (
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          onClick={() =>
                            setRotating(rotating === k.id ? null : k.id)
                          }
                        >
                          Rotate
                        </Button>
                        <Button
                          variant="danger"
                          onClick={() => {
                            setRevoking(revoking === k.id ? null : k.id);
                            setRetireDevices(false);
                          }}
                        >
                          Revoke
                        </Button>
                      </div>
                    )}
                  </Td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      )}

      {revoking && (
        <Panel className="mt-4 border-alert/30 p-5">
          <Label>Revoke this key</Label>
          <p className="mt-2 max-w-[70ch] text-[14px] text-muted">
            The key stops working immediately and cannot be brought back. Any
            build still shipping it will fail to enrol new handsets.
          </p>

          <label className="mt-4 flex max-w-[70ch] items-start gap-3 text-[14px]">
            <input
              type="checkbox"
              className="mt-1"
              checked={retireDevices}
              onChange={(e) => setRetireDevices(e.target.checked)}
            />
            <span>
              <span className="text-ink">
                Also sign out every handset enrolled with it
              </span>
              <span className="mt-1 block text-muted">
                Revoking a key does not stop the handsets that already have a
                token: they keep uploading until it expires, up to twelve
                hours. Tick this if the key has leaked. Those delivery partners will
                have to enrol again with a new key before they can upload.
              </span>
            </span>
          </label>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button
              busy={busy}
              variant="danger"
              onClick={() =>
                run(async () => {
                  await keysApi.revoke({ token }, revoking, retireDevices);
                  setRevoking(null);
                })
              }
            >
              {retireDevices ? "Revoke and sign out devices" : "Revoke key"}
            </Button>
            <Button variant="ghost" onClick={() => setRevoking(null)}>
              Cancel
            </Button>
          </div>
        </Panel>
      )}

      {rotating && (
        <Panel className="mt-4 p-5">
          <Label>Rotate</Label>
          <p className="mt-2 max-w-[70ch] text-[14px] text-muted">
            A new key is issued immediately and the old one keeps working for
            the overlap you choose. You cannot update every handset in a fleet
            at the same instant, so an overlap is what stops a rotation taking
            your operation offline. Choose none only if the old key has leaked.
          </p>
          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div className="w-52">
              <Field label="Old key keeps working for">
                <Select
                  value={overlap}
                  onChange={(e) => setOverlap(e.target.value)}
                >
                  <option value="24">24 hours</option>
                  <option value="168">7 days</option>
                  <option value="720">30 days</option>
                  <option value="0">No overlap, revoke now</option>
                </Select>
              </Field>
            </div>
            <Button
              busy={busy}
              variant={overlap === "0" ? "danger" : "primary"}
              onClick={() =>
                run(async () => {
                  setIssued(
                    await keysApi.rotate({ token }, rotating, Number(overlap)),
                  );
                  setCopied(false);
                  setRotating(null);
                })
              }
            >
              Rotate
            </Button>
            <Button variant="ghost" onClick={() => setRotating(null)}>
              Cancel
            </Button>
          </div>
        </Panel>
      )}
    </>
  );
}
