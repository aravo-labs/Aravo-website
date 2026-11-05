"use client";

import { useState } from "react";

import { PageHead, useAuth } from "@/components/dashboard/Shell";
import {
  Badge,
  Button,
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
import { accountApi } from "@/lib/platform/api";
import type { Company, MemberInvited } from "@/lib/platform/types";
import { ApiRequestError } from "@/lib/platform/client";
import { useAsync } from "@/lib/platform/useAsync";

/**
 * The three levels, in the words a customer uses rather than the strings the
 * database stores. One list, so the invite form and the member table cannot
 * drift apart and offer different sets.
 */
const ROLES = [
  {
    value: "company_viewer",
    label: "View only",
    hint: "Sees the dashboard. Changes nothing, and cannot download raw sensor data.",
  },
  {
    value: "company_user",
    label: "Edit",
    hint: "Also edits company details and retires handsets.",
  },
  {
    value: "company_admin",
    label: "Full access",
    hint: "Also issues API keys and manages people.",
  },
] as const;

function roleLabel(value: string): string {
  return ROLES.find((r) => r.value === value)?.label ?? value.replace("_", " ");
}

export default function SettingsPage() {
  const { token, email } = useAuth();
  const company = useAsync(() => accountApi.company({ token }), [token]);
  const members = useAsync(() => accountApi.members({ token }), [token]);

  const [inviting, setInviting] = useState(false);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("company_user");
  const [inviteBusy, setInviteBusy] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<MemberInvited | null>(null);

  // Keyed by member, because two rows can be acted on at once and a single
  // flag would disable the wrong button.
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rowError, setRowError] = useState<{ id: string; message: string } | null>(
    null
  );
  const [confirmId, setConfirmId] = useState<string | null>(null);

  /**
   * Run one change against a member.
   *
   * The server refuses several of these on purpose: demoting the last
   * administrator, removing yourself, changing your own role. Those come back
   * as 409 with a message written for a person, so it is shown as it is rather
   * than replaced with something vaguer.
   */
  async function act(id: string, work: () => Promise<unknown>) {
    setBusyId(id);
    setRowError(null);
    try {
      await work();
      members.reload();
    } catch (e) {
      setRowError({
        id,
        message:
          e instanceof ApiRequestError
            ? e.message
            : "That did not go through. Try again.",
      });
    } finally {
      setBusyId(null);
      setConfirmId(null);
    }
  }

  if (company.loading) return <Loading label="Loading settings" />;
  if (company.error)
    return (
      <Failure
        message={company.error.message}
        code={company.error.code}
        requestId={company.error.requestId}
        onRetry={company.reload}
      />
    );

  const c = company.data!;

  return (
    <>
      <PageHead title="Settings" description="Your company and who can sign in." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Panel className="p-5">
          <Label>Company</Label>
          <CompanyForm
            key={c.id}
            company={c}
            token={token}
            onSaved={company.setData}
          />
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <Label>Who can sign in</Label>
            <Button
              variant="secondary"
              onClick={() => {
                setInviting((v) => !v);
                setInviteResult(null);
                setInviteError(null);
              }}
            >
              {inviting ? "Cancel" : "Invite"}
            </Button>
          </div>

          {inviting && (
            <div className="mt-4 border-b border-rule pb-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Their name">
                  <Input
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    autoComplete="off"
                  />
                </Field>
                <Field label="Work email">
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    autoComplete="off"
                  />
                </Field>
              </div>
              <div className="mt-3 w-full sm:w-52">
                <Field
                  label="Role"
                  hint={
                    ROLES.find((r) => r.value === inviteRole)?.hint ??
                    "What this person will be able to do."
                  }
                >
                  <Select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </Select>
                </Field>
              </div>

              {inviteError && (
                <p className="mt-3 text-[13px] text-alert">{inviteError}</p>
              )}
              {inviteResult && (
                <p className="mt-3 text-[13px] text-ink">
                  {inviteResult.email_sent
                    ? `Invitation sent to ${inviteResult.member.email}.`
                    : `${inviteResult.member.email} already had an account, so they were added straight away and keep the password they have.`}
                </p>
              )}

              <div className="mt-4">
                <Button
                  busy={inviteBusy}
                  disabled={!inviteName.trim() || !inviteEmail.trim()}
                  onClick={async () => {
                    setInviteBusy(true);
                    setInviteError(null);
                    setInviteResult(null);
                    try {
                      const r = await accountApi.inviteMember(
                        { token },
                        {
                          name: inviteName.trim(),
                          email: inviteEmail.trim(),
                          role: inviteRole,
                        },
                      );
                      setInviteResult(r);
                      setInviteName("");
                      setInviteEmail("");
                      members.reload();
                    } catch (err) {
                      setInviteError(
                        err instanceof ApiRequestError
                          ? err.message
                          : "Could not send that invitation.",
                      );
                    } finally {
                      setInviteBusy(false);
                    }
                  }}
                >
                  Send invitation
                </Button>
              </div>
            </div>
          )}
          <div className="mt-4">
            {members.loading ? (
              <p className="text-[14px] text-muted">Loading…</p>
            ) : (
              <Table>
                <thead>
                  <tr>
                    <Th>Name</Th>
                    <Th>Role</Th>
                    <Th>{""}</Th>
                  </tr>
                </thead>
                <tbody>
                  {(members.data ?? []).map((m) => {
                    const isYou = m.email === email;
                    const busy = busyId === m.id;
                    return (
                      <tr key={m.id}>
                        <Td>
                          {m.name}
                          <span className="block font-mono text-[11px] text-muted">
                            {m.email}
                            {isYou ? " · you" : ""}
                          </span>
                          {rowError?.id === m.id && (
                            <span className="mt-1 block text-[12px] text-alert">
                              {rowError.message}
                            </span>
                          )}
                        </Td>
                        <Td>
                          {isYou ? (
                            // Changing your own role is refused by the server,
                            // because it is how an account locks itself out of
                            // its own administration with nobody able to undo
                            // it. Showing a control that always fails would be
                            // worse than showing none.
                            <Badge
                              tone={m.role === "company_admin" ? "info" : "neutral"}
                            >
                              {roleLabel(m.role)}
                            </Badge>
                          ) : (
                            <Select
                              aria-label={`Role for ${m.name}`}
                              value={m.role}
                              disabled={busy}
                              onChange={(e) =>
                                act(m.id, () =>
                                  accountApi.updateMember(
                                    { token },
                                    m.id,
                                    { role: e.target.value }
                                  )
                                )
                              }
                            >
                              {ROLES.map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </Select>
                          )}
                        </Td>
                        <Td>
                          {!isYou &&
                            (confirmId === m.id ? (
                              <span className="flex flex-wrap items-center gap-2">
                                <span className="text-[12px] text-muted">
                                  Remove {m.name}?
                                </span>
                                <Button
                                  variant="danger"
                                  busy={busy}
                                  onClick={() =>
                                    act(m.id, () =>
                                      accountApi.removeMember({ token }, m.id)
                                    )
                                  }
                                >
                                  Remove
                                </Button>
                                <Button
                                  variant="ghost"
                                  onClick={() => setConfirmId(null)}
                                >
                                  Cancel
                                </Button>
                              </span>
                            ) : (
                              // Two steps. Removing somebody ends their access
                              // immediately and there is no undo, which is not
                              // a thing to do on one stray click.
                              <Button
                                variant="ghost"
                                disabled={busy}
                                onClick={() => setConfirmId(m.id)}
                              >
                                Remove
                              </Button>
                            ))}
                        </Td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            )}
          </div>
        </Panel>
      </div>

      <Panel className="mt-4 p-5">
        <Label>What we hold about your delivery partners</Label>
        <p className="mt-3 max-w-[75ch] text-[14px] text-muted">
          A delivery record stores the delivery partner reference your own system
          supplies, never a name or a phone number, along with the sensor data
          their handset uploaded. That data describes a real person&rsquo;s
          movement inside a building, so it is personal data about them and not
          only about your company. You will need their consent to collect it,
          and a retention period after which it is deleted. If you have not
          settled those with your legal advisor yet, do that before you run a
          real fleet on this.
        </p>
      </Panel>
    </>
  );
}


/**
 * Keyed by company id, so `useState` initialises from the loaded data and
 * there is no effect syncing props into state. A sync like that is one more
 * thing that can be wrong, and it is wrong exactly when the data arrives late.
 */
function CompanyForm({
  company,
  token,
  onSaved,
}: {
  company: Company;
  token: string;
  onSaved: (next: Company) => void;
}) {
  const [form, setForm] = useState({
    name: company.name,
    location: company.location ?? "",
    delivery_category: company.delivery_category ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <>
      <form
        className="mt-4 flex flex-col gap-4"
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setMessage(null);
          setError(null);
          try {
            onSaved(
              await accountApi.updateCompany(
                { token },
                {
                  name: form.name,
                  location: form.location || null,
                  delivery_category: form.delivery_category || null,
                },
              ),
            );
            setMessage("Saved.");
          } catch (err) {
            setError(
              err instanceof ApiRequestError ? err.message : "Could not save that.",
            );
          } finally {
            setBusy(false);
          }
        }}
      >
        <Field label="Name">
          <Input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </Field>
        <Field label="Location">
          <Input
            value={form.location}
            onChange={(e) => setForm({ ...form, location: e.target.value })}
          />
        </Field>
        <Field label="Delivery category">
          <Input
            value={form.delivery_category}
            onChange={(e) =>
              setForm({ ...form, delivery_category: e.target.value })
            }
          />
        </Field>
        <div className="flex items-center gap-3">
          <Button type="submit" busy={busy}>
            Save
          </Button>
          {message && <span className="text-[13px] text-signal">{message}</span>}
          {error && <span className="text-[13px] text-alert">{error}</span>}
        </div>
      </form>

      <p className="mt-5 border-t border-rule pt-4 text-[13px] text-muted">
        Your handle is <code className="font-mono text-ink">{company.slug}</code>.
        It does not change when the name does, because it may already be in a
        bookmark or a support ticket.
      </p>
    </>
  );
}
