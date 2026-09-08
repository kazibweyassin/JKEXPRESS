import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { buildQuotationPdf, parseQuotationFormData } from "@/lib/quotation-pdf";

export async function POST(request: Request) {
  const session = await auth();
  if (
    !session?.user ||
    !hasPermission(session.user.permissions, "projects", "view")
  ) {
    return new NextResponse("Forbidden", { status: 403 });
  }

  const formData = await request.formData();
  const parsed = parseQuotationFormData(formData);
  if (!parsed.ok) {
    return new NextResponse(parsed.error, { status: 400 });
  }

  const pdf = buildQuotationPdf(parsed.data);
  const filename = `${parsed.data.quotationNumber}.pdf`;
  return new NextResponse(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
