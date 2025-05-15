
import { useState } from "react";
import { useParams } from "react-router-dom";
import { format } from "date-fns";
import { PageLayout } from "@/components/layout/PageLayout";
import { JobDetailsHeader } from "@/components/jobs/JobDetailsHeader";
import { JobDetailsQuickActions } from "@/components/jobs/JobDetailsQuickActions";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group";
import { 
  FileText, 
  History, 
  Edit, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Tag, 
  Phone, 
  Mail,
  MapPin,
  Plus,
  Search,
  Trash,
  Check,
  FileCheck,
  CreditCard,
  Download,
  Printer,
  ChevronsUpDown
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

// Mock products data
const mockProducts = [
  { id: "1", name: "HVAC Filter", description: "High-efficiency air filter", price: 45.99 },
  { id: "2", name: "Condenser Fan Motor", description: "Replacement motor for AC unit", price: 129.95 },
  { id: "3", name: "Refrigerant R-410A", description: "10lb canister", price: 89.50 },
  { id: "4", name: "Thermostat", description: "Digital programmable thermostat", price: 59.99 },
  { id: "5", name: "Capacitor", description: "Dual run capacitor 45/5 MFD", price: 32.50 },
  { id: "6", name: "Diagnostic Service", description: "Complete system diagnostic", price: 89.00 },
  { id: "7", name: "Duct Cleaning", description: "Full duct system cleaning", price: 299.00 },
  { id: "8", name: "Compressor", description: "2-ton replacement compressor", price: 485.00 },
  { id: "9", name: "Thermostat Wire", description: "18-gauge thermostat wire (50ft)", price: 24.99 },
  { id: "10", name: "Air Handler", description: "2-ton air handler unit", price: 899.00 },
];

// Mock history data
const jobHistoryData = [
  { date: "May 14, 2023", time: "09:15 AM", action: "Job created", user: "Admin" },
  { date: "May 14, 2023", time: "09:30 AM", action: "Assigned to Robert Smith", user: "Admin" },
  { date: "May 15, 2023", time: "01:30 PM", action: "Status changed to In Progress", user: "Robert Smith" },
  { date: "May 15, 2023", time: "03:45 PM", action: "Added new task: Check refrigerant levels", user: "Robert Smith" },
  { date: "May 16, 2023", time: "10:00 AM", action: "File uploaded: HVAC-specs.pdf", user: "Admin" }
];

const JobDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  
  // State for dialogs
  const [isDescriptionDialogOpen, setIsDescriptionDialogOpen] = useState(false);
  const [isScheduleDialogOpen, setIsScheduleDialogOpen] = useState(false);
  const [isJobTypeDialogOpen, setIsJobTypeDialogOpen] = useState(false);
  const [isTagsDialogOpen, setIsTagsDialogOpen] = useState(false);
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [isTasksDialogOpen, setIsTasksDialogOpen] = useState(false);
  const [isAttachmentsDialogOpen, setIsAttachmentsDialogOpen] = useState(false);
  const [isAddProductDialogOpen, setIsAddProductDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isEstimateDetailsOpen, setIsEstimateDetailsOpen] = useState(false);
  const [isInvoicePreviewOpen, setIsInvoicePreviewOpen] = useState(false);
  const [isEstimatePreviewOpen, setIsEstimatePreviewOpen] = useState(false);
  
  // Job data state
  const [jobDescription, setJobDescription] = useState<string>(
    "Customer reported that their HVAC unit is not cooling properly. The unit is making unusual noises when running. The system is about 8 years old, a Carrier model 24ACC6."
  );
  const [jobType, setJobType] = useState<string>("Repair");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date("2023-05-15T13:30:00"));
  const [startTime, setStartTime] = useState<string>("13:30");
  const [endTime, setEndTime] = useState<string>("15:30");
  const [selectedTechnician, setSelectedTechnician] = useState<string>("Robert Smith");
  const [selectedTags, setSelectedTags] = useState<string[]>(["HVAC", "Residential"]);
  const [notes, setNotes] = useState<string>(
    "Customer mentioned they've had issues with this unit before. Previous service was done by our technician John Doe last summer. Customer prefers morning appointments."
  );
  
  // Invoice data state
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    id: string;
    name: string;
    description: string;
    price: number;
    quantity: number;
  }>>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredProducts, setFilteredProducts] = useState(mockProducts);
  const [applyTax, setApplyTax] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("credit-card");
  const [invoiceNumber] = useState("INV-1089");
  const [estimateNumber] = useState("EST-2047");
  const TAX_RATE = 0.13; // 13% tax rate
  
  // Mock data
  const technicians = [
    { id: "1", name: "Robert Smith" },
    { id: "2", name: "Janet Wilson" },
    { id: "3", name: "Miguel Rodriguez" },
    { id: "4", name: "Sarah Johnson" },
  ];
  
  const jobTypes = ["Repair", "Service", "Diagnostic", "Maintenance", "Installation"];
  
  const tags = [
    { id: "1", name: "HVAC" },
    { id: "2", name: "Residential" },
    { id: "3", name: "Commercial" },
    { id: "4", name: "Emergency" },
    { id: "5", name: "Warranty" },
  ];

  const clientInfo = {
    name: "Michael Johnson",
    address: "123 Main St, Apt 45",
    city: "Austin",
    state: "TX",
    zip: "78701",
    phone: "(555) 123-4567",
    email: "michael.johnson@example.com"
  };

  const companyInfo = {
    name: "Fixlyfy Services Inc.",
    logo: "https://placekitten.com/200/60", // Placeholder logo
    address: "456 Business Ave, Suite 100",
    city: "Austin",
    state: "TX",
    zip: "78702",
    phone: "(555) 987-6543",
    email: "info@fixlyfy.com",
    website: "www.fixlyfy.com",
    taxId: "TX-12345678"
  };

  const handleAddAttachment = () => {
    setIsAttachmentsDialogOpen(true);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term.trim() === "") {
      setFilteredProducts(mockProducts);
    } else {
      const filtered = mockProducts.filter(product => 
        product.name.toLowerCase().includes(term.toLowerCase()) || 
        product.description.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  };

  const handleAddProduct = (product: typeof mockProducts[0]) => {
    const existingItemIndex = invoiceItems.findIndex(item => item.id === product.id);
    
    if (existingItemIndex >= 0) {
      // Product already in invoice, increment quantity
      const updatedItems = [...invoiceItems];
      updatedItems[existingItemIndex].quantity += 1;
      setInvoiceItems(updatedItems);
    } else {
      // Add new product to invoice
      setInvoiceItems([...invoiceItems, { ...product, quantity: 1 }]);
    }
    
    toast.success(`${product.name} added to invoice`);
  };
  
  const handleRemoveProduct = (productId: string) => {
    setInvoiceItems(invoiceItems.filter(item => item.id !== productId));
    toast.success("Product removed from invoice");
  };
  
  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = invoiceItems.map(item => 
      item.id === productId ? { ...item, quantity: newQuantity } : item
    );
    setInvoiceItems(updatedItems);
  };
  
  const calculateSubtotal = () => {
    return invoiceItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const calculateTax = () => {
    return applyTax ? calculateSubtotal() * TAX_RATE : 0;
  };
  
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleSendInvoice = () => {
    if (invoiceItems.length === 0) {
      toast.error("Cannot send empty invoice. Please add products first.");
      return;
    }
    
    setIsInvoicePreviewOpen(true);
  };
  
  const handleSendEstimate = () => {
    if (invoiceItems.length === 0) {
      toast.error("Cannot send empty estimate. Please add products first.");
      return;
    }
    
    setIsEstimatePreviewOpen(true);
  };
  
  const handleMakePayment = () => {
    if (calculateTotal() <= 0) {
      toast.error("No amount to pay. Please add products to the invoice first.");
      return;
    }
    
    setIsPaymentDialogOpen(true);
  };

  const handleProcessPayment = () => {
    toast.success(`Payment of $${calculateTotal().toFixed(2)} processed via ${paymentMethod === "credit-card" ? "Credit Card" : 
      paymentMethod === "e-transfer" ? "E-Transfer" : 
      paymentMethod === "cash" ? "Cash" : "Check"}`);
    setIsPaymentDialogOpen(false);
  };
  
  return (
    <PageLayout>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JobDetailsHeader id={id} />
          
          <Card>
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid grid-cols-3 h-auto p-0 bg-fixlyfy-bg-interface">
                <TabsTrigger 
                  value="details" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <FileText size={16} className="mr-2" />
                  Details
                </TabsTrigger>
                <TabsTrigger 
                  value="create" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <Plus size={16} className="mr-2" />
                  Create
                </TabsTrigger>
                <TabsTrigger 
                  value="history" 
                  className="py-3 rounded-none data-[state=active]:bg-white"
                >
                  <History size={16} className="mr-2" />
                  History
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium mb-4">Client Information</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Full Name</p>
                          <p className="font-medium">{clientInfo.name}</p>
                        </div>
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Address</p>
                          <div className="flex items-center gap-1">
                            <MapPin size={14} className="text-fixlyfy-text-secondary" />
                            <p>{clientInfo.address}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Contact</p>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Phone size={14} className="text-fixlyfy-text-secondary" />
                              <p>{clientInfo.phone}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <Mail size={14} className="text-fixlyfy-text-secondary" />
                              <p>{clientInfo.email}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium mb-4">Job Details</h3>
                      <div className="space-y-3">
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Description</p>
                          <div
                            onClick={() => setIsDescriptionDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <p className="line-clamp-2">{jobDescription}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Schedule Date & Time</p>
                          <div
                            onClick={() => setIsScheduleDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <CalendarIcon size={14} className="mr-2 text-fixlyfy-text-secondary" />
                            <p>{format(selectedDate, "MMM dd, yyyy")}</p>
                            <Clock size={14} className="mx-2 text-fixlyfy-text-secondary" />
                            <p>{startTime} - {endTime}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Type</p>
                          <div
                            onClick={() => setIsJobTypeDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <p>{jobType}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Job Tags</p>
                          <div
                            onClick={() => setIsTagsDialogOpen(true)}
                            className="cursor-pointer flex items-center gap-2 text-fixlyfy hover:underline flex-wrap"
                          >
                            {selectedTags.map((tag) => (
                              <span key={tag} className="bg-fixlyfy/10 text-fixlyfy text-sm px-2 py-1 rounded">
                                {tag}
                              </span>
                            ))}
                            <Tag size={14} className="text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                        
                        <div>
                          <p className="text-fixlyfy-text-secondary text-sm">Team</p>
                          <div
                            onClick={() => setIsTeamDialogOpen(true)}
                            className="cursor-pointer flex items-center text-fixlyfy hover:underline"
                          >
                            <User size={14} className="mr-2 text-fixlyfy-text-secondary" />
                            <p>{selectedTechnician}</p>
                            <Edit size={14} className="ml-2 text-fixlyfy-text-secondary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Tasks</h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setIsTasksDialogOpen(true)}
                            className="text-fixlyfy hover:text-fixlyfy"
                          >
                            View All
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy flex items-center justify-center">
                              <div className="h-2.5 w-2.5 rounded-full bg-fixlyfy"></div>
                            </div>
                            <p>Initial diagnosis of HVAC unit</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy/30"></div>
                            <p className="text-fixlyfy-text-secondary">Check refrigerant levels</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="h-5 w-5 rounded-full border-2 border-fixlyfy/30"></div>
                            <p className="text-fixlyfy-text-secondary">Clean condenser coils</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-medium">Attachments</h3>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost"
                              size="icon"
                              onClick={handleAddAttachment}
                              className="h-8 w-8 text-fixlyfy hover:text-fixlyfy"
                              title="Add attachment"
                            >
                              <Plus size={16} />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setIsAttachmentsDialogOpen(true)}
                              className="text-fixlyfy hover:text-fixlyfy"
                            >
                              View All
                            </Button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <p>HVAC-specs.pdf</p>
                            </div>
                            <p className="text-xs text-fixlyfy-text-secondary">210 KB</p>
                          </div>
                          <div className="flex items-center justify-between p-2 border rounded">
                            <div className="flex items-center gap-2">
                              <FileText size={16} />
                              <p>Previous-service.pdf</p>
                            </div>
                            <p className="text-xs text-fixlyfy-text-secondary">185 KB</p>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="font-medium mb-4">Notes</h3>
                        <p className="text-fixlyfy-text-secondary">
                          {notes}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="create" className="p-6">
                <div className="space-y-6">
                  {/* Tabs for different creation options */}
                  <Tabs defaultValue="invoice">
                    <div className="mb-6">
                      <TabsList className="grid grid-cols-3 w-full md:w-auto">
                        <TabsTrigger value="invoice">Invoice</TabsTrigger>
                        <TabsTrigger value="estimate">Estimate</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                      </TabsList>
                    </div>
                    
                    <TabsContent value="invoice" className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">Create Invoice</h3>
                          <p className="text-sm text-fixlyfy-text-secondary">Invoice #{invoiceNumber}</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddProductDialogOpen(true)}
                          className="bg-fixlyfy hover:bg-fixlyfy/90"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Product
                        </Button>
                      </div>
                      
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Product</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceItems.length > 0 ? (
                              invoiceItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                      >
                                        -
                                      </Button>
                                      <span className="mx-2">{item.quantity}</span>
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => handleRemoveProduct(item.id)}
                                    >
                                      <Trash size={16} />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-fixlyfy-text-secondary">
                                  No products added yet. Click "Add Product" to create an invoice.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="apply-tax" 
                            checked={applyTax} 
                            onCheckedChange={setApplyTax}
                          />
                          <Label htmlFor="apply-tax">Apply Tax (13%)</Label>
                        </div>
                        
                        <div className="space-y-2 text-right">
                          <div className="text-sm text-fixlyfy-text-secondary">
                            <span>Subtotal:</span>
                            <span className="ml-2 font-medium text-foreground">${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-fixlyfy-text-secondary">
                            <span>Tax (13%):</span>
                            <span className="ml-2 font-medium text-foreground">${calculateTax().toFixed(2)}</span>
                          </div>
                          <div className="text-lg font-medium">
                            <span>Total:</span>
                            <span className="ml-2">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          className="bg-fixlyfy hover:bg-fixlyfy/90 w-[200px]"
                          onClick={handleSendInvoice}
                          disabled={invoiceItems.length === 0}
                        >
                          Send Invoice
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="estimate" className="space-y-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">Create Estimate</h3>
                          <p className="text-sm text-fixlyfy-text-secondary">Estimate #{estimateNumber}</p>
                        </div>
                        <Button 
                          onClick={() => setIsAddProductDialogOpen(true)}
                          className="bg-fixlyfy hover:bg-fixlyfy/90"
                        >
                          <Plus size={16} className="mr-2" />
                          Add Product
                        </Button>
                      </div>
                      
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[40%]">Product</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Price</TableHead>
                              <TableHead className="text-center">Qty</TableHead>
                              <TableHead className="text-right">Total</TableHead>
                              <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {invoiceItems.length > 0 ? (
                              invoiceItems.map((item) => (
                                <TableRow key={item.id}>
                                  <TableCell className="font-medium">{item.name}</TableCell>
                                  <TableCell>{item.description}</TableCell>
                                  <TableCell className="text-right">${item.price.toFixed(2)}</TableCell>
                                  <TableCell>
                                    <div className="flex items-center justify-center">
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity - 1)}
                                      >
                                        -
                                      </Button>
                                      <span className="mx-2">{item.quantity}</span>
                                      <Button 
                                        variant="outline" 
                                        size="icon" 
                                        className="h-7 w-7"
                                        onClick={() => handleUpdateQuantity(item.id, item.quantity + 1)}
                                      >
                                        +
                                      </Button>
                                    </div>
                                  </TableCell>
                                  <TableCell className="text-right">${(item.price * item.quantity).toFixed(2)}</TableCell>
                                  <TableCell>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-8 w-8 text-red-500"
                                      onClick={() => handleRemoveProduct(item.id)}
                                    >
                                      <Trash size={16} />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            ) : (
                              <TableRow>
                                <TableCell colSpan={6} className="text-center py-4 text-fixlyfy-text-secondary">
                                  No products added yet. Click "Add Product" to create an estimate.
                                </TableCell>
                              </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="flex justify-between">
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id="apply-tax-estimate" 
                            checked={applyTax} 
                            onCheckedChange={setApplyTax}
                          />
                          <Label htmlFor="apply-tax-estimate">Apply Tax (13%)</Label>
                        </div>
                        
                        <div className="space-y-2 text-right">
                          <div className="text-sm text-fixlyfy-text-secondary">
                            <span>Subtotal:</span>
                            <span className="ml-2 font-medium text-foreground">${calculateSubtotal().toFixed(2)}</span>
                          </div>
                          <div className="text-sm text-fixlyfy-text-secondary">
                            <span>Tax (13%):</span>
                            <span className="ml-2 font-medium text-foreground">${calculateTax().toFixed(2)}</span>
                          </div>
                          <div className="text-lg font-medium">
                            <span>Total:</span>
                            <span className="ml-2">${calculateTotal().toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button 
                          className="bg-fixlyfy hover:bg-fixlyfy/90 w-[200px]"
                          onClick={handleSendEstimate}
                          disabled={invoiceItems.length === 0}
                        >
                          Send Estimate
                        </Button>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="payment" className="space-y-6">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Add Payment</h3>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="payment-amount">Amount</Label>
                            <Input 
                              id="payment-amount" 
                              type="text" 
                              value={calculateTotal().toFixed(2)} 
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="payment-date">Payment Date</Label>
                            <Input 
                              id="payment-date" 
                              type="text" 
                              value={format(new Date(), "MMM dd, yyyy")} 
                              readOnly
                              className="bg-muted"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label>Payment Method</Label>
                          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem id="payment-cc" value="credit-card" />
                              <Label htmlFor="payment-cc">Credit Card</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem id="payment-etransfer" value="e-transfer" />
                              <Label htmlFor="payment-etransfer">E-Transfer</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem id="payment-cash" value="cash" />
                              <Label htmlFor="payment-cash">Cash</Label>
                            </div>
                            <div className="flex items-center space-x-2 border rounded-md p-3">
                              <RadioGroupItem id="payment-check" value="check" />
                              <Label htmlFor="payment-check">Check</Label>
                            </div>
                          </RadioGroup>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="payment-notes">Notes</Label>
                          <textarea 
                            id="payment-notes" 
                            className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none h-20"
                            placeholder="Add payment notes..."
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end">
                        <Button
                          className="bg-fixlyfy hover:bg-fixlyfy/90 w-[200px]"
                          onClick={handleMakePayment}
                        >
                          <CreditCard size={16} className="mr-2" />
                          Process Payment
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              </TabsContent>
              
              <TabsContent value="history" className="p-6">
                <h3 className="text-lg font-medium mb-4">Job History</h3>
                <div className="space-y-4">
                  {jobHistoryData.map((entry, index) => (
                    <div key={index} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="min-w-[120px]">
                        <p className="font-medium">{entry.date}</p>
                        <p className="text-sm text-fixlyfy-text-secondary">{entry.time}</p>
                      </div>
                      <div>
                        <p>{entry.action}</p>
                        <p className="text-sm text-fixlyfy-text-secondary">By: {entry.user}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </div>
        <div>
          <JobDetailsQuickActions />
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={isAddProductDialogOpen} onOpenChange={setIsAddProductDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Product</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
              />
            </div>
            
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <div 
                    key={product.id} 
                    className="p-3 border-b last:border-0 hover:bg-muted/50 cursor-pointer flex justify-between items-center"
                    onClick={() => handleAddProduct(product)}
                  >
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-fixlyfy-text-secondary">{product.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">${product.price.toFixed(2)}</p>
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Plus size={16} />
                      </Button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-fixlyfy-text-secondary">
                  No products found matching your search.
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button onClick={() => setIsAddProductDialogOpen(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Invoice Preview Dialog */}
      <Dialog open={isInvoicePreviewOpen} onOpenChange={setIsInvoicePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="border rounded-md p-6 bg-white">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <img src={companyInfo.logo} alt="Company Logo" className="h-12 mb-2" />
                  <h2 className="text-xl font-bold">{companyInfo.name}</h2>
                  <p className="text-sm">{companyInfo.address}</p>
                  <p className="text-sm">{companyInfo.city}, {companyInfo.state} {companyInfo.zip}</p>
                  <p className="text-sm">Phone: {companyInfo.phone}</p>
                  <p className="text-sm">Email: {companyInfo.email}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-fixlyfy mb-2">INVOICE</h1>
                  <p className="text-sm"><strong>Invoice #:</strong> {invoiceNumber}</p>
                  <p className="text-sm"><strong>Date:</strong> {format(new Date(), "MMM dd, yyyy")}</p>
                  <p className="text-sm"><strong>Due Date:</strong> {format(new Date(new Date().setDate(new Date().getDate() + 30)), "MMM dd, yyyy")}</p>
                  <p className="text-sm"><strong>Job #:</strong> {id}</p>
                </div>
              </div>
              
              {/* Bill To */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-bold mb-2">Bill To:</h3>
                <p>{clientInfo.name}</p>
                <p>{clientInfo.address}</p>
                <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zip}</p>
                <p>Phone: {clientInfo.phone}</p>
                <p>Email: {clientInfo.email}</p>
              </div>
              
              {/* Invoice Items */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-fixlyfy text-white">
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2 border-b">{item.name}</td>
                        <td className="p-2 border-b">{item.description}</td>
                        <td className="p-2 border-b text-right">${item.price.toFixed(2)}</td>
                        <td className="p-2 border-b text-center">{item.quantity}</td>
                        <td className="p-2 border-b text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {applyTax && (
                    <div className="flex justify-between py-2">
                      <span>Tax (13%):</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Notes and Terms */}
              <div className="mb-6 text-sm">
                <h4 className="font-bold mb-2">Notes:</h4>
                <p>Thank you for your business!</p>
              </div>
              
              <div className="text-sm">
                <h4 className="font-bold mb-2">Terms and Conditions:</h4>
                <p>Payment is due within 30 days from the invoice date. Please make checks payable to {companyInfo.name} or contact us for electronic payment options.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsInvoicePreviewOpen(false)}>
                  <Check size={16} className="mr-2" />
                  Send Later
                </Button>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <Printer size={16} className="mr-2" />
                  Print
                </Button>
              </div>
              <Button 
                onClick={() => {
                  setIsInvoicePreviewOpen(false);
                  toast.success(`Invoice #${invoiceNumber} sent to client`);
                }}
              >
                Send Invoice
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Estimate Preview Dialog */}
      <Dialog open={isEstimatePreviewOpen} onOpenChange={setIsEstimatePreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Estimate Preview</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <div className="border rounded-md p-6 bg-white">
              {/* Estimate Header */}
              <div className="flex justify-between items-start mb-6">
                <div>
                  <img src={companyInfo.logo} alt="Company Logo" className="h-12 mb-2" />
                  <h2 className="text-xl font-bold">{companyInfo.name}</h2>
                  <p className="text-sm">{companyInfo.address}</p>
                  <p className="text-sm">{companyInfo.city}, {companyInfo.state} {companyInfo.zip}</p>
                  <p className="text-sm">Phone: {companyInfo.phone}</p>
                  <p className="text-sm">Email: {companyInfo.email}</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl font-bold text-fixlyfy mb-2">ESTIMATE</h1>
                  <p className="text-sm"><strong>Estimate #:</strong> {estimateNumber}</p>
                  <p className="text-sm"><strong>Date:</strong> {format(new Date(), "MMM dd, yyyy")}</p>
                  <p className="text-sm"><strong>Valid Until:</strong> {format(new Date(new Date().setDate(new Date().getDate() + 30)), "MMM dd, yyyy")}</p>
                  <p className="text-sm"><strong>Job #:</strong> {id}</p>
                </div>
              </div>
              
              {/* Customer Info */}
              <div className="mb-6 p-4 bg-gray-50 rounded-md">
                <h3 className="font-bold mb-2">Customer:</h3>
                <p>{clientInfo.name}</p>
                <p>{clientInfo.address}</p>
                <p>{clientInfo.city}, {clientInfo.state} {clientInfo.zip}</p>
                <p>Phone: {clientInfo.phone}</p>
                <p>Email: {clientInfo.email}</p>
              </div>
              
              {/* Estimate Items */}
              <div className="mb-6">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-fixlyfy text-white">
                      <th className="p-2 text-left">Item</th>
                      <th className="p-2 text-left">Description</th>
                      <th className="p-2 text-right">Price</th>
                      <th className="p-2 text-center">Qty</th>
                      <th className="p-2 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoiceItems.map((item, index) => (
                      <tr key={item.id} className={index % 2 === 0 ? "bg-gray-50" : ""}>
                        <td className="p-2 border-b">{item.name}</td>
                        <td className="p-2 border-b">{item.description}</td>
                        <td className="p-2 border-b text-right">${item.price.toFixed(2)}</td>
                        <td className="p-2 border-b text-center">{item.quantity}</td>
                        <td className="p-2 border-b text-right">${(item.price * item.quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              {/* Totals */}
              <div className="flex justify-end mb-6">
                <div className="w-64">
                  <div className="flex justify-between py-2">
                    <span>Subtotal:</span>
                    <span>${calculateSubtotal().toFixed(2)}</span>
                  </div>
                  {applyTax && (
                    <div className="flex justify-between py-2">
                      <span>Tax (13%):</span>
                      <span>${calculateTax().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between py-2 font-bold border-t">
                    <span>Estimated Total:</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              {/* Notes and Terms */}
              <div className="mb-6 text-sm">
                <h4 className="font-bold mb-2">Notes:</h4>
                <p>This is only an estimate. Actual costs may vary based on additional parts or labor required.</p>
              </div>
              
              <div className="text-sm">
                <h4 className="font-bold mb-2">Terms and Conditions:</h4>
                <p>This estimate is valid for 30 days from the date issued. By accepting this estimate, you agree to the services and costs outlined above.</p>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <div className="w-full flex flex-col-reverse sm:flex-row sm:justify-between gap-2">
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEstimatePreviewOpen(false)}>
                  <Check size={16} className="mr-2" />
                  Send Later
                </Button>
                <Button variant="outline">
                  <Download size={16} className="mr-2" />
                  Download
                </Button>
                <Button variant="outline">
                  <Printer size={16} className="mr-2" />
                  Print
                </Button>
              </div>
              <Button 
                onClick={() => {
                  setIsEstimatePreviewOpen(false);
                  toast.success(`Estimate #${estimateNumber} sent to client`);
                }}
              >
                Send Estimate
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Process Payment</DialogTitle>
          </DialogHeader>
          
          <div className="py-4 space-y-4">
            <div>
              <Label>Selected Payment Method</Label>
              <div className="flex items-center mt-2 p-3 border rounded-md bg-gray-50">
                <div className="font-medium">
                  {paymentMethod === "credit-card" ? "Credit Card" : 
                   paymentMethod === "e-transfer" ? "E-Transfer" : 
                   paymentMethod === "cash" ? "Cash" : "Check"}
                </div>
              </div>
            </div>
            
            <div>
              <Label>Amount</Label>
              <div className="flex items-center mt-2 p-3 border rounded-md bg-gray-50">
                <div className="font-medium">${calculateTotal().toFixed(2)}</div>
              </div>
            </div>
            
            {paymentMethod === "credit-card" && (
              <div className="space-y-2">
                <Label htmlFor="card-number">Card Details</Label>
                <div className="space-y-2">
                  <Input id="card-number" placeholder="Card number" />
                  <div className="grid grid-cols-2 gap-2">
                    <Input placeholder="MM/YY" />
                    <Input placeholder="CVC" />
                  </div>
                  <Input placeholder="Cardholder name" />
                </div>
              </div>
            )}
            
            {paymentMethod === "check" && (
              <div className="space-y-2">
                <Label htmlFor="check-number">Check Number</Label>
                <Input id="check-number" placeholder="Enter check number" />
              </div>
            )}
            
            {paymentMethod === "e-transfer" && (
              <div className="border rounded-md p-3 bg-muted/30">
                <p className="text-sm">Send e-transfer to: <strong>{companyInfo.email}</strong></p>
                <p className="text-sm mt-1">Reference: <strong>Job #{id}</strong></p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button
              type="button" 
              variant="outline" 
              onClick={() => setIsPaymentDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleProcessPayment}
            >
              Process Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Description Dialog */}
      <Dialog open={isDescriptionDialogOpen} onOpenChange={setIsDescriptionDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Job Description</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <textarea 
              className="w-full h-32 p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsDescriptionDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsDescriptionDialogOpen(false);
                toast.success("Job description updated");
              }}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Schedule Dialog */}
      <Dialog open={isScheduleDialogOpen} onOpenChange={setIsScheduleDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Job</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Date</p>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="p-3 pointer-events-auto border rounded-md"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Start Time</p>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="08:00">8:00 AM</SelectItem>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="13:30">1:30 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:00">3:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-2">End Time</p>
                <Select value={endTime} onValueChange={setEndTime}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select end time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00">9:00 AM</SelectItem>
                    <SelectItem value="10:00">10:00 AM</SelectItem>
                    <SelectItem value="11:00">11:00 AM</SelectItem>
                    <SelectItem value="12:00">12:00 PM</SelectItem>
                    <SelectItem value="13:00">1:00 PM</SelectItem>
                    <SelectItem value="14:00">2:00 PM</SelectItem>
                    <SelectItem value="15:30">3:30 PM</SelectItem>
                    <SelectItem value="16:00">4:00 PM</SelectItem>
                    <SelectItem value="17:00">5:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsScheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsScheduleDialogOpen(false);
                toast.success("Schedule updated");
              }}
            >
              Save Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Type Dialog */}
      <Dialog open={isJobTypeDialogOpen} onOpenChange={setIsJobTypeDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Select Job Type</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={jobType} onValueChange={setJobType}>
              {jobTypes.map((type) => (
                <div key={type} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={type} id={`job-type-${type}`} />
                  <label htmlFor={`job-type-${type}`} className="text-sm font-medium leading-none cursor-pointer">
                    {type}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsJobTypeDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsJobTypeDialogOpen(false);
                toast.success("Job type updated");
              }}
            >
              Save Selection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Job Tags Dialog */}
      <Dialog open={isTagsDialogOpen} onOpenChange={setIsTagsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Job Tags</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-3">
              {tags.map((tag) => (
                <div key={tag.id} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`tag-${tag.id}`}
                    checked={selectedTags.includes(tag.name)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedTags([...selectedTags, tag.name]);
                      } else {
                        setSelectedTags(selectedTags.filter((t) => t !== tag.name));
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium cursor-pointer">
                    {tag.name}
                  </label>
                </div>
              ))}
            </div>
            <div className="mt-4 border-t pt-4">
              <p className="text-sm font-medium mb-2">Create New Tag (Admin only)</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New tag name"
                  className="px-3 py-1 border rounded-md flex-1"
                  disabled
                />
                <Button variant="outline" disabled>Add</Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTagsDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsTagsDialogOpen(false);
                toast.success("Tags updated");
              }}
            >
              Save Tags
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Team Assignment Dialog */}
      <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Technician</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup value={selectedTechnician} onValueChange={setSelectedTechnician}>
              {technicians.map((tech) => (
                <div key={tech.id} className="flex items-center space-x-2 py-2">
                  <RadioGroupItem value={tech.name} id={`tech-${tech.id}`} />
                  <label htmlFor={`tech-${tech.id}`} className="text-sm font-medium leading-none cursor-pointer">
                    {tech.name}
                  </label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsTeamDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsTeamDialogOpen(false);
                toast.success(`Assigned to ${selectedTechnician}`);
              }}
            >
              Assign Technician
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Tasks Dialog */}
      <Dialog open={isTasksDialogOpen} onOpenChange={setIsTasksDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Tasks</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" checked className="h-4 w-4" />
                  <span>Initial diagnosis of HVAC unit</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Completed</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Check refrigerant levels</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Clean condenser coils</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <input type="checkbox" className="h-4 w-4" />
                  <span>Test system operation</span>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary">Pending</span>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Add New Task</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter task description"
                  className="px-3 py-1 border rounded-md flex-1"
                />
                <Button 
                  variant="outline"
                  onClick={() => toast.success("New task added")}
                >
                  Add
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsTasksDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachments Dialog */}
      <Dialog open={isAttachmentsDialogOpen} onOpenChange={setIsAttachmentsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Job Attachments</DialogTitle>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <div>
                    <p>HVAC-specs.pdf</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Added May 14, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center gap-3">
                  <FileText size={18} />
                  <div>
                    <p>Previous-service.pdf</p>
                    <p className="text-xs text-fixlyfy-text-secondary">Added May 13, 2023</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm">View</Button>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium mb-2">Upload New Attachment</p>
              <div className="flex gap-2">
                <input
                  type="file"
                  className="py-1 flex-1"
                />
                <Button 
                  variant="outline"
                  onClick={() => toast.success("File uploaded successfully")}
                >
                  Upload
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" onClick={() => setIsAttachmentsDialogOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
};

export default JobDetailsPage;
