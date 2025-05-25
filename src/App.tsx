
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/components/ui/AppProviders";
import { RBACProvider } from "@/components/auth/RBACProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import ClientsPage from "./pages/ClientsPage";
import JobsPage from "./pages/JobsPage";
import SchedulePage from "./pages/SchedulePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";
import JobDetailsPage from "./pages/JobDetailsPage";
import InvoicesPage from "./pages/InvoicesPage";
import EstimatesPage from "./pages/EstimatesPage";
import FinancePage from "./pages/FinancePage";
import MessagesPage from "./pages/MessagesPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import AutomationsPage from "./pages/AutomationsPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import AdminRolesPage from "./pages/AdminRolesPage";
import DocumentsPage from "./pages/DocumentsPage";
import InventoryPage from "./pages/InventoryPage";
import ProductsPage from "./pages/ProductsPage";
import NotFound from "./pages/NotFound";
import PreviewPage from "./pages/PreviewPage";
import EstimateViewPage from "./pages/EstimateViewPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <RBACProvider>
            <AppProviders>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/team/:id" element={<TeamMemberProfilePage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/estimates" element={<EstimatesPage />} />
                <Route path="/estimate/view/:estimateNumber" element={<EstimateViewPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/connect" element={<ConnectCenterPage />} />
                <Route path="/automations" element={<AutomationsPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/report-builder" element={<ReportBuilderPage />} />
                <Route path="/configuration" element={<ConfigurationPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/preview" element={<PreviewPage />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </AppProviders>
          </RBACProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
