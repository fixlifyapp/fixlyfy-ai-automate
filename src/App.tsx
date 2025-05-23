
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { AppProviders } from "@/components/ui/AppProviders";

import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import SchedulePage from "./pages/SchedulePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AutomationsPage from "./pages/AutomationsPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import ProductsPage from "./pages/ProductsPage";
import PreviewPage from "./pages/PreviewPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";
import FinancePage from "./pages/FinancePage";
import AiAssistantPage from "./pages/AiAssistantPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";
import ConfigurationPage from "./pages/ConfigurationPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RBACProvider>
          <AppProviders>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={
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
                <Route path="/schedule" element={
                  <ProtectedRoute>
                    <SchedulePage />
                  </ProtectedRoute>
                } />
                <Route path="/reports" element={
                  <ProtectedRoute>
                    <ReportsPage />
                  </ProtectedRoute>
                } />
                <Route path="/settings" element={
                  <ProtectedRoute>
                    <SettingsPage />
                  </ProtectedRoute>
                } />
                <Route path="/automations" element={
                  <ProtectedRoute>
                    <AutomationsPage />
                  </ProtectedRoute>
                } />
                <Route path="/connect" element={
                  <ProtectedRoute>
                    <ConnectCenterPage />
                  </ProtectedRoute>
                } />
                <Route path="/products" element={
                  <ProtectedRoute>
                    <ProductsPage />
                  </ProtectedRoute>
                } />
                <Route path="/preview/:type/:id" element={
                  <ProtectedRoute>
                    <PreviewPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/roles" element={
                  <ProtectedRoute>
                    <AdminRolesPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/team" element={
                  <ProtectedRoute>
                    <TeamManagementPage />
                  </ProtectedRoute>
                } />
                <Route path="/admin/team/:id" element={
                  <ProtectedRoute>
                    <TeamMemberProfilePage />
                  </ProtectedRoute>
                } />
                <Route path="/finance" element={
                  <ProtectedRoute>
                    <FinancePage />
                  </ProtectedRoute>
                } />
                <Route path="/ai-assistant" element={
                  <ProtectedRoute>
                    <AiAssistantPage />
                  </ProtectedRoute>
                } />
                <Route path="/configuration" element={
                  <ProtectedRoute>
                    <ConfigurationPage />
                  </ProtectedRoute>
                } />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AppProviders>
        </RBACProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
