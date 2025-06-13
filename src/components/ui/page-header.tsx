
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
  icon?: React.ComponentType<any>;
  badges?: Array<{
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info" | "fixlyfy";
    icon?: React.ComponentType<any>;
  }>;
  actionButton?: {
    label: string;
    text?: string;
    onClick: () => void;
    icon?: React.ComponentType<any>;
  };
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  action, 
  className,
  icon: Icon,
  badges,
  actionButton
}: PageHeaderProps) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          {Icon && <Icon className="h-7 w-7" />}
          {title}
          {badges && badges.length > 0 && (
            <div className="flex gap-2 ml-3">
              {badges.map((badge, index) => (
                <Badge key={index} variant={badge.variant || "default"} icon={badge.icon}>
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </h1>
        {subtitle && (
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        )}
      </div>
      {(action || actionButton) && (
        <div className="flex items-center gap-3">
          {action}
          {actionButton && (
            <button
              onClick={actionButton.onClick}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
            >
              {actionButton.icon && <actionButton.icon className="h-4 w-4" />}
              {actionButton.text || actionButton.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
