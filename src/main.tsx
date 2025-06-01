
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import { Toaster as RadixToaster } from "@/components/ui/toaster";
import { AppProviders } from "@/components/ui/AppProviders";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { MessageContextProvider } from "@/contexts/MessageContext";
import { GlobalRealtimeProvider } from "@/contexts/GlobalRealtimeProvider";

// Pages
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import Clients from "./pages/Clients";
import Schedule from "./pages/Schedule";
import Finance from "./pages/Finance";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Team from "./pages/Team";
import AISettingsPage from "./pages/AISettingsPage";
import ConnectCenterPage from "./pages/ConnectCenterPage";
import PhoneNumbersPage from "./pages/PhoneNumbersPage";
import TelnyxPage from "./pages/TelnyxPage";
import AutomationsPage from "./pages/AutomationsPage";
import ClientDetailsPage from "./pages/ClientDetailsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import TeamMemberProfilePage from "./pages/TeamMemberProfilePage";

import "./index.css";

const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AppProviders>
          <GlobalRealtimeProvider>
            <MessageContextProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
                <Route path="/jobs/:jobId" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
                <Route path="/clients" element={<ProtectedRoute><Clients /></ProtectedRoute>} />
                <Route path="/clients/:clientId" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
                <Route path="/schedule" element={<ProtectedRoute><Schedule /></ProtectedRoute>} />
                <Route path="/finance" element={<ProtectedRoute><Finance /></ProtectedRoute>} />
                <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
                <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
                <Route path="/team/:userId" element={<ProtectedRoute><TeamMemberProfilePage /></ProtectedRoute>} />
                <Route path="/ai-settings" element={<ProtectedRoute><AISettingsPage /></ProtectedRoute>} />
                <Route path="/connect-center" element={<ProtectedRoute><ConnectCenterPage /></ProtectedRoute>} />
                <Route path="/phone-numbers" element={<ProtectedRoute><PhoneNumbersPage /></ProtectedRoute>} />
                <Route path="/telnyx" element={<ProtectedRoute><TelnyxPage /></ProtectedRoute>} />
                <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
              </Routes>
              <Toaster />
              <RadixToaster />
            </MessageContextProvider>
          </GlobalRealtimeProvider>
        </AppProviders>
      </BrowserRouter>
    </QueryClientProvider>
  </StrictMode>
);
