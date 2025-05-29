
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Briefcase, Users, Calendar, DollarSign, MessageSquare, BarChart3, Settings, Bot, Zap, UserCheck } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { TrackingWrapper } from "@/components/ui/TrackingWrapper";

export function AppSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [{
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/dashboard',
    color: "text-fixlyfy"
  }, {
    label: 'Jobs',
    icon: Briefcase,
    href: '/jobs',
    color: "text-fixlyfy"
  }, {
    label: 'Clients',
    icon: Users,
    href: '/clients',
    color: "text-fixlyfy"
  }, {
    label: 'Schedule',
    icon: Calendar,
    href: '/schedule',
    color: "text-fixlyfy"
  }, {
    label: 'Finance',
    icon: DollarSign,
    href: '/finance',
    color: "text-fixlyfy"
  }, {
    label: 'Connect Center',
    icon: MessageSquare,
    href: '/connect',
    color: "text-fixlyfy"
  }, {
    label: 'AI Center',
    icon: Bot,
    href: '/ai-center',
    color: "text-fixlyfy"
  }, {
    label: 'Automations',
    icon: Zap,
    href: '/automations',
    color: "text-fixlyfy"
  }, {
    label: 'Analytics',
    icon: BarChart3,
    href: '/analytics',
    color: "text-fixlyfy"
  }, {
    label: 'Team',
    icon: UserCheck,
    href: '/team',
    color: "text-fixlyfy"
  }, {
    label: 'Settings',
    icon: Settings,
    href: '/settings',
    color: "text-fixlyfy-text-muted"
  }];

  const handleNavigation = (href: string) => {
    console.log(`Navigating to: ${href}`);
    navigate(href);
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40 bg-gradient-to-b from-background to-muted/20">
      <SidebarHeader className="border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            {/* Logo */}
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-primary via-primary/80 to-primary/60 rounded-xl shadow-lg flex items-center justify-center transform hover:scale-105 transition-all duration-300 group-data-[collapsible=icon]:w-8 group-data-[collapsible=icon]:h-8">
                <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center group-data-[collapsible=icon]:w-4 group-data-[collapsible=icon]:h-4">
                  <Bot className="w-4 h-4 text-white group-data-[collapsible=icon]:w-3 group-data-[collapsible=icon]:h-3" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background animate-pulse" />
            </div>
            
            {/* Brand Name */}
            <div className="group-data-[collapsible=icon]:hidden">
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Fixlify
              </h1>
              <p className="text-xs text-muted-foreground font-medium">AI Business Manager</p>
            </div>
          </div>
          
          <SidebarTrigger className="h-8 w-8 hover:bg-muted/80 transition-colors" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <div className="space-y-1">
          <SidebarMenu>
            {routes.map(route => (
              <SidebarMenuItem key={route.href}>
                <TrackingWrapper actionType="navigation" element="sidebar_menu" context={{
                  destination: route.href,
                  label: route.label
                }}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === route.href}
                    className="group relative h-10 px-3 text-sm font-medium transition-all duration-200 hover:bg-muted/80 data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm hover:data-[active=true]:bg-primary/90"
                    tooltip={route.label}
                  >
                    <Button 
                      variant="ghost"
                      className="w-full justify-start gap-3 h-10"
                      onClick={() => handleNavigation(route.href)}
                    >
                      <route.icon className="h-4 w-4 shrink-0 transition-colors group-data-[collapsible=icon]:mr-0" />
                      <span className="truncate group-data-[collapsible=icon]:hidden">
                        {route.label}
                      </span>
                      
                      {/* Active indicator */}
                      {location.pathname === route.href && (
                        <div className="absolute right-2 w-1.5 h-1.5 bg-primary-foreground rounded-full group-data-[collapsible=icon]:hidden" />
                      )}
                    </Button>
                  </SidebarMenuButton>
                </TrackingWrapper>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
        
        {/* Bottom section */}
        <div className="mt-auto pt-4 border-t border-border/40 group-data-[collapsible=icon]:hidden">
          <div className="px-3 py-2 space-y-1">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">All systems operational</span>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
