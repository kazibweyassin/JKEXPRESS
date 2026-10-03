"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export type FormActionResult =
  | { success: true; id?: string }
  | { success: false; error: string };

export function FormFrame({
  children,
  onSubmit,
  submitLabel = "Save",
}: {
  children: React.ReactNode;
  onSubmit: (data: FormData) => Promise<FormActionResult>;
  submitLabel?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handle(formData: FormData) {
    setPending(true);
    setError(null);
    setSuccess(null);
    const result = await onSubmit(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error ?? "Failed");
      return;
    }
    setSuccess("Saved successfully.");
    router.refresh();
  }

  return (
    <form action={handle} className="space-y-4">
      {error ? (
        <p className="rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-800">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800" role="status">{success}</p>
      ) : null}
      {children}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : submitLabel}
      </Button>
    </form>
  );
}

export function RowAction({
  action,
  name,
  value,
  label,
  confirm,
  extra,
}: {
  action: (data: FormData) => Promise<FormActionResult>;
  name: string;
  value: string;
  label: string;
  confirm?: string;
  extra?: Record<string, string>;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handle(formData: FormData) {
    if (confirm && !window.confirm(confirm)) return;
    setError(null);
    setSuccess(false);
    const result = await action(formData);
    if (!result.success) {
      setError(result.error ?? "Failed");
      return;
    }
    setSuccess(true);
    router.refresh();
  }

  return (
    <form action={handle} className="inline-flex flex-col items-end gap-1">
      <input type="hidden" name={name} value={value} />
      {extra
        ? Object.entries(extra).map(([key, val]) => (
            <input key={key} type="hidden" name={key} value={val} />
          ))
        : null}
      <Button type="submit" variant="ghost" size="sm">
        {label}
      </Button>
      {error ? <span className="text-xs text-rose-700">{error}</span> : null}
      {success ? <span className="text-xs text-emerald-700" role="status">Done</span> : null}
    </form>
  );
}
