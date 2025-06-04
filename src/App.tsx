
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { RBACProvider } from "./components/auth/RBACProvider";
import { SidebarProvider } from "./components/ui/sidebar";
import { ThemeProvider } from "next-themes";
import { useState } from "react";

// Layout and Auth
import MainLayout from "./components/layout/MainLayout";
import Index from "./pages/Index";

// Main pages
import { TasksPage } from "./pages/TasksPage";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import ClientFormPage from "./pages/ClientFormPage";
import MessagesPage from "./pages/MessagesPage";
import ProductsPage from "./pages/ProductsPage";
import SettingsPage from "./pages/SettingsPage";
import TeamManagementPage from "./pages/TeamManagementPage";
import EstimatesPage from "./pages/EstimatesPage";
import InvoicesPage from "./pages/InvoicesPage";
import TeamInvitePage from "./pages/TeamInvitePage";

// Public pages
import EstimateViewPage from "./pages/EstimateViewPage";
import InvoiceViewPage from "./pages/InvoiceViewPage";
import { ClientPortalAuthProvider } from "./hooks/useClientPortalAuth";

// Import analytics and automation pages
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { AutomationsPage } from "./components/automations/AutomationsPage";

function App() {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <TooltipProvider>
          <ClientPortalAuthProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                {/* Public routes */}
                <Route path="/estimate/view/:estimateNumber" element={<EstimateViewPage />} />
                <Route path="/invoice/view/:invoiceNumber" element={<InvoiceViewPage />} />
                
                {/* Protected routes */}
                <Route path="/*" element={
                  <RBACProvider>
                    <SidebarProvider>
                      <MainLayout>
                        <Routes>
                          <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
                          <Route path="/tasks" element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
                          <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
                          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
                          <Route path="/clients/:id" element={<ProtectedRoute><ClientFormPage /></ProtectedRoute>} />
                          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
                          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
                          <Route path="/estimates" element={<ProtectedRoute><EstimatesPage /></ProtectedRoute>} />
                          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
                          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                          <Route path="/team" element={<ProtectedRoute><TeamManagementPage /></ProtectedRoute>} />
                          <Route path="/team/invite/:token" element={<TeamInvitePage />} />
                          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
                          <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
                          <Route path="*" element={<Navigate to="/" replace />} />
                        </Routes>
                      </MainLayout>
                    </SidebarProvider>
                  </RBACProvider>
                } />
              </Routes>
            </BrowserRouter>
          </ClientPortalAuthProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
