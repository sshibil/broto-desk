import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type ComplaintStatus = 
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "WAITING_ON_STUDENT"
  | "RESOLVED"
  | "CLOSED";

interface StatusBadgeProps {
  status: ComplaintStatus;
  className?: string;
}

const statusConfig: Record<ComplaintStatus, { label: string; variant: string }> = {
  DRAFT: { label: "Draft", variant: "secondary" },
  SUBMITTED: { label: "Submitted", variant: "default" },
  UNDER_REVIEW: { label: "Under Review", variant: "default" },
  IN_PROGRESS: { label: "In Progress", variant: "default" },
  WAITING_ON_STUDENT: { label: "Waiting on Student", variant: "warning" },
  RESOLVED: { label: "Resolved", variant: "success" },
  CLOSED: { label: "Closed", variant: "secondary" },
};

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];
  
  return (
    <Badge
      className={cn(
        "font-medium",
        config.variant === "success" && "bg-success text-success-foreground",
        config.variant === "warning" && "bg-warning text-warning-foreground",
        className
      )}
      variant={config.variant === "success" || config.variant === "warning" ? "default" : config.variant as any}
    >
      {config.label}
    </Badge>
  );
};
