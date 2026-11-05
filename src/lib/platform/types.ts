/**
 * Platform API types.
 *
 * This site talks to two backends. The CMS one, under `src/lib/api`, serves
 * the public pages and is read anonymously. This one serves the customer
 * dashboard and every call is authenticated. They are separate deployments on
 * separate Supabase projects and share nothing, so they get separate clients
 * rather than one that has to remember which is which.
 *
 * Regenerate after a backend change:
 *   npm run platform:types
 */

import type { components } from "./schema";

type S = components["schemas"];

export type ApiError = S["ApiError"];
export type ErrorDetail = S["ErrorDetail"];
export type PaginationMeta = S["PaginationMeta"];
export type ResponseMeta = S["ResponseMeta"];

/** The shape every endpoint returns, success or failure. */
export type ApiResponse<T> = {
  success: boolean;
  data: T | null;
  error: ApiError | null;
  meta: ResponseMeta;
};

export const ERROR_CODES = [
  "VALIDATION_ERROR",
  "BAD_REQUEST",
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "NOT_FOUND",
  "CONFLICT",
  "UNPROCESSABLE",
  "RATE_LIMITED",
  "PAYLOAD_TOO_LARGE",
  "UNSUPPORTED_MEDIA_TYPE",
  "INTERNAL_ERROR",
  "SERVICE_UNAVAILABLE",
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

/* ---------- account ---------- */

export type Company = S["CompanyRead"];
export type CompanyRegister = S["CompanyRegister"];
export type MemberUpdate = S["MemberUpdate"];
export type MemberInvited = S["MemberInvited"];
export type MemberInvite = S["MemberInvite"];
export type DeliveryTrend = S["DeliveryTrendPoint"];
export type PublicSignup = S["PublicSignup"];
export type SignupAccepted = S["SignupAccepted"];
export type CompanyProfileUpdate = S["CompanyProfileUpdate"];
export type RegistrationResult = S["RegistrationResult"];
export type Member = S["MemberRead"];

/* ---------- credentials ---------- */

export type ApiKey = S["ApiKeyRead"];
export type ApiKeyIssued = S["ApiKeyIssued"];
export type ApiKeyUsage = S["ApiKeyUsage"];
export type Device = S["DeviceRead"];

/* ---------- deliveries ---------- */

export type Delivery = S["DeliveryRead"];
export type DeliveryDetail = S["DeliveryDetail"];
export type SensorBatch = S["SensorBatchRead"];

/* ---------- usage ---------- */

export type UsageSummary = S["UsageSummary"];
export type UsageStats = S["UsageStats"];
export type UsagePoint = S["UsagePoint"];
export type DeliveryCounts = S["DeliveryCounts"];

/**
 * What a delivery can be.
 *
 * `inconclusive` is not an error. It means the sensor data could not be used,
 * which happens when a phone was off, out of battery, in a bag or force
 * closed. That is a real outcome of a real delivery and the screens say so
 * rather than showing an empty page or a red badge.
 */
export type DeliveryStatus =
  | "created"
  | "started"
  | "tracking"
  | "completed"
  | "processing"
  | "processed"
  | "inconclusive"
  | "failed"
  | "cancelled";
