
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AppProviders } from './components/ui/AppProviders';
import ClientsPage from './pages/ClientsPage';
import JobsPage from './pages/JobsPage';
import EstimatesPage from './pages/EstimatesPage';
import InvoicesPage from './pages/InvoicesPage';
import ProductsPage from './pages/ProductsPage';
import AutomationsPage from './pages/AutomationsPage';
import SettingsPage from './pages/SettingsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import PhoneSettingsPage from "./pages/PhoneSettingsPage";
import ConnectCenterPage from './pages/ConnectCenterPage';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProviders>
        <Router>
          <Routes>
            <Route path="/" element={<ClientsPage />} />
            <Route path="/clients" element={<ClientsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/estimates" element={<EstimatesPage />} />
            <Route path="/invoices" element={<InvoicesPage />} />
            <Route path="/products" element={<ProductsPage />} />
            <Route path="/automations" element={<AutomationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/phone" element={<PhoneSettingsPage />} />
            <Route path="/settings/integrations" element={<IntegrationsPage />} />
            <Route path="/connect" element={<ConnectCenterPage />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Router>
      </AppProviders>
    </QueryClientProvider>
  );
}

export default App;
