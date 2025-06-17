
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"

import AuthPage from "@/pages/AuthPage";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import EstimatesPage from "@/pages/EstimatesPage";
import EstimateViewPage from "@/pages/EstimateViewPage";
import InvoicesPage from "@/pages/InvoicesPage";
import FinancePage from "@/pages/FinancePage";
import SchedulePage from "@/pages/SchedulePage";
import MessagesPage from "@/pages/MessagesPage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import ReportsPage from "@/pages/ReportsPage";
import ReportBuilderPage from "@/pages/ReportBuilderPage";
import AdvancedReportsPage from "@/pages/AdvancedReportsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import AdvancedDashboard from "@/pages/AdvancedDashboard";
import TeamManagementPage from "@/pages/TeamManagementPage";
import TeamMemberProfilePage from "@/pages/TeamMemberProfilePage";
import TeamCollaborationPage from "@/pages/TeamCollaborationPage";
import SettingsPage from "@/pages/SettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import AISettingsPage from "@/pages/AISettingsPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import TelnyxSettingsPage from "@/pages/TelnyxSettingsPage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import TelnyxPage from "@/pages/TelnyxPage";
import ProductsPage from "@/pages/ProductsPage";
import InventoryPage from "@/pages/InventoryPage";
import AutomationsPage from "@/pages/AutomationsPage";
import DocumentsPage from "@/pages/DocumentsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import PreviewPage from "@/pages/PreviewPage";
import AdminRolesPage from "@/pages/AdminRolesPage";
import NotFound from "@/pages/NotFound";
import { AppProviders } from "@/components/ui/AppProviders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ClientPortal from "@/pages/ClientPortal";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            {/* Public client portal route - no authentication required */}
            <Route path="/portal/:accessId" element={<ClientPortal />} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppProviders>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/jobs" element={<JobsPageOptimized />} />
                    <Route path="/jobs/:jobId" element={<JobDetailsPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/clients/:clientId" element={<ClientDetailPage />} />
                    <Route path="/estimates" element={<EstimatesPage />} />
                    <Route path="/estimates/:id" element={<EstimateViewPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                    <Route path="/connect" element={<ConnectCenterPageOptimized />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/reports/builder" element={<ReportBuilderPage />} />
                    <Route path="/reports/advanced" element={<AdvancedReportsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/advanced-dashboard" element={<AdvancedDashboard />} />
                    <Route path="/team" element={<TeamManagementPage />} />
                    <Route path="/team/:userId" element={<TeamMemberProfilePage />} />
                    <Route path="/team/collaboration" element={<TeamCollaborationPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/settings/profile" element={<ProfileCompanyPage />} />
                    <Route path="/settings/configuration" element={<ConfigurationPage />} />
                    <Route path="/settings/ai" element={<AISettingsPage />} />
                    <Route path="/settings/integrations" element={<IntegrationsPage />} />
                    <Route path="/settings/telnyx" element={<TelnyxSettingsPage />} />
                    <Route path="/phone-numbers" element={<PhoneNumbersPage />} />
                    <Route path="/telnyx" element={<TelnyxPage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/inventory" element={<InventoryPage />} />
                    <Route path="/automations" element={<AutomationsPage />} />
                    <Route path="/documents" element={<DocumentsPage />} />
                    <Route path="/ai-center" element={<AiCenterPage />} />
                    <Route path="/preview" element={<PreviewPage />} />
                    <Route path="/admin/roles" element={<AdminRolesPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </AppProviders>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
