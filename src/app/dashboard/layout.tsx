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
  const [notificationCount, notifications] = await Promise.all([
    db.notification.count({
      where: { userId: session.user.id, isRead: false },
    }),
    db.notification.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 6,
    }),
  ]);

  return (
    <DashboardShell
      companyName={company.companyName}
      notificationCount={notificationCount}
      notifications={notifications.map((item) => ({
        id: item.id,
        title: item.title,
        message: item.message,
        link: item.link,
        isRead: item.isRead,
        createdAt: item.createdAt.toISOString(),
      }))}
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
