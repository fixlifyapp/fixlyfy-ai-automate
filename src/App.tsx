
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "@/components/ui/modal-provider";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { AuthProvider } from "@/hooks/use-auth";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import SchedulePage from "./pages/SchedulePage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ReportsPage from "./pages/ReportsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import SettingsPage from "./pages/SettingsPage";
import ProductsPage from "./pages/ProductsPage";
import FinancePage from "./pages/FinancePage";
import AiAssistantPage from "./pages/AiAssistantPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import AutomationsPage from "./pages/AutomationsPage";
import AuthPage from "./pages/AuthPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <AuthProvider>
            <RBACProvider>
              <GlobalRealtimeProvider>
                <ModalProvider>
                  <Toaster />
                  <BrowserRouter>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/schedule" element={<SchedulePage />} />
                      <Route path="/jobs" element={<JobsPage />} />
                      <Route path="/jobs/:id" element={<JobDetailsPage />} />
                      <Route path="/clients" element={<ClientsPage />} />
                      <Route path="/clients/:id" element={<ClientDetailPage />} />
                      <Route path="/products" element={<ProductsPage />} />
                      <Route path="/finance" element={<FinancePage />} />
                      <Route path="/admin/team" element={<TeamManagementPage />} />
                      <Route path="/team" element={<TeamManagementPage />} />
                      <Route path="/ai-assistant" element={<AiAssistantPage />} />
                      <Route path="/connect" element={<ConnectCenterPage />} />
                      <Route path="/automations" element={<AutomationsPage />} />
                      <Route path="/reports" element={<ReportsPage />} />
                      <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                  </BrowserRouter>
                </ModalProvider>
              </GlobalRealtimeProvider>
            </RBACProvider>
          </AuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
