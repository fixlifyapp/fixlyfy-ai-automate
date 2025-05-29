
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Floating3DIconProps {
  icon: LucideIcon;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "success" | "warning" | "error";
  className?: string;
  floating?: boolean;
}

export const Floating3DIcon: React.FC<Floating3DIconProps> = ({
  icon: Icon,
  size = "md",
  variant = "primary",
  className,
  floating = true
}) => {
  const sizeClasses = {
    sm: "w-10 h-10 p-2",
    md: "w-14 h-14 p-3",
    lg: "w-18 h-18 p-4"
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 36
  };

  const variantClasses = {
    primary: "bg-gradient-to-br from-fixlyfy via-fixlyfy-light to-purple-400 text-white",
    secondary: "bg-gradient-to-br from-gray-600 via-gray-500 to-gray-400 text-white",
    success: "bg-gradient-to-br from-fixlyfy-success via-green-400 to-emerald-300 text-white",
    warning: "bg-gradient-to-br from-fixlyfy-warning via-yellow-400 to-amber-300 text-white",
    error: "bg-gradient-to-br from-fixlyfy-error via-red-400 to-rose-300 text-white"
  };

  return (
    <div
      className={cn(
        "relative rounded-2xl flex items-center justify-center",
        "shadow-2xl",
        sizeClasses[size],
        variantClasses[variant],
        floating && "animate-[float_3s_ease-in-out_infinite]",
        "transform-gpu transition-all duration-500 hover:scale-110",
        "border-2 border-white/30",
        "before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-t before:from-black/30 before:via-transparent before:to-white/20",
        "after:absolute after:-inset-1 after:rounded-2xl after:bg-gradient-to-r after:from-transparent after:via-white/10 after:to-transparent after:blur-sm",
        className
      )}
      style={{
        transform: "perspective(1000px) rotateX(10deg) rotateY(-10deg)",
        filter: "drop-shadow(0 25px 50px rgba(0, 0, 0, 0.25))",
      }}
    >
      <Icon 
        size={iconSizes[size]} 
        className="relative z-10 drop-shadow-lg"
      />
    </div>
  );
};
