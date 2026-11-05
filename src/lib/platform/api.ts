"use client";

/**
 * Typed platform API surface for the customer dashboard.
 *
 * One function per endpoint. Screens never build URLs or touch the response
 * envelope: they call these and catch `ApiRequestError`.
 *
 * Nothing here takes a company id. The API resolves the company from the
 * caller's own credential, so a screen cannot read another customer's data
 * even by accident - there is no parameter it could get wrong.
 */

import { request, requestPaged, type Paged } from "./client";
import type {
  ApiKey,
  ApiKeyIssued,
  ApiKeyUsage,
  Company,
  CompanyProfileUpdate,
  CompanyRegister,
  DeliveryCounts,
  Delivery,
  DeliveryDetail,
  Device,
  Member,
  RegistrationResult,
  UsagePoint,
  UsageStats,
  UsageSummary,
  PublicSignup,
  SignupAccepted,
  DeliveryTrend,
  MemberInvite,
  MemberInvited,
  MemberUpdate,
} from "./types";

type Auth = { token: string };

export type DeliveryQuery = {
  page?: number;
  page_size?: number;
  status?: string | null;
  device_id?: string;
  partner_reference?: string;
  since?: string;
  until?: string;
};

/** A dashboard showing yesterday's numbers is a support ticket. */
const FRESH = { cache: "no-store" as const };

/**
 * Every read takes an optional abort signal.
 *
 * `useAsync` already aborts a superseded request, but that only stops the
 * fetch if the signal actually reaches it. Without this the request ran to
 * completion for an answer nobody would read, which on a filter box meant one
 * wasted query per keystroke.
 */
type Signal = AbortSignal | undefined;

/* ---------- who is this, really ---------- */

export const identityApi = {
  /**
   * Is this signed-in identity a member of platform staff?
   *
   * Asked only after the API has said NO_COMPANY, to tell two very different
   * situations apart. One is a customer whose signup was interrupted before
   * the company was created, and the way out is to finish signing up. The
   * other is a member of staff who has opened the wrong application, and
   * sending them to the signup form would have them create a company they do
   * not want and cannot use.
   *
   * Resolves false on any failure. It is only ever used to choose between two
   * messages, and an error here should not replace a useful one with a crash.
   */
  isPlatformStaff: async ({ token }: Auth): Promise<boolean> => {
    try {
      await request<unknown>("/admin/me", { token, ...FRESH });
      return true;
    } catch {
      return false;
    }
  },
};

/* ---------- account ---------- */

export const accountApi = {
  /**
   * Sign up: the account and the company in one unauthenticated request.
   *
   * The server creates the Supabase identity, sends its confirmation email and
   * creates the company together, because the browser cannot do the second
   * part - that needs a session, and with confirmation on there is none until
   * the link is opened.
   *
   * No key is issued here. They make one from the dashboard when they want it.
   */
  signup: (body: PublicSignup): Promise<SignupAccepted> =>
    request<SignupAccepted>("/public/signup", { method: "POST", body }),

  /**
   * Create the company and issue its first key, for a session that already
   * exists. Still used by anyone who signed up before the flow above.
   *
   * The key comes back in this response and nowhere else, ever again. Only its
   * hash is stored, so nobody - including support - can recover it later.
   */
  register: ({ token }: Auth, body: CompanyRegister): Promise<RegistrationResult> =>
    request<RegistrationResult>("/companies/register", {
      method: "POST",
      token,
      body,
    }),

  company: ({ token }: Auth): Promise<Company> =>
    request<Company>("/companies/me", { token, ...FRESH }),

  updateCompany: ({ token }: Auth, body: CompanyProfileUpdate): Promise<Company> =>
    request<Company>("/companies/me", { method: "PATCH", token, body }),

  members: ({ token }: Auth): Promise<Member[]> =>
    request<Member[]>("/companies/me/members", { token, ...FRESH }),

  /**
   * Invite a colleague.
   *
   * `email_sent` comes back false when the address already has an account:
   * they are added and keep the password they have, and the screen has to say
   * that rather than promising an email nobody will receive.
   */
  inviteMember: ({ token }: Auth, body: MemberInvite): Promise<MemberInvited> =>
    request<MemberInvited>("/companies/me/members", {
      method: "POST",
      token,
      body,
    }),

  updateMember: (
    { token }: Auth,
    id: string,
    body: MemberUpdate,
  ): Promise<Member> =>
    request<Member>(`/companies/me/members/${id}`, {
      method: "PATCH",
      token,
      body,
    }),

  removeMember: ({ token }: Auth, id: string): Promise<unknown> =>
    request(`/companies/me/members/${id}`, { method: "DELETE", token }),
};

