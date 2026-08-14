"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProperty } from "@/app/actions/properties";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";

export function PropertyForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setPending(true);
    setError(null);
    const result = await createProperty(formData);
    setPending(false);
    if (!result.success) {
      setError(result.error);
      return;
    }
    router.push("/dashboard/properties");
    router.refresh();
  }

  return (
    <form action={onSubmit} className="mx-auto max-w-3xl space-y-5">
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea id="description" name="description" rows={4} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="propertyType">Property type</Label>
          <Select id="propertyType" name="propertyType" defaultValue="HOUSE" required>
            <option value="HOUSE">House</option>
            <option value="APARTMENT">Apartment</option>
            <option value="LAND">Land</option>
            <option value="COMMERCIAL">Commercial</option>
            <option value="OFFICE">Office</option>
            <option value="WAREHOUSE">Warehouse</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="listingType">Listing type</Label>
          <Select id="listingType" name="listingType" defaultValue="SALE" required>
            <option value="SALE">Sale</option>
            <option value="RENT">Rent</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input id="city" name="city" placeholder="Kampala" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="district">District</Label>
          <Input id="district" name="district" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" />
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="price">Price</Label>
          <Input id="price" name="price" type="number" required min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="currency">Currency</Label>
          <Select id="currency" name="currency" defaultValue="UGX">
            <option value="UGX">UGX</option>
            <option value="USD">USD</option>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select id="status" name="status" defaultValue="DRAFT">
            <option value="DRAFT">Draft</option>
            <option value="AVAILABLE">Available</option>
            <option value="RESERVED">Reserved</option>
            <option value="RENTED">Rented</option>
            <option value="SOLD">Sold</option>
          </Select>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="bedrooms">Bedrooms</Label>
          <Input id="bedrooms" name="bedrooms" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="bathrooms">Bathrooms</Label>
          <Input id="bathrooms" name="bathrooms" type="number" min={0} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parkingSpaces">Parking</Label>
          <Input id="parkingSpaces" name="parkingSpaces" type="number" min={0} />
        </div>
      </div>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isFeatured" className="rounded border-slate-300" />
          Featured
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublished" className="rounded border-slate-300" />
          Published
        </label>
      </div>
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Create property"}
      </Button>
    </form>
  );
}
