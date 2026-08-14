import { DashboardShell } from "@/components/layout/dashboard-shell";
import { requireSession } from "@/lib/auth-guard";
import { getCompanySettings } from "@/lib/company";
import { db } from "@/lib/db";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireSession();
  const company = await getCompanySettings();
  const notificationCount = await db.notification.count({
    where: { userId: session.user.id, isRead: false },
  });

  return (
    <DashboardShell
      companyName={company.companyName}
      notificationCount={notificationCount}
      user={{
        name: session.user.name,
        email: session.user.email,
        roleName: session.user.role.name,
        permissions: session.user.permissions,
      }}
    >
      {children}
    </DashboardShell>
  );
}
