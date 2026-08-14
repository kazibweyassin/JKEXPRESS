import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CompanySettingsForm } from "@/components/forms/company-settings-form";
import { requirePagePermission } from "@/lib/auth-guard";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requirePagePermission("settings");
  const company = await getCompanySettings();
  const [userCount, roleCount, branchCount] = await Promise.all([
    db.user.count({ where: { deletedAt: null } }),
    db.role.count(),
    db.branch.count(),
  ]);

  return (
    <div>
      <PageHeader
        title="Administration settings"
        description="Company profile, branding and system configuration."
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Users</p>
            <p className="text-2xl font-bold">{userCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Roles</p>
            <p className="text-2xl font-bold">{roleCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-slate-500">Branches</p>
            <p className="text-2xl font-bold">{branchCount}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company profile</CardTitle>
        </CardHeader>
        <CardContent>
          <CompanySettingsForm settings={company} />
        </CardContent>
      </Card>
    </div>
  );
}
