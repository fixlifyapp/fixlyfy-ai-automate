
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
      "relative overflow-hidden bg-gradient-to-br from-fixlyfy/10 via-fixlyfy-light/10 to-blue-50 rounded-3xl p-8 mb-8 border border-fixlyfy/20",
      className
    )}>
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-64 h-64 bg-gradient-to-br from-fixlyfy/20 to-fixlyfy-light/20 rounded-full blur-3xl transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-fixlyfy-light/20 to-blue-500/20 rounded-full blur-3xl transform translate-x-1/2 translate-y-1/2"></div>
      </div>
      
      <div className="relative z-10 flex justify-between items-center">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-gradient-to-br from-fixlyfy to-fixlyfy-light rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-500">
              <Icon className="text-white w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-fixlyfy via-fixlyfy-light to-blue-600 bg-clip-text text-transparent">
                {title}
              </h1>
              <p className="text-fixlyfy-text-secondary text-lg">{subtitle}</p>
            </div>
          </div>
          
          {/* Feature Badges */}
          {badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
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
            className="bg-gradient-to-r from-fixlyfy to-fixlyfy-light hover:from-fixlyfy/90 hover:to-fixlyfy-light/90 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300"
          >
            <actionButton.icon className="mr-2 h-5 w-5" />
            {actionButton.text}
          </Button>
        )}
      </div>
    </div>
  );
};
