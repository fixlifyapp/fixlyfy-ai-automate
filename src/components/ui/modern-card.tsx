
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
}

export const ModernCard = ({ 
  children, 
  className, 
  hover = true, 
  glow = false 
}: ModernCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200/60 shadow-sm",
        "backdrop-blur-sm bg-white/95",
        hover && "hover:shadow-lg hover:border-primary/20 hover:-translate-y-0.5",
        glow && "shadow-primary/10",
        "transition-all duration-300 ease-out",
        className
      )}
      style={{
        boxShadow: glow 
          ? "0 4px 20px rgba(138, 77, 213, 0.1), 0 1px 3px rgba(0, 0, 0, 0.05)"
          : undefined
      }}
    >
      {children}
    </div>
  );
};
