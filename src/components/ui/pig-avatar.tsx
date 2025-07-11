import React from "react";
import { cn } from "../../lib/utils";

interface PigAvatarProps {
  className?: string;
  backgroundColor?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

export const PigAvatar: React.FC<PigAvatarProps> = ({
  className,
  backgroundColor = "bg-gray-500/20",
  size = "md",
}) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-32 h-32",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full overflow-hidden",
        backgroundColor,
        sizeClasses[size],
        className
      )}
    >
      <img
        src="/pig-snout.svg"
        alt="Pig Avatar"
        className={cn(
          "opacity-70",
          size === "sm" && "w-4 h-4",
          size === "md" && "w-6 h-6",
          size === "lg" && "w-8 h-8",
          size === "xl" && "w-16 h-16"
        )}
        style={{ filter: "brightness(0) saturate(100%)" }}
      />
    </div>
  );
};
