
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badges?: Array<{
    text: string;
    icon: React.ComponentType<{ className?: string }>;
    variant: "fixlify" | "success" | "info" | "warning";
  }>;
  actionButton?: {
    text: string;
    icon: React.ComponentType<{ className?: string }>;
    onClick: () => void;
  };
  className?: string;
}

export const PageHeader = ({ 
  title, 
  subtitle, 
  icon: Icon, 
  badges = [], 
  actionButton,
  className 
}: PageHeaderProps) => {
  return (
    <div className={cn(
      "relative overflow-hidden bg-gradient-to-br from-fixlify/10 via-fixlify-light/10 to-blue-50 rounded-2xl p-4 sm:p-6 mb-6 border border-fixlify/20",
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-32 h-32 sm:w-48 sm:h-48 bg-gradient-to-br from-fixlify/20 to-fixlify-light/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-48 h-48 sm:w-64 sm:h-64 bg-gradient-to-br from-fixlify-light/20 to-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div className="space-y-2 flex-1 min-w-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-3 bg-gradient-to-br from-fixlify to-fixlify-light rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-500 flex-shrink-0">
              <Icon className="text-white w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-fixlify via-fixlify-light to-blue-600 bg-clip-text text-transparent break-words">
                {title}
              </h1>
              <p className="text-fixlify-text-secondary text-xs sm:text-sm break-words">{subtitle}</p>
            </div>
          </div>
          
          {/* Feature Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-1 sm:gap-2 mt-3">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium border flex-shrink-0",
                    badge.variant === "fixlify" && "bg-fixlify/10 text-fixlify border-fixlify/30",
                    badge.variant === "success" && "bg-green-100 text-green-700 border-green-200",
                    badge.variant === "info" && "bg-blue-100 text-blue-700 border-blue-200",
                    badge.variant === "warning" && "bg-yellow-100 text-yellow-700 border-yellow-200"
                  )}
                >
                  <badge.icon className="w-3 h-3 mr-1 flex-shrink-0" />
                  <span className="truncate">{badge.text}</span>
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {actionButton && (
          <div className="flex-shrink-0">
            <Button 
              onClick={actionButton.onClick}
              className="bg-gradient-to-r from-fixlify to-fixlify-light hover:from-fixlify/90 hover:to-fixlify-light/90 text-white px-4 sm:px-6 py-2 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 w-full sm:w-auto"
            >
              <actionButton.icon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="truncate">{actionButton.text}</span>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
