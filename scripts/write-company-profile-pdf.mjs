import fs from "node:fs";
import path from "node:path";

const out = path.join(process.cwd(), "public", "jk-express-company-profile.pdf");

function escapePdf(text) {
  return text.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrap(text, width) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";
  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = next;
    }
  }
  if (current) lines.push(current);
  return lines;
}

const pageW = 595.28;
const pageH = 841.89;
const left = 48;
let y = 780;
const ops = [];

function text(str, size, x, yy) {
  ops.push(`BT /F1 ${size} Tf ${x.toFixed(2)} ${yy.toFixed(2)} Td (${escapePdf(str)}) Tj ET`);
}

function rule(yy, color = "0.91 0 0") {
  ops.push(`${color} rg ${left} ${yy} ${pageW - left * 2} 3 re f 0 0 0 rg`);
}

text("JK EXPRESS REALTORS & DEVELOPERS LTD.", 16, left, y);
y -= 18;
text("Company profile  |  Construction  ·  Real estate  ·  Property management", 10, left, y);
y -= 14;
rule(y);
y -= 28;

text("Who we are", 13, left, y);
y -= 16;
for (const line of wrap(
  "JK Express Realtors & Developers Ltd. is a Uganda company delivering construction, brokerage and property management across Kampala, Entebbe, Jinja and Wakiso. One team from groundbreaking to occupancy reporting.",
  92,
)) {
  text(line, 10, left, y);
  y -= 13;
}

y -= 10;
text("How we work", 13, left, y);
y -= 16;
const creds = [
  "Uganda-registered developer with local delivery teams.",
  "Construction, sales/leasing and asset management under one roof.",
  "Site-supervised delivery: milestones, BOQ control and progress photography.",
  "Markets: Kampala, Entebbe, Jinja and surrounding growth corridors.",
];
for (const item of creds) {
  text(`•  ${item}`, 10, left, y);
  y -= 14;
}

y -= 8;
text("Sectors we build in", 13, left, y);
y -= 16;
text("Commercial  ·  Offices & fit-outs  ·  Residential  ·  Mixed-use  ·  Warehousing  ·  Institutional", 10, left, y);
y -= 22;

text("Who we work with", 13, left, y);
y -= 16;
text("Private developers, property owners, institutions, retail occupiers, industrial clients and households.", 10, left, y);
y -= 22;

text("Selected projects", 13, left, y);
y -= 18;
const projects = [
  "Kololo Office Complex — offices, Kampala — active",
  "Entebbe Residential Estate Phase 1 — residential — completed 2024",
  "Naguru Hillside Apartments — 16 units, Kampala — active",
  "Bugolobi Mixed-Use Hub — retail / offices / apartments — active",
  "Muyenga Luxury Villas — six villas — completed 2025",
  "Jinja Riverside Commercial Block — retail & offices — active",
  "Namanve Logistics Shed — warehousing, Mukono — completed 2024",
  "Ntinda Civic Centre Fit-out — institutional — active",
];
for (const item of projects) {
  text(`•  ${item}`, 10, left, y);
  y -= 14;
}

y -= 10;
text("Contact", 13, left, y);
y -= 16;
text("Email  info@jkexpress.ug", 10, left, y);
y -= 14;
text("Phone  0704 776 059  |  0786 953 313", 10, left, y);
y -= 14;
text("WhatsApp  +256704776059", 10, left, y);
y -= 14;
text("Web  https://jkexpress.ug", 10, left, y);
y -= 22;
rule(y, "0 0.125 0.565");
y -= 16;
text("Confidential briefing for owners, developers and procurement. Figures are indicative.", 8, left, y);

const stream = ops.join("\n");
const objects = [];
objects.push("1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj");
objects.push("2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj");
objects.push(
  `3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageW} ${pageH}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj`,
);
objects.push(
  `4 0 obj << /Length ${Buffer.byteLength(stream, "utf8")} >> stream\n${stream}\nendstream endobj`,
);
objects.push("5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj");

let body = "%PDF-1.4\n";
const offsets = [0];
for (const obj of objects) {
  offsets.push(Buffer.byteLength(body, "utf8"));
  body += `${obj}\n`;
}
const xrefStart = Buffer.byteLength(body, "utf8");
body += `xref\n0 ${objects.length + 1}\n`;
body += "0000000000 65535 f \n";
for (let i = 1; i < offsets.length; i++) {
  body += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
}
body += `trailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;

fs.writeFileSync(out, body);
console.log("Wrote", out);
