

import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RBACProvider } from "@/components/auth/RBACProvider";
import Dashboard from "./pages/Dashboard";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import SettingsPage from "./pages/SettingsPage";
import AuthPage from "./pages/AuthPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import EstimatesPage from "./pages/EstimatesPage.tsx";
import InvoicesPage from "./pages/InvoicesPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import MessagesPage from "./pages/MessagesPage";
import { MessageProvider } from "@/contexts/MessageContext";
import { UnifiedMessageDialog } from "@/components/messages/UnifiedMessageDialog";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RBACProvider>
        <MessageProvider>
          <div className="min-h-screen bg-background font-sans antialiased">
            <Toaster />
            <BrowserRouter>
              <Routes>
                <Route path="/login" element={<AuthPage />} />
                <Route path="/" element={<Dashboard />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailsPage />} />
                <Route path="/clients" element={<ClientsPage />} />
                <Route path="/team" element={<TeamManagementPage />} />
                <Route path="/estimates" element={<EstimatesPage />} />
                <Route path="/invoices" element={<InvoicesPage />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/connect-center" element={<ConnectCenterPage />} />
                <Route path="/messages" element={<MessagesPage />} />
              </Routes>
            </BrowserRouter>
            <UnifiedMessageDialog />
          </div>
        </MessageProvider>
      </RBACProvider>
    </QueryClientProvider>
  );
}

export default App;

