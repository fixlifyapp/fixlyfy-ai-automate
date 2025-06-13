
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppErrorBoundary } from "@/components/ui/AppErrorBoundary";
import { AppProviders } from "@/components/ui/AppProviders";
import { AppInitializer } from "@/components/ui/AppInitializer";
import { cacheConfig } from "@/utils/cacheConfig";

// Import pages
import Index from "./pages/Index";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import SchedulePage from "./pages/SchedulePage";
import FinancePage from "./pages/FinancePage";
import ConnectPage from "./pages/ConnectPage";
import AiCenterPage from "./pages/AiCenterPage";
import AutomationsPage from "./pages/AutomationsPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import JobDetailPage from "./pages/JobDetailPage";
import EstimateViewPage from "./pages/EstimateViewPage";

// Portal pages
import { PortalLoginPage } from "./pages/portal/PortalLoginPage";
import { PortalDashboard } from "./pages/portal/PortalDashboard";
import { PortalJobs } from "./pages/portal/PortalJobs";
import { PortalEstimates } from "./pages/portal/PortalEstimates";
import { PortalInvoices } from "./pages/portal/PortalInvoices";
import { PortalProfile } from "./pages/portal/PortalProfile";

// Create query client with enhanced configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: cacheConfig.queries,
  },
});

function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <AppProviders>
            <AppInitializer>
              <BrowserRouter>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Routes>
                    {/* Main App Routes */}
                    <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    <Route path="/dashboard" element={<Index />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/:id" element={<JobDetailPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/finance" element={<FinancePage />} />
                    <Route path="/connect" element={<ConnectPage />} />
                    <Route path="/ai-center" element={<AiCenterPage />} />
                    <Route path="/automations" element={<AutomationsPage />} />
                    <Route path="/analytics" element={<AnalyticsPage />} />
                    <Route path="/team" element={<TeamPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    
                    {/* Estimate View Route */}
                    <Route path="/estimate/view/:id" element={<EstimateViewPage />} />
                    
                    {/* Client Portal Routes */}
                    <Route path="/portal/login" element={<PortalLoginPage />} />
                    <Route path="/portal/dashboard" element={<PortalDashboard />} />
                    <Route path="/portal/jobs" element={<PortalJobs />} />
                    <Route path="/portal/estimates" element={<PortalEstimates />} />
                    <Route path="/portal/invoices" element={<PortalInvoices />} />
                    <Route path="/portal/profile" element={<PortalProfile />} />
                  </Routes>
                </div>
                <Toaster />
              </BrowserRouter>
            </AppInitializer>
          </AppProviders>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
}

export default App;
