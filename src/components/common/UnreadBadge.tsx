import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UnreadBadge({
  count,
  className,
  size = "md",
}: UnreadBadgeProps) {
  if (count === 0) return null;

  const sizeClasses = {
    sm: "text-xs px-1.5 py-0.5 min-w-0 h-5",
    md: "text-xs px-2 py-1 min-w-0 h-6",
    lg: "text-sm px-2.5 py-1.5 min-w-0 h-7",
  };

  return (
    <Badge
      className={cn(
        "bg-red-500 text-white font-semibold",
        sizeClasses[size],
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </Badge>
  );
}
