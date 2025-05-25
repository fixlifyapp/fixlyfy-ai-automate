
import React, { useState, useEffect } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { PlusCircle, Edit, Trash, CreditCard, FileText, DollarSign, Calendar, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { InvoiceDialog } from "../dialogs/InvoiceDialog";

interface ModernJobInvoicesTabProps {
  jobId: string;
}

type Invoice = {
  id: string;
  invoice_number: string;
  created_at: string;
  total: number;
  amount_paid: number;
  balance: number;
  status: string;
  notes?: string;
};

export const ModernJobInvoicesTab = ({ jobId }: ModernJobInvoicesTabProps) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
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
      
      setInvoices(data || []);
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
  
  const handleNewInvoice = () => {
    setSelectedInvoice(null);
    setIsEditMode(false);
    setIsInvoiceDialogOpen(true);
  };

  const handleInvoiceCreated = (amount: number) => {
    fetchInvoices();
  };

  const renderStatusBadge = (status: string) => {
    const statusStyles = {
      paid: "bg-green-50 text-green-700 border-green-200",
      partial: "bg-yellow-50 text-yellow-700 border-yellow-200", 
      unpaid: "bg-red-50 text-red-700 border-red-200"
    };
    
    return (
      <Badge 
        variant="outline" 
        className={statusStyles[status.toLowerCase() as keyof typeof statusStyles] || "bg-gray-50 text-gray-700 border-gray-200"}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={FileText}>
              Invoices ({invoices.length})
            </ModernCardTitle>
            <Button 
              className="gap-2 bg-fixlyfy hover:bg-fixlyfy-dark" 
              onClick={handleNewInvoice}
            >
              <PlusCircle size={16} />
              New Invoice
            </Button>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-20" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No invoices found</p>
              <p className="text-sm">Create your first invoice or convert an estimate to invoice</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-medium">{invoice.invoice_number}</h4>
                        {renderStatusBadge(invoice.status)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {format(new Date(invoice.created_at), 'MMM dd, yyyy')}
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${invoice.total.toFixed(2)}
                        </div>
                        {invoice.amount_paid > 0 && (
                          <div className="text-green-600">
                            Paid: ${invoice.amount_paid.toFixed(2)}
                          </div>
                        )}
                        {invoice.balance > 0 && (
                          <div className="text-red-600">
                            Balance: ${invoice.balance.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditInvoice(invoice)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteInvoice(invoice.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>
      
      <InvoiceDialog 
        open={isInvoiceDialogOpen}
        onOpenChange={setIsInvoiceDialogOpen}
        onInvoiceCreated={handleInvoiceCreated}
        clientInfo={clientInfo}
        companyInfo={companyInfo}
        editInvoice={isEditMode ? selectedInvoice : undefined}
      />
    </div>
  );
};
