
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AppProviders } from './components/ui/AppProviders';
import DashboardPage from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import ClientsPage from './pages/ClientsPage';
import SettingsPage from './pages/SettingsPage';
import InvoicesPage from './pages/InvoicesPage';
import EstimatesPage from './pages/EstimatesPage';
import TeamPage from './pages/TeamManagementPage';
import LoginPage from './pages/AuthPage';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navigate } from 'react-router-dom';
import JobDetailsPage from './pages/JobDetailsPage';
import ClientDetailsPage from './pages/ClientDetailPage';
import EstimateViewPage from './pages/EstimateViewPage';
import SecureDocumentViewer from "@/pages/SecureDocumentViewer";

function App() {
  return (
    <Router>
      <Toaster />
      <AppProviders>
        <Routes>
          <Route path="/auth" element={<LoginPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/estimates" element={<ProtectedRoute><EstimatesPage /></ProtectedRoute>} />
          <Route path="/estimate/view/:id" element={<ProtectedRoute><EstimateViewPage /></ProtectedRoute>} />
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          
          {/* Secure document viewer - no authentication required */}
          <Route path="/view/:token" element={<SecureDocumentViewer />} />
          
        </Routes>
      </AppProviders>
    </Router>
  );
}

export default App;
