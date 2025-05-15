import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  Calendar, 
  Mail, 
  Clock, 
  AlertTriangle, 
  CheckCircle,
  MoreVertical,
  Eye,
  Copy,
  Trash2,
  Plus,
  Zap
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AutomationCategory = "all" | "reminders" | "marketing" | "follow-ups" | "actions";

interface AutomationsListProps {
  category: AutomationCategory;
  onViewDetails?: (automation: AutomationType) => void;
}

type AutomationType = {
  id: string;
  name: string;
  description: string;
  category: AutomationCategory | string;
  trigger: string;
  action: string;
  status: "active" | "disabled" | "draft";
  lastRun: string | null;
  nextRun: string | null;
  icon: React.ElementType;
  runCount: number;
  successRate: number;
};

// Mock data for automations
const automationsData: AutomationType[] = [
  {
    id: "auto-1",
    name: "24h Job Reminder",
    description: "Send email reminder 24 hours before scheduled job",
    category: "reminders",
    trigger: "24 hours before job",
    action: "Send email",
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "In 3 hours",
    icon: Calendar,
    runCount: 128,
    successRate: 98
  },
  {
    id: "auto-2",
    name: "Invoice Payment Reminder",
    description: "Remind client when invoice is 3 days overdue",
    category: "reminders",
    trigger: "Invoice 3 days overdue",
    action: "Send SMS",
    status: "active",
    lastRun: "1 day ago",
    nextRun: "In 2 days",
    icon: Mail,
    runCount: 85,
    successRate: 92
  },
  {
    id: "auto-3",
    name: "Monthly Special Offer",
    description: "Send monthly promotion to clients who haven't booked in 60 days",
    category: "marketing",
    trigger: "1st of each month",
    action: "Send marketing email",
    status: "disabled",
    lastRun: "30 days ago",
    nextRun: "In 2 days",
    icon: Mail,
    runCount: 450,
    successRate: 76
  },
  {
    id: "auto-4",
    name: "Post-Service Feedback",
    description: "Request feedback 2 days after job completion",
    category: "follow-ups",
    trigger: "2 days after job completion",
    action: "Send email",
    status: "active",
    lastRun: "12 hours ago",
    nextRun: "In 5 hours",
    icon: Mail,
    runCount: 203,
    successRate: 82
  },
  {
    id: "auto-5",
    name: "Low Inventory Alert",
    description: "Notify manager when inventory falls below threshold",
    category: "actions",
    trigger: "Inventory below threshold",
    action: "Create internal notification",
    status: "active",
    lastRun: "3 days ago",
    nextRun: null,
    icon: AlertTriangle,
    runCount: 12,
    successRate: 100
  },
  {
    id: "auto-6",
    name: "Seasonal HVAC Maintenance",
    description: "Offer seasonal maintenance to past HVAC clients",
    category: "marketing",
    trigger: "April 1 and October 1",
    action: "Send email sequence",
    status: "draft",
    lastRun: null,
    nextRun: "In 45 days",
    icon: Calendar,
    runCount: 0,
    successRate: 0
  }
];

