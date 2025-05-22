
import React, { ReactNode } from 'react';
import { ModalProvider } from './modal-provider';

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ModalProvider>
      {children}
    </ModalProvider>
  );
}
