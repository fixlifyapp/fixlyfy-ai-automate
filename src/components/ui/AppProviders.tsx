
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <RBACProvider>
        {children}
      </RBACProvider>
    </AuthProvider>
  );
};
