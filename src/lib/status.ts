import type { BadgeProps } from "@/components/ui/badge";

export function statusVariant(
  status: string,
): NonNullable<BadgeProps["variant"]> {
  const s = status.toUpperCase();
  if (
    ["ACTIVE", "AVAILABLE", "PAID", "COMPLETED", "APPROVED", "WON", "OCCUPIED"].includes(
      s,
    )
  ) {
    return "success";
  }
  if (
    ["PENDING", "DRAFT", "NEW", "SCHEDULED", "PARTIAL", "EXPIRING", "IN_PROGRESS", "ASSIGNED"].includes(
      s,
    )
  ) {
    return "warning";
  }
  if (
    ["CANCELLED", "REJECTED", "LOST", "OVERDUE", "TERMINATED", "UNAVAILABLE"].includes(
      s,
    )
  ) {
    return "danger";
  }
  if (["FEATURED", "SOLD", "RESERVED"].includes(s)) {
    return "gold";
  }
  return "secondary";
}
