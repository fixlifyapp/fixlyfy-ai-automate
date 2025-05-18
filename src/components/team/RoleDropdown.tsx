
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useRBAC } from "@/components/auth/RBACProvider";
import { UserRole } from "@/components/auth/types";

interface RoleDropdownProps {
  userId: string;
  role: UserRole;
  disabled?: boolean;
}

export const RoleDropdown = ({ userId, role, disabled = false }: RoleDropdownProps) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(role);
  const { allRoles } = useRBAC();

  const handleRoleChange = (newRole: UserRole) => {
    // In a real app, this would call an API to update the user's role
    console.log(`Updating role for user ${userId} from ${currentRole} to ${newRole}`);
    
    // Update local state
    setCurrentRole(newRole);
    
    // Show success toast
    toast.success(`Role updated to ${newRole}`);
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={disabled}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select role" />
      </SelectTrigger>
      <SelectContent>
        {allRoles.map((roleOption) => (
          <SelectItem key={roleOption} value={roleOption}>
            {roleOption.charAt(0).toUpperCase() + roleOption.slice(1)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
