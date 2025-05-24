
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import { MessageProvider } from "@/contexts/MessageContext";
import { AppProviders } from "@/components/ui/AppProviders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { UnifiedMessageDialog } from "@/components/messages/UnifiedMessageDialog";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import MessagesPage from "./pages/MessagesPage";
import SchedulePage from "./pages/SchedulePage";
import ProductsPage from "./pages/ProductsPage";
import FinancePage from "./pages/FinancePage";
import ReportsPage from "./pages/ReportsPage";
import AutomationsPage from "./pages/AutomationsPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalRealtimeProvider>
          <RBACProvider>
            <MessageProvider>
              <AppProviders>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/login" element={<AuthPage />} />
                      
                      {/* Protected routes */}
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
                      <Route path="/schedule" element={
                        <ProtectedRoute>
                          <SchedulePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/products" element={
                        <ProtectedRoute>
                          <ProductsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/finance" element={
                        <ProtectedRoute>
                          <FinancePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/team" element={
                        <ProtectedRoute>
                          <TeamManagementPage />
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
                      <Route path="/estimates" element={
                        <ProtectedRoute>
                          <EstimatesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/invoices" element={
                        <ProtectedRoute>
                          <InvoicesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/reports" element={
                        <ProtectedRoute>
                          <ReportsPage />
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
                      <Route path="/connect" element={
                        <ProtectedRoute>
                          <ConnectCenterPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <MessagesPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/settings" element={
                        <ProtectedRoute>
                          <SettingsPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* 404 page */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </BrowserRouter>
                  <UnifiedMessageDialog />
                </div>
              </AppProviders>
            </MessageProvider>
          </RBACProvider>
        </GlobalRealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
