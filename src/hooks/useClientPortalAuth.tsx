
// This file is no longer needed - removing client portal authentication
// The secure document viewer now uses direct token-based access
export function ClientPortalAuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function useClientPortalAuth() {
  return {
    user: null,
    loading: false,
    signIn: () => Promise.resolve({ success: false, message: 'Client portal disabled' }),
    signOut: () => Promise.resolve(),
    verifyToken: () => Promise.resolve({ success: false, message: 'Client portal disabled' })
  };
}
