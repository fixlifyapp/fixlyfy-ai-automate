
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import ClientsPage from "@/pages/ClientsPage";
import ClientDetailPage from "@/pages/ClientDetailPage";
import JobsPage from "@/pages/JobsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ConnectCenterPage from "@/pages/ConnectCenterPage";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import AISettingsPage from "@/pages/AISettingsPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import { AutomationsPage } from "@/components/automations/AutomationsPage";
import AiCenterPage from "@/pages/AiCenterPage";
import ConfigurationPage from "@/pages/ConfigurationPage";
import { useState } from "react";
import { AuthProvider } from "@/hooks/use-auth";
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
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
                  <JobsPage />
                </ProtectedRoute>
              } />
              <Route path="/jobs/:id" element={
                <ProtectedRoute>
                  <JobDetailsPage />
                </ProtectedRoute>
              } />
              <Route path="/connect" element={
                <ProtectedRoute>
                  <ConnectCenterPage />
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
              <Route path="/phone-numbers" element={
                <ProtectedRoute>
                  <PhoneNumbersPage />
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
