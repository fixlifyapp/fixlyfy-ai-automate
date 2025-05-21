
import { Link, useLocation } from "react-router-dom";
import { LucideIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
  collapsed?: boolean;
}

export const NavItem = ({ to, icon: Icon, label, collapsed = false }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  const navItem = (
    <Link
      to={to}
      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
        isActive
          ? "bg-fixlyfy text-white"
          : "text-fixlyfy-text-secondary hover:bg-fixlyfy/10"
      }`}
    >
      <Icon className="shrink-0" size={18} />
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );

  if (collapsed) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{navItem}</TooltipTrigger>
          <TooltipContent side="right">{label}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return navItem;
};
