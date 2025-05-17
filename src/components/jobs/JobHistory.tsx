
import { Card, CardContent } from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import {
  FileText2,
  Clock,
  FileText,
  CheckCircle,
  MessageSquare,
  Phone
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface JobHistoryProps {
  jobId: string;
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
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
    }
  ];

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "status-change":
        return <Clock className="text-fixlyfy-info" />;
      case "note":
        return <FileText2 className="text-fixlyfy-warning" />;
      case "document":
        return <FileText className="text-fixlyfy-primary" />;
      case "job-created":
        return <CheckCircle className="text-fixlyfy-success" />;
      case "communication":
        return <MessageSquare className="text-fixlyfy" />;
      case "call":
        return <Phone className="text-fixlyfy-secondary" />;
      default:
        return <Clock className="text-fixlyfy" />;
    }
  };

  const groupHistoryByDate = () => {
    const grouped: Record<string, typeof historyItems> = {};
    
    historyItems.forEach(item => {
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
        <h3 className="text-lg font-medium mb-4">Job History</h3>
        
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
      </CardContent>
    </Card>
  );
};
