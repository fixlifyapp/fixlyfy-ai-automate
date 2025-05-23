
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
import { supabase } from "@/integrations/supabase/client";

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
  const [isLoading, setIsLoading] = useState(false);
  const { allRoles, hasPermission } = useRBAC();
  
  // Check if user has permission to change roles
  const canEditRoles = hasPermission("users.roles.assign");
  
  const handleRoleChange = async (newRole: UserRole) => {
    if (!canEditRoles) {
      toast.error("You don't have permission to change roles");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Update the role in the profiles table in Supabase
      const { error } = await supabase
        .from('profiles')
        .update({ role: newRole })
        .eq('id', userId);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setCurrentRole(newRole);
      
      // Call onRoleChange if provided
      if (onRoleChange) {
        onRoleChange(userId, newRole);
      }
      
      // Show success toast
      toast.success(`Role updated to ${newRole}`);
      
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Failed to update role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Select
      value={currentRole}
      onValueChange={handleRoleChange}
      disabled={disabled || !canEditRoles || isLoading}
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
