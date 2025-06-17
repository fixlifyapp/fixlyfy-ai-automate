
import { ReactNode } from 'react';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { MessageProvider } from '@/contexts/MessageContext';
import { GlobalRealtimeProvider } from '@/contexts/GlobalRealtimeProvider';
import { ModalProvider } from '@/components/ui/modal-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => {
  return (
    <RBACProvider>
      <GlobalRealtimeProvider>
        <MessageProvider>
          <ModalProvider>
            {children}
          </ModalProvider>
        </MessageProvider>
      </GlobalRealtimeProvider>
    </RBACProvider>
  );
};
