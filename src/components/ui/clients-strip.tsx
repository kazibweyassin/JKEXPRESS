import { CLIENT_TYPES } from "@/lib/trust";

export function ClientsStrip({
  title = "Who we work with",
  description = "Owners, developers and occupiers across residential, commercial and industrial work — not a single-sector contractor.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <section className="bg-slate-50 py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-500">
            Clients
          </p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-navy-900 sm:text-3xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-slate-600">{description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {CLIENT_TYPES.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-[11px] font-bold uppercase tracking-wide text-white">
                {item.label
                  .split(" ")
                  .slice(0, 2)
                  .map((word) => word[0])
                  .join("")}
              </span>
              <div>
                <p className="font-semibold text-navy-900">{item.label}</p>
                <p className="text-sm text-slate-500">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
