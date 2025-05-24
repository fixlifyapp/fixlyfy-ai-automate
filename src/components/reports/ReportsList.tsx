
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, Users, DollarSign } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
  Finance: FileText
};

export const ReportsList = () => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

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
      setTemplates(data.templates || []);
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

  const handleRunReport = (templateId: string) => {
    navigate(`/reports/build?templateId=${templateId}`);
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
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-fixlyfy-text-secondary">Choose a report template to get started</p>
      </div>

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
    </div>
  );
};
