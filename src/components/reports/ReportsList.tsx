
import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, FileText, Users, DollarSign } from "lucide-react";

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

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('reports-templates');
      
      if (error) throw error;
      
      setTemplates(data.templates || []);
    } catch (error) {
      console.error('Error fetching report templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRunReport = (templateId: string) => {
    navigate(`/reports/build?templateId=${templateId}`);
  };

  if (loading) {
    return <div className="p-6">Loading report templates...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-fixlyfy-text-secondary">Choose a report template to get started</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const IconComponent = categoryIcons[template.category as keyof typeof categoryIcons] || FileText;
          
          return (
            <Card key={template.id} className="p-6">
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
                  {template.widgets.length} widgets
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
    </div>
  );
};
