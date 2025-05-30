
import { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  session: any;
  user: any;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Mock user data for full access
  const mockUser = {
    id: 'mock-user-id',
    email: 'admin@fixlify.com',
    role: 'admin'
  };

  const mockSession = {
    user: mockUser,
    access_token: 'mock-token'
  };

  const signOut = async () => {
    // No-op for now
  };

  const value = {
    session: mockSession,
    user: mockUser,
    loading: false,
    signOut,
  };

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
