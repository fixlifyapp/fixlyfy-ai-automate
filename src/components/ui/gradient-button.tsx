
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface GradientButtonProps extends Omit<ButtonProps, 'variant'> {
  variant?: "primary" | "success" | "warning" | "info";
  gradient?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
}

export const GradientButton = ({ 
  children, 
  className, 
  variant = "primary",
  gradient = true,
  icon: Icon,
  ...props 
}: GradientButtonProps) => {
  return (
    <Button
      className={cn(
        "font-semibold transition-all duration-300 transform hover:scale-105",
        gradient && variant === "primary" && "bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy/90 hover:to-fixlyfy-light/90 text-white shadow-lg",
        gradient && variant === "success" && "bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg",
        gradient && variant === "warning" && "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white shadow-lg",
        gradient && variant === "info" && "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg",
        !gradient && variant === "primary" && "bg-fixlyfy hover:bg-fixlyfy/90 text-white",
        "rounded-xl px-6 py-2.5",
        className
      )}
      {...props}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  );
};
