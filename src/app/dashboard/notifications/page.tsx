import Link from "next/link";
import { Bell } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";
import { cn, formatDateTime } from "@/lib/utils";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/notifications";

export const metadata = { title: "Notifications" };

export default async function NotificationsPage() {
  const session = await requireSession("/dashboard/notifications");
  const notifications = await db.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  const unread = notifications.filter((item) => !item.isRead).length;

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Workspace alerts for leads, rent, maintenance and approvals."
        actions={
          unread > 0 ? (
            <form action={markAllNotificationsRead}>
              <Button type="submit" variant="outline" size="sm">
                Mark all as read
              </Button>
            </form>
          ) : null
        }
      />

      {notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="You are all caught up"
          description="New alerts will appear here as work happens across the platform."
        />
      ) : (
        <Card>
          <CardContent className="divide-y divide-slate-100 p-0">
            {notifications.map((item) => (
              <form key={item.id} action={markNotificationRead}>
                <input type="hidden" name="id" value={item.id} />
                <button
                  type="submit"
                  className={cn(
                    "flex w-full flex-col gap-1 px-5 py-4 text-left hover:bg-navy-50",
                    !item.isRead && "bg-navy-50/50",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="font-medium text-navy-900">{item.title}</p>
                    <span className="shrink-0 text-xs text-slate-400">
                      {formatDateTime(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600">{item.message}</p>
                  {item.link ? (
                    <span className="text-xs font-medium text-navy-700">Open related record</span>
                  ) : null}
                </button>
              </form>
            ))}
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-sm text-slate-500">
        <Link href="/dashboard" className="hover:underline">
          ← Back to overview
        </Link>
      </p>
    </div>
  );
}
