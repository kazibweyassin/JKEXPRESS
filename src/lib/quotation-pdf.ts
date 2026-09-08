import fs from "node:fs";
import path from "node:path";
import { BRAND } from "@/lib/company";

export type QuotationPdfItem = {
  section?: string;
  description: string;
  unit: string;
  quantity: number;
  unitRate: number;
};

export function parseQuotationLines(raw: string): QuotationPdfItem[] {
  return raw
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split("|").map((part) => part.trim());
      const sectioned = parts.length >= 5;
      return {
        section: sectioned ? parts[0] || "General" : "General",
        description: parts[sectioned ? 1 : 0] || "Item",
        quantity: Number(parts[sectioned ? 2 : 1] || 1),
        unitRate: Number(parts[sectioned ? 3 : 2] || 0),
        unit: parts[sectioned ? 4 : 3] || "item",
      };
    })
    .filter((item) => item.description);
}

export function parseQuotationFormData(
  formData: FormData,
): { ok: true; data: QuotationPdfInput } | { ok: false; error: string } {
  const title = String(formData.get("title") || "").trim();
  const clientName = String(formData.get("clientName") || "").trim();
  const itemsRaw = String(formData.get("items") || "");
  if (title.length < 3) return { ok: false, error: "Title is required." };
  if (clientName.length < 2) return { ok: false, error: "Client name is required." };
  const items = parseQuotationLines(itemsRaw);
  if (items.length === 0) {
    return { ok: false, error: "Add at least one line item." };
  }
  const year = new Date().getFullYear();
  const stamp = Date.now().toString().slice(-4);
  const validUntilRaw = String(formData.get("validUntil") || "");
  return {
    ok: true,
    data: {
      quotationNumber: String(formData.get("quotationNumber") || `QT-${year}-${stamp}`),
      title,
      clientName,
      clientEmail: String(formData.get("clientEmail") || "") || null,
      clientPhone: String(formData.get("clientPhone") || "") || null,
      clientAddress: String(formData.get("clientAddress") || "") || null,
      siteLocation: String(formData.get("siteLocation") || "") || null,
      projectName: String(formData.get("projectName") || "") || null,
      notes: String(formData.get("notes") || "") || null,
      currency: String(formData.get("currency") || "UGX"),
      revision: Number(formData.get("revision") || 0),
      discount: Number(formData.get("discount") || 0),
      taxRate: Number(formData.get("taxRate") || 0),
      contingencyRate: Number(formData.get("contingencyRate") || 0),
      scopeOfWorks: String(formData.get("scopeOfWorks") || "") || null,
      inclusions: String(formData.get("inclusions") || "") || null,
      exclusions: String(formData.get("exclusions") || "") || null,
      paymentTerms: String(formData.get("paymentTerms") || "") || null,
      duration: String(formData.get("duration") || "") || null,
      warranty: String(formData.get("warranty") || "") || null,
      variationTerms: String(formData.get("variationTerms") || "") || null,
      preparedBy: String(formData.get("preparedBy") || "") || null,
      approvedBy: String(formData.get("approvedBy") || "") || null,
      bankDetails: String(formData.get("bankDetails") || "") || null,
      createdAt: new Date(),
      validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
      items,
    },
  };
}

export type QuotationPdfInput = {
  quotationNumber: string;
  title: string;
  clientName: string;
  clientEmail?: string | null;
  clientPhone?: string | null;
  clientAddress?: string | null;
  siteLocation?: string | null;
  projectName?: string | null;
  notes?: string | null;
  currency: string;
  revision?: number;
  discount?: number;
  taxRate?: number;
  contingencyRate?: number;
  scopeOfWorks?: string | null;
  inclusions?: string | null;
  exclusions?: string | null;
  paymentTerms?: string | null;
  duration?: string | null;
  warranty?: string | null;
  variationTerms?: string | null;
  preparedBy?: string | null;
  approvedBy?: string | null;
  bankDetails?: string | null;
  createdAt: Date;
  validUntil?: Date | null;
  items: QuotationPdfItem[];
};

