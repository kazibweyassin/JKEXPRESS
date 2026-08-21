/**
 * Listing photos from /public/site-photos.
 * Used when a property has no local primary image in the database.
 */

import { SITE_PHOTOS, isLocalPublicPath } from "./site-photos";

const DEFAULT_IMAGE = SITE_PHOTOS[0].src;

function hashKey(key: string): number {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return hash;
}

/** Prefer a local public image; otherwise pick a stable site photo. */
export function propertyCoverImage(
  key: string,
  _propertyType?: string | null,
  primaryUrl?: string | null,
): string {
  if (isLocalPublicPath(primaryUrl)) return primaryUrl as string;
  return SITE_PHOTOS[hashKey(key) % SITE_PHOTOS.length]?.src ?? DEFAULT_IMAGE;
}

/** Gallery of local site photos, optionally starting with stored public URLs. */
export function propertyGalleryImages(
  key: string,
  count = 6,
  storedUrls: Array<string | null | undefined> = [],
): string[] {
  const urls: string[] = [];
  for (const url of storedUrls) {
    if (isLocalPublicPath(url) && !urls.includes(url as string)) {
      urls.push(url as string);
    }
  }
  const start = hashKey(key) % SITE_PHOTOS.length;
  for (let i = 0; i < SITE_PHOTOS.length && urls.length < count; i++) {
    const src = SITE_PHOTOS[(start + i) % SITE_PHOTOS.length].src;
    if (!urls.includes(src)) urls.push(src);
  }
  return urls.length ? urls : [DEFAULT_IMAGE];
}
