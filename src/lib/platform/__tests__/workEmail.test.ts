import { describe, expect, it } from "vitest";

import { checkWorkEmail } from "../workEmail";

describe("checkWorkEmail", () => {
  it.each([
    "priya@northwind.co.in",
    "ops@aravo.in",
    "a@b.io",
    "first.last@some-company.com",
  ])("accepts %s", (email) => {
    expect(checkWorkEmail(email).ok).toBe(true);
  });

  it.each([
    "someone@gmail.com",
    "someone@GMAIL.COM",
    "someone@yahoo.co.in",
    "someone@outlook.com",
    "someone@icloud.com",
  ])("refuses the personal address %s", (email) => {
    const v = checkWorkEmail(email);
    expect(v.ok).toBe(false);
    if (!v.ok) expect(v.reason).toContain("work address");
  });

  it.each(["someone@mailinator.com", "someone@yopmail.com"])(
    "refuses the throwaway inbox %s",
    (email) => {
      const v = checkWorkEmail(email);
      expect(v.ok).toBe(false);
      // A different reason: the problem is that it will stop existing, not
      // that it belongs to a person.
      if (!v.ok) expect(v.reason).toContain("temporary");
    },
  );

  it("refuses something that is not an address at all", () => {
    expect(checkWorkEmail("not-an-address").ok).toBe(false);
  });

  it("stays quiet on an empty field, which `required` already covers", () => {
    expect(checkWorkEmail("").ok).toBe(true);
    expect(checkWorkEmail("   ").ok).toBe(true);
  });

  it("ignores case and surrounding space", () => {
    expect(checkWorkEmail("  Ops@Northwind.CO.IN  ").ok).toBe(true);
    expect(checkWorkEmail("  Someone@Gmail.com  ").ok).toBe(false);
  });
});
