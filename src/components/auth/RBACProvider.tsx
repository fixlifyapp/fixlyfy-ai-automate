
import { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { User, UserRole, DEFAULT_PERMISSIONS } from './types';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

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
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Fetch the current authenticated user from Supabase
    const fetchCurrentUser = async () => {
      try {
        setLoading(true);
        
        // Get the current session
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Get user profile data
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (error) {
            console.error("Error fetching user profile:", error);
            // Log security event for failed profile fetch
            await supabase.rpc('log_security_event', {
              p_action: 'profile_fetch_failed',
              p_resource: 'user_profile',
              p_details: { error: error.message, user_id: session.user.id }
            });
            setCurrentUser(null);
          } else if (profile) {
            // Set the current user from profile data
            setCurrentUser({
              id: profile.id,
              name: profile.name || session.user.email?.split('@')[0] || 'User',
              email: session.user.email || 'unknown@example.com',
              role: (profile.role as UserRole) || 'technician',
              avatar: profile.avatar_url || "https://github.com/shadcn.png"
            });

            // Log successful authentication
            await supabase.rpc('log_security_event', {
              p_action: 'user_authenticated',
              p_resource: 'auth_session',
              p_details: { user_id: session.user.id, role: profile.role }
            });
          }
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in RBAC provider:", error);
        // Log security event for authentication error
        if (error instanceof Error) {
          await supabase.rpc('log_security_event', {
            p_action: 'auth_error',
            p_resource: 'rbac_provider',
            p_details: { error: error.message }
          });
        }
        setCurrentUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCurrentUser();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event);
      
      // Log authentication events
      await supabase.rpc('log_security_event', {
        p_action: `auth_${event}`,
        p_resource: 'auth_session',
        p_details: { 
          event, 
          user_id: session?.user?.id || null,
          timestamp: new Date().toISOString() 
        }
      });

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        fetchCurrentUser();
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });
    
    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Enhanced permission check that properly handles wildcards and granular permissions
  const hasPermission = (permission: string): boolean => {
    if (!currentUser) return false;
    
    const userRole = currentUser.role;
    const rolePermissions = DEFAULT_PERMISSIONS[userRole] || [];
    
    // Admin has all permissions
    if (rolePermissions.includes('*')) return true;
    
    // Check if the user has the specific permission
    if (rolePermissions.includes(permission)) return true;
    
    // Check for broader permissions (e.g., 'jobs.view.all' covers 'jobs.view.assigned')
    const permissionParts = permission.split('.');
    if (permissionParts.length > 2) {
      const broaderPermission = permissionParts.slice(0, -1).join('.') + '.all';
      if (rolePermissions.includes(broaderPermission)) return true;
    }
    
    // Check for category-level permissions
    if (permissionParts.length > 1) {
      const categoryPermission = permissionParts[0] + '.*';
      if (rolePermissions.includes(categoryPermission)) return true;
    }
    
    return false;
  };

  // Function to check if user has a specific role or one of multiple roles
  const hasRole = (role: UserRole | UserRole[]): boolean => {
    if (!currentUser) return false;
    
    if (Array.isArray(role)) {
      return role.includes(currentUser.role);
    }
    
    return currentUser.role === role;
  };

  // Get all available roles from DEFAULT_PERMISSIONS
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

// Security indicator for production
export const SecurityModeIndicator = () => {
  return process.env.NODE_ENV === 'production' ? (
    <div className="fixed bottom-0 right-0 bg-green-500 text-white px-3 py-1 text-xs font-medium m-2 rounded-full">
      Secure Mode
    </div>
  ) : (
    <div className="fixed bottom-0 right-0 bg-amber-500 text-white px-3 py-1 text-xs font-medium m-2 rounded-full">
      Development Mode
    </div>
  );
};
