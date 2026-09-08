import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";
import { buildQuotationPdf } from "@/lib/quotation-pdf";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "projects", "view")) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const { id } = await params;
  const quotation = await db.clientQuotation.findUnique({
    where: { id },
    include: { items: { orderBy: { sortOrder: "asc" } }, project: true },
  });
  if (!quotation) return new NextResponse("Not found", { status: 404 });

  const pdf = buildQuotationPdf({
    quotationNumber: quotation.quotationNumber,
    title: quotation.title,
    clientName: quotation.clientName,
    clientEmail: quotation.clientEmail,
    clientPhone: quotation.clientPhone,
    clientAddress: quotation.clientAddress,
    siteLocation: quotation.siteLocation,
    projectName: quotation.project?.name,
    notes: quotation.notes,
    currency: quotation.currency,
    revision: quotation.revision,
    discount: Number(quotation.discount),
    taxRate: Number(quotation.taxRate),
    contingencyRate: Number(quotation.contingencyRate),
    scopeOfWorks: quotation.scopeOfWorks,
    inclusions: quotation.inclusions,
    exclusions: quotation.exclusions,
    paymentTerms: quotation.paymentTerms,
    duration: quotation.duration,
    warranty: quotation.warranty,
    variationTerms: quotation.variationTerms,
    preparedBy: quotation.preparedBy,
    approvedBy: quotation.approvedBy,
    bankDetails: quotation.bankDetails,
    createdAt: quotation.createdAt,
    validUntil: quotation.validUntil,
    items: quotation.items.map((item) => ({
      description: item.description,
      section: item.section,
      unit: item.unit,
      quantity: Number(item.quantity),
      unitRate: Number(item.unitRate),
    })),
  });

  const filename = `${quotation.quotationNumber}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
