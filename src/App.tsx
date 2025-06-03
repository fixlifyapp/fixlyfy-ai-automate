
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/hooks/use-auth";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { ClientPortalAuthProvider } from "@/hooks/useClientPortalAuth";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

// Main App Pages
import Dashboard from "@/pages/Dashboard";
import JobsPage from "@/pages/JobsPage";
import JobDetailsPage from "@/pages/JobDetailsPage";
import ClientsPage from "@/pages/ClientsPage";
import FinancePage from "@/pages/FinancePage";
import ConnectPage from "@/pages/ConnectPage";
import AuthPage from "@/pages/AuthPage";
import TeamManagementPage from "@/pages/TeamManagementPage";
import SettingsPage from "@/pages/SettingsPage";
import AutomationsPage from "@/pages/AutomationsPage";

// Client Portal Pages
import PortalLoginPage from "@/pages/portal/PortalLoginPage";
import PortalDashboard from "@/pages/portal/PortalDashboard";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <Routes>
            {/* Client Portal Routes */}
            <Route path="/portal/*" element={
              <ClientPortalAuthProvider>
                <Routes>
                  <Route path="login" element={<PortalLoginPage />} />
                  <Route path="dashboard" element={<PortalDashboard />} />
                  <Route path="estimates" element={<PortalDashboard />} />
                  <Route path="estimates/:id" element={<PortalDashboard />} />
                  <Route path="invoices" element={<PortalDashboard />} />
                  <Route path="invoices/:id" element={<PortalDashboard />} />
                  <Route path="*" element={<Navigate to="/portal/login" />} />
                </Routes>
              </ClientPortalAuthProvider>
            } />
            
            {/* Main App Routes */}
            <Route path="/*" element={
              <AuthProvider>
                <RBACProvider>
                  <GlobalRealtimeProvider>
                    <Routes>
                      <Route path="/auth" element={<AuthPage />} />
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
                      <Route path="/finance" element={
                        <ProtectedRoute>
                          <FinancePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/connect" element={
                        <ProtectedRoute>
                          <ConnectPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/team" element={
                        <ProtectedRoute>
                          <TeamManagementPage />
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
                    </Routes>
                  </GlobalRealtimeProvider>
                </RBACProvider>
              </AuthProvider>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
