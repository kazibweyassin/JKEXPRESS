import { describe, expect, it } from "vitest";
import { hasAnyPermission, hasPermission, isSuperAdmin } from "./permissions";

describe("hasPermission", () => {
  it("grants access for wildcard permissions", () => {
    expect(hasPermission(["*"], "leads", "edit")).toBe(true);
  });

  it("supports exact and wildcard resource permissions", () => {
    expect(hasPermission(["leads:view"], "leads", "view")).toBe(true);
    expect(hasPermission(["properties:*"], "properties", "create")).toBe(true);
  });

  it("supports Set-based permission input", () => {
    expect(hasPermission(new Set(["leases:edit"]), "leases", "edit")).toBe(true);
  });

  it("allows dashboard view permission for the dashboard resource", () => {
    expect(hasPermission(["dashboard:view"], "dashboard", "view")).toBe(true);
  });

  it("rejects missing permissions", () => {
    expect(hasPermission(["payments:view"], "rent", "edit")).toBe(false);
  });
});

describe("hasAnyPermission", () => {
  it("returns true when any required permission is present", () => {
    expect(
      hasAnyPermission(["leases:view", "payments:edit"], [
        { resource: "leases", action: "edit" },
        { resource: "payments", action: "edit" },
      ]),
    ).toBe(true);
  });

  it("returns false when no required permission is present", () => {
    expect(
      hasAnyPermission(["leases:view"], [
        { resource: "payments", action: "edit" },
        { resource: "inventory", action: "create" },
      ]),
    ).toBe(false);
  });
});

describe("isSuperAdmin", () => {
  it("detects wildcard access", () => {
    expect(isSuperAdmin(["*"])).toBe(true);
  });

  it("does not treat regular permissions as super admin", () => {
    expect(isSuperAdmin(["dashboard:view"])).toBe(false);
  });
});
