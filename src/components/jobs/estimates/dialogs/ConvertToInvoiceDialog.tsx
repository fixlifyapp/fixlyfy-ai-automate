
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useJobHistoryIntegration } from "@/hooks/useJobHistoryIntegration";

interface ConvertToInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: any;
  onSuccess?: () => void;
}

export const ConvertToInvoiceDialog = ({
  open,
  onOpenChange,
  estimate,
  onSuccess
}: ConvertToInvoiceDialogProps) => {
  const [isConverting, setIsConverting] = useState(false);
  const { logEstimateConverted } = useJobHistoryIntegration();

  const handleConvert = async () => {
    setIsConverting(true);
    try {
      // Get next invoice number
      const { data: counter } = await supabase.rpc('generate_next_id', {
        p_entity_type: 'invoice'
      });

      const invoiceNumber = counter || '1';

      // Create invoice from estimate
      const { data: invoice, error } = await supabase
        .from('invoices')
        .insert({
          job_id: estimate.job_id,
          client_id: estimate.client_id,
          estimate_id: estimate.id,
          invoice_number: invoiceNumber,
          title: estimate.title,
          description: estimate.description,
          items: estimate.items,
          subtotal: estimate.subtotal,
          tax_rate: estimate.tax_rate,
          tax_amount: estimate.tax_amount,
          total: estimate.total,
          notes: estimate.notes,
          terms: estimate.terms,
          status: 'sent'
        })
        .select()
        .single();

      if (error) throw error;

      // Update estimate status
      await supabase
        .from('estimates')
        .update({ status: 'converted' })
        .eq('id', estimate.id);

      // Log conversion to job history
      await logEstimateConverted(
        estimate.job_id,
        estimate.estimate_number,
        invoiceNumber,
        estimate.total
      );

      toast.success('Estimate converted to invoice successfully');
      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error converting estimate:', error);
      toast.error('Failed to convert estimate');
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Convert to Invoice</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <p>Are you sure you want to convert this estimate to an invoice?</p>
        </div>
        <Button onClick={handleConvert} disabled={isConverting}>
          {isConverting ? "Converting..." : "Convert to Invoice"}
        </Button>
      </DialogContent>
    </Dialog>
  );
};
