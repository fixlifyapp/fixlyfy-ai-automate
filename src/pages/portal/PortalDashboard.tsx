
import { useEffect, useState } from 'react';
import { useClientPortalAuth } from '@/hooks/useClientPortalAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { FileText, DollarSign, Calendar, Phone, Mail, LogOut } from 'lucide-react';
import { toast } from 'sonner';

interface JobData {
  id: string;
  title: string;
  status: string;
  date: string;
  address: string;
}

interface EstimateData {
  id: string;
  estimate_number: string;
  total: number;
  status: string;
  created_at: string;
}

interface InvoiceData {
  id: string;
  invoice_number: string;
  total: number;
  status: string;
  created_at: string;
}

export default function PortalDashboard() {
  const { user, signOut } = useClientPortalAuth();
  const [jobs, setJobs] = useState<JobData[]>([]);
  const [estimates, setEstimates] = useState<EstimateData[]>([]);
  const [invoices, setInvoices] = useState<InvoiceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchClientData();
    }
  }, [user]);

  const fetchClientData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch jobs
      const { data: jobsData } = await supabase
        .from('jobs')
        .select('id, title, status, date, address')
        .eq('client_id', user.clientId)
        .order('date', { ascending: false })
        .limit(5);

      // Fetch estimates
      const { data: estimatesData } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, status, created_at')
        .in('job_id', jobsData?.map(j => j.id) || [])
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch invoices
      const { data: invoicesData } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, status, created_at')
        .in('job_id', jobsData?.map(j => j.id) || [])
        .order('created_at', { ascending: false })
        .limit(5);

      setJobs(jobsData || []);
      setEstimates(estimatesData || []);
      setInvoices(invoicesData || []);
    } catch (error) {
      console.error('Error fetching client data:', error);
      toast.error('Failed to load your data');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    window.location.href = '/portal/login';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">F</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Fixlify</h1>
                <p className="text-sm text-blue-600">Client Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-2">Welcome back, {user?.name}!</h2>
            <p className="text-blue-100 text-lg">
              Here's an overview of your projects and services with us.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
                <Calendar className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{jobs.length}</div>
                <p className="text-xs text-gray-600">Current projects</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estimates</CardTitle>
                <FileText className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{estimates.length}</div>
                <p className="text-xs text-gray-600">Recent estimates</p>
              </CardContent>
            </Card>

            <Card className="border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Invoices</CardTitle>
                <DollarSign className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{invoices.length}</div>
                <p className="text-xs text-gray-600">Recent invoices</p>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Jobs */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Recent Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {jobs.length > 0 ? (
                  <div className="space-y-4">
                    {jobs.map((job) => (
                      <div key={job.id} className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                        <div>
                          <p className="font-medium text-gray-900">{job.title}</p>
                          <p className="text-sm text-gray-600">{job.address}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          job.status === 'completed' ? 'bg-green-100 text-green-800' :
                          job.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {job.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">No recent projects</p>
                )}
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card className="border-blue-200">
              <CardHeader>
                <CardTitle className="text-blue-600">Need Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-600 mb-3">Contact Our Team</h4>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">(555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-blue-600" />
                      <span className="text-sm text-gray-600">support@fixlify.com</span>
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700">
                    <Phone className="h-4 w-4 mr-2" />
                    Call Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
