
import { ReactNode } from "react";

interface ProtectedPortalRouteProps {
  children: ReactNode;
}

export function ProtectedPortalRoute({ children }: ProtectedPortalRouteProps) {
  // Removed all authentication checks - full access
  return <>{children}</>;
}
