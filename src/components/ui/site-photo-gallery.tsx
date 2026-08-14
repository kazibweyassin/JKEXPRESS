import Image from "next/image";
import type { SitePhoto } from "@/lib/site-photos";
import { cn } from "@/lib/utils";

type Props = {
  photos: SitePhoto[];
  className?: string;
  /** denser grid on construction pages */
  compact?: boolean;
};

export function SitePhotoGallery({ photos, className, compact }: Props) {
  if (photos.length === 0) return null;

  return (
    <div
      className={cn(
        "grid gap-3",
        compact
          ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
        className,
      )}
    >
      {photos.map((photo, i) => (
        <div
          key={photo.src}
          className={cn(
            "relative overflow-hidden rounded-xl bg-slate-200",
            i === 0 && !compact ? "sm:col-span-2 sm:row-span-2 aspect-[16/10]" : "aspect-[4/3]",
          )}
        >
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            className="object-cover transition duration-300 hover:scale-[1.03]"
            sizes={
              i === 0 && !compact
                ? "(max-width: 640px) 100vw, 66vw"
                : "(max-width: 640px) 50vw, 33vw"
            }
          />
        </div>
      ))}
    </div>
  );
}
