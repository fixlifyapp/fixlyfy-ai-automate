
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
    variant: "fixlyfy" | "success" | "info" | "warning";
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
      "relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-2xl p-6 mb-6 border border-fixlyfy/20",
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-48 h-48 bg-gradient-to-br from-fixlyfy/20 to-fixlyfy-light/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-gradient-to-br from-fixlyfy-light/20 to-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 flex justify-between items-center">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-all duration-500">
              <Icon className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-fixlyfy via-fixlyfy-light to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-fixlyfy-text-secondary text-sm">{subtitle}</p>
            </div>
          </div>
          
          {/* Feature Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {badges.map((badge, index) => (
                <Badge 
                  key={index}
                  variant="outline" 
                  className={cn(
                    "text-xs font-medium border",
                    badge.variant === "fixlyfy" && "bg-fixlyfy/10 text-fixlyfy border-fixlyfy/30",
                    badge.variant === "success" && "bg-green-100 text-green-700 border-green-200",
                    badge.variant === "info" && "bg-blue-100 text-blue-700 border-blue-200",
                    badge.variant === "warning" && "bg-yellow-100 text-yellow-700 border-yellow-200"
                  )}
                >
                  <badge.icon className="w-3 h-3 mr-1" />
                  {badge.text}
                </Badge>
              ))}
            </div>
          )}
        </div>
        
        {actionButton && (
          <Button 
            onClick={actionButton.onClick}
            className="bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy/90 hover:to-fixlyfy-light/90 text-white px-6 py-2 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <actionButton.icon className="mr-2 h-4 w-4" />
            {actionButton.text}
          </Button>
        )}
      </div>
    </div>
  );
};
