
import React from "react";
import { cn } from "@/lib/utils";

interface ModernCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "elevated" | "glass";
  hoverable?: boolean;
}

export const ModernCard = ({ 
  children, 
  className, 
  variant = "default",
  hoverable = false 
}: ModernCardProps) => {
  return (
    <div className={cn(
      "rounded-xl border transition-all duration-300",
      variant === "default" && "bg-white border-fixlify-border shadow-sm",
      variant === "elevated" && "bg-white border-0 shadow-xl",
      variant === "glass" && "bg-white/80 backdrop-blur-sm border-fixlify-border/50 shadow-lg",
      hoverable && "hover:shadow-xl hover:scale-[1.02] cursor-pointer",
      className
    )}>
      {children}
    </div>
  );
};

interface ModernCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernCardHeader = ({ children, className }: ModernCardHeaderProps) => {
  return (
    <div className={cn("p-6 border-b border-fixlify-border", className)}>
      {children}
    </div>
  );
};

interface ModernCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const ModernCardContent = ({ children, className }: ModernCardContentProps) => {
  return (
    <div className={cn("p-6", className)}>
      {children}
    </div>
  );
};

interface ModernCardTitleProps {
  children: React.ReactNode;
  icon?: React.ComponentType<{ className?: string }>;
  className?: string;
}

export const ModernCardTitle = ({ children, icon: Icon, className }: ModernCardTitleProps) => {
  return (
    <div className={cn("flex items-center gap-2 text-lg font-semibold", className)}>
      {Icon && (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-fixlify to-fixlify-light flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
      )}
      {children}
    </div>
  );
};
