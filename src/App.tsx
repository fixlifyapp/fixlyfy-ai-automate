
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider } from '@/hooks/use-auth';
import { RBACProvider } from '@/components/auth/RBACProvider';

import AuthPage from '@/pages/AuthPage';
import Dashboard from '@/pages/Dashboard';
import JobsPage from '@/pages/JobsPage';
import JobDetailsPage from '@/pages/JobDetailsPage';
import ClientsPage from '@/pages/ClientsPage';
import ClientDetailPage from '@/pages/ClientDetailPage';
import FinancePage from '@/pages/FinancePage';
import SchedulePage from '@/pages/SchedulePage';
import TeamManagementPage from '@/pages/TeamManagementPage';
import TeamMemberProfilePage from '@/pages/TeamMemberProfilePage';
import ProductsPage from '@/pages/ProductsPage';
import DocumentsPage from '@/pages/DocumentsPage';
import SettingsPage from '@/pages/SettingsPage';
import ReportsPage from '@/pages/ReportsPage';
import InvoicesPage from '@/pages/InvoicesPage';
import InventoryPage from '@/pages/InventoryPage';
import AdminRolesPage from '@/pages/AdminRolesPage';
import AutomationsPage from '@/pages/AutomationsPage';
import AiAssistantPage from '@/pages/AiAssistantPage';
import MessagesPage from '@/pages/MessagesPage';
import NotFound from '@/pages/NotFound';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import PreviewPage from '@/pages/PreviewPage';

const queryClient = new QueryClient();

function App() {
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RBACProvider>
            <Toaster richColors closeButton position="top-right" />
            <Routes>
              <Route path="/login" element={<AuthPage />} />
              <Route path="/preview" element={<PreviewPage />} />
              <Route path="/" element={
                <ProtectedRoute>
                  <Dashboard />
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
              <Route path="/clients" element={
                <ProtectedRoute>
                  <ClientsPage />
                </ProtectedRoute>
              } />
              <Route path="/clients/:id" element={
                <ProtectedRoute>
                  <ClientDetailPage />
                </ProtectedRoute>
              } />
              <Route path="/finance" element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <TeamManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/team/:id" element={
                <ProtectedRoute>
                  <TeamMemberProfilePage />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/documents" element={
                <ProtectedRoute>
                  <DocumentsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/reports" element={
                <ProtectedRoute>
                  <ReportsPage />
                </ProtectedRoute>
              } />
              <Route path="/invoices" element={
                <ProtectedRoute>
                  <InvoicesPage />
                </ProtectedRoute>
              } />
              <Route path="/inventory" element={
                <ProtectedRoute>
                  <InventoryPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/roles" element={
                <ProtectedRoute>
                  <AdminRolesPage />
                </ProtectedRoute>
              } />
              <Route path="/automations" element={
                <ProtectedRoute>
                  <AutomationsPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-assistant" element={
                <ProtectedRoute>
                  <AiAssistantPage />
                </ProtectedRoute>
              } />
              <Route path="/messages" element={
                <ProtectedRoute>
                  <MessagesPage />
                </ProtectedRoute>
              } />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RBACProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export default App;
