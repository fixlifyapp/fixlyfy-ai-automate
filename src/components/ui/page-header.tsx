
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  icon?: React.ComponentType<any>;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  className,
  icon: Icon 
}: PageHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7" />}
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="flex items-center gap-3">
          {action}
        </div>
      )}
    </div>
  );
};
