
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  Calendar,
  Users,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  DollarSign,
  Briefcase,
  Home,
  Phone,
  Zap,
  MessageSquare,
  Bot,
  Workflow,
  PhoneCall,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const sidebarItems = [
  { icon: Home, label: "Dashboard", href: "/dashboard" },
  { icon: Briefcase, label: "Jobs", href: "/jobs" },
  { icon: Users, label: "Clients", href: "/clients" },
  { icon: Calendar, label: "Schedule", href: "/schedule" },
  { icon: DollarSign, label: "Finance", href: "/finance" },
  { icon: BarChart3, label: "Reports", href: "/reports" },
  { 
    icon: MessageSquare, 
    label: "Connect Center", 
    href: "/connect-center",
    badge: "Amazon"
  },
  { 
    icon: PhoneCall, 
    label: "Telnyx", 
    href: "/telnyx",
    badge: "Simple",
    badgeVariant: "fixlyfy" as const
  },
  { icon: Phone, label: "Phone Numbers", href: "/phone-numbers" },
  { icon: Bot, label: "AI Settings", href: "/ai-settings" },
  { icon: Workflow, label: "Automations", href: "/automations" },
  { icon: Users, label: "Team", href: "/team" },
  { icon: Settings, label: "Settings", href: "/settings" },
];

export const AppSidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div className={cn(
      "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col h-full",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-fixlyfy" />
            <span className="font-bold text-lg">Fixlyfy</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 p-0"
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-fixlyfy text-white"
                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50",
                collapsed && "justify-center"
              )}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <>
                  <span className="flex-1">{item.label}</span>
                  {item.badge && (
                    <Badge 
                      variant={item.badgeVariant || "info"} 
                      className="text-xs"
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
