
import React from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  // Removed all authentication checks - allowing full access
  return <>{children}</>;
};
