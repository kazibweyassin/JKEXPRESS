"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth-guard";
import { db } from "@/lib/db";

export async function markNotificationRead(formData: FormData) {
  const session = await requireSession("/dashboard/notifications");
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const notification = await db.notification.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!notification) return;

  if (!notification.isRead) {
    await db.notification.update({
      where: { id },
      data: { isRead: true },
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
  if (notification.link) {
    redirect(notification.link);
  }
}

export async function markAllNotificationsRead() {
  const session = await requireSession("/dashboard/notifications");
  await db.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/notifications");
}
