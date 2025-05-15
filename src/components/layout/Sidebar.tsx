import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  Calendar, 
  Settings, 
  BarChart3, 
  Mail, 
  Zap,
  Menu, 
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const menuItems = [
  { 
    name: 'Dashboard', 
    icon: LayoutDashboard, 
    path: '/', 
    highlight: false 
  },
  { 
    name: 'Jobs', 
    icon: ListTodo, 
    path: '/jobs', 
    badge: '12', 
    highlight: true 
  },
  { 
    name: 'Clients', 
    icon: Users, 
    path: '/clients',
    highlight: false 
  },
  { 
    name: 'Schedule', 
    icon: Calendar, 
    path: '/schedule',
    highlight: false 
  },
  {
    name: 'Automations',
    icon: Zap,
    path: '/automations',
    highlight: false
  },
  { 
    name: 'Reports', 
    icon: BarChart3, 
    path: '/reports',
    highlight: false 
  },
  { 
    name: 'Messages', 
    icon: Mail, 
    path: '/messages', 
    badge: '3',
    highlight: false 
  }
];

const bottomMenuItems = [
  { 
    name: 'Settings', 
    icon: Settings, 
    path: '/settings',
    highlight: false 
  }
];

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  return (
    <div 
      className={cn(
        "h-screen bg-fixlyfy-bg-sidebar border-r border-fixlyfy-border flex flex-col transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="p-4 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-md fixlyfy-gradient flex items-center justify-center text-white font-bold">
              F
            </div>
            <span className="ml-2 font-bold text-fixlyfy text-xl">Fixlyfy</span>
          </div>
        )}
        {collapsed && (
          <div className="h-8 w-8 rounded-md fixlyfy-gradient flex items-center justify-center text-white font-bold mx-auto">
            F
          </div>
        )}
        <Button 
          variant="ghost" 
          size="icon" 
          className={cn("text-fixlyfy-text-secondary", collapsed && "mx-auto mt-4")}
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight size={20} /> : <Menu size={20} />}
        </Button>
      </div>
      
      <div className="flex-1 overflow-y-auto hide-scrollbar pt-4">
        <div className="space-y-1 px-3">
          {menuItems.map((item) => (
            <Link 
              key={item.name} 
              to={item.path}
              className={cn(
                "flex items-center py-2 px-3 rounded-lg group transition-colors relative",
                location.pathname === item.path 
                  ? "bg-fixlyfy text-white" 
                  : "hover:bg-fixlyfy/10 text-fixlyfy-text-secondary"
              )}
            >
              <item.icon size={20} className={cn(
                collapsed ? "mx-auto" : "mr-3"
              )} />
              {!collapsed && (
                <span className="flex-1">{item.name}</span>
              )}
              {!collapsed && item.badge && (
                <Badge className="bg-fixlyfy-light text-white">{item.badge}</Badge>
              )}
              {collapsed && item.badge && (
                <Badge className="bg-fixlyfy-light text-white absolute top-0 right-0 translate-x-1 -translate-y-1">
                  {item.badge}
                </Badge>
              )}
            </Link>
          ))}
        </div>
      </div>
      
      <div className="p-3 space-y-1">
        {bottomMenuItems.map((item) => (
          <Link 
            key={item.name} 
            to={item.path}
            className={cn(
              "flex items-center py-2 px-3 rounded-lg group transition-colors",
              location.pathname === item.path 
                ? "bg-fixlyfy text-white" 
                : "hover:bg-fixlyfy/10 text-fixlyfy-text-secondary"
            )}
          >
            <item.icon size={20} className={cn(
              collapsed ? "mx-auto" : "mr-3"
            )} />
            {!collapsed && (
              <span className="flex-1">{item.name}</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
};
