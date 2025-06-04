
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ProtectedPortalRoute } from "@/components/portal/ProtectedPortalRoute";
import Index from "@/pages/Index";
import AuthPage from "@/pages/AuthPage";
import Dashboard from "@/pages/Dashboard";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import JobsPageOptimized from "@/pages/JobsPageOptimized";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ConnectCenterPageOptimized from "@/pages/ConnectCenterPageOptimized";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import TelnyxSettingsPage from "@/pages/TelnyxSettingsPage";
import ProfileCompanyPage from "@/pages/ProfileCompanyPage";
import IntegrationsPage from "@/pages/IntegrationsPage";
import AISettingsPage from "@/pages/AISettingsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import ProductsPage from "@/pages/ProductsPage";
import { AutomationsPage } from "@/components/automations/AutomationsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import PortalLoginPage from "@/pages/portal/PortalLoginPage";
import PortalDashboardPage from "@/pages/portal/PortalDashboardPage";
import PortalEstimatesPage from "@/pages/portal/PortalEstimatesPage";
import PortalInvoicesPage from "@/pages/portal/PortalInvoicesPage";
import PortalProfilePage from "@/pages/portal/PortalProfilePage";
import { useState } from "react";
import { AppProviders } from "@/components/ui/AppProviders";

const queryClient = new QueryClient();

const App = () => {
  const [onboardingOpen, setOnboardingOpen] = useState(false);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppProviders>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<AuthPage />} />
              
              {/* Client Portal Routes */}
              <Route path="/portal/login" element={<PortalLoginPage />} />
              <Route path="/portal/dashboard" element={
                <ProtectedPortalRoute>
                  <PortalDashboardPage />
                </ProtectedPortalRoute>
              } />
              
              {/* Main App Routes */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard />
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
              <Route path="/jobs" element={
                <ProtectedRoute>
                  <JobsPageOptimized />
                </ProtectedRoute>
              } />
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/products" element={
                <ProtectedRoute>
                  <ProductsPage />
                </ProtectedRoute>
              } />
              <Route path="/connect" element={
                <ProtectedRoute>
                  <ConnectCenterPageOptimized />
                </ProtectedRoute>
              } />
              <Route path="/schedule" element={
                <ProtectedRoute>
                  <SchedulePage />
                </ProtectedRoute>
              } />
              <Route path="/finance" element={
                <ProtectedRoute>
                  <FinancePage />
                </ProtectedRoute>
              } />
              <Route path="/analytics" element={
                <ProtectedRoute>
                  <AnalyticsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings" element={
                <ProtectedRoute>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/settings/telnyx" element={
                <ProtectedRoute>
                  <TelnyxSettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/profile-company" element={
                <ProtectedRoute>
                  <ProfileCompanyPage />
                </ProtectedRoute>
              } />
              <Route path="/integrations" element={
                <ProtectedRoute>
                  <IntegrationsPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-settings" element={
                <ProtectedRoute>
                  <AISettingsPage />
                </ProtectedRoute>
              } />
              <Route path="/team" element={
                <ProtectedRoute>
                  <TeamManagementPage />
                </ProtectedRoute>
              } />
              <Route path="/automations" element={
                <ProtectedRoute>
                  <AutomationsPage />
                </ProtectedRoute>
              } />
              <Route path="/ai-center" element={
                <ProtectedRoute>
                  <AiCenterPage />
                </ProtectedRoute>
              } />
              <Route path="/configuration" element={
                <ProtectedRoute>
                  <ConfigurationPage />
                </ProtectedRoute>
              } />
            </Routes>
            <OnboardingModal open={onboardingOpen} onOpenChange={setOnboardingOpen} />
          </BrowserRouter>
        </AppProviders>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
