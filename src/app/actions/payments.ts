"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

const paymentSchema = z.object({
  invoiceId: z.string().min(1),
  amount: z.coerce.number().positive(),
  method: z.string().default("CASH"),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

export async function recordPayment(formData: FormData) {
  const session = await auth();
  if (!session?.user || !hasPermission(session.user.permissions, "payments", "create")) {
    return { success: false as const, error: "Forbidden" };
  }

  try {
    const data = paymentSchema.parse({
      invoiceId: formData.get("invoiceId"),
      amount: formData.get("amount"),
      method: formData.get("method") || "CASH",
      reference: formData.get("reference") || undefined,
      notes: formData.get("notes") || undefined,
    });

    const invoice = await db.invoice.findUnique({ where: { id: data.invoiceId } });
    if (!invoice) return { success: false as const, error: "Invoice not found" };

    const amount = Math.min(data.amount, Number(invoice.balance));
    const count = await db.payment.count();
    const paymentNumber = `PAY-${new Date().getFullYear()}-${String(count + 1).padStart(4, "0")}`;
    const receiptCount = await db.receipt.count();
    const receiptNumber = `RCT-${new Date().getFullYear()}-${String(receiptCount + 1).padStart(4, "0")}`;

    await db.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          paymentNumber,
          amount,
          currency: invoice.currency,
          method: data.method,
          reference: data.reference,
          notes: data.notes,
          tenantId: invoice.tenantId,
          receivedBy: session.user.name,
          status: "COMPLETED",
          allocations: {
            create: { invoiceId: invoice.id, amount },
          },
          receipts: {
            create: { receiptNumber },
          },
        },
      });

      const newPaid = Number(invoice.amountPaid) + amount;
      const newBalance = Number(invoice.totalAmount) - newPaid;
      await tx.invoice.update({
        where: { id: invoice.id },
        data: {
          amountPaid: newPaid,
          balance: Math.max(0, newBalance),
          status:
            newBalance <= 0 ? "PAID" : newPaid > 0 ? "PARTIAL" : invoice.status,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: session.user.id,
          action: "CREATE",
          entityType: "Payment",
          entityId: payment.id,
          newValues: { paymentNumber, amount, invoiceId: invoice.id },
        },
      });
    });

    revalidatePath("/dashboard/payments");
    revalidatePath("/dashboard/rent");
    return { success: true as const, receiptNumber };
  } catch (e) {
    console.error(e);
    return { success: false as const, error: "Failed to record payment." };
  }
}
