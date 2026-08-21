/**
 * Finished-home / commercial listing photos (Unsplash).
 * Construction site shots in /public/site-photos are for projects only.
 */

const BY_TYPE: Record<string, string[]> = {
  APARTMENT: [
    "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
  ],
  HOUSE: [
    "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80",
  ],
  COMMERCIAL: [
    "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
  ],
  OFFICE: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
  ],
  LAND: [
    "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=1200&q=80",
    "https://images.unsplash.com/photo-1472214103451-21a7e6d3c5c6?auto=format&fit=crop&w=1200&q=80",
  ],
  WAREHOUSE: [
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
  ],
};

const DEFAULT_IMAGE =
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80";

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function poolFor(propertyType?: string | null): string[] {
  return BY_TYPE[propertyType ?? ""] ?? [DEFAULT_IMAGE];
}

/** True for finished-listing photos (Unsplash or other remotes). Site photos are excluded. */
export function isListingPhoto(url?: string | null): boolean {
  if (!url) return false;
  if (url.includes("/site-photos/")) return false;
  return (
    url.startsWith("https://images.unsplash.com") ||
    url.startsWith("https://source.unsplash.com") ||
    (url.startsWith("https://") && !url.includes("site-photos"))
  );
}

/** Prefer a stored Unsplash/listing image; otherwise a type-aware Unsplash fallback. */
export function propertyCoverImage(
  key: string,
  propertyType?: string | null,
  primaryUrl?: string | null,
): string {
  if (isListingPhoto(primaryUrl)) return primaryUrl as string;
  const pool = poolFor(propertyType);
  return pool[hashKey(key) % pool.length] ?? DEFAULT_IMAGE;
}

/** Gallery of Unsplash listing photos, skipping construction site shots. */
export function propertyGalleryImages(
  key: string,
  count = 6,
  storedUrls: Array<string | null | undefined> = [],
  propertyType?: string | null,
): string[] {
  const urls: string[] = [];
  for (const url of storedUrls) {
    if (isListingPhoto(url) && !urls.includes(url as string)) {
      urls.push(url as string);
    }
  }
  const pool = poolFor(propertyType);
  const start = hashKey(key) % pool.length;
  for (let i = 0; i < pool.length && urls.length < count; i++) {
    const src = pool[(start + i) % pool.length];
    if (!urls.includes(src)) urls.push(src);
  }
  while (urls.length < count) {
    const src = pool[urls.length % pool.length] ?? DEFAULT_IMAGE;
    if (!urls.includes(src)) urls.push(src);
    else break;
  }
  return urls.length ? urls : [DEFAULT_IMAGE];
}
