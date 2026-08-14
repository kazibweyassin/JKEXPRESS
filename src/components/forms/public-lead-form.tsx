"use client";

import { useActionState } from "react";
import { submitPublicLead, type ActionResult } from "@/app/actions/leads";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function PublicLeadForm({
  propertyId,
  interest,
  source = "WEBSITE",
  submitLabel = "Submit inquiry",
  showInterest = true,
  defaultMessage = "",
  compact = false,
  messageLabel = "Project details",
  messagePlaceholder = "Tell us about the site, timeline, budget, or property type you're looking for.",
}: {
  propertyId?: string;
  interest?: string;
  source?: string;
  submitLabel?: string;
  showInterest?: boolean;
  defaultMessage?: string;
  compact?: boolean;
  messageLabel?: string;
  messagePlaceholder?: string;
}) {
  const [state, formAction, pending] = useActionState<ActionResult | null, FormData>(
    submitPublicLead,
    null,
  );

  if (state?.success) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        {state.message ?? "Thank you. We will contact you shortly."}
      </div>
    );
  }

  return (
    <form action={formAction} className={compact ? "space-y-3" : "space-y-5"}>
      <input type="hidden" name="propertyId" value={propertyId ?? ""} />
      <input type="hidden" name="source" value={source} />
      {!showInterest && interest ? (
        <input type="hidden" name="interest" value={interest} />
      ) : null}
      <div className={compact ? "grid gap-3" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <Label htmlFor="firstName">First name</Label>
          <Input id="firstName" name="firstName" placeholder="Jane" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Last name</Label>
          <Input id="lastName" name="lastName" placeholder="Nakato" required />
        </div>
      </div>
      <div className={compact ? "grid gap-3" : "grid gap-4 sm:grid-cols-2"}>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="you@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" placeholder="0772 000 000" required />
        </div>
      </div>
      {showInterest ? (
        <div className="space-y-2">
          <Label htmlFor="interest">Interest</Label>
          <Select id="interest" name="interest" defaultValue={interest ?? ""}>
            <option value="">Select...</option>
            <option value="SALE">Buying</option>
            <option value="RENT">Renting</option>
            <option value="CONSTRUCTION">Construction</option>
            <option value="MANAGEMENT">Property management</option>
            <option value="VIEWING">Property viewing</option>
          </Select>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="message">{messageLabel}</Label>
        <Textarea
          id="message"
          name="message"
          rows={compact ? 3 : 5}
          defaultValue={defaultMessage}
          placeholder={messagePlaceholder}
        />
      </div>
      {state && !state.success ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </p>
      ) : null}
      <Button
        type="submit"
        variant={compact ? "gold" : "default"}
        disabled={pending}
        className="w-full px-6 py-2.5 text-base sm:w-auto"
      >
        {pending ? "Sending..." : submitLabel}
      </Button>
    </form>
  );
}
