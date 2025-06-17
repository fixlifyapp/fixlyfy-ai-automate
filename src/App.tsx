
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

// Wrapper component for protected routes with providers
const ProtectedRouteWithProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ProtectedRoute>
      <AppProviders>
        {children}
      </AppProviders>
    </ProtectedRoute>
  );
};

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
            
            {/* Protected routes */}
            <Route path="/" element={<ProtectedRouteWithProviders><Index /></ProtectedRouteWithProviders>} />
            <Route path="/dashboard" element={<ProtectedRouteWithProviders><Dashboard /></ProtectedRouteWithProviders>} />
            <Route path="/jobs" element={<ProtectedRouteWithProviders><JobsPageOptimized /></ProtectedRouteWithProviders>} />
            <Route path="/jobs/:jobId" element={<ProtectedRouteWithProviders><JobDetailsPage /></ProtectedRouteWithProviders>} />
            <Route path="/clients" element={<ProtectedRouteWithProviders><ClientsPage /></ProtectedRouteWithProviders>} />
            <Route path="/clients/:clientId" element={<ProtectedRouteWithProviders><ClientDetailPage /></ProtectedRouteWithProviders>} />
            <Route path="/estimates" element={<ProtectedRouteWithProviders><EstimatesPage /></ProtectedRouteWithProviders>} />
            <Route path="/estimates/:id" element={<ProtectedRouteWithProviders><EstimateViewPage /></ProtectedRouteWithProviders>} />
            <Route path="/invoices" element={<ProtectedRouteWithProviders><InvoicesPage /></ProtectedRouteWithProviders>} />
            <Route path="/finance" element={<ProtectedRouteWithProviders><FinancePage /></ProtectedRouteWithProviders>} />
            <Route path="/schedule" element={<ProtectedRouteWithProviders><SchedulePage /></ProtectedRouteWithProviders>} />
            <Route path="/messages" element={<ProtectedRouteWithProviders><MessagesPage /></ProtectedRouteWithProviders>} />
            <Route path="/connect" element={<ProtectedRouteWithProviders><ConnectCenterPageOptimized /></ProtectedRouteWithProviders>} />
            <Route path="/reports" element={<ProtectedRouteWithProviders><ReportsPage /></ProtectedRouteWithProviders>} />
            <Route path="/reports/builder" element={<ProtectedRouteWithProviders><ReportBuilderPage /></ProtectedRouteWithProviders>} />
            <Route path="/reports/advanced" element={<ProtectedRouteWithProviders><AdvancedReportsPage /></ProtectedRouteWithProviders>} />
            <Route path="/analytics" element={<ProtectedRouteWithProviders><AnalyticsPage /></ProtectedRouteWithProviders>} />
            <Route path="/advanced-dashboard" element={<ProtectedRouteWithProviders><AdvancedDashboard /></ProtectedRouteWithProviders>} />
            <Route path="/team" element={<ProtectedRouteWithProviders><TeamManagementPage /></ProtectedRouteWithProviders>} />
            <Route path="/team/:userId" element={<ProtectedRouteWithProviders><TeamMemberProfilePage /></ProtectedRouteWithProviders>} />
            <Route path="/team/collaboration" element={<ProtectedRouteWithProviders><TeamCollaborationPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings" element={<ProtectedRouteWithProviders><SettingsPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings/profile" element={<ProtectedRouteWithProviders><ProfileCompanyPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings/configuration" element={<ProtectedRouteWithProviders><ConfigurationPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings/ai" element={<ProtectedRouteWithProviders><AISettingsPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings/integrations" element={<ProtectedRouteWithProviders><IntegrationsPage /></ProtectedRouteWithProviders>} />
            <Route path="/settings/telnyx" element={<ProtectedRouteWithProviders><TelnyxSettingsPage /></ProtectedRouteWithProviders>} />
            <Route path="/phone-numbers" element={<ProtectedRouteWithProviders><PhoneNumbersPage /></ProtectedRouteWithProviders>} />
            <Route path="/telnyx" element={<ProtectedRouteWithProviders><TelnyxPage /></ProtectedRouteWithProviders>} />
            <Route path="/products" element={<ProtectedRouteWithProviders><ProductsPage /></ProtectedRouteWithProviders>} />
            <Route path="/inventory" element={<ProtectedRouteWithProviders><InventoryPage /></ProtectedRouteWithProviders>} />
            <Route path="/automations" element={<ProtectedRouteWithProviders><AutomationsPage /></ProtectedRouteWithProviders>} />
            <Route path="/documents" element={<ProtectedRouteWithProviders><DocumentsPage /></ProtectedRouteWithProviders>} />
            <Route path="/ai-center" element={<ProtectedRouteWithProviders><AiCenterPage /></ProtectedRouteWithProviders>} />
            <Route path="/preview" element={<ProtectedRouteWithProviders><PreviewPage /></ProtectedRouteWithProviders>} />
            <Route path="/admin/roles" element={<ProtectedRouteWithProviders><AdminRolesPage /></ProtectedRouteWithProviders>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
