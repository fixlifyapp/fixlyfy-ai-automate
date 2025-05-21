
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavGroupItemProps {
  label: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

export const NavGroupItem = ({ label, children, defaultOpen = false }: NavGroupItemProps) => {
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen);
  
  return (
    <div className="mb-2">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between w-full text-sm px-3 py-2 text-muted-foreground hover:text-foreground"
      >
        <span className="font-medium hidden lg:block">{label}</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      <div className={cn("space-y-1 mt-1", !isOpen && "hidden")}>
        {children}
      </div>
    </div>
  );
};
