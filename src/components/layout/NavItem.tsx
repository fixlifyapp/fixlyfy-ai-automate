
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface NavItemProps {
  to: string;
  icon: LucideIcon;
  label: string;
}

export const NavItem = ({ to, icon: Icon, label }: NavItemProps) => {
  const location = useLocation();
  const isActive = location.pathname === to || location.pathname.startsWith(`${to}/`);

  return (
    <Link
      to={to}
      className={cn(
        "flex items-center text-sm px-3 py-2 rounded-md transition-colors",
        "hover:bg-muted",
        isActive 
          ? "bg-fixlyfy/10 text-fixlyfy font-medium" 
          : "text-muted-foreground"
      )}
    >
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <span className="hidden lg:block">{label}</span>
    </Link>
  );
};
