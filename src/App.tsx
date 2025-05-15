
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import JobsPage from "./pages/JobsPage";
import JobDetailsPage from "./pages/JobDetailsPage";
import ClientsPage from "./pages/ClientsPage";
import SchedulePage from "./pages/SchedulePage";
import ReportsPage from "./pages/ReportsPage";
import SettingsPage from "./pages/SettingsPage";
import InvoicesPage from "./pages/InvoicesPage";
import InventoryPage from "./pages/InventoryPage";
import AutomationsPage from "./pages/AutomationsPage";
import MessagesPage from "./pages/MessagesPage";
import DocumentsPage from "./pages/DocumentsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/jobs" element={<JobsPage />} />
          <Route path="/jobs/:id" element={<JobDetailsPage />} />
          <Route path="/clients" element={<ClientsPage />} />
          <Route path="/schedule" element={<SchedulePage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/automations" element={<AutomationsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/documents" element={<DocumentsPage />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
