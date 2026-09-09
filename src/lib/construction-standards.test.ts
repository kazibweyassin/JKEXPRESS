import { describe, expect, it } from "vitest";
import { mondayOf, padRef, PROGRESS_STANDARD } from "./construction-standards";

describe("construction standards", () => {
  it("uses FIDIC weekly reports entered by company staff", () => {
    expect(PROGRESS_STANDARD.short).toBe("FIDIC");
    expect(PROGRESS_STANDARD.enteredBy).toMatch(/Site Engineer|Project Manager/);
  });

  it("normalises week starting to Monday", () => {
    const sunday = mondayOf(new Date("2026-08-23T12:00:00Z"));
    expect(sunday.getDay()).toBe(1);
  });

  it("pads document references", () => {
    expect(padRef("QT", 2026, 3)).toBe("QT-2026-0003");
    expect(padRef("IPC", 2026, 12)).toBe("IPC-2026-0012");
  });
});
