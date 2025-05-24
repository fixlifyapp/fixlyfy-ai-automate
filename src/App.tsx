import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RBACProvider } from "@/components/auth/RBACProvider";
import DashboardPage from "./pages/DashboardPage";
import JobsPage from "./pages/JobsPage";
import ClientsPage from "./pages/ClientsPage";
import TeamPage from "./pages/TeamPage";
import SettingsPage from "./pages/SettingsPage";
import LoginPage from "./pages/LoginPage";
import AuthWrapper from "@/components/auth/AuthWrapper";
import JobDetailsPage from "./pages/JobDetailsPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import MessagesPage from "./pages/MessagesPage";
import { CallingInterface } from "@/components/connect/CallingInterface";
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
                <Route path="/login" element={<LoginPage />} />
                <Route path="/" element={<AuthWrapper><DashboardPage /></AuthWrapper>} />
                <Route path="/jobs" element={<AuthWrapper><JobsPage /></AuthWrapper>} />
                <Route path="/jobs/:id" element={<AuthWrapper><JobDetailsPage /></AuthWrapper>} />
                <Route path="/clients" element={<AuthWrapper><ClientsPage /></AuthWrapper>} />
                <Route path="/team" element={<AuthWrapper><TeamPage /></AuthWrapper>} />
                <Route path="/estimates" element={<AuthWrapper><EstimatesPage /></AuthWrapper>} />
                <Route path="/invoices" element={<AuthWrapper><InvoicesPage /></AuthWrapper>} />
                <Route path="/settings" element={<AuthWrapper><SettingsPage /></AuthWrapper>} />
                <Route path="/connect-center" element={<AuthWrapper><ConnectCenterPage /></AuthWrapper>} />
                <Route path="/messages" element={<AuthWrapper><MessagesPage /></AuthWrapper>} />
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
