
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
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
import AiAssistantPage from "./pages/AiAssistantPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import ReportsPage from "./pages/ReportsPage";
import AutomationsPage from "./pages/AutomationsPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import { MessageProvider } from "@/contexts/MessageContext";
import { UnifiedMessageDialog } from "@/components/messages/UnifiedMessageDialog";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <GlobalRealtimeProvider>
          <RBACProvider>
            <MessageProvider>
              <div className="min-h-screen bg-background font-sans antialiased">
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route path="/login" element={<AuthPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/:id" element={<JobDetailsPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/team" element={<TeamManagementPage />} />
                    <Route path="/admin/team" element={<TeamManagementPage />} />
                    <Route path="/admin/roles" element={<AdminRolesPage />} />
                    <Route path="/estimates" element={<EstimatesPage />} />
                    <Route path="/invoices" element={<InvoicesPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/products" element={<ProductsPage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/ai-assistant" element={<AiAssistantPage />} />
                    <Route path="/automations" element={<AutomationsPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/configuration" element={<ConfigurationPage />} />
                    <Route path="/connect" element={<ConnectCenterPage />} />
                    <Route path="/messages" element={<MessagesPage />} />
                  </Routes>
                </BrowserRouter>
                <UnifiedMessageDialog />
              </div>
            </MessageProvider>
          </RBACProvider>
        </GlobalRealtimeProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
