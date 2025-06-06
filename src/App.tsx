
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

const queryClient = new QueryClient();

function App() {
  return (
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
                  <ProtectedRoute>
                    <DashboardPage />
                  </ProtectedRoute>
                } />
                <Route path="/clients" element={
                  <ProtectedRoute>
                    <ClientsPage />
                  </ProtectedRoute>
                } />
                <Route path="/clients/:id" element={
                  <ProtectedRoute>
                    <ClientDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/jobs" element={
                  <ProtectedRoute>
                    <JobsPage />
                  </ProtectedRoute>
                } />
                <Route path="/jobs/:id" element={
                  <ProtectedRoute>
                    <JobDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/estimates" element={
                  <ProtectedRoute>
                    <EstimatesPage />
                  </ProtectedRoute>
                } />
                <Route path="/estimates/:id" element={
                  <ProtectedRoute>
                    <EstimateDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/invoices" element={
                  <ProtectedRoute>
                    <InvoicesPage />
                  </ProtectedRoute>
                } />
                <Route path="/invoices/:id" element={
                  <ProtectedRoute>
                    <InvoicesPage />
                  </ProtectedRoute>
                } />
                <Route path="/team" element={
                  <ProtectedRoute>
                    <TeamPage />
                  </ProtectedRoute>
                } />
                <Route path="/team/:id" element={
                  <ProtectedRoute>
                    <TeamMemberDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/connect-center" element={
                  <ProtectedRoute>
                    <ConnectCenterPageOptimized />
                  </ProtectedRoute>
                } />

                {/* Client Portal Routes */}
                <Route path="/portal/login" element={<PortalLoginPage />} />
                <Route path="/portal/access" element={<PortalAccessPage />} />
                <Route path="/portal/dashboard" element={
                  <ProtectedPortalRoute>
                    <PortalDashboardPage />
                  </ProtectedPortalRoute>
                } />
                <Route path="/portal/jobs" element={
                  <ProtectedPortalRoute>
                    <PortalJobsPage />
                  </ProtectedPortalRoute>
                } />
                <Route path="/portal/estimates" element={
                  <ProtectedPortalRoute>
                    <PortalEstimatesPage />
                  </ProtectedPortalRoute>
                } />
                <Route path="/portal/invoices" element={
                  <ProtectedPortalRoute>
                    <PortalInvoicesPage />
                  </ProtectedPortalRoute>
                } />
                <Route path="/portal/profile" element={
                  <ProtectedPortalRoute>
                    <PortalProfilePage />
                  </ProtectedPortalRoute>
                } />
              </Routes>
            </Router>
          </ClientPortalAuthProvider>
        </RBACProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
