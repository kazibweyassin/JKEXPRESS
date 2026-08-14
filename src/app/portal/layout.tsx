import Link from "next/link";
import { requireSession } from "@/lib/auth-guard";
import { getCompanySettings } from "@/lib/company";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/logo";

export default async function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession("/portal/tenant");
  const company = await getCompanySettings();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="brand-red-bar h-1 w-full" />
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-4 px-4">
          <Link
            href="/"
            className="flex min-w-0 items-center gap-3 font-semibold text-navy-900"
            aria-label={company.companyName}
          >
            <Logo height={34} variant="compact" />
            <span className="hidden text-sm font-medium text-slate-500 sm:inline">
              Portal
            </span>
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-slate-500 sm:inline">
              {session.user.name} · {session.user.role.name}
            </span>
            <form
              action={async () => {
                "use server";
                const { signOut } = await import("@/lib/auth");
                await signOut({ redirectTo: "/login" });
              }}
            >
              <Button type="submit" variant="outline" size="sm">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}
