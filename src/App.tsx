
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
import ProfileCompanyPage from '@/pages/ProfileCompanyPage';
import ProductsPage from '@/pages/ProductsPage';
import SchedulePage from '@/pages/SchedulePage';
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
import { AppErrorBoundary } from '@/components/ui/AppErrorBoundary';

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
    <AppErrorBoundary>
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
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <DashboardPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/clients" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ClientsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/clients/:id" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ClientDetailsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/jobs" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <JobsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/jobs/:id" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <JobDetailsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/estimates" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <EstimatesPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/estimates/:id" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <EstimateDetailsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/invoices" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <InvoicesPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/invoices/:id" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <InvoicesPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/products" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ProductsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/finance" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <FinancePage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/team" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <TeamPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/team/:id" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <TeamMemberDetailsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/settings" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/profile-company" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ProfileCompanyPage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/schedule" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <SchedulePage />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/connect" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ConnectCenterPageOptimized />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/connect-center" element={
                    <AppErrorBoundary>
                      <ProtectedRoute>
                        <ConnectCenterPageOptimized />
                      </ProtectedRoute>
                    </AppErrorBoundary>
                  } />

                  {/* Client Portal Routes */}
                  <Route path="/portal/login" element={<PortalLoginPage />} />
                  <Route path="/portal/access" element={<PortalAccessPage />} />
                  <Route path="/portal/dashboard" element={
                    <AppErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalDashboardPage />
                      </ProtectedPortalRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/portal/jobs" element={
                    <AppErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalJobsPage />
                      </ProtectedPortalRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/portal/estimates" element={
                    <AppErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalEstimatesPage />
                      </ProtectedPortalRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/portal/invoices" element={
                    <AppErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalInvoicesPage />
                      </ProtectedPortalRoute>
                    </AppErrorBoundary>
                  } />
                  <Route path="/portal/profile" element={
                    <AppErrorBoundary>
                      <ProtectedPortalRoute>
                        <PortalProfilePage />
                      </ProtectedPortalRoute>
                    </AppErrorBoundary>
                  } />
                </Routes>
              </Router>
            </ClientPortalAuthProvider>
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
