
import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  LayoutDashboard, 
  Briefcase, 
  Users, 
  Calendar, 
  ClipboardList,
  DollarSign,
  MessageSquare,
  BarChart3,
  Settings,
  FileText,
  Phone,
  Package,
  Bot,
  Zap,
  UserCheck
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrackingWrapper } from "@/components/ui/TrackingWrapper";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: "text-fixlyfy"
    },
    {
      label: 'Jobs',
      icon: Briefcase,
      href: '/jobs',
      color: "text-fixlyfy"
    },
    {
      label: 'Clients',
      icon: Users,
      href: '/clients',
      color: "text-fixlyfy"
    },
    {
      label: 'Schedule',
      icon: Calendar,
      href: '/schedule',
      color: "text-fixlyfy"
    },
    {
      label: 'Estimates',
      icon: ClipboardList,
      href: '/estimates',
      color: "text-fixlyfy"
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/invoices',
      color: "text-fixlyfy"
    },
    {
      label: 'Finance',
      icon: DollarSign,
      href: '/finance',
      color: "text-fixlyfy"
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      href: '/messages',
      color: "text-fixlyfy"
    },
    {
      label: 'Connect Center',
      icon: Phone,
      href: '/connect',
      color: "text-fixlyfy"
    },
    {
      label: 'AI Assistant',
      icon: Bot,
      href: '/ai-assistant',
      color: "text-fixlyfy"
    },
    {
      label: 'Automations',
      icon: Zap,
      href: '/automations',
      color: "text-fixlyfy"
    },
    {
      label: 'Analytics',
      icon: BarChart3,
      href: '/analytics',
      color: "text-fixlyfy"
    },
    {
      label: 'Team',
      icon: UserCheck,
      href: '/team',
      color: "text-fixlyfy"
    },
    {
      label: 'Products',
      icon: Package,
      href: '/products',
      color: "text-fixlyfy"
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      color: "text-fixlyfy-text-muted"
    }
  ];

  const handleNavigation = (href: string) => {
    console.log(`Navigating to: ${href}`);
    navigate(href);
  };

  return (
    <div className={cn("pb-12 w-64 bg-white border-r border-fixlyfy-border shadow-sm", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="mb-6 px-4 py-2">
            <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent tracking-tight">
              Fixlyfy
            </h2>
            <p className="text-xs text-fixlyfy-text-muted mt-1">
              Field Service Management
            </p>
          </div>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <TrackingWrapper
                  key={route.href}
                  actionType="navigation"
                  element="sidebar_menu"
                  context={{ destination: route.href, label: route.label }}
                >
                  <Button
                    variant={location.pathname === route.href ? "default" : "ghost"}
                    className={cn(
                      "w-full justify-start text-sm font-medium transition-all duration-200 hover:scale-[1.02]",
                      location.pathname === route.href 
                        ? "bg-gradient-primary text-white shadow-md hover:shadow-lg" 
                        : "text-fixlyfy-text hover:bg-fixlyfy/10 hover:text-fixlyfy"
                    )}
                    onClick={() => handleNavigation(route.href)}
                  >
                    <route.icon className={cn(
                      "mr-3 h-4 w-4 transition-colors", 
                      location.pathname === route.href 
                        ? "text-white" 
                        : route.color
                    )} />
                    <span className="truncate">{route.label}</span>
                  </Button>
                </TrackingWrapper>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
