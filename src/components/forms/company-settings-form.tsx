"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateCompanySettings } from "@/app/actions/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export type CompanySettingsValues = {
  companyName: string;
  tagline?: string | null;
  description?: string | null;
  email?: string | null;
  phone?: string | null;
  whatsapp?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  defaultCurrency?: string | null;
  secondaryCurrency?: string | null;
  primaryColor?: string | null;
  secondaryColor?: string | null;
  websiteUrl?: string | null;
  facebookUrl?: string | null;
  twitterUrl?: string | null;
  linkedinUrl?: string | null;
  instagramUrl?: string | null;
};

export function CompanySettingsForm({ settings }: { settings: CompanySettingsValues }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateCompanySettings(formData);
        setSuccess(true);
        router.refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to update settings.");
      }
    });
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="companyName">Company name</Label>
          <Input id="companyName" name="companyName" required defaultValue={settings.companyName} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="tagline">Tagline</Label>
          <Input id="tagline" name="tagline" defaultValue={settings.tagline ?? ""} />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" defaultValue={settings.description ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" defaultValue={settings.email ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" defaultValue={settings.phone ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" name="whatsapp" defaultValue={settings.whatsapp ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" defaultValue={settings.address ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" defaultValue={settings.city ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input id="country" name="country" defaultValue={settings.country ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="defaultCurrency">Default currency</Label>
          <Input id="defaultCurrency" name="defaultCurrency" defaultValue={settings.defaultCurrency ?? "UGX"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryCurrency">Secondary currency</Label>
          <Input id="secondaryCurrency" name="secondaryCurrency" defaultValue={settings.secondaryCurrency ?? "USD"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="primaryColor">Primary color</Label>
          <Input id="primaryColor" name="primaryColor" defaultValue={settings.primaryColor ?? "#002090"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="secondaryColor">Secondary color</Label>
          <Input id="secondaryColor" name="secondaryColor" defaultValue={settings.secondaryColor ?? "#E80000"} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="websiteUrl">Website</Label>
          <Input id="websiteUrl" name="websiteUrl" defaultValue={settings.websiteUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="facebookUrl">Facebook</Label>
          <Input id="facebookUrl" name="facebookUrl" defaultValue={settings.facebookUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="twitterUrl">Twitter / X</Label>
          <Input id="twitterUrl" name="twitterUrl" defaultValue={settings.twitterUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="linkedinUrl">LinkedIn</Label>
          <Input id="linkedinUrl" name="linkedinUrl" defaultValue={settings.linkedinUrl ?? ""} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="instagramUrl">Instagram</Label>
          <Input id="instagramUrl" name="instagramUrl" defaultValue={settings.instagramUrl ?? ""} />
        </div>
      </div>

      {error ? (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
      ) : null}
      {success ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
          Settings saved successfully.
        </p>
      ) : null}

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save settings"}
      </Button>
    </form>
  );
}
