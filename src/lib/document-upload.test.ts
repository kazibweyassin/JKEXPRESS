import { describe, expect, it } from "vitest";
import {
  documentDisposition,
  documentExtension,
  documentKey,
} from "./document-upload";

describe("document upload helpers", () => {
  it("maps PDF and Office types to extensions", () => {
    expect(documentExtension({ name: "x", type: "application/pdf" })).toBe("pdf");
    expect(
      documentExtension({
        name: "offer.docx",
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
    ).toBe("docx");
  });

  it("falls back to the file name when the browser omits a type", () => {
    expect(documentExtension({ name: "boq.xlsx", type: "" })).toBe("xlsx");
  });

  it("rejects unknown types", () => {
    expect(() => documentExtension({ name: "payload.exe", type: "application/x-msdownload" })).toThrow(
      /PDF, Word, Excel/,
    );
  });

  it("stores objects under documents/year/id.ext", () => {
    expect(documentKey("abc", "pdf")).toMatch(/^documents\/\d{4}\/abc\.pdf$/);
  });

  it("opens PDFs inline and downloads Office files", () => {
    expect(documentDisposition("FIDIC contract.pdf", "pdf")).toContain("inline");
    expect(documentDisposition("BOQ.xlsx", "xlsx")).toContain("attachment");
  });
});
