import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import SchedulePage from "./pages/SchedulePage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";
import ReportsPage from "./pages/ReportsPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import SettingsPage from "./pages/SettingsPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import MessagesPage from "./pages/MessagesPage";
import FinancePage from "./pages/FinancePage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import DocumentsPage from "./pages/DocumentsPage";
import AutomationsPage from "./pages/AutomationsPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import AuthPage from "./pages/AuthPage";
import PreviewPage from "./pages/PreviewPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <RBACProvider>
            <GlobalRealtimeProvider>
              <Toaster />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/admin/jobs" element={<JobsPage />} />
                  <Route path="/admin/jobs/:id" element={<JobDetailsPage />} />
                  <Route path="/admin/clients" element={<ClientsPage />} />
                  <Route path="/admin/clients/:id" element={<ClientDetailPage />} />
                  <Route path="/admin/schedule" element={<SchedulePage />} />
                  <Route path="/admin/team" element={<TeamManagementPage />} />
                  <Route path="/admin/team/:id" element={<TeamMemberProfilePage />} />
                  <Route path="/admin/reports" element={<ReportsPage />} />
                  <Route path="/admin/reports/builder" element={<ReportBuilderPage />} />
                  <Route path="/admin/settings" element={<SettingsPage />} />
                  <Route path="/admin/settings/configuration" element={<ConfigurationPage />} />
                  <Route path="/admin/roles" element={<AdminRolesPage />} />
                  <Route path="/admin/connect" element={<ConnectCenterPage />} />
                  <Route path="/admin/messages" element={<MessagesPage />} />
                  <Route path="/admin/finance" element={<FinancePage />} />
                  <Route path="/admin/estimates" element={<EstimatesPage />} />
                  <Route path="/admin/invoices" element={<InvoicesPage />} />
                  <Route path="/admin/products" element={<ProductsPage />} />
                  <Route path="/admin/inventory" element={<InventoryPage />} />
                  <Route path="/admin/documents" element={<DocumentsPage />} />
                  <Route path="/admin/automations" element={<AutomationsPage />} />
                  <Route path="/admin/ai-assistant" element={<AiAssistantPage />} />
                  <Route path="/preview/:type" element={<PreviewPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </GlobalRealtimeProvider>
          </RBACProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
