import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { AlertCircle, AlertTriangle, Info, Zap } from "lucide-react";

type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

interface PriorityBadgeProps {
  priority: Priority;
  className?: string;
  showIcon?: boolean;
}

const priorityConfig: Record<Priority, { label: string; className: string; icon: any }> = {
  LOW: { 
    label: "Low", 
    className: "bg-muted text-muted-foreground",
    icon: Info
  },
  MEDIUM: { 
    label: "Medium", 
    className: "bg-info text-info-foreground",
    icon: AlertCircle
  },
  HIGH: { 
    label: "High", 
    className: "bg-warning text-warning-foreground",
    icon: AlertTriangle
  },
  CRITICAL: { 
    label: "Critical", 
    className: "bg-destructive text-destructive-foreground",
    icon: Zap
  },
};

export const PriorityBadge = ({ priority, className, showIcon = true }: PriorityBadgeProps) => {
  const config = priorityConfig[priority];
  const Icon = config.icon;
  
  return (
    <Badge
      className={cn("font-medium", config.className, className)}
    >
      {showIcon && <Icon className="mr-1 h-3 w-3" />}
      {config.label}
    </Badge>
  );
};
