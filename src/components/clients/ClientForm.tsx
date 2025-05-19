
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { 
  Phone, 
  Mail, 
  Building, 
  MapPin, 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  Calendar,
  CreditCard,
  Home,
  History,
  Check,
  Brain,
  MessageSquare,
  Clock,
  AlertCircle,
  TrendingUp,
  Star,
  Copy,
  MoreHorizontal,
  Play,
  Send,
  DollarSign,
  ShieldAlert,
  Eye,
  EyeOff,
  Paperclip,
  Filter,
  Undo,
  Download,
  ArrowUpRight,
  X,
  LightbulbIcon,
  Lightbulb
} from "lucide-react";
import { clients } from "@/data/clients";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAI } from "@/hooks/use-ai";

interface ClientFormProps {
  clientId?: string;
  onCreateJob?: () => void;
}

interface CreateInvoiceData {
  description: string;
  amount: string;
}

export const ClientForm = ({ clientId, onCreateJob }: ClientFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<CreateInvoiceData>({
    description: "",
    amount: ""
  });

  // States for history tab
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [pinnedItems, setPinnedItems] = useState<number[]>([]);
  const [showRestrictedItems, setShowRestrictedItems] = useState(false);
  const { generateText, isLoading: isAiLoading } = useAI({
    systemContext: "You are an AI assistant for a service business management app called Fixlyfy."
  });
  const [aiInsight, setAiInsight] = useState("Analyzing client history and data...");
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [showInsights, setShowInsights] = useState(true);
  
  useEffect(() => {
    // Simulating API fetch
    setIsLoading(true);
    
    // Find client from the mock data
    const foundClient = clients.find(c => c.id === clientId);
    
    setTimeout(() => {
      setClient(foundClient || {});
      setIsLoading(false);
      generateClientInsight(foundClient);
    }, 500);
  }, [clientId]);

  const generateClientInsight = async (client: any) => {
    if (!client) return;
    
    setIsGeneratingInsight(true);
    
    try {
      // Simulate generating an insight with the useAI hook
      setTimeout(() => {
        const insight = getSimulatedAiInsight(client);
        setAiInsight(insight);
        setIsGeneratingInsight(false);
      }, 1000);
    } catch (error) {
      setAiInsight("Unable to generate client insight at this time.");
      setIsGeneratingInsight(false);
    }
  };

  const getSimulatedAiInsight = (client: any) => {
    if (client.type === "Commercial") {
      return "This commercial client has a consistent payment history but their service frequency has decreased by 15% over the last quarter. Consider reaching out with a maintenance package offer.";
    } else {
      return "This residential client has requested services across multiple categories, showing opportunity for comprehensive home maintenance packages. Their jobs are typically scheduled within 2 days of request.";
    }
  };

  const handleSaveChanges = () => {
    // Simulate saving changes
    toast({
      title: "Changes saved",
      description: "Client information has been updated successfully.",
    });
  };

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = () => {
    // Simulate creating an invoice
    setIsInvoiceModalOpen(false);
    toast({
      title: "Invoice created",
      description: `Invoice for $${invoiceData.amount} has been created successfully.`,
    });

    // Reset form data
    setInvoiceData({
      description: "",
      amount: ""
    });
  };
  
  // Add function to navigate to job page
  const handleJobClick = (jobId: string) => {
    console.log("Navigating to job:", jobId);
    navigate(`/jobs/${jobId}`);
  };

  // Handle pinning history items
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

  // Client history data
  const historyItems = [
    {
      id: 1,
      date: "May 25, 2023",
      time: "14:30",
      type: "note",
      title: "Note Added",
      description: "Client requested to be contacted only during business hours.",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 2,
      date: "May 23, 2023",
      time: "10:15",
      type: "job-created",
      title: "Job Created",
      description: "New job created for HVAC service at client's main location.",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 3,
      date: "May 20, 2023",
      time: "16:45",
      type: "payment",
      title: "Payment Received",
      description: "Client paid invoice #INV-2023-112 for $325.00",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted',
      meta: { amount: 325, paymentMethod: 'credit_card' }
    },
    {
      id: 4,
      date: "May 18, 2023",
      time: "09:30",
      type: "communication",
      title: "Call Made",
      description: "Follow-up call about recent plumbing service satisfaction.",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 5,
      date: "May 15, 2023",
      time: "11:00",
      type: "job-created",
      title: "Job Completed",
      description: "Plumbing service completed successfully.",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 6,
      date: "April 28, 2023",
      time: "14:20",
      type: "invoice",
      title: "Invoice Created",
      description: "Invoice #INV-2023-098 created for $250.00",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson",
      visibility: 'restricted'
    },
    {
      id: 7,
      date: "April 25, 2023",
      time: "09:15",
      type: "estimate",
      title: "Estimate Approved",
      description: "Client approved estimate for kitchen faucet replacement",
      userId: "3", // Michael Chen (technician)
      userName: "Michael Chen"
    },
    {
      id: 8,
      date: "April 24, 2023",
      time: "16:10",
      type: "attachment",
      title: "File Attached",
      description: "Added signed contract documentation.pdf to client record",
      userId: "2", // Sarah Johnson (manager)
      userName: "Sarah Johnson"
    },
    {
      id: 9,
      date: "April 20, 2023",
      time: "10:30",
      type: "communication",
      title: "Email Sent",
      description: "Sent welcome email with company information and service details",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    },
    {
      id: 10,
      date: "April 20, 2023",
      time: "09:45",
      type: "note",
      title: "Client Created",
      description: "New client account created in the system",
      userId: "4", // Emily Rodriguez (dispatcher)
      userName: "Emily Rodriguez"
    }
  ];

  // Define the history filters
  const filters = [
    { value: "all", label: "All" },
    { value: "note", label: "Notes" },
    { value: "payment", label: "Payments" },
    { value: "job-created", label: "Jobs" },
    { value: "communication", label: "Communication" },
    { value: "invoice", label: "Invoices" },
    { value: "estimate", label: "Estimates" },
    { value: "attachment", label: "Attachments" }
  ];

  // Filter the history items based on the active filter and sort pinned items to the top
  const filteredHistoryItems = historyItems
    .filter(item => activeFilter === "all" || item.type === activeFilter)
    .filter(item => !item.visibility || item.visibility !== 'restricted' || showRestrictedItems)
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
      case "note":
        return <FileText className="text-orange-500" />;
      case "job-created":
        return <Play className="text-purple-500" />;
      case "communication":
        return <MessageSquare className="text-indigo-500" />;
      case "payment":
        return <DollarSign className="text-green-500" />;
      case "estimate":
        return <Send className="text-indigo-500" />;
      case "invoice":
        return <FileText className="text-blue-500" />;
      case "attachment":
        return <Paperclip className="text-gray-500" />;
      default:
        return <Clock className="text-blue-500" />;
    }
  };

  const getHistoryColor = (type: string) => {
    switch (type) {
      case "note":
        return "bg-orange-100 text-orange-700 border-orange-200";
      case "job-created":
        return "bg-purple-100 text-purple-700 border-purple-200";
      case "communication":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "payment":
        return "bg-green-100 text-green-700 border-green-200";
      case "estimate":
        return "bg-indigo-100 text-indigo-700 border-indigo-200";
      case "invoice":
        return "bg-blue-100 text-blue-700 border-blue-200";
      case "attachment":
        return "bg-gray-100 text-gray-700 border-gray-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const groupHistoryByDate = () => {
    const grouped: Record<string, typeof filteredHistoryItems> = {};
    
    filteredHistoryItems.forEach(item => {
      if (!grouped[item.date]) {
        grouped[item.date] = [];
      }
      grouped[item.date].push(item);
    });
    
    return grouped;
  };

  const groupedHistory = groupHistoryByDate();
  
  if (isLoading) {
    return (
      <div className="fixlyfy-card p-8 text-center">
        <div className="animate-pulse">Loading client details...</div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="fixlyfy-card p-8 text-center">
        <div className="text-fixlyfy-text-secondary">Client not found</div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="fixlyfy-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={client.avatarUrl} alt={client.name} />
              <AvatarFallback className="bg-fixlyfy/10 text-fixlyfy">
                {client.name && client.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-2xl font-bold">{client.name}</h2>
                <Badge className={
                  client.status === "active" 
                    ? "bg-fixlyfy-success/10 text-fixlyfy-success" 
                    : "bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary"
                }>
                  {client.status === "active" ? "Active" : "Inactive"}
                </Badge>
              </div>
              <p className="text-fixlyfy-text-secondary">{client.id} · {client.type}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCreateJob}>Create Job</Button>
            <Button variant="outline" onClick={handleCreateInvoice}>Create Invoice</Button>
            <Button className="bg-fixlyfy hover:bg-fixlyfy/90" onClick={handleSaveChanges}>
              <Check size={18} className="mr-2" /> Save Changes
            </Button>
          </div>
        </div>
        
        {/* AI Insights Card - Modified with close button and action instructions */}
        {showInsights && (
          <div className="mb-6 p-4 bg-gradient-to-r from-fixlyfy/10 to-fixlyfy/5 border border-fixlyfy/20 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-md bg-fixlyfy/10 flex items-center justify-center mr-3">
                  <Brain size={18} className="text-fixlyfy" />
                </div>
                <h3 className="text-lg font-medium">AI Client Insights</h3>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8 rounded-full hover:bg-fixlyfy/10"
                onClick={() => setShowInsights(false)}
              >
                <X size={14} />
              </Button>
            </div>
            
            <div className="space-y-3">
              <p className="text-fixlyfy-text-secondary">
                {isGeneratingInsight ? "Analyzing client data..." : aiInsight}
              </p>
              
              {/* Action instructions for insights */}
              <div className="p-3 bg-fixlyfy/5 border border-fixlyfy/10 rounded-md">
                <div className="flex items-start">
                  <Lightbulb className="text-amber-500 mt-0.5 mr-3 flex-shrink-0" size={16} />
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Action recommendations</p>
                    <ul className="text-sm text-fixlyfy-text-secondary list-disc pl-5 space-y-1">
                      <li>Schedule a follow-up call to discuss maintenance package options</li>
                      <li>Review client's purchase history to identify cross-selling opportunities</li>
                      <li>Send a personalized email with relevant service promotions</li>
                    </ul>
                    <p className="text-sm text-fixlyfy-text-secondary italic">
                      Implementing these recommendations could increase this client's lifetime value by an estimated 35%.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
                <div className="flex items-center mb-1">
                  <Calendar size={16} className="text-fixlyfy mr-2" />
                  <span className="font-medium">Engagement</span>
                </div>
                <p className="text-sm text-fixlyfy-text-secondary">Last service was 7 days ago</p>
              </div>
              <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
                <div className="flex items-center mb-1">
                  <TrendingUp size={16} className="text-green-500 mr-2" />
                  <span className="font-medium">Revenue</span>
                </div>
                <p className="text-sm text-fixlyfy-text-secondary">$1,250 spent in last 90 days</p>
              </div>
              <div className="p-3 rounded-md bg-white border border-fixlyfy/10 shadow-sm">
                <div className="flex items-center mb-1">
                  <Star size={16} className="text-amber-500 mr-2" />
                  <span className="font-medium">Satisfaction</span>
                </div>
                <p className="text-sm text-fixlyfy-text-secondary">4.8/5 average job rating</p>
              </div>
            </div>
          </div>
        )}
        
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="space-y-4"
        >
          <TabsList className="grid grid-cols-2 md:grid-cols-5 gap-1">
            <TabsTrigger value="details" className="relative">
              <User size={16} className="mr-2" />
              Details
            </TabsTrigger>
            <TabsTrigger value="jobs" className="relative">
              <FileText size={16} className="mr-2" />
              Jobs
              <Badge className="ml-2 bg-fixlyfy-light text-white text-xs">4</Badge>
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              <CreditCard size={16} className="mr-2" />
              Payments
            </TabsTrigger>
            <TabsTrigger value="properties" className="relative">
              <Home size={16} className="mr-2" />
              Properties
            </TabsTrigger>
            <TabsTrigger value="history" className="relative">
              <History size={16} className="mr-2" />
              History
            </TabsTrigger>
          </TabsList>
          
          {/* Details Tab */}
          <TabsContent value="details" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Personal Information</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input 
                        id="firstName" 
                        defaultValue={client.name && client.name.split(' ')[0] || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        defaultValue={client.name && client.name.split(' ')[1] || ''} 
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="flex items-center">
                      <Building size={16} className="mr-2 text-fixlyfy-text-secondary" />
                      <Input 
                        id="company" 
                        defaultValue={client.type === "Commercial" ? client.name : ""} 
                      />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone">Phone Numbers</Label>
                      <Button variant="ghost" size="sm" className="h-7 text-fixlyfy">
                        <Plus size={14} className="mr-1" /> Add
                      </Button>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <div className="flex items-center">
                            <Phone size={16} className="mr-2 text-fixlyfy-text-secondary" />
                            <Input defaultValue={client.phone} placeholder="Phone Number" />
                          </div>
                        </div>
                        <div className="w-24">
                          <Input placeholder="Ext." />
                        </div>
                        <Button variant="ghost" size="icon" className="text-fixlyfy-text-secondary">
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-fixlyfy-text-secondary" />
                      <Input id="email" defaultValue={client.email} />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 md:col-span-2">
                <h3 className="text-lg font-medium mb-4">Address</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Street Address</Label>
                      <div className="flex items-center">
                        <MapPin size={16} className="mr-2 text-fixlyfy-text-secondary" />
                        <Input 
                          id="street" 
                          defaultValue={client.address?.split(',')[0] || ''} 
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        defaultValue={client.address?.split(',')[1]?.trim() || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        defaultValue={client.address?.split(',')[2]?.trim().split(' ')[0] || ''} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input 
                        id="zip"
                        defaultValue={client.address?.match(/\d{5}/) ? client.address.match(/\d{5}/)[0] : ''} 
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Jobs Tab */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Client Jobs</h3>
                <Button className="bg-fixlyfy hover:bg-fixlyfy/90" onClick={onCreateJob}>
                  <Plus size={16} className="mr-2" /> New Job
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-fixlyfy-border">
                      <th className="px-4 py-3 text-left font-medium">Job #</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Service</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Technician</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3, 4].map((_, idx) => (
                      <tr 
                        key={idx} 
                        className="border-b border-fixlyfy-border hover:bg-fixlyfy-bg-interface/50 cursor-pointer"
                        onClick={() => handleJobClick(`JOB-10${idx + 1}`)}
                      >
                        <td className="px-4 py-3">
                          <span className="text-fixlyfy font-medium">JOB-10{idx + 1}</span>
                        </td>
                        <td className="px-4 py-3 text-fixlyfy-text-secondary">
                          <div className="flex items-center">
                            <Calendar size={14} className="mr-2" />
                            {new Date(2023, 4 + idx, 10 + idx).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {['HVAC Repair', 'Plumbing', 'Electrical', 'Maintenance'][idx]}
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={[
                            "bg-fixlyfy-success/10 text-fixlyfy-success",
                            "bg-fixlyfy/10 text-fixlyfy",
                            "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                            "bg-fixlyfy-text-secondary/10 text-fixlyfy-text-secondary"
                          ][idx]}>
                            {['Completed', 'In Progress', 'Scheduled', 'Cancelled'][idx]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-fixlyfy-text-secondary">
                          {['John Smith', 'Maria Garcia', 'David Lee', 'Sarah Johnson'][idx]}
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${(150 * (idx + 1)).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Payments Tab */}
          <TabsContent value="payments" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Payment History</h3>
                <Button className="bg-fixlyfy hover:bg-fixlyfy/90" onClick={handleCreateInvoice}>
                  <Plus size={16} className="mr-2" /> Create Invoice
                </Button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-fixlyfy-border">
                      <th className="px-4 py-3 text-left font-medium">Invoice #</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-left font-medium">Job</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-right font-medium">Amount</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[1, 2, 3].map((_, idx) => (
                      <tr key={idx} className="border-b border-fixlyfy-border hover:bg-fixlyfy-bg-interface/50">
                        <td className="px-4 py-3">
                          <a href="#" className="text-fixlyfy font-medium">INV-20{idx + 1}</a>
                        </td>
                        <td className="px-4 py-3 text-fixlyfy-text-secondary">
                          {new Date(2023, 4 + idx, 15 + idx).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3">
                          <a href="#" className="text-fixlyfy">JOB-10{idx + 1}</a>
                        </td>
                        <td className="px-4 py-3">
                          <Badge className={[
                            "bg-fixlyfy-success/10 text-fixlyfy-success",
                            "bg-fixlyfy-warning/10 text-fixlyfy-warning",
                            "bg-fixlyfy-error/10 text-fixlyfy-error",
                          ][idx]}>
                            {['Paid', 'Pending', 'Overdue'][idx]}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-right font-medium">
                          ${(150 * (idx + 1)).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </TabsContent>
          
          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-medium">Properties</h3>
                <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
                  <Plus size={16} className="mr-2" /> Add Property
                </Button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2].map((_, idx) => (
                  <div key={idx} className="border border-fixlyfy-border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">
                        {idx === 0 ? "Main Location" : "Secondary Location"}
                      </h4>
                      <Badge className="bg-fixlyfy/10 text-fixlyfy">
                        {idx === 0 ? "Primary" : "Secondary"}
                      </Badge>
                    </div>
                    <div className="mt-3 space-y-2 text-fixlyfy-text-secondary">
                      <div className="flex items-start">
                        <MapPin size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                        <span>
                          {idx === 0 
                            ? client.address 
                            : "789 Oak Street, Apt 12, Austin, TX 78701"}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Home size={16} className="mr-2 flex-shrink-0" />
                        <span>{idx === 0 ? "Residential" : "Office"}</span>
                      </div>
                    </div>
                    <div className="mt-4 flex justify-end">
                      <Button variant="ghost" size="sm" className="text-fixlyfy">Edit</Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
          
          {/* History Tab - Updated to match JobHistory style */}
          <TabsContent value="history" className="space-y-6">
            <Card className="border-fixlyfy-border shadow-sm">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Client History</h3>
                  
                  <div className="flex items-center space-x-2">
                    {/* Toggle for showing restricted items */}
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => setShowRestrictedItems(!showRestrictedItems)}
                    >
                      {showRestrictedItems ? <EyeOff size={14} /> : <Eye size={14} />}
                      {showRestrictedItems ? "Hide Restricted" : "Show Restricted"}
                    </Button>
                    
                    <Badge variant="outline" className="mr-2">
                      <Filter size={14} className="mr-1" /> 
                      Filter
                    </Badge>
                  </div>
                </div>

                {/* AI Insight Bar */}
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-start">
                  <AlertCircle size={16} className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <p className="text-sm text-blue-700">
                    This client has been active for 3 months and has completed 5 jobs with a total value of $1,750.
                  </p>
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
                                            <DropdownMenuItem onClick={() => {
                                              toast({
                                                title: "Download started",
                                                description: `Downloading ${item.description.split(' ').pop() || "file.pdf"}...`,
                                              });
                                            }}>
                                              <Download size={14} className="mr-2" /> Download
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
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Invoice Modal */}
      <Dialog open={isInvoiceModalOpen} onOpenChange={setIsInvoiceModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for client {client.name}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea 
                id="description" 
                placeholder="Enter invoice description"
                value={invoiceData.description}
                onChange={(e) => setInvoiceData({...invoiceData, description: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="flex items-center">
                <span className="mr-2">$</span>
                <Input 
                  id="amount" 
                  placeholder="0.00" 
                  type="number"
                  value={invoiceData.amount}
                  onChange={(e) => setInvoiceData({...invoiceData, amount: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInvoiceModalOpen(false)}>
              Cancel
            </Button>
            <Button 
              className="bg-fixlyfy hover:bg-fixlyfy/90" 
              onClick={handleInvoiceSubmit}
            >
              Create Invoice
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
