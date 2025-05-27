
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Clock, 
  Mail, 
  FileText,
  Edit,
  Trash2,
  Play,
  Pause,
  Plus,
  Download,
  Users
} from "lucide-react";

export const ScheduledReports = () => {
  const [reports, setReports] = useState([
    {
      id: 1,
      name: "Daily Operations Summary",
      template: "Operational Metrics",
      frequency: "Daily",
      time: "09:00 AM",
      recipients: ["manager@company.com", "ops@company.com"],
      status: "active",
      lastRun: "2024-01-15 09:00",
      nextRun: "2024-01-16 09:00",
      format: "PDF",
      enabled: true
    },
    {
      id: 2,
      name: "Weekly Financial Report",
      template: "Financial Performance",
      frequency: "Weekly",
      time: "Monday 08:00 AM",
      recipients: ["cfo@company.com", "finance@company.com"],
      status: "active",
      lastRun: "2024-01-15 08:00",
      nextRun: "2024-01-22 08:00",
      format: "Excel",
      enabled: true
    },
    {
      id: 3,
      name: "Monthly Executive Summary",
      template: "Executive Summary",
      frequency: "Monthly",
      time: "1st Monday 10:00 AM",
      recipients: ["ceo@company.com", "board@company.com"],
      status: "active",
      lastRun: "2024-01-01 10:00",
      nextRun: "2024-02-05 10:00",
      format: "PDF",
      enabled: true
    },
    {
      id: 4,
      name: "Customer Satisfaction Review",
      template: "Customer Insights",
      frequency: "Weekly",
      time: "Friday 05:00 PM",
      recipients: ["quality@company.com"],
      status: "paused",
      lastRun: "2024-01-12 17:00",
      nextRun: "-",
      format: "PDF",
      enabled: false
    }
  ]);

  const toggleReport = (id: number) => {
    setReports(prev => prev.map(report => 
      report.id === id 
        ? { ...report, enabled: !report.enabled, status: report.enabled ? 'paused' : 'active' }
        : report
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFrequencyIcon = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return <Clock className="h-4 w-4" />;
      case 'Weekly': return <Calendar className="h-4 w-4" />;
      case 'Monthly': return <Calendar className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold">Scheduled Reports</h2>
          <p className="text-muted-foreground">Automated report generation and distribution</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Scheduled Report
        </Button>
      </div>

      {/* Active Reports */}
      <div className="space-y-4">
        {reports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-blue-600" />
                  <div>
                    <h3 className="font-semibold">{report.name}</h3>
                    <p className="text-sm text-muted-foreground">Template: {report.template}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <Switch 
                    checked={report.enabled} 
                    onCheckedChange={() => toggleReport(report.id)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-2">
                  {getFrequencyIcon(report.frequency)}
                  <div>
                    <p className="text-xs text-muted-foreground">Frequency</p>
                    <p className="text-sm font-medium">{report.frequency}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Schedule</p>
                    <p className="text-sm font-medium">{report.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Recipients</p>
                    <p className="text-sm font-medium">{report.recipients.length} people</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Download className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-xs text-muted-foreground">Format</p>
                    <p className="text-sm font-medium">{report.format}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Last Run: <span className="text-foreground">{report.lastRun}</span></p>
                </div>
                <div>
                  <p className="text-muted-foreground">Next Run: <span className="text-foreground">{report.nextRun}</span></p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button size="sm" variant="outline">
                  <Play className="h-3 w-3 mr-1" />
                  Run Now
                </Button>
                <Button size="sm" variant="outline">
                  <Edit className="h-3 w-3 mr-1" />
                  Edit Schedule
                </Button>
                <Button size="sm" variant="outline">
                  <Mail className="h-3 w-3 mr-1" />
                  Edit Recipients
                </Button>
                <Button size="sm" variant="outline">
                  <Download className="h-3 w-3 mr-1" />
                  Download Last
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                  <Trash2 className="h-3 w-3 mr-1" />
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Schedule Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Calendar className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h4 className="font-medium text-blue-900">Total Scheduled</h4>
              <p className="text-2xl font-bold text-blue-600">{reports.length}</p>
            </div>
            
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Play className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h4 className="font-medium text-green-900">Active Reports</h4>
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.enabled).length}
              </p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-purple-600" />
              <h4 className="font-medium text-purple-900">Total Recipients</h4>
              <p className="text-2xl font-bold text-purple-600">
                {new Set(reports.flatMap(r => r.recipients)).size}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
