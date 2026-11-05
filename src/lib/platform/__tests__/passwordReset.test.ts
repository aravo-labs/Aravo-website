import { afterEach, describe, expect, it, vi } from "vitest";

import { BASE_URL } from "../client";
import { requestPasswordReset } from "../auth";

/**
 * Which service the reset request goes to.
 *
 * This shipped pointing at NEXT_PUBLIC_API_URL, which on this site is the CMS
 * behind the marketing pages, not the platform. The CMS has no such endpoint,
 * the failure is swallowed on purpose so the response cannot be used to find
 * out who has an account, and the result was a form that said "check your
 * email" and never sent one. A wrong address here is silent by design, so it
 * has to be held in place by a test rather than noticed in use.
 */
afterEach(() => vi.unstubAllGlobals());

const capture = () => {
  const fetchMock = vi.fn().mockResolvedValue({ ok: true });
  vi.stubGlobal("fetch", fetchMock);
  return fetchMock;
};

describe("requestPasswordReset", () => {
  it("asks the platform API, not the content API", async () => {
    const fetchMock = capture();
    await requestPasswordReset("priya@northwind.example");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/v1/public/password-reset`);
  });

  it("sends the address as JSON", async () => {
    const fetchMock = capture();
    await requestPasswordReset("priya@northwind.example");

    const [, init] = fetchMock.mock.calls[0];
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({ email: "priya@northwind.example" });
  });

  it("stays quiet when the request fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(requestPasswordReset("priya@northwind.example")).resolves.toBeUndefined();
  });
});
