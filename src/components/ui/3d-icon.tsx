
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThreeDIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "primary" | "secondary" | "success" | "warning" | "error" | "info";
  className?: string;
  animated?: boolean;
}

export const ThreeDIcon: React.FC<ThreeDIconProps> = ({
  icon: Icon,
  size = "md",
  variant = "primary",
  className,
  animated = false
}) => {
  const sizeClasses = {
    sm: "w-8 h-8 p-1.5",
    md: "w-12 h-12 p-2.5",
    lg: "w-16 h-16 p-3.5",
    xl: "w-20 h-20 p-4"
  };

  const iconSizes = {
    sm: 18,
    md: 24,
    lg: 32,
    xl: 40
  };

  const variantClasses = {
    primary: "bg-gradient-to-br from-fixlyfy to-fixlyfy-light text-white shadow-lg shadow-fixlyfy/30",
    secondary: "bg-gradient-to-br from-gray-500 to-gray-600 text-white shadow-lg shadow-gray-500/30",
    success: "bg-gradient-to-br from-fixlyfy-success to-green-400 text-white shadow-lg shadow-fixlyfy-success/30",
    warning: "bg-gradient-to-br from-fixlyfy-warning to-yellow-400 text-white shadow-lg shadow-fixlyfy-warning/30",
    error: "bg-gradient-to-br from-fixlyfy-error to-red-400 text-white shadow-lg shadow-fixlyfy-error/30",
    info: "bg-gradient-to-br from-fixlyfy-info to-blue-400 text-white shadow-lg shadow-fixlyfy-info/30"
  };

  return (
    <div
      className={cn(
        "relative rounded-xl flex items-center justify-center",
        "before:absolute before:inset-0 before:rounded-xl before:bg-gradient-to-t before:from-black/20 before:to-transparent",
        "after:absolute after:inset-0 after:rounded-xl after:bg-gradient-to-b after:from-white/20 after:to-transparent",
        "transform-gpu transition-all duration-300",
        sizeClasses[size],
        variantClasses[variant],
        animated && "hover:scale-110 hover:rotate-3 hover:shadow-xl",
        "border border-white/20",
        className
      )}
      style={{
        transform: "perspective(1000px) rotateX(5deg) rotateY(-5deg)",
      }}
    >
      <Icon 
        size={iconSizes[size]} 
        className="relative z-10 drop-shadow-sm"
      />
    </div>
  );
};
