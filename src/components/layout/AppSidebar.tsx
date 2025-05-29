
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
    <Sidebar collapsible="icon" className="border-r border-gray-200/80 bg-white shadow-sm">
      <SidebarHeader className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-lg transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  F
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full opacity-80 animate-pulse" />
            </div>
            <div className="group-data-[collapsible=icon]:hidden">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Fixlify
              </h2>
              <p className="text-xs text-gray-500 -mt-1">Service Management</p>
            </div>
          </div>
          <SidebarTrigger className="text-gray-400 hover:text-gray-600" />
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <div className="space-y-2">
          <div className="px-3 mb-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider group-data-[collapsible=icon]:hidden">
              Main Menu
            </p>
          </div>
          
          <SidebarMenu className="space-y-1">
            {routes.map(route => (
              <SidebarMenuItem key={route.href}>
                <TrackingWrapper actionType="navigation" element="sidebar_menu" context={{
                  destination: route.href,
                  label: route.label
                }}>
                  <SidebarMenuButton 
                    asChild
                    isActive={location.pathname === route.href}
                    className={`
                      group w-full justify-start px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 
                      hover:bg-gray-50 hover:scale-[1.02] hover:shadow-sm
                      data-[active=true]:bg-gradient-to-r data-[active=true]:from-blue-50 data-[active=true]:to-purple-50 
                      data-[active=true]:text-blue-700 data-[active=true]:border-l-4 data-[active=true]:border-blue-500
                      data-[active=true]:shadow-md data-[active=true]:ml-0
                      ${location.pathname === route.href ? 'border-l-4 border-blue-500 bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 shadow-md' : 'text-gray-700 hover:text-gray-900'}
                    `}
                    tooltip={route.label}
                  >
                    <Button 
                      variant="ghost"
                      className="w-full justify-start p-0 h-auto hover:bg-transparent"
                      onClick={() => handleNavigation(route.href)}
                    >
                      <route.icon className={`
                        mr-3 h-5 w-5 transition-all duration-200 group-data-[collapsible=icon]:mr-0
                        ${location.pathname === route.href ? 'text-blue-600' : 'text-gray-500 group-hover:text-gray-700'}
                      `} />
                      <span className="truncate group-data-[collapsible=icon]:hidden font-medium">
                        {route.label}
                      </span>
                      {location.pathname === route.href && (
                        <div className="ml-auto w-2 h-2 bg-blue-500 rounded-full group-data-[collapsible=icon]:hidden" />
                      )}
                    </Button>
                  </SidebarMenuButton>
                </TrackingWrapper>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          
          <div className="pt-6 mt-6 border-t border-gray-100 group-data-[collapsible=icon]:hidden">
            <div className="px-3 mb-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Quick Stats
              </p>
            </div>
            <div className="px-3 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Active Jobs</span>
                <span className="font-semibold text-blue-600">12</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">This Month</span>
                <span className="font-semibold text-green-600">$45.2k</span>
              </div>
            </div>
          </div>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}
