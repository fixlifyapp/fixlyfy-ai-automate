
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { MessageProvider } from '@/contexts/MessageContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <AuthProvider>
      <RBACProvider>
        <GlobalRealtimeProvider>
          <MessageProvider>
            {children}
          </MessageProvider>
        </GlobalRealtimeProvider>
      </RBACProvider>
    </AuthProvider>
  );
};
