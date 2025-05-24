
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, Users, DollarSign, TrendingUp, Clock, Calculator, Globe, CheckSquare, Wrench } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ReportsFilters } from "./ReportsFilters";
import { ReportsTable } from "./ReportsTable";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  widgets: any[];
}

const categoryIcons = {
  Operations: BarChart3,
  Sales: DollarSign,
  Team: Users,
  Finance: FileText,
  Jobs: Wrench,
  Statistics: TrendingUp,
  Expenses: Calculator,
  Invoices: FileText,
  Website: Globe,
  Tasks: CheckSquare,
  Activity: Clock
};

export const ReportsList = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState<any[]>([]);
  const [reportLoading, setReportLoading] = useState(false);
  const [filters, setFilters] = useState({
    reportType: 'standard',
    jobType: 'all',
    technician: 'all',
    serviceArea: 'all',
    adGroup: 'all',
    dateRange: 'month',
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    status: 'created'
  });
  
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  useEffect(() => {
    // Auto-run report when filters change
    if (templates.length > 0) {
      runFilteredReport();
    }
  }, [filters, templates]);

  const fetchTemplates = async () => {
    try {
      console.log('Fetching report templates...');
      
      const { data, error } = await supabase.functions.invoke('reports-templates', {
        method: 'GET'
      });
      
      if (error) {
        console.error('Supabase function error:', error);
        throw error;
      }
      
      console.log('Templates received:', data);
      
      // Add more template varieties based on the reference images
      const enhancedTemplates = [
        ...(data.templates || []),
        {
          id: 'job-statistics',
          name: 'Job Statistics',
          description: 'Detailed job performance and completion metrics',
          category: 'Statistics',
          widgets: []
        },
        {
          id: 'leads-report',
          name: 'Leads Report',
          description: 'Lead generation and conversion tracking',
          category: 'Sales',
          widgets: []
        },
        {
          id: 'payments',
          name: 'Payments',
          description: 'Payment processing and transaction history',
          category: 'Finance',
          widgets: []
        },
        {
          id: 'expenses',
          name: 'Expenses',
          description: 'Business expense tracking and categorization',
          category: 'Finance',
          widgets: []
        },
        {
          id: 'tips',
          name: 'Tips',
          description: 'Tip tracking and distribution reports',
          category: 'Finance',
          widgets: []
        },
        {
          id: 'estimates',
          name: 'Estimates',
          description: 'Estimate creation and conversion tracking',
          category: 'Sales',
          widgets: []
        }
      ];
      
      setTemplates(enhancedTemplates);
    } catch (error) {
      console.error('Error fetching report templates:', error);
      toast({
        title: "Error",
        description: "Failed to load report templates. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const runFilteredReport = async () => {
    setReportLoading(true);
    try {
      // Simulate API call with filtered data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate sample data based on filters
      const sampleData = Array.from({ length: Math.floor(Math.random() * 10) + 1 }, (_, i) => ({
        job_id: `JOB-${1000 + i}`,
        closed: Math.random() > 0.5 ? 'Yes' : 'No',
        total: `$${(Math.random() * 1000).toFixed(2)}`,
        cash: `$${(Math.random() * 200).toFixed(2)}`,
        credit: `$${(Math.random() * 800).toFixed(2)}`,
        billing: 'Standard',
        tech_share: `$${(Math.random() * 100).toFixed(2)}`,
        tip_amount: `$${(Math.random() * 50).toFixed(2)}`,
        parts: `$${(Math.random() * 300).toFixed(2)}`,
        company_parts: `$${(Math.random() * 200).toFixed(2)}`,
        tech_profit: `$${(Math.random() * 150).toFixed(2)}`,
        company_profit: `$${(Math.random() * 400).toFixed(2)}`
      }));
      
      setReportData(sampleData);
    } catch (error) {
      console.error('Error running filtered report:', error);
      toast({
        title: "Error",
        description: "Failed to run report with filters.",
        variant: "destructive",
      });
    } finally {
      setReportLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleRunReport = (templateId: string) => {
    navigate(`/reports/build?templateId=${templateId}`);
  };

  const handleExport = () => {
    toast({
      title: "Export Started",
      description: "Your report is being exported...",
    });
  };

  const handleSearch = (query: string) => {
    // Implement search functionality
    console.log('Searching for:', query);
  };

  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-fixlyfy mx-auto mb-4"></div>
            <p className="text-fixlyfy-text-secondary">Loading report templates...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-fixlyfy-text-secondary">Generate and customize business reports</p>
      </div>

      {/* Enhanced Filters */}
      <Card className="p-6">
        <ReportsFilters
          filters={filters}
          onFilterChange={handleFilterChange}
          onExport={handleExport}
          onSearch={handleSearch}
        />
      </Card>

      {/* Report Results Table */}
      <ReportsTable
        data={reportData}
        loading={reportLoading}
        columns={[]}
      />

      {/* Report Templates Grid */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">Report Templates</h2>
        {templates.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No report templates available</h3>
            <p className="text-gray-500 mb-4">There was an issue loading the report templates.</p>
            <Button onClick={fetchTemplates}>Try Again</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates.map((template) => {
              const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || FileText;
              
              return (
                <Card key={template.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start mb-4">
                    <div className="bg-fixlyfy/10 p-2 rounded mr-3">
                      <IconComponent size={20} className="text-fixlyfy" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{template.name}</h3>
                      <span className="text-xs text-fixlyfy-text-secondary bg-fixlyfy/10 px-2 py-1 rounded">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-fixlyfy-text-secondary text-sm mb-4">
                    {template.description}
                  </p>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-fixlyfy-text-secondary">
                      {template.widgets?.length || 0} widgets
                    </span>
                    <Button 
                      onClick={() => handleRunReport(template.id)}
                      size="sm"
                    >
                      Run Report
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};
