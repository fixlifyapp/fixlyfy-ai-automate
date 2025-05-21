
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
} from "lucide-react";
import { Link } from "react-router-dom";

import { Logo } from "@/components/Logo";
import { NavItem } from "@/components/layout/NavItem";
import { UserMenu } from "@/components/auth/UserMenu";

export const Sidebar = () => {
  return (
    <aside className="h-full w-16 lg:w-64 border-r border-fixlyfy-border bg-card hidden md:flex flex-col">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        <NavItem to="/" icon={Home} label="Dashboard" />
        <NavItem to="/jobs" icon={ListChecks} label="Jobs" />
        <NavItem to="/clients" icon={Users} label="Clients" />
        <NavItem to="/finance" icon={DollarSign} label="Finance" />
        <NavItem to="/products" icon={Package} label="Products" />
        <NavItem to="/messages" icon={MessageSquare} label="Messages" />
        <NavItem to="/reports" icon={BarChart2} label="Reports" />
        <NavItem to="/automations" icon={Zap} label="Automations" />
        <NavItem to="/ai-assistant" icon={Bot} label="AI Assistant" />
        <NavItem to="/team" icon={Users} label="Team" />
        <NavItem to="/settings" icon={Settings} label="Settings" />
      </nav>
      
      <div className="p-4 border-t border-fixlyfy-border mt-auto hidden lg:block">
        <UserMenu />
      </div>
    </aside>
  );
};
