import Link from "next/link";
import { LoginForm } from "@/components/auth/login-form";
import { Logo } from "@/components/brand/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-navy-50 px-4">
      <div className="brand-red-bar fixed left-0 right-0 top-0 h-1.5" />
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center text-center">
          <Link href="/" className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
            <Logo height={52} priority />
          </Link>
          <p className="mt-4 text-sm text-slate-600">
            Realtors &amp; Developers Ltd.
          </p>
        </div>
        <Card className="border-navy-100 shadow-md">
          <CardHeader>
            <CardTitle className="text-navy-900">Sign in to workspace</CardTitle>
            <CardDescription>
              Employees, tenants and property owners use their assigned credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm callbackUrl={params.callbackUrl} />
            <p className="mt-6 text-center text-xs text-slate-500">
              Demo: admin@jkexpress.ug / Password123!
            </p>
            <p className="mt-2 text-center text-sm">
              <Link href="/" className="text-navy-800 hover:underline">
                ← Back to website
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
