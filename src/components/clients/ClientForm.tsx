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
  User, 
  Loader,
  Brain,
  Calendar,
  TrendingUp,
  Star,
  X,
  Lightbulb
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClientFormProps {
  clientId?: string;
  onCreateJob?: () => void;
}

export const ClientForm = ({ clientId, onCreateJob }: ClientFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  const [client, setClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState({
    description: "",
    amount: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    company: "",
    email: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    zip: "",
  });
  const [showInsights, setShowInsights] = useState(true);
  const [isGeneratingInsight, setIsGeneratingInsight] = useState(false);
  const [aiInsight, setAiInsight] = useState("Analyzing client history and data...");
  
  useEffect(() => {
    // Fetch client from Supabase
    const fetchClient = async () => {
      if (!clientId) {
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', clientId)
          .single();
          
        if (error) {
          throw error;
        }
        
        if (data) {
          console.log("Fetched client data:", data);
          setClient(data);
          // Populate form data
          const nameParts = data.name ? data.name.split(' ') : ['', ''];
          setFormData({
            firstName: nameParts[0] || '',
            lastName: nameParts.slice(1).join(' ') || '',
            company: data.company || '',
            email: data.email || '',
            phone: data.phone || '',
            street: data.address || '',
            city: data.city || '',
            state: data.state || '',
            zip: data.zip || '',
          });
          generateClientInsight(data);
        } else {
          toast({
            title: "Client not found",
            description: "The requested client could not be found.",
          });
        }
      } catch (error) {
        console.error("Error fetching client:", error);
        toast({
          title: "Error",
          description: "Failed to load client data.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchClient();
  }, [clientId]);

  const generateClientInsight = async (client: any) => {
    if (!client) return;
    
    setIsGeneratingInsight(true);
    
    try {
      // Generate a personalized insight based on client data
      setTimeout(() => {
        let insight = "This client hasn't had any activity yet. Consider scheduling an introduction call.";
        
        if (client.type === "commercial") {
          insight = "This commercial client has been with you since " + 
            new Date(client.created_at).toLocaleDateString() + 
            ". Consider offering an annual maintenance package.";
        } else if (client.type === "residential") {
          insight = "This residential client may be interested in seasonal maintenance services based on their profile.";
        }
        
        setAiInsight(insight);
        setIsGeneratingInsight(false);
      }, 1000);
    } catch (error) {
      setAiInsight("Unable to generate client insight at this time.");
      setIsGeneratingInsight(false);
    }
  };

  const handleSaveChanges = async () => {
    if (!clientId) return;
    
    setIsSaving(true);
    
    try {
      // Combine first and last name
      const fullName = `${formData.firstName} ${formData.lastName}`.trim();
      
      const updates = {
        name: fullName,
        company: formData.company,
        email: formData.email,
        phone: formData.phone,
        address: formData.street,
        city: formData.city,
        state: formData.state,
        zip: formData.zip,
        // Convert Date to ISO string for Supabase
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('clients')
        .update(updates)
        .eq('id', clientId);
        
      if (error) throw error;
      
      // Update local client state
      setClient(prev => ({ ...prev, ...updates }));
      
      toast({
        title: "Changes saved",
        description: "Client information has been updated successfully.",
      });
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "Failed to save changes. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateInvoice = () => {
    setIsInvoiceModalOpen(true);
  };

  const handleInvoiceSubmit = async () => {
    if (!clientId) return;
    
    try {
      // Create invoice in the database
      const currentDate = new Date().toISOString();
      
      const { data, error } = await supabase
        .from('invoices')
        .insert({
          invoice_number: `INV-${Date.now().toString().slice(-6)}`,
          total: parseFloat(invoiceData.amount) || 0,
          notes: invoiceData.description,
          date: currentDate,
          balance: parseFloat(invoiceData.amount) || 0
        })
        .select();
        
      if (error) throw error;
      
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
    } catch (error) {
      console.error("Error creating invoice:", error);
      toast({
        title: "Error",
        description: "Failed to create invoice. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  if (isLoading) {
    return (
      <div className="fixlyfy-card p-8 text-center">
        <div className="flex flex-col items-center justify-center">
          <Loader className="h-8 w-8 animate-spin text-fixlyfy mb-4" />
          <div className="text-fixlyfy-text-secondary">Loading client details...</div>
        </div>
      </div>
    );
  }
  
  if (!client) {
    return (
      <div className="fixlyfy-card p-8 text-center">
        <div className="text-fixlyfy-text-secondary">Client not found</div>
        <Button 
          variant="outline" 
          className="mt-4"
          onClick={() => navigate('/clients')}
        >
          Back to Clients
        </Button>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="fixlyfy-card p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={client.name} />
              <AvatarFallback className="bg-fixlyfy/10 text-fixlyfy">
                {client.name && client.name.split(' ').map((n: string) => n[0]).join('')}
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
                  {client.status || "Unknown"}
                </Badge>
              </div>
              <p className="text-fixlyfy-text-secondary">
                ID: {client.id ? client.id.substring(0, 8) : 'Unknown'} · {client.type || "Unknown type"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onCreateJob}>Create Job</Button>
            <Button variant="outline" onClick={handleCreateInvoice}>Create Invoice</Button>
            <Button 
              className="bg-fixlyfy hover:bg-fixlyfy/90" 
              onClick={handleSaveChanges}
              disabled={isSaving}
            >
              {isSaving && <Loader size={18} className="mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </div>
        
        {/* AI Insights Card */}
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
              {/* No mock data - hide badge */}
              Jobs
            </TabsTrigger>
            <TabsTrigger value="payments" className="relative">
              Payments
            </TabsTrigger>
            <TabsTrigger value="properties" className="relative">
              Properties
            </TabsTrigger>
            <TabsTrigger value="history" className="relative">
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
                        value={formData.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input 
                        id="lastName" 
                        value={formData.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <div className="flex items-center">
                      <Building size={16} className="mr-2 text-fixlyfy-text-secondary" />
                      <Input 
                        id="company" 
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6">
                <h3 className="text-lg font-medium mb-4">Contact Information</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex items-center">
                      <Phone size={16} className="mr-2 text-fixlyfy-text-secondary" />
                      <Input 
                        id="phone" 
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-fixlyfy-text-secondary" />
                      <Input 
                        id="email" 
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                      />
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
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">City</Label>
                      <Input 
                        id="city" 
                        value={formData.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <Input 
                        id="state" 
                        value={formData.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP Code</Label>
                      <Input 
                        id="zip"
                        value={formData.zip}
                        onChange={(e) => handleInputChange('zip', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>
          
          {/* Other tabs - simplified to remove mock data */}
          <TabsContent value="jobs" className="space-y-6">
            <Card className="p-6 flex flex-col items-center justify-center py-12">
              <p className="text-fixlyfy-text-secondary mb-4">No jobs found for this client.</p>
              <Button 
                className="bg-fixlyfy hover:bg-fixlyfy/90" 
                onClick={onCreateJob}
              >
                Create First Job
              </Button>
            </Card>
          </TabsContent>
          
          <TabsContent value="payments" className="space-y-6">
            <Card className="p-6 flex flex-col items-center justify-center py-12">
              <p className="text-fixlyfy-text-secondary mb-4">No payments found for this client.</p>
              <Button 
                className="bg-fixlyfy hover:bg-fixlyfy/90" 
                onClick={handleCreateInvoice}
              >
                Create First Invoice
              </Button>
            </Card>
          </TabsContent>
          
          <TabsContent value="properties" className="space-y-6">
            <Card className="p-6 flex flex-col items-center justify-center py-12">
              <p className="text-fixlyfy-text-secondary mb-4">No properties found for this client.</p>
              <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
                Add Property
              </Button>
            </Card>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6 flex flex-col items-center justify-center py-12">
              <p className="text-fixlyfy-text-secondary mb-4">No history entries found for this client.</p>
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
