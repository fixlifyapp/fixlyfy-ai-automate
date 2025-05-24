
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { ModalProvider } from "@/components/ui/modal-provider";
import { RBACProvider } from "@/components/auth/RBACProvider";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";
import Index from "./pages/Index";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientDetailPage from "./pages/ClientDetailPage";
import ReportsPage from "./pages/ReportsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import SettingsPage from "./pages/SettingsPage";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
        <TooltipProvider>
          <RBACProvider>
            <GlobalRealtimeProvider>
              <ModalProvider>
                <Toaster />
                <BrowserRouter>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/jobs" element={<JobsPage />} />
                    <Route path="/jobs/:id" element={<JobDetailsPage />} />
                    <Route path="/clients" element={<ClientsPage />} />
                    <Route path="/clients/:id" element={<ClientDetailPage />} />
                    <Route path="/reports" element={<ReportsPage />} />
                    <Route path="/team" element={<TeamManagementPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                  </Routes>
                </BrowserRouter>
              </ModalProvider>
            </GlobalRealtimeProvider>
          </RBACProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
