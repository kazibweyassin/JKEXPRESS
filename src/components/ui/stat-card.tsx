import { type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              {title}
            </p>
            <p className="mt-2 truncate text-2xl font-bold text-navy-900">
              {value}
            </p>
            {subtitle ? (
              <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
            ) : null}
            {trend ? (
              <p className="mt-1 text-xs font-medium text-emerald-600">{trend}</p>
            ) : null}
          </div>
          {Icon ? (
            <div className="rounded-lg bg-navy-50 p-2.5 text-navy-800">
              <Icon className="h-5 w-5" />
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}
