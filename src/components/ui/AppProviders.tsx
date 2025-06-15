
import { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';
import { ClientPortalAuthProvider } from '@/hooks/useClientPortalAuth';
import { MessageProvider } from '@/contexts/MessageContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';
import { ModalProvider } from '@/components/ui/modal-provider';

interface AppProvidersProps {
  children: ReactNode;
}

// Create a query client instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ClientPortalAuthProvider>
          <RBACProvider>
            <GlobalRealtimeProvider>
              <MessageProvider>
                <ModalProvider>
                  {children}
                </ModalProvider>
              </MessageProvider>
            </GlobalRealtimeProvider>
          </RBACProvider>
        </ClientPortalAuthProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};