function jpegSize(buf: Buffer): { width: number; height: number } | null {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let offset = 2;
  while (offset + 9 < buf.length) {
    if (buf[offset] !== 0xff) return null;
    const marker = buf[offset + 1];
    const size = buf.readUInt16BE(offset + 2);
    if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
      return {
        height: buf.readUInt16BE(offset + 5),
        width: buf.readUInt16BE(offset + 7),
      };
    }
    offset += 2 + size;
  }
  return null;
}

function loadLogo() {
  const file = path.join(process.cwd(), "public", "logo.jpeg");
  if (!fs.existsSync(file)) return null;
  const bytes = fs.readFileSync(file);
  const size = jpegSize(bytes);
  if (!size) return null;
  return { bytes, ...size };
}

function pdfEscape(text: string) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function money(amount: number, currency: string) {
  return `${currency} ${amount.toLocaleString("en-UG", { maximumFractionDigits: 0 })}`;
}

function wrap(text: string, width: number) {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else current = next;
  }
  if (current) lines.push(current);
  return lines.length ? lines : [""];
}

class PdfDoc {
  private objects: Buffer[] = [];

  add(content: string | Buffer) {
    const buf = Buffer.isBuffer(content) ? content : Buffer.from(content, "utf8");
    this.objects.push(buf);
    return this.objects.length;
  }

