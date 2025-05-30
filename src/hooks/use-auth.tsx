
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("AuthProvider: Setting up auth state management");
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('AuthProvider: Auth event:', event, 'Session expires at:', session?.expires_at);
        console.log('AuthProvider: User ID:', session?.user?.id);
        
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Log auth state changes for debugging
        if (event === 'SIGNED_IN') {
          console.log('AuthProvider: User signed in successfully');
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthProvider: User signed out');
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('AuthProvider: Token refreshed');
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('AuthProvider: Error getting session:', error);
      }
      
      console.log('AuthProvider: Initial session check, expires at:', session?.expires_at);
      console.log('AuthProvider: Initial user ID:', session?.user?.id);
      
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      console.log("AuthProvider: Cleaning up auth subscription");
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log("AuthProvider: Signing out user");
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("AuthProvider: Sign out error:", error);
      } else {
        console.log("AuthProvider: Sign out successful");
      }
    } catch (error) {
      console.error("AuthProvider: Unexpected sign out error:", error);
    }
  };

  const value = {
    session,
    user,
    loading,
    signOut,
  };

  console.log("AuthProvider: Current state:", { 
    hasSession: !!session, 
    hasUser: !!user, 
    loading,
    userId: user?.id 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
