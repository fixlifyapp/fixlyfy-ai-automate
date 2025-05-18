import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  FileText,
  Clock,
  CheckCircle,
  MessageSquare,
  Phone,
  Receipt,
  FileIcon,
  User,
  Paperclip,
  Filter
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface JobHistoryProps {
  jobId: string;
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
  // Add state for the active filter
  const [activeFilter, setActiveFilter] = useState<string>("all");

  // In a real app, we would fetch this data from an API
  const historyItems = [
    {
      id: 1,
      date: "May 15, 2023",
      time: "14:22",
      type: "status-change",
      title: "Job Status Changed",
      description: "Job status changed from 'Scheduled' to 'In Progress'"
    },
    {
      id: 2,
      date: "May 15, 2023",
      time: "13:45",
      type: "note",
      title: "Note Added",
      description: "Technician added a note: 'HVAC unit is 8 years old and showing signs of wear.'"
    },
    {
      id: 3,
      date: "May 15, 2023",
      time: "13:30",
      type: "status-change",
      title: "Job Started",
      description: "Technician Robert Smith started working on the job"
    },
    {
      id: 4,
      date: "May 14, 2023",
      time: "09:15",
      type: "communication",
      title: "SMS Sent",
      description: "Appointment confirmation SMS sent to customer"
    },
    {
      id: 5,
      date: "May 12, 2023",
      time: "11:30",
      type: "job-created",
      title: "Job Created",
      description: "Job was created and scheduled for May 15, 2023"
    },
    {
      id: 6,
      date: "May 13, 2023",
      time: "10:45",
      type: "payment",
      title: "Payment Received",
      description: "Customer paid deposit of $150.00"
    },
    {
      id: 7,
      date: "May 12, 2023",
      time: "15:20",
      type: "estimate",
      title: "Estimate Created",
      description: "Estimate #EST-2023-1001 was created for $250.00"
    },
    {
      id: 8,
      date: "May 14, 2023",
      time: "16:30",
      type: "invoice",
      title: "Invoice Generated",
      description: "Invoice #INV-2023-1001 was generated for $250.00"
    },
    {
      id: 9,
      date: "May 14, 2023",
      time: "14:00",
      type: "technician",
      title: "Technician Changed",
      description: "Job reassigned from John Doe to Robert Smith"
    },
    {
      id: 10,
      date: "May 13, 2023",
      time: "11:00",
      type: "attachment",
      title: "File Attached",
      description: "Technician uploaded photo-evidence.jpg"
    }
  ];

  // Define the filters
  const filters = [
    { value: "all", label: "All" },
    { value: "status-change", label: "Status Changes" },
    { value: "note", label: "Notes" },
    { value: "payment", label: "Payments" },
    { value: "estimate", label: "Estimates" },
    { value: "invoice", label: "Invoices" },
    { value: "technician", label: "Technician" },
    { value: "attachment", label: "Attachments" }
  ];

  // Filter the history items based on the active filter
  const filteredItems = historyItems.filter(item => 
    activeFilter === "all" || item.type === activeFilter
  );

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "status-change":
        return <Clock className="text-fixlyfy-info" />;
      case "note":
        return <FileText className="text-fixlyfy-warning" />;
      case "document":
        return <FileText className="text-fixlyfy-primary" />;
      case "job-created":
        return <CheckCircle className="text-fixlyfy-success" />;
      case "communication":
        return <MessageSquare className="text-fixlyfy" />;
      case "call":
        return <Phone className="text-fixlyfy-secondary" />;
      case "payment":
        return <Receipt className="text-green-500" />;
      case "estimate":
        return <FileText className="text-amber-500" />;
      case "invoice":
        return <FileText className="text-blue-500" />;
      case "technician":
        return <User className="text-fixlyfy-warning" />;
      case "attachment":
        return <Paperclip className="text-gray-500" />;
      default:
        return <Clock className="text-fixlyfy" />;
    }
  };

  const groupHistoryByDate = () => {
    const grouped: Record<string, typeof filteredItems> = {};
    
    filteredItems.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    
    return grouped;
  };

  const groupedHistory = groupHistoryByDate();

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Job History</h3>
          
          <div className="flex items-center">
            <Badge variant="outline" className="mr-2">
              <Filter size={14} className="mr-1" /> 
              Filter
            </Badge>
          </div>
        </div>

        {/* Activity Type Filters */}
        <div className="mb-6 overflow-x-auto pb-2">
          <ToggleGroup 
            type="single" 
            value={activeFilter} 
            onValueChange={(value) => value && setActiveFilter(value)}
            className="justify-start"
          >
            {filters.map(filter => (
              <ToggleGroupItem 
                key={filter.value} 
                value={filter.value}
                variant="outline"
                size="sm"
                className={`text-xs ${activeFilter === filter.value ? 'bg-fixlyfy text-white hover:bg-fixlyfy/90' : ''}`}
              >
                {filter.label}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        
        {Object.keys(groupedHistory).length > 0 ? (
          <Accordion type="multiple" className="w-full">
            {Object.entries(groupedHistory).map(([date, items], dateIndex) => (
              <AccordionItem key={date} value={date} className="border-b">
                <AccordionTrigger className="py-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-fixlyfy-bg border-fixlyfy-border text-fixlyfy">
                      {date}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{items.length} activities</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="pl-4 border-l-2 border-fixlyfy-border/30 space-y-6 py-2">
                    {items.map((item, itemIndex) => (
                      <div key={item.id} className="relative">
                        <div className="absolute -left-[25px] bg-white p-1 rounded-full border border-fixlyfy-border">
                          {getHistoryIcon(item.type)}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center mb-1">
                            <span className="text-sm font-medium">{item.title}</span>
                            <span className="ml-2 text-xs text-muted-foreground">{item.time}</span>
                          </div>
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No history entries found for this filter.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
