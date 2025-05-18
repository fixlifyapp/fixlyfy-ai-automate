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
  User,
  Paperclip,
  Filter,
  Copy,
  Star,
  Download,
  Undo,
  MoreHorizontal,
  Play,
  Send,
  DollarSign,
  AlertCircle,
  ShieldAlert,
  Eye,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useRBAC } from "@/components/auth/RBACProvider";
import { teamMembers } from "@/data/team";

interface JobHistoryProps {
  jobId: string;
}

interface HistoryItem {
  id: number;
  date: string;
  time: string;
  type: string;
  title: string;
  description: string;
  userId?: string;
  userName?: string;
  meta?: Record<string, any>;
  visibility?: 'all' | 'restricted';
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
  // Add state for the active filter and pinned items
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pinnedItems, setPinnedItems] = useState<number[]>([]);
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const { toast } = useToast();
  const { hasPermission, currentUser } = useRBAC();

  // Enhanced fake data with user information
  const historyItems: HistoryItem[] = [
    {
      id: 1,
      date: "May 15, 2023",
      time: "14:22",
      type: "status-change",
      title: "Job Status Changed",
      description: "Job status changed from 'Scheduled' to 'In Progress'",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 2,
      date: "May 15, 2023",
      time: "13:45",
      type: "note",
      title: "Note Added",
      description: "Technician added a note: 'HVAC unit is 8 years old and showing signs of wear. Will need to order replacement parts for the condenser.'",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 3,
      date: "May 15, 2023",
      time: "13:30",
      type: "job-created",
      title: "Job Started",
      description: "Technician Robert Smith started working on the job",
      userId: "3", // Michael Chen (technician) 
      userName: "Michael Chen"
    },
    {
      id: 4,
      date: "May 14, 2023",
      time: "09:15",
      type: "communication",
      title: "SMS Sent",
      description: "Appointment confirmation SMS sent to customer",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 5,
      date: "May 12, 2023",
      time: "11:30",
      type: "job-created",
      title: "Job Created",
      description: "Job was created and scheduled for May 15, 2023",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 6,
      date: "May 13, 2023",
      time: "10:45",
      type: "payment",
      title: "Payment Received",
      description: "Customer paid deposit of $150.00",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted',
      meta: { amount: 150, paymentMethod: 'credit_card' }
    },
    {
      id: 7,
      date: "May 12, 2023",
      time: "15:20",
      type: "estimate",
      title: "Estimate Created",
      description: "Estimate #EST-2023-1001 was created for $250.00",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 8,
      date: "May 14, 2023",
      time: "16:30",
      type: "invoice",
      title: "Invoice Generated",
      description: "Invoice #INV-2023-1001 was generated for $250.00",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted'
    },
    {
      id: 9,
      date: "May 14, 2023",
      time: "14:00",
      type: "technician",
      title: "Technician Changed",
      description: "Job reassigned from John Doe to Robert Smith",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 10,
      date: "May 13, 2023",
      time: "11:00",
      type: "attachment",
      title: "File Attached",
      description: "Technician uploaded photo-evidence.jpg",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 11,
      date: "May 16, 2023",
      time: "08:45",
      type: "status-change",
      title: "Job Status Changed",
      description: "Job status changed from 'In Progress' to 'Completed'",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 12,
      date: "May 16, 2023",
      time: "08:30",
      type: "note",
      title: "Note Added",
      description: "Technician added a note: 'Successfully replaced condenser fan motor and cleaned the evaporator coil. Unit is now functioning properly with appropriate cooling.'",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 13,
      date: "May 16, 2023",
      time: "09:15",
      type: "payment",
      title: "Payment Received",
      description: "Customer paid remaining balance of $325.99",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted',
      meta: { amount: 325.99, paymentMethod: 'check' }
    },
    {
      id: 14,
      date: "May 15, 2023",
      time: "17:05",
      type: "communication",
      title: "Call Made",
      description: "Technician called customer to discuss additional parts needed",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 15,
      date: "May 15, 2023",
      time: "16:30",
      type: "attachment",
      title: "File Attached",
      description: "Customer uploaded warranty-document.pdf",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 16,
      date: "May 15, 2023",
      time: "15:45",
      type: "estimate",
      title: "Estimate Updated",
      description: "Estimate #EST-2023-1001 was updated from $250.00 to $475.99 due to additional parts",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 17,
      date: "May 14, 2023",
      time: "13:15",
      type: "note",
      title: "Note Added",
      description: "Customer requested service to be done before noon if possible. They need to leave for work by 1:00 PM.",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 18,
      date: "May 14, 2023",
      time: "10:20",
      type: "communication",
      title: "Email Sent",
      description: "Detailed job information email sent to customer",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 19,
      date: "May 13, 2023",
      time: "09:30",
      type: "status-change",
      title: "Job Status Changed",
      description: "Job status changed from 'Pending' to 'Scheduled'",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 20,
      date: "May 13, 2023",
      time: "14:15",
      type: "invoice",
      title: "Invoice Updated",
      description: "Invoice #INV-2023-1001 updated with new line items",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted'
    },
    {
      id: 21,
      date: "May 11, 2023",
      time: "09:45",
      type: "communication",
      title: "Call Received",
      description: "Customer called about HVAC unit not cooling properly",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 22,
      date: "May 10, 2023",
      time: "16:20",
      type: "technician",
      title: "Technician Scheduled",
      description: "John Doe initially assigned to job",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 23,
      date: "May 17, 2023",
      time: "10:30",
      type: "note",
      title: "Follow-up Note",
      description: "Called customer to verify system is still operating correctly. Customer reported everything is working well.",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 24,
      date: "May 16, 2023",
      time: "15:00",
      type: "attachment",
      title: "File Attached",
      description: "Final inspection report.pdf uploaded to job",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 25,
      date: "May 17, 2023",
      time: "11:45",
      type: "status-change",
      title: "Job Status Changed",
      description: "Job status changed from 'Completed' to 'Closed'",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
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

  // Function to determine if user can see an item
  const canViewItem = (item: HistoryItem) => {
    // Admin and managers can see everything
    if (hasPermission('*') || hasPermission('jobs.view.all')) return true;
    
    // If item is restricted, only show to admin/manager/dispatcher roles
    if (item.visibility === 'restricted' && !showRestrictedItems) {
      return false;
    }
    
    // Technicians can only see their own items or general items
    if (currentUser?.role === 'technician') {
      return item.userId === currentUser?.id || !item.userId;
    }
    
    return true;
  };

  // Filter the history items based on the active filter, user role, and sort pinned items to the top
  const filteredItems = historyItems
    .filter(item => activeFilter === "all" || item.type === activeFilter)
    .filter(item => canViewItem(item))
    .sort((a, b) => {
      // Sort pinned items first
      const isPinnedA = pinnedItems.includes(a.id);
      const isPinnedB = pinnedItems.includes(b.id);
      
      if (isPinnedA && !isPinnedB) return -1;
      if (!isPinnedA && isPinnedB) return 1;
      
      // Then by date (newest first)
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case "status-change":
        return <Clock className="text-blue-500" />;
      case "note":
        return <FileText className="text-orange-500" />;
      case "job-created":
        return <Play className="text-purple-500" />;
      case "communication":
        return <MessageSquare className="text-indigo-500" />;
      case "call":
        return <Phone className="text-indigo-500" />;
      case "payment":
        return <DollarSign className="text-green-500" />;
      case "estimate":
        return <Send className="text-indigo-500" />;
      case "invoice":
        return <FileText className="text-blue-500" />;
      case "technician":
        return <User className="text-purple-500" />;
      case "attachment":
        return <Paperclip className="text-gray-500" />;
      default:
        return <Clock className="text-blue-500" />;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case "status-change":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "note":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "job-created":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "communication":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "call":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "payment":
        return "bg-green-100 text-green-700 border-green-200";
      case "estimate":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "invoice":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "technician":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "attachment":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const handlePinItem = (id: number) => {
    setPinnedItems(prev => {
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });
    
    toast({
      title: pinnedItems.includes(id) ? "Item unpinned" : "Item pinned",
      description: pinnedItems.includes(id) 
        ? "The item has been removed from pinned items." 
        : "The item will now appear at the top of the list.",
    });
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "The content has been copied to your clipboard.",
    });
  };

  const handleRevertChange = (id: number) => {
    // In a real app, this would call an API to revert the change
    toast({
      title: "Change reverted",
      description: "The change has been successfully reverted.",
    });
  };

  const handleDownload = (filename: string) => {
    // In a real app, this would download the file
    toast({
      title: "Download started",
      description: `Downloading ${filename}...`,
    });
  };

  const handleToggleRestrictedItems = () => {
    // Only admins and managers can see restricted items
    if (hasPermission('admin') || hasPermission('manager')) {
      setShowRestrictedItems(prev => !prev);
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
  
  // Simple AI insight based on the history data
  const getAiInsight = () => {
    const statusChanges = historyItems.filter(item => item.type === "status-change").length;
    const technicianChanges = historyItems.filter(item => item.type === "technician").length;
    const daysElapsed = new Set(historyItems.map(item => item.date)).size;
    
    if (statusChanges > 3) {
      return "This job has multiple status changes - may indicate scheduling issues or customer indecision.";
    }
    
    if (technicianChanges > 1) {
      return "Multiple technician reassignments detected - consider reviewing routing efficiency.";
    }

    if (daysElapsed > 6) {
      return "Job has been open for over a week - may need escalation or customer follow-up.";
    }
    
    return "Job history shows normal progression with standard completion timeframe.";
  };

  const isRestrictedView = currentUser?.role === 'technician';

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Job History</h3>
          
          <div className="flex items-center space-x-2">
            {/* Toggle for showing restricted items (admin/manager only) */}
            {(hasPermission('admin') || hasPermission('manager')) && (
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-1"
                onClick={handleToggleRestrictedItems}
              >
                {showRestrictedItems ? <EyeOff size={14} /> : <Eye size={14} />}
                {showRestrictedItems ? "Hide Restricted" : "Show Restricted"}
              </Button>
            )}
            
            {/* Role indicator */}
            {currentUser && (
              <Badge variant="outline" className="mr-2">
                <User size={14} className="mr-1" /> 
                {currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)}
              </Badge>
            )}

            <Badge variant="outline" className="mr-2">
              <Filter size={14} className="mr-1" /> 
              Filter
            </Badge>
          </div>
        </div>

        {/* Role-based access warning */}
        {isRestrictedView && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md flex items-start">
            <ShieldAlert size={16} className="text-amber-500 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-amber-700">
              You have limited access to job history. Contact your manager if you need additional information.
            </p>
          </div>
        )}

        {/* AI Insight Bar */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
          <AlertCircle size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
          <p className="text-sm text-blue-700">{getAiInsight()}</p>
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
                      <div key={item.id} className="relative group">
                        {/* Pin indicator */}
                        {pinnedItems.includes(item.id) && (
                          <div className="absolute -left-[40px] bg-amber-100 p-1 rounded-full border border-amber-200">
                            <Star size={14} className="text-amber-500" />
                          </div>
                        )}
                        
                        <div className="absolute -left-[25px] bg-white p-1 rounded-full border border-fixlyfy-border">
                          {getHistoryIcon(item.type)}
                        </div>
                        <div className="ml-2">
                          <div className="flex items-center mb-1 justify-between">
                            <div className="flex items-center">
                              <Badge className={`mr-2 ${getHistoryColor(item.type)}`}>
                                {item.title}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{item.time}</span>
                              
                              {/* User badge */}
                              {item.userName && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  <User size={12} className="mr-1" />
                                  {item.userName}
                                </Badge>
                              )}
                            </div>
                            
                            {/* Inline Actions */}
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-8 w-8"
                                      onClick={() => handlePinItem(item.id)}
                                    >
                                      <Star 
                                        size={16} 
                                        className={cn(
                                          pinnedItems.includes(item.id) 
                                            ? "fill-amber-400 text-amber-400" 
                                            : "text-muted-foreground"
                                        )} 
                                      />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    {pinnedItems.includes(item.id) ? "Unpin" : "Pin"}
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                              
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal size={16} />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem onClick={() => handleCopyToClipboard(item.description)}>
                                    <Copy size={14} className="mr-2" /> Copy
                                  </DropdownMenuItem>
                                  
                                  {item.type === "attachment" && (
                                    <DropdownMenuItem onClick={() => handleDownload(item.description.split(' ').pop() || "file.pdf")}>
                                      <Download size={14} className="mr-2" /> Download
                                    </DropdownMenuItem>
                                  )}
                                  
                                  {hasPermission('admin') && (
                                    <DropdownMenuItem onClick={() => handleRevertChange(item.id)}>
                                      <Undo size={14} className="mr-2" /> Revert
                                    </DropdownMenuItem>
                                  )}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
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
