import { describe, expect, it } from "vitest";
import { buildQuotationPdf, parseQuotationFormData } from "./quotation-pdf";

describe("quotation PDF", () => {
  it("builds a PDF with the JK logo and quotation total", () => {
    const pdf = buildQuotationPdf({
      quotationNumber: "QT-2026-0001",
      title: "Kololo office superstructure",
      clientName: "Horizon Investments Ltd",
      clientEmail: "ops@example.com",
      clientPhone: "+256700000000",
      projectName: "Kololo Office Complex",
      notes: "Subject to site inspection.",
      currency: "UGX",
      createdAt: new Date("2026-08-21"),
      validUntil: new Date("2026-09-21"),
      items: [
        {
          description: "Superstructure",
          unit: "ls",
          quantity: 1,
          unitRate: 420000000,
        },
        {
          description: "Finishes",
          unit: "sqm",
          quantity: 180,
          unitRate: 85000,
        },
      ],
    });

    const text = pdf.toString("latin1");
    expect(text.startsWith("%PDF-1.4")).toBe(true);
    expect(text).toContain("QT-2026-0001");
    expect(text).toContain("JK Express");
    expect(text).toContain("/Subtype /Image");
    expect(text).toContain("%%EOF");
  });

  it("parses a quotation form without a database", () => {
    const form = new FormData();
    form.set("title", "Kololo superstructure");
    form.set("clientName", "Horizon Investments");
    form.set("items", "Superstructure | 1 | 420000000 | ls\nFinishes | 180 | 85000 | sqm");
    const parsed = parseQuotationFormData(form);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.data.items).toHaveLength(2);
    expect(parsed.data.items[1]?.unitRate).toBe(85000);
  });
});
