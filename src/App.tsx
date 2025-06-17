
import { Toaster } from "@/components/ui/sonner";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProviders } from "@/providers";
import Index from "./pages/Index";
import AuthPage from "./pages/AuthPage";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import Settings from "./pages/Settings";
import TeamManagementPage from "./pages/TeamManagementPage";
import InvoicesPage from "./pages/InvoicesPage";
import EstimatesPage from "./pages/EstimatesPage";
import FinancePage from "./pages/FinancePage";
import ReportsPage from "./pages/ReportsPage";
import AutomationsPage from "./pages/AutomationsPage";
import ClientPortal from "./pages/ClientPortal";
import SchedulePage from "./pages/SchedulePage";
import ConnectCenterPageOptimized from "./pages/ConnectCenterPageOptimized";
import AiCenterPage from "./pages/AiCenterPage";
import AnalyticsPage from "./pages/AnalyticsPage";
import { AppErrorBoundary } from "./components/ui/AppErrorBoundary";

const App = () => (
  <AppProviders>
    <Toaster />
    <BrowserRouter>
      <AppErrorBoundary>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/finance" element={<FinancePage />} />
          <Route path="/connect" element={<ConnectCenterPageOptimized />} />
          <Route path="/ai-center" element={<AiCenterPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
          <Route path="/analytics" element={<AnalyticsPage />} />
          <Route path="/team" element={<TeamManagementPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/estimates" element={<EstimatesPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/portal/:accessId" element={<ClientPortal />} />
        </Routes>
      </AppErrorBoundary>
    </BrowserRouter>
  </AppProviders>
);

export default App;
