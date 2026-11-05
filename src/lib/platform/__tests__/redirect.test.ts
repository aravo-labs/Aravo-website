import { describe, expect, it } from "vitest";

import { safeNext } from "../redirect";

/**
 * These exist because the function shipped once with only its prefix checks,
 * and `%09` walked through them. The bypass cases below are the point of the
 * file; the happy paths are here so a stricter rewrite cannot quietly break
 * ordinary navigation to earn a pass.
 */
describe("safeNext", () => {
  describe("sends somewhere on this site", () => {
    it.each([
      ["/dashboard", "/dashboard"],
      ["/dashboard/deliveries", "/dashboard/deliveries"],
      ["/dashboard/deliveries?page=2&status=tracking", "/dashboard/deliveries?page=2&status=tracking"],
      ["/dashboard/deliveries#recent", "/dashboard/deliveries#recent"],
      ["/", "/"],
    ])("keeps %s", (input, expected) => {
      expect(safeNext(input)).toBe(expected);
    });
  });

  describe("refuses to leave the site", () => {
    it.each([
      ["https://evil.example/phish", "absolute URL"],
      ["http://evil.example", "absolute URL, plain http"],
      ["//evil.example", "protocol relative"],
      ["/\\evil.example", "backslash, which some browsers read as a slash"],
      ["/\\\\evil.example", "double backslash"],
      ["\t//evil.example", "leading tab before the slashes"],
      ["javascript:alert(1)", "script URL"],
      ["data:text/html,<script>alert(1)</script>", "data URL"],
      ["evil.example", "bare host, no leading slash"],
    ])("rejects %s (%s)", (input) => {
      expect(safeNext(input)).toBe("/dashboard");
    });

    // The actual bypass. A browser deletes these three characters before
    // resolving, so each of these is "//evil.example" by the time it matters.
    it.each([
      ["/\t/evil.example", "tab"],
      ["/\n/evil.example", "newline"],
      ["/\r/evil.example", "carriage return"],
      ["/\r\n/evil.example", "CRLF"],
      ["/\t\t/evil.example", "repeated tabs"],
    ])("rejects %s, which a browser strips to //evil.example (%s)", (input) => {
      expect(safeNext(input)).toBe("/dashboard");
    });

    it("rejects a stripped value that a browser would resolve off-origin", () => {
      // Belt and braces: assert the premise, not just the behaviour. If the
      // URL spec ever stopped stripping these, this test should tell us.
      const stripped = "/\t/evil.example".replace(/[\t\n\r]/g, "");
      expect(new URL(stripped, "https://aravo.example").origin).toBe("https://evil.example");
      expect(safeNext("/\t/evil.example")).toBe("/dashboard");
    });
  });

  describe("nothing to redirect to", () => {
    it.each([[null], [undefined], [""]])("falls back for %s", (input) => {
      expect(safeNext(input as string | null | undefined)).toBe("/dashboard");
    });

    it("honours a caller supplied fallback", () => {
      expect(safeNext(null, "/login")).toBe("/login");
      expect(safeNext("https://evil.example", "/login")).toBe("/login");
    });
  });
});
