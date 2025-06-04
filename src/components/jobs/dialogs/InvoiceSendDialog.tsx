import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WarrantySelectionStep } from "./estimate-builder/WarrantySelectionStep";
import { Product } from "../builder/types";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { CheckCircle, Mail, MessageSquare } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { formatPhoneForTelnyx, isValidPhoneNumber } from "@/utils/phoneUtils";
import { useJobData } from "./unified/hooks/useJobData";

interface InvoiceSendDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => Promise<boolean>;
  onAddWarranty: (warranty: Product | null, note: string) => void;
  clientInfo?: { 
    id?: string;
    name?: string;
    email?: string; 
    phone?: string; 
  } | null;
  invoiceNumber: string;
  jobId?: string;
}

interface InvoiceDetails {
  invoice_id: string;
  invoice_number: string;
  total: number;
  status: string;
  notes?: string;
  job_id: string;
  job_title: string;
  job_description?: string;
  client_id: string;
  client_name: string;
  client_email?: string;
  client_phone?: string;
  client_company?: string;
}

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unit_price: number;
  taxable: boolean;
}

type SendStep = "warranty" | "send-method" | "confirmation";

const isValidEmail = (email: string): boolean => {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const InvoiceSendDialog = ({
  open,
  onOpenChange,
  onSave,
  onAddWarranty,
  clientInfo: propClientInfo,
  invoiceNumber,
  jobId
}: InvoiceSendDialogProps) => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<SendStep>("warranty");
  const [sendMethod, setSendMethod] = useState<"email" | "sms">("email");
  const [sendTo, setSendTo] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [customNote, setCustomNote] = useState("");
  const [invoiceDetails, setInvoiceDetails] = useState<InvoiceDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string>("");
  
  // Fetch job and client data using the optimized hook
  const { clientInfo: jobClientInfo, loading: jobDataLoading } = useJobData(jobId || '');
  
  // Use job client info if available, otherwise fall back to prop client info
  const clientInfo = jobClientInfo || propClientInfo;
  
  // Fetch job and client details when dialog opens
  useEffect(() => {
    if (open && invoiceNumber) {
      console.log("Dialog opened, fetching data for:", invoiceNumber);
      fetchInvoiceAndClientDetails();
    }
  }, [open, invoiceNumber, jobId]);

  const fetchInvoiceAndClientDetails = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching invoice details for invoice number:", invoiceNumber);
      
      const { data: details, error: detailsError } = await supabase
        .from('invoice_details_view')
        .select('*')
        .eq('invoice_number', invoiceNumber)
        .maybeSingle();

      if (detailsError && detailsError.code !== 'PGRST116') {
        console.error('Error fetching invoice details:', detailsError);
      }

      console.log("Invoice details from view:", details);

      if (details) {
        setInvoiceDetails(details);
        setClientInfo({
          id: details.client_id,
          name: details.client_name,
          email: details.client_email,
          phone: details.client_phone
        });
        console.log("Client info updated from invoice details:", {
          id: details.client_id,
          name: details.client_name,
          email: details.client_email,
          phone: details.client_phone
        });
      } else {
        console.log("No data from view, trying direct fetch");
        
        const { data: invoice, error: invoiceError } = await supabase
          .from('invoices')
          .select('*')
          .eq('invoice_number', invoiceNumber)
          .maybeSingle();

        if (invoiceError) {
          console.error('Error fetching invoice directly:', invoiceError);
        }

        if (jobId || invoice?.job_id) {
          const targetJobId = jobId || invoice?.job_id;
          
          const { data: job, error: jobError } = await supabase
            .from('jobs')
            .select(`
              *,
              client:clients(*)
            `)
            .eq('id', targetJobId)
            .single();

          if (!jobError && job?.client) {
            const clientData = Array.isArray(job.client) ? job.client[0] : job.client;
            
            setClientInfo({
              id: clientData.id,
              name: clientData.name,
              email: clientData.email,
              phone: clientData.phone
            });
            
            console.log("Client info fetched from job:", clientData);
          }
        }

        if (invoice) {
          const fallbackDetails: InvoiceDetails = {
            invoice_id: invoice.id,
            invoice_number: invoice.invoice_number,
            total: invoice.total || 0,
            status: invoice.status || 'draft',
            notes: invoice.notes,
            job_id: invoice.job_id || '',
            job_title: '',
            job_description: '',
            client_id: clientInfo?.id || '',
            client_name: clientInfo?.name || 'Unknown Client',
            client_email: clientInfo?.email,
            client_phone: clientInfo?.phone,
            client_company: ''
          };

          setInvoiceDetails(fallbackDetails);
          console.log("Using fallback invoice details:", fallbackDetails);
        }
      }

      const invoiceId = details?.invoice_id || invoiceDetails?.invoice_id;
      if (invoiceId) {
        const { data: items, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'invoice')
          .eq('parent_id', invoiceId);

        if (itemsError) {
          console.error('Error fetching line items:', itemsError);
        } else if (items) {
          console.log("Line items loaded:", items.length, "items");
          setLineItems(items);
        }
      }

    } catch (error: any) {
      console.error('Error in fetchInvoiceAndClientDetails:', error);
      toast.error('Failed to load invoice data');
    } finally {
      setIsLoading(false);
    }
  };

  const getClientContactInfo = () => {
    const contactData = {
      name: clientInfo?.name || 'Unknown Client',
      email: clientInfo?.email || '',
      phone: clientInfo?.phone || ''
    };
    
    console.log("Final contact data:", contactData);
    return contactData;
  };

  const contactInfo = getClientContactInfo();
  const hasValidEmail = isValidEmail(contactInfo.email);
  const hasValidPhone = isValidPhoneNumber(contactInfo.phone);
  
  console.log("Contact validation - Email valid:", hasValidEmail, "Phone valid:", hasValidPhone);
  console.log("Contact info:", contactInfo);

  useEffect(() => {
    if (contactInfo.name !== 'Unknown Client' && !jobDataLoading) {
      setValidationError("");
      
      if (hasValidEmail && sendMethod === "email") {
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && sendMethod === "sms") {
        const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
        setSendTo(formattedPhone);
        console.log("Auto-filled phone number:", formattedPhone);
      } else if (hasValidEmail && !hasValidPhone) {
        setSendMethod("email");
        setSendTo(contactInfo.email);
      } else if (hasValidPhone && !hasValidEmail) {
        setSendMethod("sms");
        const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
        setSendTo(formattedPhone);
      }
    }
  }, [contactInfo, sendMethod, hasValidEmail, hasValidPhone, jobDataLoading]);

  const getInvoiceId = (): string | null => {
    if (invoiceDetails && 'invoice_id' in invoiceDetails) {
      return invoiceDetails.invoice_id;
    }
    return null;
  };

  const getInvoiceTotal = (): number => {
    if (invoiceDetails && 'total' in invoiceDetails) {
      return invoiceDetails.total;
    }
    return 0;
  };

  const getInvoiceNotes = (): string | undefined => {
    if (invoiceDetails && 'notes' in invoiceDetails) {
      return invoiceDetails.notes;
    }
    return undefined;
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      console.log("Dialog opening, resetting state");
      setCurrentStep("warranty");
      setIsProcessing(false);
      setCustomNote("");
      setValidationError("");
    } else {
      console.log("Dialog closing, clearing data");
      setInvoiceDetails(null);
      setLineItems([]);
      setSendTo("");
      setValidationError("");
    }
    onOpenChange(newOpen);
  };
  
  const handleWarrantySelect = (warranty: Product | null, note: string) => {
    console.log("Warranty selected:", warranty?.name || "none", "with note:", note);
    
    if (warranty) {
      onAddWarranty(warranty, note);
      setCustomNote(note);
    }
    
    console.log("Moving to send-method step");
    setCurrentStep("send-method");
  };
  
  const handleSkipWarranty = () => {
    console.log("Skipping warranty, moving to send-method step");
    setCurrentStep("send-method");
  };

  const handleSendMethodChange = (value: "email" | "sms") => {
    console.log("Send method changed to:", value);
    setSendMethod(value);
    setValidationError("");
    
    if (value === "email" && hasValidEmail) {
      setSendTo(contactInfo.email);
    } else if (value === "sms" && hasValidPhone) {
      const formattedPhone = formatPhoneForTelnyx(contactInfo.phone);
      setSendTo(formattedPhone);
    } else {
      setSendTo("");
    }
  };

  const validateRecipient = (method: "email" | "sms", recipient: string): string | null => {
    if (!recipient.trim()) {
      return `Please enter a ${method === "email" ? "email address" : "phone number"}`;
    }

    if (method === "email") {
      if (!isValidEmail(recipient)) {
        return "Please enter a valid email address";
      }
    } else if (method === "sms") {
      if (!isValidPhoneNumber(recipient)) {
        return "Please enter a valid phone number";
      }
    }

    return null;
  };
  
  const handleSendInvoice = async () => {
    console.log("=== STARTING INVOICE SEND PROCESS ===");
    console.log("Send method:", sendMethod);
    console.log("Send to:", sendTo);
    console.log("Invoice number:", invoiceNumber);
    console.log("Client info:", contactInfo);

    const validationErrorMsg = validateRecipient(sendMethod, sendTo);
    if (validationErrorMsg) {
      setValidationError(validationErrorMsg);
      toast.error(validationErrorMsg);
      console.error("Validation failed:", validationErrorMsg);
      return;
    }

    setIsProcessing(true);
    setValidationError("");
    
    try {
      console.log("Step 1: Saving invoice...");
      const success = await onSave();
      
      if (!success) {
        console.error("Failed to save invoice");
        toast.error("Failed to save invoice. Please try again.");
        setIsProcessing(false);
        return;
      }

      console.log("Step 2: Invoice saved, fetching updated details...");
      await fetchInvoiceAndClientDetails();
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const invoiceId = getInvoiceId();
      const invoiceTotal = getInvoiceTotal();
      const invoiceNotes = getInvoiceNotes();

      console.log("Step 3: Invoice details retrieved:", {
        invoiceId,
        invoiceTotal,
        invoiceNotes
      });

      if (!invoiceId) {
        console.error("No invoice ID found");
        toast.error("Invoice not found. Please save the invoice first and try again.");
        setIsProcessing(false);
        return;
      }

      let finalRecipient = sendTo;
      if (sendMethod === "sms") {
        finalRecipient = formatPhoneForTelnyx(sendTo);
        console.log("Formatted phone number:", finalRecipient);
        
        if (!isValidPhoneNumber(finalRecipient)) {
          const error = "Invalid phone number format";
          setValidationError(error);
          toast.error(error);
          console.error(error);
          setIsProcessing(false);
          return;
        }
      }

      console.log("Step 4: Creating communication record...");
      const { data: commData, error: commError } = await supabase
        .from('invoice_communications')
        .insert({
          invoice_id: invoiceId,
          communication_type: sendMethod,
          recipient: finalRecipient,
          subject: sendMethod === 'email' ? `Invoice ${invoiceNumber}` : null,
          content: sendMethod === 'sms' 
            ? `Hi ${contactInfo.name}! Your invoice ${invoiceNumber} is ready. Total: $${invoiceTotal.toFixed(2)}.`
            : `Please find your invoice ${invoiceNumber} attached. Total: $${invoiceTotal.toFixed(2)}.`,
          status: 'pending',
          invoice_number: invoiceNumber,
          client_name: contactInfo.name,
          client_email: contactInfo.email,
          client_phone: contactInfo.phone
        })
        .select()
        .single();

      if (commError) {
        console.error('Error creating communication record:', commError);
        toast.error('Failed to create communication record');
        setIsProcessing(false);
        return;
      }

      console.log("Step 5: Communication record created:", commData);

      // Generate client portal login token
      let portalLoginLink = '';
      if (contactInfo.email) {
        try {
          console.log("Step 6: Generating portal login token...");
          const { data: tokenData, error: tokenError } = await supabase.rpc('generate_client_login_token', {
            p_email: contactInfo.email
          });

          if (!tokenError && tokenData) {
            portalLoginLink = `${window.location.origin}/portal/login?token=${tokenData}`;
            console.log("Portal login link generated");
          } else {
            console.warn("Failed to generate portal login token:", tokenError);
          }
        } catch (error) {
          console.error('Error generating portal login token:', error);
        }
      }

      const invoiceData = {
        lineItems: lineItems.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          taxable: item.taxable,
          total: item.quantity * Number(item.unit_price)
        })),
        total: invoiceTotal,
        taxRate: 13,
        notes: customNote || invoiceNotes,
        viewUrl: `${window.location.origin}/invoice/view/${invoiceNumber}`,
        portalLoginLink: portalLoginLink
      };

      console.log("Step 7: Calling send-invoice edge function...");
      console.log("Request payload:", {
        method: sendMethod,
        recipient: finalRecipient,
        invoiceNumber: invoiceNumber,
        invoiceData: invoiceData,
        clientName: contactInfo.name,
        communicationId: commData.id
      });

      const { data, error } = await supabase.functions.invoke('send-invoice', {
        body: {
          method: sendMethod,
          recipient: finalRecipient,
          invoiceNumber: invoiceNumber,
          invoiceData: invoiceData,
          clientName: contactInfo.name,
          communicationId: commData.id
        }
      });
      
      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message);
      }
      
      console.log("Step 8: Edge function response:", data);
      
      if (data?.success) {
        const method = sendMethod === "email" ? "email" : "text message";
        toast.success(`Invoice ${invoiceNumber} sent to client via ${method}`);
        console.log("SUCCESS: Invoice sent successfully");
        
        setCurrentStep("confirmation");
      } else {
        console.error("Edge function returned error:", data);
        await supabase
          .from('invoice_communications')
          .update({
            status: 'failed',
            error_message: data?.error || 'Unknown error'
          })
          .eq('id', commData.id);
        
        toast.error(`Failed to send invoice: ${data?.error || 'Unknown error'}`);
        setIsProcessing(false);
      }
    } catch (error: any) {
      console.error("CRITICAL ERROR in send invoice process:", error);
      toast.error(`An error occurred while sending the invoice: ${error.message}`);
      setIsProcessing(false);
    }
    
    console.log("=== INVOICE SEND PROCESS COMPLETED ===");
  };
  
  const handleCloseAfterSend = () => {
    onOpenChange(false);
    const currentPath = window.location.pathname;
    if (currentPath.includes('/jobs/')) {
      const jobId = currentPath.split('/').pop();
      const jobDetailsUrl = `/jobs/${jobId}`;
      navigate(jobDetailsUrl, { state: { activeTab: "invoices" } });
    }
  };

  if (isLoading || jobDataLoading) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Loading Invoice Details...</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-muted-foreground">
              {jobDataLoading ? "Loading client information..." : "Loading invoice details..."}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentStep === "warranty" && "Add Warranty to Invoice"}
            {currentStep === "send-method" && "Send Invoice to Client"}
            {currentStep === "confirmation" && "Invoice Sent"}
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          {currentStep === "warranty" && (
            <WarrantySelectionStep
              onSelectWarranty={handleWarrantySelect}
              onSkip={handleSkipWarranty}
            />
          )}
          
          {currentStep === "send-method" && (
            <div className="space-y-6">
              <div className="text-sm text-muted-foreground mb-4">
                Send invoice {invoiceNumber} to {contactInfo.name}:
              </div>
              
              <RadioGroup value={sendMethod} onValueChange={handleSendMethodChange}>
                <div className={`flex items-start space-x-3 border rounded-md p-3 mb-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "email" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="email" id="email" className="mt-1" disabled={!hasValidEmail} />
                  <div className="flex-1">
                    <Label htmlFor="email" className="flex items-center gap-2 font-medium cursor-pointer">
                      <Mail size={16} />
                      Send via Email
                    </Label>
                    {hasValidEmail ? (
                      <p className="text-sm text-muted-foreground mt-1">{contactInfo.email}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No valid email available for this client</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
                  </div>
                </div>
                
                <div className={`flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 cursor-pointer ${
                  sendMethod === "sms" ? "border-primary bg-primary/5" : "border-input"
                }`}>
                  <RadioGroupItem value="sms" id="sms" className="mt-1" disabled={!hasValidPhone} />
                  <div className="flex-1">
                    <Label htmlFor="sms" className="flex items-center gap-2 font-medium cursor-pointer">
                      <MessageSquare size={16} />
                      Send via Text Message
                    </Label>
                    {hasValidPhone ? (
                      <p className="text-sm text-muted-foreground mt-1">{contactInfo.phone}</p>
                    ) : (
                      <p className="text-sm text-amber-600 mt-1">No valid phone number available for this client</p>
                    )}
                    <p className="text-xs text-blue-600 mt-1">Includes secure portal access link</p>
                  </div>
                </div>
              </RadioGroup>
              
              <div className="space-y-2">
                <Label htmlFor="send-to">
                  {sendMethod === "email" ? "Email Address" : "Phone Number"}
                </Label>
                <Input
                  id="send-to"
                  value={sendTo}
                  onChange={(e) => {
                    setSendTo(e.target.value);
                    setValidationError("");
                  }}
                  placeholder={sendMethod === "email" ? "client@example.com" : "+1234567890 or (555) 123-4567"}
                  className={validationError ? "border-red-500" : ""}
                />
                {validationError && (
                  <p className="text-sm text-red-600 mt-1">{validationError}</p>
                )}
                {sendMethod === "sms" && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Phone numbers will be automatically formatted for Telnyx delivery
                  </p>
                )}
              </div>
              
              <div className="pt-4 flex justify-end gap-2">
                <Button variant="outline" onClick={() => setCurrentStep("warranty")}>
                  Back
                </Button>
                <Button 
                  onClick={handleSendInvoice} 
                  disabled={!sendTo || isProcessing || !!validationError}
                >
                  {isProcessing ? "Sending..." : "Send Invoice"}
                </Button>
              </div>
            </div>
          )}
          
          {currentStep === "confirmation" && (
            <div className="text-center p-6">
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Invoice Sent Successfully</h3>
              <p className="text-muted-foreground mb-6">
                The invoice has been sent to the client via {sendMethod === "email" ? "email" : "text message"}.
                {sendMethod === "email" && (
                  <span className="block mt-2">The client can access their portal to view and pay the invoice.</span>
                )}
                {sendMethod === "sms" && (
                  <span className="block mt-2">The client can access their portal to view and pay the invoice via the secure link.</span>
                )}
                {customNote && <span className="block mt-2">Your warranty recommendation was included.</span>}
              </p>
              <Button onClick={handleCloseAfterSend}>
                Close
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
