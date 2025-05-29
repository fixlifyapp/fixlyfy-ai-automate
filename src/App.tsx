
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { OnboardingModal } from "@/components/auth/OnboardingModal";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Dashboard from "@/pages/Dashboard";
import Clients from "@/pages/Clients";
import Jobs from "@/pages/Jobs";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ConnectPage from "@/pages/ConnectPage";
import SchedulePage from "@/pages/SchedulePage";
import FinancePage from "@/pages/FinancePage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import SettingsPage from "@/pages/SettingsPage";
import PhoneNumbersPage from "@/pages/PhoneNumbersPage";
import AISettingsPage from "@/pages/AISettingsPage";
import TeamPage from "@/pages/TeamPage";
import { AutomationsPage } from "@/components/automations/AutomationsPage";
import AICenterPage from "@/pages/AICenterPage";
import ConfigurationPage from "@/pages/ConfigurationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <RBACProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/clients" element={
              <ProtectedRoute>
                <Clients />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            } />
            <Route path="/jobs/:id" element={
              <ProtectedRoute>
                <JobDetailsPage />
              </ProtectedRoute>
            } />
            <Route path="/connect" element={
              <ProtectedRoute>
                <ConnectPage />
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
                <TeamPage />
              </ProtectedRoute>
            } />
            <Route path="/automations" element={
              <ProtectedRoute>
                <AutomationsPage />
              </ProtectedRoute>
            } />
            <Route path="/ai-center" element={
              <ProtectedRoute>
                <AICenterPage />
              </ProtectedRoute>
            } />
            <Route path="/configuration" element={
              <ProtectedRoute>
                <ConfigurationPage />
              </ProtectedRoute>
            } />
          </Routes>
          <OnboardingModal />
        </RBACProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
