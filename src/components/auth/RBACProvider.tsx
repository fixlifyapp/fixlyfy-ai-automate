
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, UserRole, DEFAULT_PERMISSIONS } from './types';
import { toast } from 'sonner';

interface RBACContextType {
  currentUser: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  userRole: UserRole | null;
  setCurrentUser: (user: User | null) => void;
  allRoles: UserRole[];
  addCustomRole: (roleName: string) => void;
}

const defaultUser: User = {
  id: "1",
  name: "Admin User",
  email: "admin@fixlyfy.com",
  role: "admin",
  avatar: "https://github.com/shadcn.png"
};

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider = ({ children }: { children: ReactNode }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(defaultUser);
  const [loading, setLoading] = useState(true);
  const [customRoles, setCustomRoles] = useState<UserRole[]>([]);
  
  // Load saved custom roles from localStorage
  useEffect(() => {
    // Normally would fetch the current user from an API or local storage
    // For demo purposes, we use the default admin user
    // In a real app, replace with actual authentication logic
    setLoading(false);

    // Load any saved custom roles from localStorage
    try {
      const savedCustomRoles = localStorage.getItem('fixlyfy_custom_roles');
      if (savedCustomRoles) {
        const parsedRoles = JSON.parse(savedCustomRoles) as string[];
        setCustomRoles(parsedRoles);
      }
    } catch (error) {
      console.error('Error loading custom roles:', error);
    }
  }, []);
  
  // Initialize permissions for custom roles if they don't exist
  useEffect(() => {
    const updatedPermissions = { ...DEFAULT_PERMISSIONS };
    
    customRoles.forEach(role => {
      if (!updatedPermissions[role]) {
        updatedPermissions[role] = [];
      }
    });
    
    // Try to load any saved custom role permissions
    try {
      const savedPermissions = localStorage.getItem('fixlyfy_custom_roles_permissions');
      if (savedPermissions) {
        const parsedPermissions = JSON.parse(savedPermissions) as Record<string, string[]>;
        
        // Merge saved permissions with default permissions
        Object.entries(parsedPermissions).forEach(([role, permissions]) => {
          updatedPermissions[role] = permissions;
        });
      }
    } catch (error) {
      console.error('Error loading custom role permissions:', error);
    }
  }, [customRoles]);

  const addCustomRole = (roleName: string) => {
    if (!roleName.trim()) {
      toast.error('Role name cannot be empty');
      return;
    }

    // Clean up the role name for use as an ID
    const cleanRoleName = roleName.trim().toLowerCase();
    
    // Make sure we have the default roles always available for the check
    const defaultRoleKeys = Object.keys(DEFAULT_PERMISSIONS);
    
    // Check if role already exists in both default and custom roles
    if ([...defaultRoleKeys, ...customRoles].includes(cleanRoleName)) {
      toast.error(`Role "${roleName}" already exists`);
      return;
    }

    // Add the new role
    const newRoles = [...customRoles, cleanRoleName];
    setCustomRoles(newRoles);
    
    // Initialize empty permissions for the new role
    DEFAULT_PERMISSIONS[cleanRoleName] = [];
    
    // Save to localStorage
    localStorage.setItem('fixlyfy_custom_roles', JSON.stringify(newRoles));
    
    toast.success(`Role "${roleName}" created successfully`);
  };

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
    
    // Admin has all permissions
    if (rolePermissions.includes('*')) return true;
    
    // Check if the user has the specific permission
    return rolePermissions.includes(permission);
  };

  // Combine default roles with custom roles - ensure we always have an array
  const defaultRoleKeys = Object.keys(DEFAULT_PERMISSIONS) || [];
  const allRoles: UserRole[] = [...defaultRoleKeys, ...customRoles];

  const value = {
    currentUser,
    loading,
    hasPermission,
    userRole: currentUser?.role || null,
    setCurrentUser,
    allRoles,
    addCustomRole,
  };

  return (
    <RBACContext.Provider value={value}>
      {children}
    </RBACContext.Provider>
  );
};

export const useRBAC = (): RBACContextType => {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
};

// Helper components for permission-based rendering
export const PermissionRequired = ({ 
  permission, 
  fallback = null,
  children 
}: { 
  permission: string; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { hasPermission } = useRBAC();
  
  return hasPermission(permission) ? <>{children}</> : <>{fallback}</>;
};

export const RoleRequired = ({ 
  role, 
  fallback = null,
  children 
}: { 
  role: UserRole | UserRole[]; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  const { currentUser } = useRBAC();
  
  if (!currentUser) return <>{fallback}</>;
  
  const roles = Array.isArray(role) ? role : [role];
  const hasRole = roles.includes(currentUser.role);
  
  return hasRole ? <>{children}</> : <>{fallback}</>;
};
