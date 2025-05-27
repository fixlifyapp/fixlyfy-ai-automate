
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProviders } from "@/components/ui/AppProviders";
import { SmartNotificationsPanel } from "@/components/ai/SmartNotificationsPanel";

const Dashboard = lazy(() => import("@/pages/Dashboard"));
const ClientsPage = lazy(() => import("@/pages/ClientsPage"));
const JobsPage = lazy(() => import("@/pages/JobsPage"));
const ClientDetailPage = lazy(() => import("@/pages/ClientDetailPage"));
const JobDetailsPage = lazy(() => import("@/pages/JobDetailsPage"));
const SchedulePage = lazy(() => import("@/pages/SchedulePage"));
const ConnectCenterPage = lazy(() => import("@/pages/ConnectCenterPage"));
const MessagesPage = lazy(() => import("@/pages/MessagesPage"));
const FinancePage = lazy(() => import("@/pages/FinancePage"));
const InvoicesPage = lazy(() => import("@/pages/InvoicesPage"));
const EstimatesPage = lazy(() => import("@/pages/EstimatesPage"));
const ProductsPage = lazy(() => import("@/pages/ProductsPage"));
const TeamManagementPage = lazy(() => import("@/pages/TeamManagementPage"));
const AutomationsPage = lazy(() => import("@/pages/AutomationsPage"));
const SettingsPage = lazy(() => import("@/pages/SettingsPage"));
const AiAssistantPage = lazy(() => import("@/pages/AiAssistantPage"));
const AnalyticsPage = lazy(() => import("@/pages/AnalyticsPage"));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <TooltipProvider>
          <Toaster />
          <BrowserRouter>
            <div className="min-h-screen bg-gray-50">
              <Suspense fallback={<div>Loading...</div>}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/clients" element={<ClientsPage />} />
                  <Route path="/clients/:id" element={<ClientDetailPage />} />
                  <Route path="/jobs" element={<JobsPage />} />
                  <Route path="/jobs/:id" element={<JobDetailsPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  <Route path="/connect" element={<ConnectCenterPage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/finance" element={<FinancePage />} />
                  <Route path="/invoices" element={<InvoicesPage />} />
                  <Route path="/estimates" element={<EstimatesPage />} />
                  <Route path="/products" element={<ProductsPage />} />
                  <Route path="/team" element={<TeamManagementPage />} />
                  <Route path="/automations" element={<AutomationsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="/ai-assistant" element={<AiAssistantPage />} />
                  <Route path="/analytics" element={<AnalyticsPage />} />
                </Routes>
              </Suspense>
              <SmartNotificationsPanel />
            </div>
          </BrowserRouter>
        </TooltipProvider>
      </AppProviders>
    </QueryClientProvider>
  );
}

export default App;
