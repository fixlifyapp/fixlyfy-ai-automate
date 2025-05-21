import {
  BarChart2,
  Bot,
  DollarSign,
  File,
  FileText,
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
import { NavGroupItem } from "@/components/layout/NavGroupItem";
import { NavItem } from "@/components/layout/NavItem";
import { UserMenu } from "@/components/layout/UserMenu";

const sidebarLinks = [
  {
    to: "/",
    icon: Home,
    label: "Dashboard",
  },
  {
    to: "/jobs",
    icon: ListChecks,
    label: "Jobs",
  },
  {
    to: "/clients",
    icon: Users,
    label: "Clients",
  },
];

export const Sidebar = () => {
  return (
    <aside className="h-full w-16 lg:w-64 border-r border-fixlyfy-border bg-card hidden md:flex flex-col">
      <div className="p-4">
        <Link to="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" />
          <span className="font-bold text-xl hidden lg:block">FixlyFy</span>
        </Link>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {sidebarLinks.map((link) => (
          <NavItem 
            key={link.to} 
            to={link.to} 
            icon={link.icon} 
            label={link.label} 
          />
        ))}

        <NavGroupItem label="Finance">
          <NavItem to="/finance" icon={DollarSign} label="Finance" />
          <NavItem to="/invoices" icon={FileText} label="Invoices" />
        </NavGroupItem>

        <NavGroupItem label="Resources">
          <NavItem to="/products" icon={Package} label="Products" />
          <NavItem to="/documents" icon={File} label="Documents" />
          <NavItem to="/messages" icon={MessageSquare} label="Messages" />
        </NavGroupItem>

        <NavGroupItem label="Reports">
          <NavItem to="/reports" icon={BarChart2} label="Reports" />
          <NavItem to="/automations" icon={Zap} label="Automations" />
          <NavItem to="/ai-assistant" icon={Bot} label="AI Assistant" />
        </NavGroupItem>
        
        <NavGroupItem label="Settings">
          <NavItem to="/team" icon={Users} label="Team" />
          <NavItem to="/settings" icon={Settings} label="Settings" />
        </NavGroupItem>
      </nav>
      
      <div className="p-4 border-t border-fixlyfy-border mt-auto hidden lg:block">
        <UserMenu />
      </div>
    </aside>
  );
};
