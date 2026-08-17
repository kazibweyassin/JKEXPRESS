import { cn } from "@/lib/utils";

export function PageHero({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "border-b border-slate-200 bg-gradient-to-br from-navy-950 via-navy-900 to-navy-800 text-white",
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent-400">
            {eyebrow}
          </p>
        ) : null}
        <h1
          className={cn(
            "max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl",
            eyebrow ? "mt-3" : null,
            "font-serif",
          )}
        >
          {title}
        </h1>
        {description ? (
          <p className="mt-3 max-w-2xl text-slate-300">{description}</p>
        ) : null}
        {actions ? (
          <div className="mt-6 flex flex-wrap gap-3">{actions}</div>
        ) : null}
      </div>
    </section>
  );
}