export const AutomationsList = ({ category, onViewDetails }: AutomationsListProps) => {
  const [automations, setAutomations] = useState<AutomationType[]>(
    category === "all" 
      ? automationsData 
      : automationsData.filter(a => a.category === category)
  );
  
  const toggleStatus = (id: string) => {
    setAutomations(automations.map(auto => {
      if (auto.id === id) {
        const newStatus = auto.status === "active" ? "disabled" : "active";
        return { ...auto, status: newStatus };
      }
      return auto;
    }));
  };
  
  const getStatusBadge = (status: string) => {
    switch(status) {
      case "active":
        return <Badge className="bg-fixlyfy-success">Active</Badge>;
      case "disabled":
        return <Badge variant="outline" className="text-fixlyfy-text-secondary">Disabled</Badge>;
      case "draft":
        return <Badge variant="outline" className="border-amber-500 text-amber-500">Draft</Badge>;
      default:
        return null;
    }
  };
  
  if (automations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <div className="w-16 h-16 rounded-full bg-fixlyfy/10 flex items-center justify-center mb-4">
          <Zap size={24} className="text-fixlyfy" />
        </div>
        <h3 className="text-lg font-medium mb-2">No automations found</h3>
        <p className="text-fixlyfy-text-secondary mb-6 max-w-md">
          You don't have any {category !== 'all' ? category : ''} automations set up yet. 
          Create your first automation to start saving time.
        </p>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={16} className="mr-2" /> Create Automation
        </Button>
      </div>
    );
  }
  
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Trigger</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead>Next Run</TableHead>
            <TableHead>Performance</TableHead>
            <TableHead className="w-[80px]">Active</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {automations.map((automation) => (
            <TableRow key={automation.id} className="cursor-pointer" onClick={() => onViewDetails && onViewDetails(automation)}>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center">
                  <div className="bg-fixlyfy/10 p-2 rounded mr-2">
                    <automation.icon size={14} className="text-fixlyfy" />
                  </div>
                  <div>
                    <p className="font-medium">{automation.name}</p>
                    <p className="text-xs text-fixlyfy-text-secondary">{automation.description}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Clock size={14} className="text-fixlyfy-text-secondary mr-1" />
                  <span className="text-sm">{automation.trigger}</span>
                </div>
              </TableCell>
              <TableCell>
                <div className="flex items-center">
                  <Mail size={14} className="text-fixlyfy-text-secondary mr-1" />
                  <span className="text-sm">{automation.action}</span>
                </div>
              </TableCell>
              <TableCell>{getStatusBadge(automation.status)}</TableCell>
              <TableCell>
                {automation.lastRun ? (
                  <span className="text-sm">{automation.lastRun}</span>
                ) : (
                  <span className="text-sm text-fixlyfy-text-muted">Never run</span>
                )}
              </TableCell>
              <TableCell>
                {automation.nextRun ? (
                  <span className="text-sm">{automation.nextRun}</span>
                ) : (
                  <span className="text-sm text-fixlyfy-text-muted">Not scheduled</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                {automation.runCount > 0 ? (
                  <div className="flex items-center">
                    <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden mr-2">
                      <div 
                        className="h-full bg-fixlyfy-success" 
                        style={{ width: `${automation.successRate}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-fixlyfy-text-secondary">
                      {automation.successRate}% ({automation.runCount})
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-fixlyfy-text-muted">No data</span>
                )}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Switch 
                  checked={automation.status === "active"} 
                  onCheckedChange={() => toggleStatus(automation.id)}
                  disabled={automation.status === "draft"}
                />
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="cursor-pointer" onClick={() => onViewDetails && onViewDetails(automation)}>
                      <Eye size={14} className="mr-2" /> View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      <Copy size={14} className="mr-2" /> Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer text-red-600">
                      <Trash2 size={14} className="mr-2" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

// Add the automationsData constant here 
const automationsData: AutomationType[] = [
  {
    id: "auto-1",
    name: "24h Job Reminder",
    description: "Send email reminder 24 hours before scheduled job",
    category: "reminders",
    trigger: "24 hours before job",
    action: "Send email",
    status: "active",
    lastRun: "2 hours ago",
    nextRun: "In 3 hours",
    icon: Calendar,
    runCount: 128,
    successRate: 98
  },
  {
    id: "auto-2",
    name: "Invoice Payment Reminder",
    description: "Remind client when invoice is 3 days overdue",
    category: "reminders",
    trigger: "Invoice 3 days overdue",
    action: "Send SMS",
    status: "active",
    lastRun: "1 day ago",
    nextRun: "In 2 days",
    icon: Mail,
    runCount: 85,
    successRate: 92
  },
  {
    id: "auto-3",
    name: "Monthly Special Offer",
    description: "Send monthly promotion to clients who haven't booked in 60 days",
    category: "marketing",
    trigger: "1st of each month",
    action: "Send marketing email",
    status: "disabled",
    lastRun: "30 days ago",
    nextRun: "In 2 days",
    icon: Mail,
    runCount: 450,
    successRate: 76
  },
  {
    id: "auto-4",
    name: "Post-Service Feedback",
    description: "Request feedback 2 days after job completion",
    category: "follow-ups",
    trigger: "2 days after job completion",
    action: "Send email",
    status: "active",
    lastRun: "12 hours ago",
    nextRun: "In 5 hours",
    icon: Mail,
    runCount: 203,
    successRate: 82
  },
  {
    id: "auto-5",
    name: "Low Inventory Alert",
    description: "Notify manager when inventory falls below threshold",
    category: "actions",
    trigger: "Inventory below threshold",
    action: "Create internal notification",
    status: "active",
    lastRun: "3 days ago",
    nextRun: null,
    icon: AlertTriangle,
    runCount: 12,
    successRate: 100
  },
  {
    id: "auto-6",
    name: "Seasonal HVAC Maintenance",
    description: "Offer seasonal maintenance to past HVAC clients",
    category: "marketing",
    trigger: "April 1 and October 1",
    action: "Send email sequence",
    status: "draft",
    lastRun: null,
    nextRun: "In 45 days",
    icon: Calendar,
    runCount: 0,
    successRate: 0
  }
];

// Add missing imports
import { Plus, Zap } from "lucide-react";
