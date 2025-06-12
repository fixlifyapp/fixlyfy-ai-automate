import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, DollarSign, Clock, CheckCircle, XCircle, Send, Download, Receipt } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Estimate } from "@/hooks/useEstimates";
import { formatCurrency } from "@/lib/utils";
import { LineItem } from "../builder/types";

interface EstimatePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: Estimate;
  onEstimateConverted?: () => void;
}

export const EstimatePreviewWindow = ({ 
  open, 
  onOpenChange, 
  estimate,
  onEstimateConverted 
}: EstimatePreviewWindowProps) => {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [isLoadingItems, setIsLoadingItems] = useState(false);

  useEffect(() => {
    if (open && estimate?.id) {
      parseLineItemsFromEstimate();
    }
  }, [open, estimate?.id]);

  const parseLineItemsFromEstimate = () => {
    setIsLoadingItems(true);
    try {
      // Parse items from the estimate.items JSON field
      let parsedItems: LineItem[] = [];
      
      if (estimate.items && Array.isArray(estimate.items)) {
        parsedItems = estimate.items.map((item: any, index: number) => ({
          id: item.id || `temp-${Date.now()}-${index}`,
          description: item.description || item.name || 'Service Item',
          quantity: Number(item.quantity) || 1,
          unitPrice: Number(item.unitPrice || item.price || item.unit_price) || 0,
          taxable: item.taxable !== undefined ? item.taxable : true,
          total: (Number(item.quantity) || 1) * (Number(item.unitPrice || item.price || item.unit_price) || 0),
          ourPrice: Number(item.ourPrice || item.cost || item.our_price) || 0,
          name: item.name || item.description,
          price: Number(item.price || item.unitPrice || item.unit_price) || 0
        }));
      }
      
      setLineItems(parsedItems);
    } catch (error) {
      console.error('Error parsing line items from estimate:', error);
      setLineItems([]);
    } finally {
      setIsLoadingItems(false);
    }
  };

  const handleConvertToInvoice = async () => {
    if (!estimate?.id) return;
    
    setIsConverting(true);
    try {
      // Convert estimate to invoice
      const invoiceNumber = `INV-${Date.now()}`;
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          estimate_id: estimate.id,
          invoice_number: invoiceNumber,
          total: estimate.total || 0,
          amount_paid: 0,
          status: 'unpaid',
          notes: estimate.notes,
          due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          items: estimate.items || []
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update estimate status
      const { error: updateError } = await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimate.id);

      if (updateError) {
        console.error('Error updating estimate status:', updateError);
        // Don't throw here, conversion was successful
      }

      toast.success('Estimate converted to invoice successfully');
      onEstimateConverted?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      toast.error('Failed to convert estimate to invoice');
    } finally {
      setIsConverting(false);
    }
  };

  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + item.total, 0);
  };

  const calculateTax = () => {
    const taxableAmount = lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.total : 0);
    }, 0);
    return taxableAmount * 0.1; // 10% tax rate
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { color: "bg-gray-100 text-gray-800", icon: FileText },
      sent: { color: "bg-blue-100 text-blue-800", icon: Send },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle },
      converted: { color: "bg-purple-100 text-purple-800", icon: Receipt }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft;
    const IconComponent = config.icon;

    return (
      <Badge className={`${config.color} gap-1`}>
        <IconComponent className="h-3 w-3" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Estimate Preview - {estimate.estimate_number || estimate.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Info */}
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold">{estimate.estimate_number || estimate.number}</h2>
              <p className="text-sm text-muted-foreground">
                Created on {formatDate(estimate.created_at)}
              </p>
              {estimate.valid_until && (
                <p className="text-sm text-muted-foreground">
                  Valid until {formatDate(estimate.valid_until)}
                </p>
              )}
            </div>
            <div className="text-right">
              {getStatusBadge(estimate.status)}
              <div className="mt-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(estimate.total || calculateTotal())}
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Line Items */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Items & Services</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoadingItems ? (
                <div className="text-center py-4">Loading items...</div>
              ) : lineItems.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  No items found for this estimate
                </div>
              ) : (
                <div className="space-y-2">
                  {lineItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-b-0">
                      <div className="flex-1">
                        <div className="font-medium">{item.description}</div>
                        <div className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
                          {item.taxable && " (Taxable)"}
                        </div>
                      </div>
                      <div className="font-medium">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Totals */}
          {lineItems.length > 0 && (
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>{formatCurrency(calculateSubtotal())}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (10%):</span>
                    <span>{formatCurrency(calculateTax())}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>{formatCurrency(calculateTotal())}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notes */}
          {estimate.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{estimate.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            
            {estimate.status !== 'converted' && (
              <Button 
                onClick={handleConvertToInvoice}
                disabled={isConverting}
                className="gap-2"
              >
                {isConverting ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Receipt className="h-4 w-4" />
                    Convert to Invoice
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
