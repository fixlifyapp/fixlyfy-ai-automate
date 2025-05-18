
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, UserRole, DEFAULT_PERMISSIONS } from './types';
import { toast } from 'sonner';

interface RBACContextType {
  currentUser: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
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

  // Enhanced permission check that properly handles wildcards
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
    
    // Admin has all permissions
    if (rolePermissions.includes('*')) return true;
    
    // Check if the user has the specific permission
    return rolePermissions.includes(permission);
  };

  // New function to check if user has a specific role or one of multiple roles
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  };

  // Use the default roles from DEFAULT_PERMISSIONS
  const defaultRoleKeys = Object.keys(DEFAULT_PERMISSIONS) as UserRole[] || [];
  const allRoles: UserRole[] = defaultRoleKeys;

  const value = {
    currentUser,
    loading,
    hasPermission,
    hasRole,
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
  const { hasRole } = useRBAC();
  
  const hasAccess = hasRole(role);
  
  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

// New component for testing pre-Supabase functionality
export const TestModeIndicator = () => {
  return process.env.NODE_ENV === 'development' ? (
    <div className="fixed bottom-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium m-2 rounded-full">
      Test Mode (No Supabase)
    </div>
  ) : null;
};
