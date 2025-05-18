
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
  onRoleChange?: (userId: string, newRole: UserRole) => void;
  testMode?: boolean;
}

export const RoleDropdown = ({ 
  userId, 
  role, 
  disabled = false, 
  onRoleChange,
  testMode = false
}: RoleDropdownProps) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(role);
  const { allRoles, hasPermission } = useRBAC();
  
  // Check if user has permission to change roles
  const canEditRoles = hasPermission("users.roles.assign");
  
  const handleRoleChange = (newRole: UserRole) => {
    if (!canEditRoles) {
      toast.error("You don't have permission to change roles");
      return;
    }
    
    // In a real app, this would call an API to update the user's role
    console.log(`Updating role for user ${userId} from ${currentRole} to ${newRole}`);
    
    // Update local state
    setCurrentRole(newRole);
    
    // Call onRoleChange if provided
    if (onRoleChange) {
      onRoleChange(userId, newRole);
    }
    
    // Show success toast
    toast.success(`Role updated to ${newRole}`);
    
    if (testMode) {
      toast.info("Test Mode: Role changed locally only. Will be saved to Supabase after integration.");
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={disabled || !canEditRoles}
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
