
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  X, 
  BarChart3, 
  PieChart, 
  LineChart, 
  Table,
  Calendar,
  Filter,
  Settings,
  Eye,
  Save
} from "lucide-react";

interface ReportWidget {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'kpi';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataSource: string;
  filters: any[];
  dimensions: string[];
  metrics: string[];
  position: { x: number; y: number; width: number; height: number };
}

export const CustomReportBuilder = () => {
  const [reportName, setReportName] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [widgets, setWidgets] = useState<ReportWidget[]>([]);
  const [selectedWidget, setSelectedWidget] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("design");

  const dataSources = [
    { id: 'jobs', name: 'Jobs', tables: ['jobs', 'job_status', 'job_types'] },
    { id: 'clients', name: 'Clients', tables: ['clients', 'client_properties'] },
    { id: 'financials', name: 'Financials', tables: ['invoices', 'payments', 'estimates'] },
    { id: 'team', name: 'Team', tables: ['profiles', 'technicians'] }
  ];

  const availableMetrics = [
    { id: 'revenue', name: 'Revenue', type: 'currency' },
    { id: 'job_count', name: 'Job Count', type: 'number' },
    { id: 'completion_rate', name: 'Completion Rate', type: 'percentage' },
    { id: 'response_time', name: 'Response Time', type: 'duration' },
    { id: 'customer_rating', name: 'Customer Rating', type: 'rating' }
  ];

  const availableDimensions = [
    { id: 'date', name: 'Date', type: 'date' },
    { id: 'technician', name: 'Technician', type: 'category' },
    { id: 'service_type', name: 'Service Type', type: 'category' },
    { id: 'client_type', name: 'Client Type', type: 'category' },
    { id: 'region', name: 'Region', type: 'category' }
  ];

  const addWidget = (type: ReportWidget['type']) => {
    const newWidget: ReportWidget = {
      id: `widget-${Date.now()}`,
      type,
      chartType: type === 'chart' ? 'bar' : undefined,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      dataSource: 'jobs',
      filters: [],
      dimensions: [],
      metrics: [],
      position: { x: 0, y: widgets.length * 300, width: 6, height: 4 }
    };
    setWidgets([...widgets, newWidget]);
    setSelectedWidget(newWidget.id);
  };

  const updateWidget = (id: string, updates: Partial<ReportWidget>) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, ...updates } : w));
  };

  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(w => w.id !== id));
    if (selectedWidget === id) {
      setSelectedWidget(null);
    }
  };

  const selectedWidgetData = selectedWidget ? widgets.find(w => w.id === selectedWidget) : null;

  const getWidgetIcon = (type: string, chartType?: string) => {
    if (type === 'chart') {
      switch (chartType) {
        case 'bar': return BarChart3;
        case 'line': return LineChart;
        case 'pie': return PieChart;
        default: return BarChart3;
      }
    }
    return type === 'table' ? Table : BarChart3;
  };

  const saveReport = () => {
    const reportData = {
      name: reportName,
      description: reportDescription,
      widgets,
      createdAt: new Date().toISOString()
    };
    console.log('Saving report:', reportData);
    // Integration with backend would go here
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <h1 className="text-xl font-semibold">Custom Report Builder</h1>
              <p className="text-sm text-gray-600">Create custom reports and dashboards</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button size="sm" onClick={saveReport}>
              <Save className="h-4 w-4 mr-2" />
              Save Report
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Content */}
        <div className="flex-1 p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="design" className="mt-6">
              <div className="space-y-6">
                {/* Report Info */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="report-name">Report Name</Label>
                      <Input
                        id="report-name"
                        value={reportName}
                        onChange={(e) => setReportName(e.target.value)}
                        placeholder="Enter report name..."
                      />
                    </div>
                    <div>
                      <Label htmlFor="report-description">Description</Label>
                      <Textarea
                        id="report-description"
                        value={reportDescription}
                        onChange={(e) => setReportDescription(e.target.value)}
                        placeholder="Describe your report..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Widget Toolbar */}
                <Card>
                  <CardHeader>
                    <CardTitle>Add Widgets</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWidget('chart')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Chart
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWidget('table')}
                      >
                        <Table className="h-4 w-4 mr-2" />
                        Table
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWidget('kpi')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        KPI Card
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => addWidget('metric')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        Metric
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Widgets List */}
                <Card>
                  <CardHeader>
                    <CardTitle>Report Widgets ({widgets.length})</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {widgets.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <p>No widgets added yet.</p>
                        <p className="text-sm">Add widgets to start building your report.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {widgets.map((widget) => {
                          const IconComponent = getWidgetIcon(widget.type, widget.chartType);
                          
                          return (
                            <div
                              key={widget.id}
                              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                                selectedWidget === widget.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                              }`}
                              onClick={() => setSelectedWidget(widget.id)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <IconComponent className="h-4 w-4 text-gray-600" />
                                  <div>
                                    <p className="font-medium">{widget.title}</p>
                                    <div className="flex items-center gap-2">
                                      <Badge variant="outline">{widget.type}</Badge>
                                      {widget.chartType && (
                                        <Badge variant="outline">{widget.chartType}</Badge>
                                      )}
                                      <span className="text-xs text-gray-500">
                                        {widget.metrics.length} metrics, {widget.dimensions.length} dimensions
                                      </span>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    removeWidget(widget.id);
                                  }}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="data" className="mt-6">
              {selectedWidgetData ? (
                <Card>
                  <CardHeader>
                    <CardTitle>Configure: {selectedWidgetData.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label>Widget Title</Label>
                      <Input
                        value={selectedWidgetData.title}
                        onChange={(e) => updateWidget(selectedWidgetData.id, { title: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label>Data Source</Label>
                      <Select
                        value={selectedWidgetData.dataSource}
                        onValueChange={(value) => updateWidget(selectedWidgetData.id, { dataSource: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {dataSources.map((source) => (
                            <SelectItem key={source.id} value={source.id}>
                              {source.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {selectedWidgetData.type === 'chart' && (
                      <div>
                        <Label>Chart Type</Label>
                        <Select
                          value={selectedWidgetData.chartType || 'bar'}
                          onValueChange={(value) => updateWidget(selectedWidgetData.id, { chartType: value as any })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bar">Bar Chart</SelectItem>
                            <SelectItem value="line">Line Chart</SelectItem>
                            <SelectItem value="pie">Pie Chart</SelectItem>
                            <SelectItem value="area">Area Chart</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    <div>
                      <Label>Metrics</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableMetrics.map((metric) => (
                          <div key={metric.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedWidgetData.metrics.includes(metric.id)}
                              onChange={(e) => {
                                const metrics = e.target.checked
                                  ? [...selectedWidgetData.metrics, metric.id]
                                  : selectedWidgetData.metrics.filter(m => m !== metric.id);
                                updateWidget(selectedWidgetData.id, { metrics });
                              }}
                            />
                            <Label className="text-sm">{metric.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label>Dimensions</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {availableDimensions.map((dimension) => (
                          <div key={dimension.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedWidgetData.dimensions.includes(dimension.id)}
                              onChange={(e) => {
                                const dimensions = e.target.checked
                                  ? [...selectedWidgetData.dimensions, dimension.id]
                                  : selectedWidgetData.dimensions.filter(d => d !== dimension.id);
                                updateWidget(selectedWidgetData.id, { dimensions });
                              }}
                            />
                            <Label className="text-sm">{dimension.name}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <p className="text-gray-500">Select a widget to configure its data settings.</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="filters" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Filters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600">Add filters to control data across all widgets</p>
                      <Button size="sm" variant="outline">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Filter
                      </Button>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                      <Filter className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p>No filters configured yet.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="preview" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Report Preview</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    <Eye className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                    <p>Preview functionality coming soon.</p>
                    <p className="text-sm">Add widgets and configure data to see preview.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Widget Properties */}
        {selectedWidgetData && (
          <div className="w-80 border-l bg-gray-50 p-4">
            <h3 className="font-medium mb-4">Widget Properties</h3>
            <div className="space-y-4">
              <div>
                <Label className="text-xs">Position & Size</Label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  <div>
                    <Label className="text-xs text-gray-500">Width</Label>
                    <Input size="sm" value={selectedWidgetData.position.width} />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-500">Height</Label>
                    <Input size="sm" value={selectedWidgetData.position.height} />
                  </div>
                </div>
              </div>
              
              <div>
                <Label className="text-xs">Styling</Label>
                <div className="space-y-2 mt-1">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Settings className="h-3 w-3 mr-2" />
                    Style Options
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
