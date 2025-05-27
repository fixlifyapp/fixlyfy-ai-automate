
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { MessageProvider } from '@/contexts/MessageContext';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <RBACProvider>
        <MessageProvider>
          {children}
        </MessageProvider>
      </RBACProvider>
    </AuthProvider>
  );
};
