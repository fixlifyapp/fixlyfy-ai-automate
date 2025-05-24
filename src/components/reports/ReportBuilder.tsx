
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { ReportWidget } from "./ReportWidget";
import { Plus, Play, Save, Calendar } from "lucide-react";

interface Widget {
  id: string;
  type: 'chart' | 'table';
  metric: string;
  dimension?: string;
  data?: any[];
  columns?: any[];
}

export const ReportBuilder = () => {
  const [searchParams] = useSearchParams();
  const templateId = searchParams.get('templateId');
  
  const [startDate, setStartDate] = useState(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [technicianId, setTechnicianId] = useState<string>('all');
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [reportName, setReportName] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTechnicians();
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const fetchTechnicians = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, name')
      .eq('role', 'technician');
    
    setTechnicians(data || []);
  };

  const loadTemplate = () => {
    // Load default widgets based on template
    const defaultWidgets: Widget[] = [
      {
        id: 'widget-1',
        type: 'chart',
        metric: 'revenue',
        dimension: 'date'
      },
      {
        id: 'widget-2',
        type: 'table',
        metric: 'jobs',
        dimension: 'status'
      }
    ];
    setWidgets(defaultWidgets);
  };

  const addWidget = (type: 'chart' | 'table') => {
    const newWidget: Widget = {
      id: `widget-${Date.now()}`,
      type,
      metric: 'revenue',
      dimension: 'date'
    };
    setWidgets([...widgets, newWidget]);
  };

  const updateWidget = (id: string, updates: Partial<Widget>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
  };

  const runReport = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reports-run', {
        body: {
          templateId,
          filters: { 
            startDate, 
            endDate, 
            technicianId: technicianId === 'all' ? undefined : technicianId 
          },
          widgets: widgets.map(w => ({
            type: w.type,
            metric: w.metric,
            dimension: w.dimension
          }))
        }
      });

      if (error) throw error;

      // Update widgets with data
      const updatedWidgets = widgets.map((widget, index) => ({
        ...widget,
        data: data.widgets[index]?.data || [],
        columns: data.widgets[index]?.columns || []
      }));

      setWidgets(updatedWidgets);
    } catch (error) {
      console.error('Error running report:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveReport = async () => {
    if (!reportName.trim()) return;

    try {
      const { error } = await supabase
        .from('reports')
        .insert({
          name: reportName,
          template_id: templateId,
          filters: { 
            startDate, 
            endDate, 
            technicianId: technicianId === 'all' ? undefined : technicianId 
          },
          widgets: widgets.map(w => ({
            type: w.type,
            metric: w.metric,
            dimension: w.dimension
          }))
        });

      if (error) throw error;
      
      console.log('Report saved successfully');
    } catch (error) {
      console.error('Error saving report:', error);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Report Builder</h1>
        <p className="text-fixlyfy-text-secondary">Build and customize your report</p>
      </div>

      {/* Filters */}
      <Card className="p-4 mb-6">
        <h2 className="font-medium mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="technician">Technician</Label>
            <Select value={technicianId} onValueChange={setTechnicianId}>
              <SelectTrigger>
                <SelectValue placeholder="All Technicians" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Technicians</SelectItem>
                {technicians.map(tech => (
                  <SelectItem key={tech.id} value={tech.id}>
                    {tech.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button onClick={runReport} disabled={loading} className="gap-2">
              <Play size={16} />
              {loading ? 'Running...' : 'Preview'}
            </Button>
          </div>
        </div>
      </Card>

      {/* Widget Controls */}
      <Card className="p-4 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-medium">Widgets</h2>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => addWidget('chart')}>
              <Plus size={16} className="mr-1" />
              Chart
            </Button>
            <Button variant="outline" size="sm" onClick={() => addWidget('table')}>
              <Plus size={16} className="mr-1" />
              Table
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {widgets.map(widget => (
            <ReportWidget
              key={widget.id}
              widget={widget}
              onUpdate={(updates) => updateWidget(widget.id, updates)}
              onRemove={() => removeWidget(widget.id)}
            />
          ))}
        </div>
      </Card>

      {/* Save Controls */}
      <Card className="p-4">
        <h2 className="font-medium mb-4">Save Report</h2>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <Label htmlFor="reportName">Report Name</Label>
            <Input
              id="reportName"
              placeholder="Enter report name"
              value={reportName}
              onChange={(e) => setReportName(e.target.value)}
            />
          </div>
          <Button onClick={saveReport} disabled={!reportName.trim()} className="gap-2">
            <Save size={16} />
            Save Report
          </Button>
          <Button variant="outline" className="gap-2">
            <Calendar size={16} />
            Schedule
          </Button>
        </div>
      </Card>
    </div>
  );
};
