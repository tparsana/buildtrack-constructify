
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  colorClass: string;
}

const StatusBadge = ({ status, colorClass }: StatusBadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize",
        colorClass
      )}
    >
      {status.replace(/-/g, ' ')}
    </span>
  );
};

export default StatusBadge;
