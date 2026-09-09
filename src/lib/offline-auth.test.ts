import { describe, expect, it } from "vitest";
import { OFFLINE_PASSWORD, verifyOfflineUser } from "./offline-auth";

describe("offline staff login", () => {
  it("accepts the seeded admin password", () => {
    const user = verifyOfflineUser("admin@jkexpress.ug", OFFLINE_PASSWORD);
    expect(user?.role.slug).toBe("super-administrator");
    expect(user?.permissions).toEqual(["*"]);
  });

  it("rejects a wrong password", () => {
    expect(verifyOfflineUser("admin@jkexpress.ug", "wrong")).toBeNull();
  });
});