/* ---------- API keys ---------- */

export const keysApi = {
  list: ({ token }: Auth): Promise<ApiKey[]> =>
    request<ApiKey[]>("/api-keys", { token, ...FRESH }),

  /**
   * What each key has actually been doing.
   *
   * The useful question about a key is not whether it exists but whether it is
   * still earning its place. A key with no traffic for a month is either a
   * credential nobody revoked or an integration that stopped without telling
   * anyone, and both look identical on a list of names.
   */
  usage: ({ token }: Auth, days = 30, signal?: Signal): Promise<ApiKeyUsage[]> =>
    request<ApiKeyUsage[]>("/api-keys/usage", {
      token,
      query: { days },
      signal,
      ...FRESH,
    }),

  create: ({ token }: Auth, name: string): Promise<ApiKeyIssued> =>
    request<ApiKeyIssued>("/api-keys", { method: "POST", token, body: { name } }),

  /**
   * Rotate with an overlap rather than a cliff.
   *
   * A fleet cannot be updated in an instant, so killing the old key the moment
   * a new one is issued takes the whole operation offline. Zero hours is the
   * right choice only when rotating because a key leaked.
   */
  rotate: (
    { token }: Auth,
    id: string,
    overlapHours: number,
    name?: string,
  ): Promise<ApiKeyIssued> =>
    request<ApiKeyIssued>(`/api-keys/${id}/rotate`, {
      method: "POST",
      token,
      body: { overlap_hours: overlapHours, ...(name ? { name } : {}) },
    }),

  revoke: ({ token }: Auth, id: string, retireDevices = false): Promise<unknown> =>
    request(`/api-keys/${id}`, {
      method: "DELETE",
      token,
      query: { retire_devices: retireDevices },
    }),
};

/* ---------- devices ---------- */

export const devicesApi = {
  list: (
    { token }: Auth,
    query: { page?: number; page_size?: number } = {},
    signal?: Signal,
  ): Promise<Paged<Device>> =>
    requestPaged<Device>("/devices", { token, query, signal, ...FRESH }),
};

/* ---------- dashboard ---------- */

export const dashboardApi = {
  summary: ({ token }: Auth): Promise<UsageSummary> =>
    request<UsageSummary>("/dashboard/summary", { token, ...FRESH }),

  usage: ({ token }: Auth, days = 30, signal?: Signal): Promise<UsagePoint[]> =>
    request<UsagePoint[]>("/dashboard/usage", {
      token,
      query: { days },
      signal,
      ...FRESH,
    }),

  /** Today, yesterday, this month, last month, average and peak. */
  usageStats: ({ token }: Auth): Promise<UsageStats> =>
    request<UsageStats>("/dashboard/usage/stats", { token, ...FRESH }),

  /** Deliveries per day, split by outcome. One row per day, empties included. */
  trend: ({ token }: Auth, days = 30, signal?: Signal): Promise<DeliveryTrend[]> =>
    request<DeliveryTrend[]>(`/dashboard/deliveries/trend?days=${days}`, {
      token,
      signal,
      ...FRESH,
    }),

  counts: ({ token }: Auth): Promise<DeliveryCounts[]> =>
    request<DeliveryCounts[]>("/dashboard/deliveries/counts", { token, ...FRESH }),

  deliveries: (
    { token }: Auth,
    query: DeliveryQuery = {},
    signal?: Signal,
  ): Promise<Paged<Delivery>> =>
    requestPaged<Delivery>("/dashboard/deliveries", {
      token,
      query,
      signal,
      ...FRESH,
    }),

  delivery: ({ token }: Auth, id: string): Promise<DeliveryDetail> =>
    request<DeliveryDetail>(`/dashboard/deliveries/${id}`, { token, ...FRESH }),

  /**
   * A short-lived signed link to one raw batch.
   *
   * Fetched from storage directly rather than streamed through the API, and it
   * expires in five minutes. This is one courier's movement inside a building,
   * so the link is deliberately not durable and every request for one is
   * recorded server-side.
   */
  rawBatch: (
    { token }: Auth,
    deliveryId: string,
    batchId: string,
  ): Promise<{ url: string; expires_in: number; byte_size: number }> =>
    request(`/dashboard/deliveries/${deliveryId}/batches/${batchId}/raw`, {
      token,
      ...FRESH,
    }),
};
