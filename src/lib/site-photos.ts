/**
 * Local construction site photography under /public/site-photos.
 * Used for hero, projects portfolio, construction service, and about pages.
 */

export type SitePhoto = {
  src: string;
  alt: string;
};

/** All available site photos (wide exteriors + work-in-progress). */
export const SITE_PHOTOS: SitePhoto[] = [
  { src: "/site-photos/site-01.jpeg", alt: "JK Express multi-storey construction site with scaffolding" },
  { src: "/site-photos/site-02.jpeg", alt: "JK Express building under construction" },
  { src: "/site-photos/site-03.jpeg", alt: "JK Express structural frame and site progress" },
  { src: "/site-photos/site-04.jpeg", alt: "JK Express construction project exterior" },
  { src: "/site-photos/site-05.jpeg", alt: "JK Express multi-level concrete structure in progress" },
  { src: "/site-photos/site-06.jpeg", alt: "JK Express site works and block construction" },
  { src: "/site-photos/site-07.jpeg", alt: "JK Express building elevation under construction" },
  { src: "/site-photos/site-08.jpeg", alt: "JK Express roadside commercial construction site" },
  { src: "/site-photos/site-09.jpeg", alt: "JK Express construction site overview" },
  { src: "/site-photos/site-10.jpeg", alt: "JK Express active construction site" },
  { src: "/site-photos/site-11.jpeg", alt: "JK Express building progress with scaffolding" },
  { src: "/site-photos/site-12.jpeg", alt: "JK Express site team and materials on site" },
  { src: "/site-photos/site-13.jpeg", alt: "JK Express construction crew and equipment" },
  { src: "/site-photos/site-14.jpeg", alt: "JK Express workers pouring and moving materials on site" },
];

/** Best wide shots for the homepage hero background. */
export const HERO_SITE_PHOTOS: SitePhoto[] = [
  SITE_PHOTOS[0],
  SITE_PHOTOS[4],
  SITE_PHOTOS[7],
  SITE_PHOTOS[2],
  SITE_PHOTOS[13],
];

/** Photos for construction service + about galleries. */
export const GALLERY_SITE_PHOTOS: SitePhoto[] = SITE_PHOTOS;

/** Stable cover image for a project when no featuredImage is stored. */
export function projectCoverImage(
  key: string,
  featuredImage?: string | null,
): string {
  if (featuredImage) return featuredImage;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return SITE_PHOTOS[hash % SITE_PHOTOS.length].src;
}

/** A few photos for a project detail gallery (deterministic by key). */
export function projectGalleryImages(
  key: string,
  count = 6,
  featuredImage?: string | null,
): string[] {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  const start = hash % SITE_PHOTOS.length;
  const urls: string[] = [];
  if (featuredImage) urls.push(featuredImage);
  for (let i = 0; i < SITE_PHOTOS.length && urls.length < count; i++) {
    const src = SITE_PHOTOS[(start + i) % SITE_PHOTOS.length].src;
    if (!urls.includes(src)) urls.push(src);
  }
  return urls;
}
