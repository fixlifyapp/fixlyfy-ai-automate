
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
  UserCheck,
  Brain,
  Crown
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function Sidebar({ className }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const routes = [
    {
      label: 'Dashboard',
      icon: LayoutDashboard,
      href: '/dashboard',
      color: "text-sky-500"
    },
    {
      label: 'Advanced Dashboard',
      icon: Brain,
      href: '/advanced-dashboard',
      color: "text-purple-500"
    },
    {
      label: 'Advanced Reports',
      icon: Crown,
      href: '/advanced-reports',
      color: "text-amber-500"
    },
    {
      label: 'Jobs',
      icon: Briefcase,
      href: '/jobs',
      color: "text-emerald-500"
    },
    {
      label: 'Clients',
      icon: Users,
      href: '/clients',
      color: "text-pink-700"
    },
    {
      label: 'Schedule',
      icon: Calendar,
      href: '/schedule',
      color: "text-orange-700"
    },
    {
      label: 'Estimates',
      icon: ClipboardList,
      href: '/estimates',
      color: "text-blue-500"
    },
    {
      label: 'Invoices',
      icon: FileText,
      href: '/invoices',
      color: "text-green-500"
    },
    {
      label: 'Finance',
      icon: DollarSign,
      href: '/finance',
      color: "text-green-700"
    },
    {
      label: 'Messages',
      icon: MessageSquare,
      href: '/messages',
      color: "text-indigo-500"
    },
    {
      label: 'Connect Center',
      icon: Phone,
      href: '/connect',
      color: "text-teal-500"
    },
    {
      label: 'AI Assistant',
      icon: Bot,
      href: '/ai-assistant',
      color: "text-purple-600"
    },
    {
      label: 'Automations',
      icon: Zap,
      href: '/automations',
      color: "text-yellow-600"
    },
    {
      label: 'Reports',
      icon: BarChart3,
      href: '/reports',
      color: "text-violet-500"
    },
    {
      label: 'Team',
      icon: UserCheck,
      href: '/team',
      color: "text-rose-500"
    },
    {
      label: 'Products',
      icon: Package,
      href: '/products',
      color: "text-cyan-500"
    },
    {
      label: 'Settings',
      icon: Settings,
      href: '/settings',
      color: "text-gray-500"
    }
  ];

  const handleNavigation = (href: string) => {
    console.log(`Navigating to: ${href}`);
    navigate(href);
  };

  return (
    <div className={cn("pb-12 w-64 bg-white border-r", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Fixlyfy
          </h2>
          <ScrollArea className="h-[calc(100vh-8rem)]">
            <div className="space-y-1">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={location.pathname === route.href ? "secondary" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handleNavigation(route.href)}
                >
                  <route.icon className={cn("mr-2 h-4 w-4", route.color)} />
                  {route.label}
                </Button>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
