
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Clients from "./pages/Clients";
import Settings from "./pages/Settings";
import TeamSettings from "./pages/TeamSettings";
import Invoices from "./pages/Invoices";
import JobBuilder from "./pages/JobBuilder";
import Estimates from "./pages/Estimates";
import EstimateBuilder from "./pages/EstimateBuilder";
import Payments from "./pages/Payments";
import JobHistoryPage from "./pages/JobHistoryPage";
import CallRouter from "./pages/CallRouter";
import Automations from "./pages/Automations";
import Communications from "./pages/Communications";
import Reports from "./pages/Reports";
import AIAssistant from "./pages/AIAssistant";
import { AppErrorBoundary } from "./components/ui/AppErrorBoundary";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppErrorBoundary>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/jobs" element={<Jobs />} />
            <Route path="/jobs/:id" element={<JobDetails />} />
            <Route path="/jobs/:id/edit" element={<JobBuilder />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/invoices" element={<Invoices />} />
            <Route path="/estimates" element={<Estimates />} />
            <Route path="/estimates/new" element={<EstimateBuilder />} />
            <Route path="/estimates/:id/edit" element={<EstimateBuilder />} />
            <Route path="/payments" element={<Payments />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/team" element={<TeamSettings />} />
            <Route path="/job-history/:jobId" element={<JobHistoryPage />} />
            <Route path="/call-router" element={<CallRouter />} />
            <Route path="/automations" element={<Automations />} />
            <Route path="/communications" element={<Communications />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/ai-assistant" element={<AIAssistant />} />
          </Routes>
        </AppErrorBoundary>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
