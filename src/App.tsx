
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppProviders } from "@/components/ui/AppProviders";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";

// Import pages
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import AdvancedDashboard from "./pages/AdvancedDashboard";
import AdvancedReportsPage from "./pages/AdvancedReportsPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import SchedulePage from "./pages/SchedulePage";
import TeamManagementPage from "./pages/TeamManagementPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";
import SettingsPage from "./pages/SettingsPage";
import ConfigurationPage from "./pages/ConfigurationPage";
import EstimatesPage from "./pages/EstimatesPage";
import EstimateViewPage from "./pages/EstimateViewPage";
import InvoicesPage from "./pages/InvoicesPage";
import FinancePage from "./pages/FinancePage";
import MessagesPage from "./pages/MessagesPage";
import ReportsPage from "./pages/ReportsPage";
import ReportBuilderPage from "./pages/ReportBuilderPage";
import NotFound from "./pages/NotFound";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import DocumentsPage from "./pages/DocumentsPage";
import ProductsPage from "./pages/ProductsPage";
import InventoryPage from "./pages/InventoryPage";
import PreviewPage from "./pages/PreviewPage";
import AiAssistantPage from "./pages/AiAssistantPage";
import AutomationsPage from "./pages/AutomationsPage";
import AdminRolesPage from "./pages/AdminRolesPage";

// Portal pages
import PortalDashboardPage from "./pages/portal/PortalDashboardPage";
import PortalLoginPage from "./pages/portal/PortalLoginPage";
import PortalEstimatesPage from "./pages/portal/PortalEstimatesPage";
import PortalInvoicesPage from "./pages/portal/PortalInvoicesPage";
import PortalProfilePage from "./pages/portal/PortalProfilePage";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppProviders>
          <GlobalRealtimeProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/advanced-dashboard" element={<AdvancedDashboard />} />
                <Route path="/advanced-reports" element={<AdvancedReportsPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/clients/:id" element={<ClientDetailPage />} />
                <Route path="/schedule" element={<SchedulePage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/team/:id" element={<TeamMemberProfilePage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/configuration" element={<ConfigurationPage />} />
                <Route path="/estimates" element={<EstimatesPage />} />
                <Route path="/estimates/:id/view" element={<EstimateViewPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/finance" element={<FinancePage />} />
                <Route path="/messages" element={<MessagesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                <Route path="/reports/builder" element={<ReportBuilderPage />} />
                <Route path="/connect" element={<ConnectCenterPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/products" element={<ProductsPage />} />
                <Route path="/inventory" element={<InventoryPage />} />
                <Route path="/preview/:type/:id" element={<PreviewPage />} />
                <Route path="/ai-assistant" element={<AiAssistantPage />} />
                <Route path="/automations" element={<AutomationsPage />} />
                <Route path="/admin/roles" element={<AdminRolesPage />} />
                
                {/* Portal Routes */}
                <Route path="/portal" element={<PortalLoginPage />} />
                <Route path="/portal/dashboard" element={<PortalDashboardPage />} />
                <Route path="/portal/estimates" element={<PortalEstimatesPage />} />
                <Route path="/portal/invoices" element={<PortalInvoicesPage />} />
                <Route path="/portal/profile" element={<PortalProfilePage />} />
                
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GlobalRealtimeProvider>
        </AppProviders>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
