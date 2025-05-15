
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Tag, 
  MoreHorizontal, 
  Pencil, 
  Phone, 
  MessageSquare,
  ReceiptText,
  FileText,
  Calculator,
  Cash,
  CreditCard,
  Wrench
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog } from "@/components/ui/dialog";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

interface JobDetailsHeaderProps {
  id?: string;
}

export const JobDetailsHeader = ({ id = "JOB-1001" }: JobDetailsHeaderProps) => {
  const [status, setStatus] = useState<string>("scheduled");
  const [isCallDialogOpen, setIsCallDialogOpen] = useState(false);
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [isEstimateDialogOpen, setIsEstimateDialogOpen] = useState(false);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] = useState(false);
  const [isExpenseDialogOpen, setIsExpenseDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("invoice");
  
  const getJobInfo = () => {
    // In a real app, this would fetch job details from API
    return {
      id: id,
      client: "Michael Johnson",
      service: "HVAC Repair",
      address: "123 Main St, Apt 45",
      phone: "(555) 123-4567",
      email: "michael.johnson@example.com",
      total: 475.99,
      balance: 475.99,
      companyName: "Fixlyfy Services",
      companyLogo: "/placeholder.svg",
      companyAddress: "456 Business Ave, Suite 789",
      companyPhone: "(555) 987-6543",
      companyEmail: "info@fixlyfy.com",
      legalText: "All services are subject to our terms and conditions. Payment due within 30 days."
    };
  };
  
  const job = getJobInfo();

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    toast.success(`Job status changed to ${newStatus}`);
  };

  // Invoice form schema
  const invoiceFormSchema = z.object({
    items: z.array(
      z.object({
        description: z.string().min(2, "Description is required"),
        quantity: z.number().min(1, "Quantity must be at least 1"),
        price: z.number().min(0.01, "Price must be greater than 0"),
        tax: z.boolean().default(false),
      })
    ).min(1, "At least one item is required"),
    notes: z.string().optional(),
  });

  // Payment form schema
  const paymentFormSchema = z.object({
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    method: z.enum(["cash", "credit-card", "e-transfer", "cheque"]),
    reference: z.string().optional(),
    notes: z.string().optional(),
  });

  // Expense form schema
  const expenseFormSchema = z.object({
    description: z.string().min(2, "Description is required"),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    tax: z.boolean().default(false),
    category: z.string().min(2, "Category is required"),
    receipt: z.boolean().default(false),
    notes: z.string().optional(),
  });

  const invoiceForm = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, price: 0, tax: false }],
      notes: "",
    },
  });

  const estimateForm = useForm<z.infer<typeof invoiceFormSchema>>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      items: [{ description: "", quantity: 1, price: 0, tax: false }],
      notes: "",
    },
  });

  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: 0,
      method: "credit-card",
      reference: "",
      notes: "",
    },
  });

  const expenseForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      description: "",
      amount: 0,
      tax: false,
      category: "Materials",
      receipt: false,
      notes: "",
    },
  });

  const handleAddItem = (form: any) => {
    const currentItems = form.getValues("items") || [];
    form.setValue("items", [
      ...currentItems,
      { description: "", quantity: 1, price: 0, tax: false },
    ]);
  };

  const handleRemoveItem = (index: number, form: any) => {
    const currentItems = form.getValues("items");
    if (currentItems.length > 1) {
      const updatedItems = currentItems.filter((_, i) => i !== index);
      form.setValue("items", updatedItems);
    }
  };

  const handleInvoiceSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    console.log("Invoice data:", data);
    toast.success("Invoice sent successfully");
    setIsInvoiceDialogOpen(false);
    window.open("about:blank", "_blank")?.focus();
  };

  const handleEstimateSubmit = (data: z.infer<typeof invoiceFormSchema>) => {
    console.log("Estimate data:", data);
    toast.success("Estimate sent successfully");
    setIsEstimateDialogOpen(false);
    window.open("about:blank", "_blank")?.focus();
  };

  const handlePaymentSubmit = (data: z.infer<typeof paymentFormSchema>) => {
    console.log("Payment data:", data);
    toast.success(`Payment of $${data.amount.toFixed(2)} processed via ${data.method}`);
    setIsPaymentDialogOpen(false);
  };

  const handleExpenseSubmit = (data: z.infer<typeof expenseFormSchema>) => {
    console.log("Expense data:", data);
    toast.success(`Expense of $${data.amount.toFixed(2)} added`);
    setIsExpenseDialogOpen(false);
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  };
  
  return (
    <div className="fixlyfy-card">
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Badge variant="outline" className="text-sm px-3 py-1 border-fixlyfy/20">
                {job.id}
              </Badge>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Badge className={cn(
                    "cursor-pointer transition-colors pl-3 pr-2 py-1",
                    status === "scheduled" && "bg-fixlyfy-info/10 text-fixlyfy-info hover:bg-fixlyfy-info/20",
                    status === "in-progress" && "bg-fixlyfy-warning/10 text-fixlyfy-warning hover:bg-fixlyfy-warning/20",
                    status === "completed" && "bg-fixlyfy-success/10 text-fixlyfy-success hover:bg-fixlyfy-success/20",
                    status === "canceled" && "bg-fixlyfy-error/10 text-fixlyfy-error hover:bg-fixlyfy-error/20",
                    status === "open" && "bg-fixlyfy-primary/10 text-fixlyfy-primary hover:bg-fixlyfy-primary/20",
                    status === "ask-review" && "bg-fixlyfy-secondary/10 text-fixlyfy-secondary hover:bg-fixlyfy-secondary/20"
                  )}>
                    {status === "scheduled" && "Scheduled"}
                    {status === "in-progress" && "In Progress"}
                    {status === "completed" && "Completed"}
                    {status === "canceled" && "Cancelled"}
                    {status === "open" && "Open"}
                    {status === "ask-review" && "Ask Review"}
                    <MoreHorizontal size={14} className="ml-1" />
                  </Badge>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("open")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-primary mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("scheduled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-info mr-2" />
                    Scheduled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-warning mr-2" />
                    In Progress
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-success mr-2" />
                    Completed
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("canceled")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-error mr-2" />
                    Cancelled
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ask-review")}>
                    <div className="w-2 h-2 rounded-full bg-fixlyfy-secondary mr-2" />
                    Ask Review
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="flex gap-1">
                <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">HVAC</Badge>
                <Badge className="bg-fixlyfy/10 text-fixlyfy border-none">Residential</Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Tag size={14} />
                </Button>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-medium">{job.client}</h2>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
                  onClick={() => setIsCallDialogOpen(true)}
                >
                  <Phone size={14} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 text-fixlyfy hover:bg-fixlyfy/10"
                  onClick={() => setIsMessageDialogOpen(true)}
                >
                  <MessageSquare size={14} />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Pencil size={12} />
                </Button>
              </div>
            </div>
            <div className="mt-2 flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-7">
                    <span className={cn(
                      status === "open" && "text-fixlyfy-primary",
                      status === "scheduled" && "text-fixlyfy-info",
                      status === "in-progress" && "text-fixlyfy-warning",
                      status === "completed" && "text-fixlyfy-success",
                      status === "canceled" && "text-fixlyfy-error",
                      status === "ask-review" && "text-fixlyfy-secondary"
                    )}>
                      {status === "open" && "Open"}
                      {status === "scheduled" && "Scheduled"}
                      {status === "in-progress" && "In Progress"}
                      {status === "completed" && "Completed"}
                      {status === "canceled" && "Cancelled"}
                      {status === "ask-review" && "Ask Review"}
                    </span>
                    <MoreHorizontal size={14} className="ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Job Status</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleStatusChange("open")}>Open</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("scheduled")}>Scheduled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("in-progress")}>In Progress</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("completed")}>Completed</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("canceled")}>Cancelled</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange("ask-review")}>Ask Review</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <div className="border-l h-5 border-gray-300 mx-1"></div>
              <div className="text-sm">
                <span className="text-fixlyfy-text-secondary">Total:</span> 
                <span className="ml-1 font-medium">${job.total.toFixed(2)}</span>
              </div>
              <div className="text-sm">
                <span className="text-fixlyfy-text-secondary">Balance:</span> 
                <span className="ml-1 font-medium">${job.balance.toFixed(2)}</span>
              </div>
            </div>
            <p className="text-fixlyfy-text-secondary text-sm mt-2">
              {job.address}
            </p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-fixlyfy-text-secondary mt-2">
              <span>{job.phone}</span>
              <span>{job.email}</span>
            </div>
          </div>
          
          <div className="flex gap-3 self-start">
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button 
                  variant="secondary" 
                  className="flex gap-2 items-center"
                  onClick={() => setIsInvoiceDialogOpen(true)}
                >
                  <ReceiptText size={16} />
                  <span>Send Invoice</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex gap-2 items-center"
                  onClick={() => setIsEstimateDialogOpen(true)}
                >
                  <FileText size={16} />
                  <span>Send Estimate</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  className="flex gap-2 items-center"
                  onClick={() => setIsPaymentDialogOpen(true)}
                >
                  <Cash size={16} />
                  <span>Add Payment</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="flex gap-2 items-center"
                  onClick={() => setIsExpenseDialogOpen(true)}
                >
                  <Wrench size={16} />
                  <span>Add Expense</span>
                </Button>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button>Actions</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Complete Job</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setIsInvoiceDialogOpen(true)}>Send Invoice</DropdownMenuItem>
                <DropdownMenuItem>Reschedule</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-fixlyfy-error">Cancel Job</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Call Dialog */}
      <Dialog open={isCallDialogOpen} onOpenChange={setIsCallDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Call Client</DialogTitle>
          </DialogHeader>
          <div className="py-6 text-center">
            <p className="text-xl font-medium mb-2">{job.client}</p>
            <p className="text-xl mb-6">{job.phone}</p>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" onClick={() => setIsCallDialogOpen(false)}>Cancel</Button>
              <Button onClick={() => {
                toast.success(`Calling ${job.client}...`);
                setIsCallDialogOpen(false);
              }}>Call Now</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Message Dialog */}
      <Dialog open={isMessageDialogOpen} onOpenChange={setIsMessageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Message History with {job.client}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="h-64 overflow-y-auto border rounded-md p-3 mb-4 space-y-3">
              <div className="flex flex-col max-w-[80%]">
                <div className="bg-muted p-3 rounded-lg">
                  <p className="text-sm">Hello! Just confirming our appointment tomorrow at 1:30 PM.</p>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary mt-1">You, May 14 9:30 AM</span>
              </div>
              
              <div className="flex flex-col max-w-[80%] self-end items-end ml-auto">
                <div className="bg-fixlyfy text-white p-3 rounded-lg">
                  <p className="text-sm">Yes, I'll be there. Thank you for the reminder.</p>
                </div>
                <span className="text-xs text-fixlyfy-text-secondary mt-1">Michael Johnson, May 14 10:15 AM</span>
              </div>
            </div>
            
            <div className="flex gap-2">
              <textarea 
                className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fixlyfy focus:outline-none" 
                placeholder="Type your message..."
                rows={2}
              />
              <Button onClick={() => toast.success("Message sent to client")}>Send</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Invoice Dialog */}
      <Dialog open={isInvoiceDialogOpen} onOpenChange={setIsInvoiceDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Invoice</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Form {...invoiceForm}>
              <form onSubmit={invoiceForm.handleSubmit(handleInvoiceSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Invoice Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddItem(invoiceForm)}
                    >
                      Add Item
                    </Button>
                  </div>
                  
                  {invoiceForm.watch("items").map((item, index) => (
                    <div key={index} className="flex flex-wrap gap-3 items-end border p-3 rounded-md">
                      <FormField
                        control={invoiceForm.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-20">
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={invoiceForm.control}
                        name={`items.${index}.tax`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Apply Tax</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveItem(index, invoiceForm)}
                        disabled={invoiceForm.watch("items").length === 1}
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateTotal(invoiceForm.watch("items")).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${calculateTotal(invoiceForm.watch("items")).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={invoiceForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for the invoice..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsInvoiceDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    window.open("about:blank", "_blank")?.focus();
                    toast.success("Invoice preview opened");
                  }}>
                    View Invoice
                  </Button>
                  <Button type="submit">Send Invoice</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Estimate Dialog */}
      <Dialog open={isEstimateDialogOpen} onOpenChange={setIsEstimateDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Create Estimate</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Form {...estimateForm}>
              <form onSubmit={estimateForm.handleSubmit(handleEstimateSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Estimate Items</h3>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddItem(estimateForm)}
                    >
                      Add Item
                    </Button>
                  </div>
                  
                  {estimateForm.watch("items").map((item, index) => (
                    <div key={index} className="flex flex-wrap gap-3 items-end border p-3 rounded-md">
                      <FormField
                        control={estimateForm.control}
                        name={`items.${index}.description`}
                        render={({ field }) => (
                          <FormItem className="flex-1 min-w-[200px]">
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Input placeholder="Item description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={estimateForm.control}
                        name={`items.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="w-20">
                            <FormLabel>Qty</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="1" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={estimateForm.control}
                        name={`items.${index}.price`}
                        render={({ field }) => (
                          <FormItem className="w-32">
                            <FormLabel>Price ($)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                min="0" 
                                step="0.01" 
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={estimateForm.control}
                        name={`items.${index}.tax`}
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-end space-x-2">
                            <FormControl>
                              <Checkbox
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>Apply Tax</FormLabel>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleRemoveItem(index, estimateForm)}
                        disabled={estimateForm.watch("items").length === 1}
                        className="ml-auto"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>${calculateTotal(estimateForm.watch("items")).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span>$0.00</span>
                      </div>
                      <div className="flex justify-between font-bold">
                        <span>Total:</span>
                        <span>${calculateTotal(estimateForm.watch("items")).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <FormField
                    control={estimateForm.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notes</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Additional notes for the estimate..."
                            className="min-h-24"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsEstimateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="button" variant="outline" onClick={() => {
                    window.open("about:blank", "_blank")?.focus();
                    toast.success("Estimate preview opened");
                  }}>
                    View Estimate
                  </Button>
                  <Button type="submit">Send Estimate</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Payment Dialog */}
      <Dialog open={isPaymentDialogOpen} onOpenChange={setIsPaymentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Payment</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Form {...paymentForm}>
              <form onSubmit={paymentForm.handleSubmit(handlePaymentSubmit)} className="space-y-4">
                <FormField
                  control={paymentForm.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount ($)</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="0.01" 
                          step="0.01" 
                          {...field}
                          onChange={(e) => field.onChange(Number(e.target.value))}
                        />
                      </FormControl>
                      <FormDescription>
                        Balance due: ${job.balance.toFixed(2)}
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Method</FormLabel>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={field.value === "cash" ? "default" : "outline"}
                          className={cn(
                            "flex items-center gap-2 justify-start px-3",
                            field.value === "cash" && "border-fixlyfy text-white"
                          )}
                          onClick={() => paymentForm.setValue("method", "cash")}
                        >
                          <Cash size={16} />
                          <span>Cash</span>
                        </Button>
                        
                        <Button
                          type="button"
                          variant={field.value === "credit-card" ? "default" : "outline"}
                          className={cn(
                            "flex items-center gap-2 justify-start px-3",
                            field.value === "credit-card" && "border-fixlyfy text-white"
                          )}
                          onClick={() => paymentForm.setValue("method", "credit-card")}
                        >
                          <CreditCard size={16} />
                          <span>Credit Card</span>
                        </Button>
                        
                        <Button
                          type="button"
                          variant={field.value === "e-transfer" ? "default" : "outline"}
                          className={cn(
                            "flex items-center gap-2 justify-start px-3",
                            field.value === "e-transfer" && "border-fixlyfy text-white"
                          )}
                          onClick={() => paymentForm.setValue("method", "e-transfer")}
                        >
                          <Cash size={16} />
                          <span>E-Transfer</span>
                        </Button>
                        
                        <Button
                          type="button"
                          variant={field.value === "cheque" ? "default" : "outline"}
                          className={cn(
                            "flex items-center gap-2 justify-start px-3",
                            field.value === "cheque" && "border-fixlyfy text-white"
                          )}
                          onClick={() => paymentForm.setValue("method", "cheque")}
                        >
                          <FileText size={16} />
                          <span>Cheque</span>
                        </Button>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="reference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reference # (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="Transaction reference number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={paymentForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsPaymentDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Process Payment</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Expense Dialog */}
      <Dialog open={isExpenseDialogOpen} onOpenChange={setIsExpenseDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Tech Expense</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Form {...expenseForm}>
              <form onSubmit={expenseForm.handleSubmit(handleExpenseSubmit)} className="space-y-4">
                <FormField
                  control={expenseForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Input placeholder="Expense description" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={expenseForm.control}
                    name="amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Amount ($)</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            min="0.01" 
                            step="0.01" 
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={expenseForm.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <FormControl>
                          <Input placeholder="Materials, Parts, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <div className="flex space-x-4">
                  <FormField
                    control={expenseForm.control}
                    name="tax"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel>Apply Tax</FormLabel>
                          <FormDescription>
                            Check if tax should be applied
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={expenseForm.control}
                    name="receipt"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div>
                          <FormLabel>Has Receipt</FormLabel>
                          <FormDescription>
                            Check if a receipt is available
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={expenseForm.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any additional notes..."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsExpenseDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Expense</Button>
                </DialogFooter>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
