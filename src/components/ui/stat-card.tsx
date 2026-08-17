import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  tone = "default",
  progress,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  tone?: "default" | "warning" | "danger" | "success";
  progress?: number;
  className?: string;
}) {
  const tones = {
    default: { value: "text-navy-900", icon: "bg-navy-50 text-navy-800" },
    warning: { value: "text-amber-800", icon: "bg-amber-50 text-amber-800" },
    danger: { value: "text-danger-800", icon: "bg-danger-100 text-danger-800" },
    success: { value: "text-emerald-800", icon: "bg-emerald-50 text-emerald-800" },
  }[tone];

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <p className={cn("mt-2 truncate text-2xl font-bold", tones.value)}>
              {value}
            </p>
            {subtitle ? (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            ) : null}
            {trend ? (
              <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
            ) : null}
            {progress != null ? (
              <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={cn(
                    "h-full rounded-full",
                    tone === "danger"
                      ? "bg-danger-700"
                      : tone === "warning"
                        ? "bg-amber-500"
                        : "bg-navy-900",
                  )}
                  style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
                />
              </div>
            ) : null}
          </div>
          {Icon ? (
            <div className={cn("rounded-lg p-2.5", tones.icon)}>
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
