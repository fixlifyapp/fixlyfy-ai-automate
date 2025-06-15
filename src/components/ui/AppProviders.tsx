
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { MessageProvider } from '@/contexts/MessageContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';
import { ModalProvider } from '@/components/ui/modal-provider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RBACProvider>
          <GlobalRealtimeProvider>
            <MessageProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </MessageProvider>
          </GlobalRealtimeProvider>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
