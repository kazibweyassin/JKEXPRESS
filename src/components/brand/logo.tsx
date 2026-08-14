import Image from "next/image";
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Image height in px (width auto) */
  height?: number;
  priority?: boolean;
  variant?: "full" | "compact";
};

export function Logo({
  className,
  height = 40,
  priority = false,
  variant = "full",
}: LogoProps) {
  // Original logo is very wide (~4:1). Compact is slightly shorter for tight headers.
  const h = variant === "compact" ? Math.min(height, 36) : height;
  const w = Math.round(h * 4.1);

  return (
    <Image
      src="/logo.png"
      alt="JK Express Realtors & Developers Ltd."
      width={w}
      height={h}
      priority={priority}
      className={cn("h-auto w-auto object-contain object-left", className)}
      style={{ height: h, width: "auto", maxWidth: variant === "compact" ? 180 : 240 }}
    />
  );
}

/** Fallback mark when a tiny square brand mark is needed */
export function LogoMark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-xs font-bold text-white",
        className,
      )}
      aria-hidden
    >
      <span className="text-white">JK</span>
      <span className="text-gold-500">E</span>
    </span>
  );
}
