
import { createContext, useContext, ReactNode, useState } from 'react';
import { User, UserRole } from './types';

interface RBACContextType {
  currentUser: User | null;
  loading: boolean;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: UserRole | UserRole[]) => boolean;
  userRole: UserRole | null;
  setCurrentUser: (user: User | null) => void;
  allRoles: UserRole[];
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const RBACProvider = ({ children }: { children: ReactNode }) => {
  // Mock admin user with full permissions
  const [currentUser] = useState<User>({
    id: 'mock-admin-id',
    name: 'Admin User',
    email: 'admin@fixlify.com',
    role: 'admin',
    avatar: "https://github.com/shadcn.png"
  });

  const hasPermission = (permission: string): boolean => {
    // Always return true - full access to everything
    return true;
  };

  const hasRole = (role: UserRole | UserRole[]): boolean => {
    // Always return true - user has all roles
    return true;
  };

  const allRoles: UserRole[] = ['admin', 'manager', 'dispatcher', 'technician'];

  const value = {
    currentUser,
    loading: false,
    hasPermission,
    hasRole,
    userRole: 'admin' as UserRole,
    setCurrentUser: () => {},
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
  children 
}: { 
  permission: string; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  // Always show content - no permission checks
  return <>{children}</>;
};

export const RoleRequired = ({ 
  children 
}: { 
  role: UserRole | UserRole[]; 
  fallback?: React.ReactNode;
  children: React.ReactNode;
}) => {
  // Always show content - no role checks
  return <>{children}</>;
};

// Security indicator for production
export const SecurityModeIndicator = () => {
  return (
    <div className="fixed bottom-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium m-2 rounded-full">
      No Auth Mode
    </div>
  );
};
