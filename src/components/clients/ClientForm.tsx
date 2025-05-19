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
  Check
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
  
  useEffect(() => {
    // Simulating API fetch
    setIsLoading(true);
    
    // Find client from the mock data
    const foundClient = clients.find(c => c.id === clientId);
    
    setTimeout(() => {
      setClient(foundClient || {});
      setIsLoading(false);
    }, 500);
  }, [clientId]);

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
          
          {/* History Tab */}
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h3 className="text-lg font-medium mb-6">Activity History</h3>
              
              <div className="relative ml-4 border-l-2 border-fixlyfy-border pl-6 space-y-6">
                {[
                  {
                    type: "job",
                    date: "May 17, 2023",
                    time: "2:30 PM",
                    title: "Job Completed",
                    description: "HVAC Repair service was completed successfully",
                    id: "JOB-101"
                  },
                  {
                    type: "payment",
                    date: "May 17, 2023",
                    time: "3:15 PM",
                    title: "Payment Received",
                    description: "Payment of $150.00 received via Credit Card",
                    id: "INV-201"
                  },
                  {
                    type: "job",
                    date: "April 12, 2023",
                    time: "10:00 AM",
                    title: "Job Scheduled",
                    description: "Plumbing service scheduled",
                    id: "JOB-102"
                  },
                  {
                    type: "note",
                    date: "April 5, 2023",
                    time: "11:45 AM",
                    title: "Note Added",
                    description: "Client requested quote for kitchen renovation"
                  },
                  {
                    type: "job",
                    date: "March 23, 2023",
                    time: "9:15 AM",
                    title: "Job Created",
                    description: "Electrical service requested",
                    id: "JOB-103"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="relative">
                    <div className="absolute -left-10 h-4 w-4 rounded-full bg-fixlyfy"></div>
                    <div className="mb-1 text-sm text-fixlyfy-text-secondary">
                      {item.date} at {item.time}
                    </div>
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{item.title}</h4>
                        <p className="text-fixlyfy-text-secondary">{item.description}</p>
                      </div>
                      {item.id && (
                        <a href="#" className="text-fixlyfy font-medium hover:underline">
                          {item.id}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
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
