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
  MoreHorizontal,
  Play,
  Send,
  DollarSign,
  AlertCircle,
  ShieldAlert,
  Eye,
  EyeOff,
  Star,
  Download,
  Undo,
  ArrowRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
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
import { HistoryItem, useJobHistory } from "@/hooks/useJobHistory";

interface JobHistoryProps {
  jobId: string;
}

export const JobHistory = ({ jobId }: JobHistoryProps) => {
  // Add state for the active filter
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const { toast } = useToast();
  const { hasPermission, currentUser } = useRBAC();
  
  const {
    historyItems,
    isLoading,
    pinnedItems,
    showRestrictedItems,
    setShowRestrictedItems,
    togglePinnedItem,
    canViewItem,
    deleteHistoryItem,
    refreshHistory
  } = useJobHistory(jobId);

  // Force refresh history items when component mounts
  useEffect(() => {
    refreshHistory();
  }, []);

  // Define the filters
  const filters = [
    { value: "all", label: "All" },
    { value: "status-change", label: "Status Changes" },
    { value: "note", label: "Notes" },
    { value: "payment", label: "Payments" },
    { value: "estimate", label: "Estimates" },
    { value: "invoice", label: "Invoices" },
    { value: "estimate-conversion", label: "Estimate Conversions" },
    { value: "technician", label: "Technician" },
    { value: "attachment", label: "Attachments" },
    { value: "communication", label: "Communications" },
    { value: "message", label: "Messages" }
  ];

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
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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
      case "estimate-conversion":
        return <ArrowRight className="text-violet-500" />;
      case "invoice":
        return <Receipt className="text-blue-500" />;
      case "technician":
        return <User className="text-purple-500" />;
      case "attachment":
        return <Paperclip className="text-gray-500" />;
      case "message":
        return <MessageSquare className="text-teal-500" />;
      case "details-update":
        return <FileText className="text-amber-500" />;
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
      case "estimate-conversion":
        return "bg-violet-100 text-violet-700 border-violet-200";
      case "invoice":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "technician":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "attachment":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "message":
        return "bg-teal-100 text-teal-700 border-teal-200";
      case "details-update":
        return "bg-amber-100 text-amber-700 border-amber-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const handlePinItem = (id: string) => {
    togglePinnedItem(id);
    
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

  const handleRevertChange = (id: string) => {
    toast({
      title: "Change reverted",
      description: "The change has been successfully reverted.",
    });
  };

  const handleDownload = (filename: string) => {
    toast({
      title: "Download started",
      description: `Downloading ${filename}...`,
    });
  };

  const handleToggleRestrictedItems = () => {
    // Only admins, managers, and dispatchers can see restricted items
    if (hasPermission('admin') || hasPermission('manager') || hasPermission('jobs.view.all')) {
      setShowRestrictedItems(prev => !prev);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true
    }).format(date);
  };

  const groupHistoryByDate = () => {
    const grouped: Record<string, typeof filteredItems> = {};
    
    filteredItems.forEach(item => {
      const dateKey = formatDate(item.created_at);
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(item);
    });
    
    return grouped;
  };

  const groupedHistory = groupHistoryByDate();
  
  // Simple AI insight based on the history data
  const getAiInsight = () => {
    const statusChanges = historyItems.filter(item => item.type === "status-change").length;
    const technicianChanges = historyItems.filter(item => item.type === "technician").length;
    const daysElapsed = new Set(historyItems.map(item => formatDate(item.created_at))).size;
    
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
            {/* Toggle for showing restricted items (admin/manager/dispatcher only) */}
            {(hasPermission('admin') || hasPermission('manager') || hasPermission('jobs.view.all')) && (
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

        {/* Role-based access warning - only show to technicians */}
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
        
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Loading history data...</p>
          </div>
        ) : Object.keys(groupedHistory).length > 0 ? (
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
                              <span className="text-xs text-muted-foreground">{formatTime(item.created_at)}</span>
                              
                              {/* User badge */}
                              {item.user_name && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  <User size={12} className="mr-1" />
                                  {item.user_name}
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
                                  
                                  {item.type === "attachment" && item.meta?.filename && (
                                    <DropdownMenuItem onClick={() => handleDownload(item.meta.filename)}>
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
