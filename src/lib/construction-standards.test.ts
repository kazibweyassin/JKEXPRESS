import { describe, expect, it } from "vitest";
import {
  ipcCertificate,
  mondayOf,
  padRef,
  projectExpenditureTotal,
  quotationGrandTotal,
  shouldUpdateProjectProgress,
  PROGRESS_STANDARD,
  DEFAULT_RETENTION_RATE,
} from "./construction-standards";

describe("construction standards", () => {
  it("uses FIDIC weekly reports entered by company staff", () => {
    expect(PROGRESS_STANDARD.short).toBe("FIDIC");
    expect(PROGRESS_STANDARD.enteredBy).toMatch(/Site Engineer|Project Manager/);
  });

  it("normalises week starting to Monday in UTC", () => {
    const sunday = mondayOf(new Date("2026-08-23T12:00:00Z"));
    expect(sunday.getUTCDay()).toBe(1);
    expect(sunday.toISOString().startsWith("2026-08-17")).toBe(true);

    const monday = mondayOf(new Date("2026-08-24"));
    expect(monday.getUTCDay()).toBe(1);
    expect(monday.toISOString().startsWith("2026-08-24")).toBe(true);
  });

  it("pads document references", () => {
    expect(padRef("QT", 2026, 3)).toBe("QT-2026-0003");
    expect(padRef("IPC", 2026, 12)).toBe("IPC-2026-0012");
  });
});

describe("IPC certificate math", () => {
  it("uses 10% retention and subtracts previously certified work", () => {
    expect(DEFAULT_RETENTION_RATE).toBe(10);
    const certificate = ipcCertificate({
      grossAmount: 1_000_000,
      previousCertified: 200_000,
    });
    expect(certificate.retention).toBe(100_000);
    expect(certificate.previousPaid).toBe(200_000);
    expect(certificate.amountDue).toBe(700_000);
  });

  it("allows a retention amount override", () => {
    const certificate = ipcCertificate({
      grossAmount: 1_000_000,
      previousCertified: 0,
      retentionAmount: 50_000,
    });
    expect(certificate.retention).toBe(50_000);
    expect(certificate.amountDue).toBe(950_000);
  });

  it("flags over-certification as a negative amount due", () => {
    const certificate = ipcCertificate({
      grossAmount: 100,
      previousCertified: 90,
      retentionRate: 20,
    });
    expect(certificate.amountDue).toBeLessThan(0);
  });
});

describe("project progress and spend", () => {
  it("does not treat package reports as official project progress", () => {
    expect(shouldUpdateProjectProgress(false)).toBe(false);
    expect(shouldUpdateProjectProgress(true)).toBe(true);
  });

  it("sums expenses, issued materials and certified work", () => {
    expect(
      projectExpenditureTotal({
        expenses: 100,
        materials: 40,
        certifiedWork: 25,
      }),
    ).toBe(165);
  });

  it("computes quotation grand total with contingency, discount and VAT", () => {
    expect(
      quotationGrandTotal({
        items: [{ quantity: 2, unitRate: 100 }],
        contingencyRate: 10,
        discount: 20,
        taxRate: 18,
      }),
    ).toBeCloseTo(236.0);
  });
});
