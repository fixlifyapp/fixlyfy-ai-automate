
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
  
  useEffect(() => {
    // Normally would fetch the current user from an API or local storage
    // For demo purposes, we use the default admin user
    setLoading(false);
  }, []);

  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
    
    // Admin has all permissions
    if (rolePermissions.includes('*')) return true;
    
    // Check if the user has the specific permission
    return rolePermissions.includes(permission);
  };

  // Use the default roles from DEFAULT_PERMISSIONS
  const defaultRoleKeys = Object.keys(DEFAULT_PERMISSIONS) || [];
  const allRoles: UserRole[] = defaultRoleKeys;

  const value = {
    currentUser,
    loading,
    hasPermission,
    userRole: currentUser?.role || null,
    setCurrentUser,
    allRoles,
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
