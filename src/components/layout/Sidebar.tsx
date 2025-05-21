import {
  BarChart2,
  Bot,
  DollarSign,
  Home,
  ListChecks,
  MessageSquare,
  Package,
  Settings,
  Users,
  Zap,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

import { Logo } from "@/components/Logo";
import { NavItem } from "@/components/layout/NavItem";
import { UserMenu } from "@/components/auth/UserMenu";

export const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <aside 
      className={`h-full ${collapsed ? 'w-16' : 'w-16 lg:w-64'} border-r border-fixlyfy-border bg-card flex flex-col transition-all duration-300`}
    >
      <div className="p-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
        </Link>
      </div>
      
      
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <NavItem to="/" icon={Home} label="Dashboard" collapsed={collapsed} />
        <NavItem to="/jobs" icon={ListChecks} label="Jobs" collapsed={collapsed} />
        <NavItem to="/clients" icon={Users} label="Clients" collapsed={collapsed} />
        <NavItem to="/finance" icon={DollarSign} label="Finance" collapsed={collapsed} />
        <NavItem to="/products" icon={Package} label="Products" collapsed={collapsed} />
        <NavItem to="/messages" icon={MessageSquare} label="Messages" collapsed={collapsed} />
        <NavItem to="/reports" icon={BarChart2} label="Reports" collapsed={collapsed} />
        <NavItem to="/automations" icon={Zap} label="Automations" collapsed={collapsed} />
        <NavItem to="/ai-assistant" icon={Bot} label="AI Assistant" collapsed={collapsed} />
        <NavItem to="/team" icon={Users} label="Team" collapsed={collapsed} />
        <NavItem to="/settings" icon={Settings} label="Settings" collapsed={collapsed} />
      </nav>
      
      <div className="p-4 border-t border-fixlyfy-border mt-auto">
        {!collapsed && <div className="hidden lg:block"><UserMenu /></div>}
        <button 
          onClick={toggleSidebar}
          className="mt-2 w-full flex justify-center items-center p-2 text-fixlyfy hover:bg-fixlyfy/10 rounded-md transition-all"
        >
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>
    </aside>
  );
};
