
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';

import DashboardPage from '@/pages/Dashboard';
import ClientsPage from '@/pages/ClientsPage';
import ClientDetailsPage from '@/pages/ClientDetailPage';
import JobsPage from '@/pages/JobsPage';
import JobDetailsPage from '@/pages/JobDetailsPage';
import EstimatesPage from '@/pages/EstimatesPage';
import EstimateDetailsPage from '@/pages/EstimateViewPage';
import InvoicesPage from '@/pages/InvoicesPage';
import FinancePage from '@/pages/FinancePage';
import TeamPage from '@/pages/TeamManagementPage';
import TeamMemberDetailsPage from '@/pages/TeamMemberProfilePage';
import SettingsPage from '@/pages/SettingsPage';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RBACProvider } from '@/components/auth/RBACProvider';
import { AuthProvider } from '@/hooks/use-auth';
import ConnectCenterPageOptimized from '@/pages/ConnectCenterPageOptimized';
import PortalLoginPage from '@/pages/portal/PortalLoginPage';
import PortalDashboardPage from '@/pages/portal/PortalDashboardPage';
import PortalEstimatesPage from '@/pages/portal/PortalEstimatesPage';
import PortalInvoicesPage from '@/pages/portal/PortalInvoicesPage';
import PortalProfilePage from '@/pages/portal/PortalProfilePage';
import { ProtectedPortalRoute } from '@/components/portal/ProtectedPortalRoute';
import PortalJobsPage from '@/pages/portal/PortalJobsPage';
import { ClientPortalAuthProvider } from '@/hooks/useClientPortalAuth';
import PortalAccessPage from '@/pages/portal/PortalAccessPage';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Toaster />
        <AuthProvider>
          <RBACProvider>
            <ClientPortalAuthProvider>
              <Router>
                <Routes>
                  {/* Main application routes */}
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/clients" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ClientsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/clients/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ClientDetailsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/jobs" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <JobsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/jobs/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <JobDetailsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/estimates" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <EstimatesPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/estimates/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <EstimateDetailsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/invoices" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <InvoicesPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/invoices/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <InvoicesPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/finance" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <FinancePage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/team" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <TeamPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/team/:id" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <TeamMemberDetailsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/settings" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/connect-center" element={
                    <ErrorBoundary>
                      <ProtectedRoute>
                        <ConnectCenterPageOptimized />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />

                  {/* Client Portal Routes */}
                  <Route path="/portal/login" element={<PortalLoginPage />} />
                  <Route path="/portal/access" element={<PortalAccessPage />} />
                  <Route path="/portal/dashboard" element={
                    <ErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalDashboardPage />
                      </ProtectedPortalRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/portal/jobs" element={
                    <ErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalJobsPage />
                      </ProtectedPortalRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/portal/estimates" element={
                    <ErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalEstimatesPage />
                      </ProtectedPortalRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/portal/invoices" element={
                    <ErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalInvoicesPage />
                      </ProtectedPortalRoute>
                    </ErrorBoundary>
                  } />
                  <Route path="/portal/profile" element={
                    <ErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalProfilePage />
                      </ProtectedRoute>
                    </ErrorBoundary>
                  } />
                </Routes>
              </Router>
            </ClientPortalAuthProvider>
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
