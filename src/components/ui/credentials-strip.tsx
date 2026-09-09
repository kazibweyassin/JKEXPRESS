import { ShieldCheck } from "lucide-react";
import { CREDENTIALS } from "@/lib/trust";

export function CredentialsStrip() {
  return (
    <section className="border-y border-slate-200 bg-white">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {CREDENTIALS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-accent-500" />
            <div>
              <p className="text-sm font-semibold text-navy-900">{item.title}</p>
              <p className="mt-1 text-sm text-slate-500">{item.text}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
