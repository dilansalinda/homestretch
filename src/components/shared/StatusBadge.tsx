import type { ItemStatus } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertTriangle, Zap, Clock } from "lucide-react"; // Using Zap for in-progress, Clock for pending

interface StatusBadgeProps {
  status: ItemStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig: Record<ItemStatus, { label: string; className: string; icon: React.ElementType }> = {
    pending: { label: "Pending", className: "bg-muted text-muted-foreground border-transparent", icon: Clock },
    "in-progress": { label: "In Progress", className: "bg-blue-100 text-blue-700 border-transparent", icon: Zap },
    completed: { label: "Completed", className: "bg-green-100 text-green-700 border-transparent", icon: CheckCircle2 },
    delayed: { label: "Delayed", className: "bg-red-100 text-red-700 border-transparent", icon: AlertTriangle },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge variant="outline" className={cn("capitalize text-xs font-medium px-2.5 py-1", config.className, className)}>
      <config.icon className="mr-1.5 h-3.5 w-3.5" />
      {config.label}
    </Badge>
  );
}
