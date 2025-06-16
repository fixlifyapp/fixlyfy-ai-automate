
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Toaster } from '@/components/ui/sonner';
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
import SchedulePage from './pages/SchedulePage';
import FinancePage from './pages/FinancePage';
import ConnectCenterPageOptimized from './pages/ConnectCenterPageOptimized';
import AiCenterPage from './pages/AiCenterPage';
import AutomationsPage from './pages/AutomationsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import ProfileCompanyPage from './pages/ProfileCompanyPage';
import ClientPortalPage from './pages/ClientPortalPage';

// Add missing page imports
import ProductsPage from './pages/ProductsPage';
import IntegrationsPage from './pages/IntegrationsPage';
import ConfigurationPage from './pages/ConfigurationPage';
import DocumentsPage from './pages/DocumentsPage';
import InventoryPage from './pages/InventoryPage';
import MessagesPage from './pages/MessagesPage';
import ReportsPage from './pages/ReportsPage';
import PhoneNumbersPage from './pages/PhoneNumbersPage';
import AISettingsPage from './pages/AISettingsPage';
import AdminRolesPage from './pages/AdminRolesPage';
import AdvancedReportsPage from './pages/AdvancedReportsPage';
import ReportBuilderPage from './pages/ReportBuilderPage';
import TeamCollaborationPage from './pages/TeamCollaborationPage';
import TeamMemberProfilePage from './pages/TeamMemberProfilePage';
import TelnyxPage from './pages/TelnyxPage';
import TelnyxSettingsPage from './pages/TelnyxSettingsPage';
import AdvancedDashboard from './pages/AdvancedDashboard';

function App() {
  return (
    <Router>
      <Toaster />
      <AppProviders>
        <Routes>
          {/* Authentication */}
          <Route path="/auth" element={<LoginPage />} />
          
          {/* Client Portal - Public Route */}
          <Route path="/portal" element={<ClientPortalPage />} />
          
          {/* Main Dashboard Routes */}
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/dashboard/advanced" element={<ProtectedRoute><AdvancedDashboard /></ProtectedRoute>} />
          
          {/* Core Business Routes */}
          <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
          <Route path="/jobs/:id" element={<ProtectedRoute><JobDetailsPage /></ProtectedRoute>} />
          <Route path="/clients" element={<ProtectedRoute><ClientsPage /></ProtectedRoute>} />
          <Route path="/clients/:id" element={<ProtectedRoute><ClientDetailsPage /></ProtectedRoute>} />
          <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
          
          {/* Financial Routes */}
          <Route path="/finance" element={<ProtectedRoute><FinancePage /></ProtectedRoute>} />
          <Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
          <Route path="/estimates" element={<ProtectedRoute><EstimatesPage /></ProtectedRoute>} />
          <Route path="/estimate/view/:id" element={<ProtectedRoute><EstimateViewPage /></ProtectedRoute>} />
          
          {/* Products & Inventory */}
          <Route path="/products" element={<ProtectedRoute><ProductsPage /></ProtectedRoute>} />
          <Route path="/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
          
          {/* Communication & Connect Center */}
          <Route path="/connect" element={<ProtectedRoute><ConnectCenterPageOptimized /></ProtectedRoute>} />
          <Route path="/messages" element={<ProtectedRoute><MessagesPage /></ProtectedRoute>} />
          <Route path="/phone-numbers" element={<ProtectedRoute><PhoneNumbersPage /></ProtectedRoute>} />
          
          {/* AI & Automation */}
          <Route path="/ai-center" element={<ProtectedRoute><AiCenterPage /></ProtectedRoute>} />
          <Route path="/ai-settings" element={<ProtectedRoute><AISettingsPage /></ProtectedRoute>} />
          <Route path="/automations" element={<ProtectedRoute><AutomationsPage /></ProtectedRoute>} />
          
          {/* Analytics & Reports */}
          <Route path="/analytics" element={<ProtectedRoute><AnalyticsPage /></ProtectedRoute>} />
          <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
          <Route path="/reports/advanced" element={<ProtectedRoute><AdvancedReportsPage /></ProtectedRoute>} />
          <Route path="/reports/builder" element={<ProtectedRoute><ReportBuilderPage /></ProtectedRoute>} />
          
          {/* Team Management */}
          <Route path="/team" element={<ProtectedRoute><TeamPage /></ProtectedRoute>} />
          <Route path="/team/collaboration" element={<ProtectedRoute><TeamCollaborationPage /></ProtectedRoute>} />
          <Route path="/team/member/:id" element={<ProtectedRoute><TeamMemberProfilePage /></ProtectedRoute>} />
          <Route path="/admin/roles" element={<ProtectedRoute><AdminRolesPage /></ProtectedRoute>} />
          
          {/* Settings & Configuration */}
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/configuration" element={<ProtectedRoute><ConfigurationPage /></ProtectedRoute>} />
          <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
          <Route path="/profile-company" element={<ProtectedRoute><ProfileCompanyPage /></ProtectedRoute>} />
          
          {/* Documents */}
          <Route path="/documents" element={<ProtectedRoute><DocumentsPage /></ProtectedRoute>} />
          
          {/* Telnyx Integration */}
          <Route path="/telnyx" element={<ProtectedRoute><TelnyxPage /></ProtectedRoute>} />
          <Route path="/telnyx/settings" element={<ProtectedRoute><TelnyxSettingsPage /></ProtectedRoute>} />
        </Routes>
      </AppProviders>
    </Router>
  );
}

export default App;
