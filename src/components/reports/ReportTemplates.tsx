
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  BarChart3, 
  PieChart, 
  LineChart, 
  Calendar, 
  DollarSign, 
  Users, 
  Wrench,
  Download,
  Eye,
  Copy,
  Edit,
  Star
} from "lucide-react";

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'financial' | 'operational' | 'customer' | 'performance';
  type: 'chart' | 'table' | 'dashboard';
  icon: React.ComponentType<{ className?: string }>;
  popular: boolean;
  widgets: string[];
  estimatedTime: string;
}

export const ReportTemplates = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const templates: ReportTemplate[] = [
    {
      id: 'revenue-analysis',
      name: 'Revenue Analysis Dashboard',
      description: 'Comprehensive revenue tracking with growth trends and forecasting',
      category: 'financial',
      type: 'dashboard',
      icon: DollarSign,
      popular: true,
      widgets: ['Revenue Trends', 'Service Breakdown', 'Monthly Comparison'],
      estimatedTime: '2 mins'
    },
    {
      id: 'technician-performance',
      name: 'Technician Performance Report',
      description: 'Track individual and team performance metrics',
      category: 'performance',
      type: 'dashboard',
      icon: Wrench,
      popular: true,
      widgets: ['Job Completion Rates', 'Customer Ratings', 'Efficiency Metrics'],
      estimatedTime: '3 mins'
    },
    {
      id: 'customer-analytics',
      name: 'Customer Analytics Suite',
      description: 'Deep dive into customer behavior and satisfaction',
      category: 'customer',
      type: 'dashboard',
      icon: Users,
      popular: false,
      widgets: ['Customer Retention', 'Satisfaction Scores', 'Repeat Business'],
      estimatedTime: '4 mins'
    },
    {
      id: 'operational-efficiency',
      name: 'Operational Efficiency',
      description: 'Monitor operational KPIs and identify bottlenecks',
      category: 'operational',
      type: 'dashboard',
      icon: BarChart3,
      popular: true,
      widgets: ['Response Times', 'Job Completion', 'Resource Utilization'],
      estimatedTime: '3 mins'
    },
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Monthly financial overview with key metrics',
      category: 'financial',
      type: 'table',
      icon: PieChart,
      popular: false,
      widgets: ['Income Statement', 'Cash Flow', 'Profit Margins'],
      estimatedTime: '2 mins'
    },
    {
      id: 'service-trends',
      name: 'Service Trends Analysis',
      description: 'Analyze service demand patterns and seasonal trends',
      category: 'operational',
      type: 'chart',
      icon: LineChart,
      popular: false,
      widgets: ['Demand Forecasting', 'Seasonal Patterns', 'Service Mix'],
      estimatedTime: '5 mins'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Templates', count: templates.length },
    { id: 'financial', name: 'Financial', count: templates.filter(t => t.category === 'financial').length },
    { id: 'operational', name: 'Operational', count: templates.filter(t => t.category === 'operational').length },
    { id: 'customer', name: 'Customer', count: templates.filter(t => t.category === 'customer').length },
    { id: 'performance', name: 'Performance', count: templates.filter(t => t.category === 'performance').length }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUseTemplate = (template: ReportTemplate) => {
    console.log('Using template:', template.id);
    // Integration with report builder would go here
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'financial': return 'bg-green-100 text-green-800';
      case 'operational': return 'bg-blue-100 text-blue-800';
      case 'customer': return 'bg-purple-100 text-purple-800';
      case 'performance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'chart': return LineChart;
      case 'table': return BarChart3;
      case 'dashboard': return PieChart;
      default: return BarChart3;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Report Templates</h2>
          <p className="text-gray-600">Choose from pre-built templates or create custom reports</p>
        </div>
        <Button>
          <Edit className="h-4 w-4 mr-2" />
          Create Custom Report
        </Button>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>
      </div>

      {/* Popular Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Popular Templates
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {templates.filter(t => t.popular).map((template) => {
            const IconComponent = template.icon;
            const TypeIcon = getTypeIcon(template.type);
            
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base">{template.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TypeIcon className="h-3 w-3" />
                            {template.type}
                          </div>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {template.estimatedTime}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-medium text-gray-500 mb-1">Includes:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.widgets.slice(0, 2).map((widget, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {widget}
                          </Badge>
                        ))}
                        {template.widgets.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.widgets.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleUseTemplate(template)}
                        className="flex-1"
                      >
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* All Templates */}
      <div>
        <h3 className="text-lg font-semibold mb-3">All Templates ({filteredTemplates.length})</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const IconComponent = template.icon;
            const TypeIcon = getTypeIcon(template.type);
            
            return (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        <IconComponent className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          {template.name}
                          {template.popular && (
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          )}
                        </CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(template.category)}>
                            {template.category}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <TypeIcon className="h-3 w-3" />
                            {template.type}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      onClick={() => handleUseTemplate(template)}
                      className="flex-1"
                    >
                      Use Template
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No templates found matching your criteria.</p>
          <Button variant="outline" className="mt-2" onClick={() => {
            setSearchTerm("");
            setSelectedCategory("all");
          }}>
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  );
};
