"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { recordPayment } from "@/app/actions/payments";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export type UnpaidInvoiceOption = {
  id: string;
  invoiceNumber: string;
  balance: number;
  currency: string;
};

export function RecordPaymentForm({ invoices }: { invoices: UnpaidInvoiceOption[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    startTransition(async () => {
      const result = await recordPayment(formData);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(`Payment recorded. Receipt ${result.receiptNumber}`);
      form.reset();
      router.refresh();
    });
  }

  if (invoices.length === 0) {
    return (
      <p className="text-sm text-slate-500">No unpaid invoices available to record against.</p>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="invoiceId">Invoice</Label>
        <Select id="invoiceId" name="invoiceId" required defaultValue={invoices[0]?.id}>
          {invoices.map((inv) => (
            <option key={inv.id} value={inv.id}>
              {inv.invoiceNumber} — bal {inv.currency} {inv.balance.toLocaleString()}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <Input id="amount" name="amount" type="number" min="1" step="1" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <Select id="method" name="method" defaultValue="CASH">
            <option value="CASH">Cash</option>
            <option value="BANK_TRANSFER">Bank transfer</option>
            <option value="MOBILE_MONEY">Mobile money</option>
            <option value="CARD">Card</option>
            <option value="CHEQUE">Cheque</option>
            <option value="OTHER">Other</option>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="reference">Reference (optional)</Label>
        <Input id="reference" name="reference" placeholder="Transaction ref" />
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{success}</p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Recording..." : "Record payment"}
      </Button>
    </form>
  );
}
