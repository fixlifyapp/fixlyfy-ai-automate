
import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Edit, Trash, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { InvoiceDialog } from "./dialogs/InvoiceDialog";
import { InvoicePreviewWindow } from "./dialogs/InvoicePreviewWindow";
import { formatCurrency } from "@/lib/utils";
import { Invoice } from "@/hooks/useInvoices";

interface JobInvoicesProps {
  jobId: string;
}

export const JobInvoices = ({ jobId }: JobInvoicesProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Mock data for client and company info
  const clientInfo = {
    name: "Client Name",
    address: "123 Client St",
    phone: "123-456-7890",
    email: "client@example.com"
  };
  
  const companyInfo = {
    name: "Your Company",
    logo: "/placeholder.svg",
    address: "123 Business Ave",
    phone: "555-555-5555",
    email: "company@example.com",
    legalText: "Terms and conditions apply."
  };
  
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("invoices")
        .select("*")
        .eq("job_id", jobId)
        .order("created_at", { ascending: false });
        
      if (error) {
        throw error;
      }
      
      // Add compatibility properties and ensure required fields
      const processedInvoices: Invoice[] = (data || []).map(invoice => ({
        ...invoice,
        number: invoice.invoice_number, // Add alias
        updated_at: invoice.updated_at || invoice.created_at, // Ensure updated_at exists
        date: invoice.date || invoice.issue_date || invoice.created_at, // Use the new date column
        amount_paid: invoice.amount_paid || 0, // Ensure amount_paid is always a number
        balance: (invoice.total || 0) - (invoice.amount_paid || 0),
        notes: invoice.notes || '',
        items: Array.isArray(invoice.items) ? invoice.items : [] // Ensure items is always an array
      }));
      
      setInvoices(processedInvoices);
    } catch (error) {
      console.error("Error fetching invoices:", error);
      toast.error("Failed to load invoices");
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    fetchInvoices();
  }, [jobId]);
  
  const handleDeleteInvoice = async (invoiceId: string) => {
    try {
      const { error } = await supabase
        .from("invoices")
        .delete()
        .eq("id", invoiceId);
        
      if (error) {
        throw error;
      }
      
      setInvoices(invoices.filter(inv => inv.id !== invoiceId));
      toast.success("Invoice deleted successfully");
    } catch (error) {
      console.error("Error deleting invoice:", error);
      toast.error("Failed to delete invoice");
    }
  };
  
  const handleEditInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsEditMode(true);
    setIsInvoiceDialogOpen(true);
  };

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };
  
  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setIsInvoiceDialogOpen(true);
  };

  const handleInvoiceCreated = (amount: number) => {
    fetchInvoices();
  };

  const handlePaymentRecorded = () => {
    // Refresh invoices when payment is recorded
    fetchInvoices();
    // Clear selected invoice to force refresh when reopened
    setSelectedInvoice(null);
  };

  // Function to render status badge with appropriate color
  const renderStatusBadge = (status: string) => {
    let color = "";
    
    switch (status.toLowerCase()) {
      case "paid":
        color = "bg-green-100 text-green-800";
        break;
      case "partial":
        color = "bg-yellow-100 text-yellow-800";
        break;
      case "unpaid":
        color = "bg-red-100 text-red-800";
        break;
      default:
        color = "bg-gray-200";
    }
    
    return (
      <Badge className={color}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <>
      <Card className="border-fixlyfy-border shadow-sm">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium">Invoices</h3>
            <Button className="gap-2" onClick={handleNewInvoice}>
              <PlusCircle size={16} />
              New Invoice
            </Button>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <p>No invoices found for this job.</p>
              <p className="mt-2">Create your first invoice or convert an estimate to invoice.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id} 
                  className="border rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h4 className="font-medium">{invoice.invoice_number}</h4>
                      {renderStatusBadge(invoice.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Created on {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  
                  <div className="space-y-1 text-right">
                    <div className="text-lg font-semibold">
                      {formatCurrency(invoice.total)}
                    </div>
                    {invoice.amount_paid > 0 && (
                      <p className="text-sm text-green-600">
                        Paid: {formatCurrency(invoice.amount_paid)}
                      </p>
                    )}
                    {invoice.balance > 0 && (
                      <p className="text-sm text-red-600">
                        Balance: {formatCurrency(invoice.balance)}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 md:justify-end">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleViewInvoice(invoice)}
                      className="gap-2"
                    >
                      <Eye size={16} />
                      View
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleEditInvoice(invoice)}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteInvoice(invoice.id)}
                    >
                      <Trash size={16} className="mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {/* Invoice Dialog */}
          <InvoiceDialog 
            open={isInvoiceDialogOpen}
            onOpenChange={setIsInvoiceDialogOpen}
            onInvoiceCreated={handleInvoiceCreated}
            clientInfo={clientInfo}
            companyInfo={companyInfo}
            editInvoice={isEditMode ? selectedInvoice : undefined}
          />

          {/* Invoice Preview Window */}
          {selectedInvoice && (
            <InvoicePreviewWindow
              open={showPreview}
              onOpenChange={(open) => {
                setShowPreview(open);
                if (!open) {
                  // Refresh invoice data when closing preview
                  const refreshedInvoice = invoices.find(inv => inv.id === selectedInvoice.id);
                  if (refreshedInvoice) {
                    setSelectedInvoice(refreshedInvoice);
                  }
                }
              }}
              invoice={selectedInvoice}
              jobId={jobId}
              onPaymentRecorded={handlePaymentRecorded}
            />
          )}
        </CardContent>
      </Card>
    </>
  );
};
