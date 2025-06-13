
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface ModernCardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glow?: boolean;
  variant?: 'default' | 'elevated' | 'glass';
}

export const ModernCard = ({ 
  children, 
  className, 
  hover = true, 
  glow = false,
  variant = 'default'
}: ModernCardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl border border-gray-200/60 shadow-sm",
        "backdrop-blur-sm bg-white/95",
        variant === 'elevated' && "shadow-lg border-primary/10",
        variant === 'glass' && "bg-white/80 backdrop-blur-md",
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

// Additional exports for compatibility
export const ModernCardHeader = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("p-6 pb-3", className)}>
    {children}
  </div>
);

export const ModernCardContent = ({ children, className }: { children: ReactNode; className?: string }) => (
  <div className={cn("p-6 pt-0", className)}>
    {children}
  </div>
);

export const ModernCardTitle = ({ children, className, icon: Icon }: { 
  children: ReactNode; 
  className?: string;
  icon?: React.ComponentType<any>;
}) => (
  <h3 className={cn("text-lg font-semibold flex items-center gap-2", className)}>
    {Icon && <Icon className="h-5 w-5" />}
    {children}
  </h3>
);