  build() {
    const header = Buffer.from("%PDF-1.4\n%\xE2\xE3\xCF\xD3\n", "binary");
    const parts: Buffer[] = [header];
    const offsets = [0];
    let cursor = header.length;
    this.objects.forEach((obj, i) => {
      offsets.push(cursor);
      const block = Buffer.concat([
        Buffer.from(`${i + 1} 0 obj\n`),
        obj,
        Buffer.from("\nendobj\n"),
      ]);
      parts.push(block);
      cursor += block.length;
    });
    const xrefStart = cursor;
    let xref = `xref\n0 ${this.objects.length + 1}\n0000000000 65535 f \n`;
    for (let i = 1; i < offsets.length; i++) {
      xref += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
    }
    const trailer = `trailer << /Size ${this.objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    parts.push(Buffer.from(xref + trailer));
    return Buffer.concat(parts);
  }
}

export function buildQuotationPdf(input: QuotationPdfInput): Buffer {
  const logo = loadLogo();
  const pageW = 595.28;
  const pageH = 841.89;
  const margin = 48;
  const ops: string[] = [];

  const navy = "0 0.125 0.565";
  const red = "0.91 0 0";

  ops.push(`${navy} rg 0 ${pageH - 36} ${pageW} 36 re f`);
  ops.push(`${red} rg 0 ${pageH - 40} ${pageW} 4 re f`);
  ops.push("1 1 1 rg");
  ops.push(`BT /F2 11 Tf ${margin} ${pageH - 24} Td (${pdfEscape("QUOTATION")}) Tj ET`);
  ops.push("0 0 0 rg");

  let logoDraw = "";
  if (logo) {
    const maxW = 150;
    const scale = maxW / logo.width;
    const w = maxW;
    const h = logo.height * scale;
    const x = pageW - margin - w;
    const y = pageH - 40 - 12 - h;
    logoDraw = `q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /Im1 Do Q`;
  }

  let y = pageH - 58;
  const left = margin;
  ops.push(`BT /F2 14 Tf ${left} ${y} Td (${pdfEscape(BRAND.fullName)}) Tj ET`);
  y -= 14;
  ops.push(
    `BT /F1 9 Tf ${left} ${y} Td (${pdfEscape("Building Construction & Consultancy · Real Estate & Property Management")}) Tj ET`,
  );
  y -= 12;
  ops.push(
    `BT /F1 9 Tf ${left} ${y} Td (${pdfEscape(`Tel ${BRAND.phone}  ·  WhatsApp ${BRAND.whatsapp}  ·  info@jkexpress.ug`)}) Tj ET`,
  );
  y -= 12;
  ops.push(`BT /F1 9 Tf ${left} ${y} Td (${pdfEscape("Kampala · Entebbe · Jinja, Uganda")}) Tj ET`);

  if (logoDraw) {
    ops.push(logoDraw);
    y = Math.min(y, pageH - 40 - 12 - (logo ? (150 / logo.width) * logo.height : 0) - 8);
  }

  y -= 18;
  ops.push(`${red} rg ${left} ${y} ${pageW - margin * 2} 1.5 re f 0 0 0 rg`);
  y -= 22;

  ops.push(`BT /F2 16 Tf ${left} ${y} Td (${pdfEscape(input.quotationNumber)}) Tj ET`);
  y -= 16;
  for (const line of wrap(input.title, 78)) {
    ops.push(`BT /F1 11 Tf ${left} ${y} Td (${pdfEscape(line)}) Tj ET`);
    y -= 14;
  }

  y -= 6;
  const meta = [
    ["Revision", String(input.revision ?? 0)],
    ["Client address", input.clientAddress || "-"],
    ["Site location", input.siteLocation || "-"],
    ["Client", input.clientName],
    ["Phone", input.clientPhone || "—"],
    ["Email", input.clientEmail || "—"],
    ["Project", input.projectName || "—"],
    ["Date", input.createdAt.toLocaleDateString("en-UG")],
    ["Valid until", input.validUntil ? input.validUntil.toLocaleDateString("en-UG") : "—"],
  ];
  for (const [label, value] of meta) {
    ops.push(`BT /F2 9 Tf ${left} ${y} Td (${pdfEscape(label)}) Tj ET`);
    ops.push(`BT /F1 9 Tf ${left + 90} ${y} Td (${pdfEscape(String(value))}) Tj ET`);
    y -= 13;
  }

  y -= 10;
  const colX = [left, left + 220, left + 280, left + 360, left + 430];
  const headers = ["Description", "Qty", "Unit", "Rate", "Amount"];
  ops.push("0.94 0.94 0.96 rg");
  ops.push(`${left - 4} ${y - 4} ${pageW - margin * 2 + 8} 16 re f 0 0 0 rg`);
  headers.forEach((h, i) => {
    ops.push(`BT /F2 8 Tf ${colX[i]} ${y} Td (${h}) Tj ET`);
  });
  y -= 18;

  let subtotal = 0;
  let currentSection = "";
  for (const item of input.items) {
    const section = item.section || "General";
    if (section !== currentSection) {
      currentSection = section;
      ops.push(`${navy} rg ${left - 2} ${y - 3} ${pageW - margin * 2 + 4} 14 re f`);
      ops.push(`1 1 1 rg BT /F2 8 Tf ${left} ${y} Td (${pdfEscape(currentSection.toUpperCase())}) Tj ET 0 0 0 rg`);
      y -= 17;
    }
    const amount = item.quantity * item.unitRate;
    subtotal += amount;
    const descLines = wrap(item.description, 36);
    for (const [idx, line] of descLines.entries()) {
      if (y < 90) break;
      ops.push(`BT /F1 8 Tf ${colX[0]} ${y} Td (${pdfEscape(line)}) Tj ET`);
      if (idx === 0) {
        ops.push(`BT /F1 8 Tf ${colX[1]} ${y} Td (${pdfEscape(String(item.quantity))}) Tj ET`);
        ops.push(`BT /F1 8 Tf ${colX[2]} ${y} Td (${pdfEscape(item.unit)}) Tj ET`);
        ops.push(`BT /F1 8 Tf ${colX[3]} ${y} Td (${pdfEscape(money(item.unitRate, input.currency))}) Tj ET`);
        ops.push(`BT /F1 8 Tf ${colX[4]} ${y} Td (${pdfEscape(money(amount, input.currency))}) Tj ET`);
      }
      y -= 12;
    }
    y -= 4;
  }

  y -= 8;
  ops.push(`${navy} rg ${left} ${y} ${pageW - margin * 2} 0.6 re f 0 0 0 rg`);
  y -= 16;
  const contingency = subtotal * ((input.contingencyRate ?? 0) / 100);
  const afterDiscount = Math.max(0, subtotal + contingency - (input.discount ?? 0));
  const tax = afterDiscount * ((input.taxRate ?? 0) / 100);
  const total = afterDiscount + tax;
  const totals: Array<[string, number]> = [
    ["Subtotal", subtotal],
    [`Contingency (${input.contingencyRate ?? 0}%)`, contingency],
    ["Discount", -(input.discount ?? 0)],
    [`VAT / tax (${input.taxRate ?? 0}%)`, tax],
    ["GRAND TOTAL", total],
  ];
  for (const [label, amount] of totals) {
    ops.push(`BT /F2 ${label === "GRAND TOTAL" ? 11 : 9} Tf ${left + 300} ${y} Td (${pdfEscape(label)}) Tj ET`);
    ops.push(`BT /F2 ${label === "GRAND TOTAL" ? 11 : 9} Tf ${colX[4]} ${y} Td (${pdfEscape(money(amount, input.currency))}) Tj ET`);
    y -= 14;
  }

  if (input.notes) {
    y -= 24;
    ops.push(`BT /F2 9 Tf ${left} ${y} Td (Notes) Tj ET`);
    y -= 13;
    for (const line of wrap(input.notes, 92)) {
      ops.push(`BT /F1 9 Tf ${left} ${y} Td (${pdfEscape(line)}) Tj ET`);
      y -= 12;
    }
  }

  const commercialTerms = [
    ["Scope", input.scopeOfWorks], ["Inclusions", input.inclusions],
    ["Exclusions", input.exclusions], ["Payment terms", input.paymentTerms],
    ["Duration", input.duration], ["Warranty / defects", input.warranty],
    ["Variations", input.variationTerms], ["Bank / payment", input.bankDetails],
  ] as const;
  for (const [label, value] of commercialTerms) {
    if (!value || y < 115) continue;
    y -= 10;
    ops.push(`BT /F2 8 Tf ${left} ${y} Td (${pdfEscape(label)}) Tj ET`);
    y -= 11;
    for (const line of wrap(value, 96).slice(0, 3)) {
      ops.push(`BT /F1 8 Tf ${left} ${y} Td (${pdfEscape(line)}) Tj ET`);
      y -= 10;
    }
  }

  if (y > 105) {
    y -= 18;
    ops.push(`BT /F2 8 Tf ${left} ${y} Td (${pdfEscape(`Prepared by: ${input.preparedBy || "________________"}`)}) Tj ET`);
    ops.push(`BT /F2 8 Tf ${left + 260} ${y} Td (${pdfEscape(`Approved by: ${input.approvedBy || "________________"}`)}) Tj ET`);
    y -= 18;
    ops.push(`BT /F1 8 Tf ${left} ${y} Td (Client acceptance: Name __________________  Signature __________________  Date __________) Tj ET`);
  }

  y = 56;
  ops.push(`${red} rg ${left} ${y + 14} ${pageW - margin * 2} 1.2 re f 0 0 0 rg`);
  ops.push(
    `BT /F1 8 Tf ${left} ${y} Td (${pdfEscape("This quotation is generated by JK Express. Prices in " + input.currency + " unless stated. Subject to site inspection and confirmation.")}) Tj ET`,
  );

  const content = ops.join("\n");
  const ordered = new PdfDoc();
  ordered.add("<< /Type /Catalog /Pages 2 0 R >>");
  ordered.add("<< /Type /Pages /Kids [3 0 R] /Count 1 >>");
  const contentsId = 4;
  const f1 = 5;
  const f2 = 6;
  const img = 7;
  const res = logo
    ? `<< /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> /XObject << /Im1 ${img} 0 R >> >>`
    : `<< /Font << /F1 ${f1} 0 R /F2 ${f2} 0 R >> >>`;
  ordered.add(
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents ${contentsId} 0 R /Resources ${res} >>`,
  );
  ordered.add(`<< /Length ${Buffer.byteLength(content)} >>\nstream\n${content}\nendstream`);
  ordered.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  ordered.add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");
  if (logo) {
    const dict = Buffer.from(
      `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${logo.bytes.length} >>\nstream\n`,
    );
    ordered.add(Buffer.concat([dict, logo.bytes, Buffer.from("\nendstream")]));
  }
  return ordered.build();
}
