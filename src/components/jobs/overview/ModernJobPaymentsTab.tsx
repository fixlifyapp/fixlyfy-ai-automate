
import React, { useState } from "react";
import { ModernCard, ModernCardHeader, ModernCardContent, ModernCardTitle } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { usePayments, Payment } from "@/hooks/usePayments";
import { useInvoices } from "@/hooks/useInvoices";
import { useJobHistory } from "@/hooks/useJobHistory";
import { 
  DollarSign, 
  Plus,
  CreditCard,
  Banknote,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ModernJobPaymentsTabProps {
  jobId: string;
}

export const ModernJobPaymentsTab = ({ jobId }: ModernJobPaymentsTabProps) => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formData, setFormData] = useState({
    invoice_id: '',
    amount: '',
    method: 'credit-card',
    reference: '',
    notes: ''
  });

  const { payments, isLoading, refreshPayments } = usePayments(jobId);
  const { invoices } = useInvoices(jobId);
  const { addHistoryItem } = useJobHistory(jobId);

  const handleCreatePayment = async () => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          invoice_id: formData.invoice_id,
          amount: parseFloat(formData.amount),
          method: formData.method,
          reference: formData.reference,
          notes: formData.notes,
          date: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      await addHistoryItem({
        job_id: jobId,
        entity_id: data.id,
        entity_type: 'payment',
        type: 'payment',
        title: 'Payment Recorded',
        description: `Payment of $${formData.amount} recorded via ${formData.method}`,
        meta: { 
          action: 'create', 
          amount: formData.amount,
          method: formData.method,
          invoice_id: formData.invoice_id
        }
      });

      toast.success("Payment recorded successfully");
      refreshPayments();
      setIsCreateDialogOpen(false);
      setFormData({
        invoice_id: '',
        amount: '',
        method: 'credit-card',
        reference: '',
        notes: ''
      });
    } catch (error) {
      console.error("Failed to create payment:", error);
      toast.error("Failed to record payment");
    }
  };

  const handleDeleteClick = (payment: Payment) => {
    setSelectedPayment(payment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedPayment) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', selectedPayment.id);
        
      if (error) throw error;
      
      await addHistoryItem({
        job_id: jobId,
        entity_id: selectedPayment.id,
        entity_type: 'payment',
        type: 'payment',
        title: 'Payment Deleted',
        description: `Payment of $${selectedPayment.amount} was deleted`,
        meta: { action: 'delete', amount: selectedPayment.amount }
      });
      
      toast.success("Payment deleted successfully");
      refreshPayments();
    } catch (error) {
      console.error("Failed to delete payment:", error);
      toast.error("Failed to delete payment");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
      setSelectedPayment(null);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit-card':
      case 'debit-card':
        return <CreditCard className="h-4 w-4" />;
      case 'cash':
        return <Banknote className="h-4 w-4" />;
      default:
        return <DollarSign className="h-4 w-4" />;
    }
  };

  const getMethodColor = (method: string) => {
    switch (method) {
      case 'credit-card':
      case 'debit-card':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'cash':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'check':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);

  return (
    <div className="space-y-6">
      <ModernCard variant="elevated" className="hover:shadow-lg transition-all duration-300">
        <ModernCardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <ModernCardTitle icon={DollarSign}>
              Payments ({payments.length})
            </ModernCardTitle>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Total Received</p>
                <p className="text-lg font-semibold text-green-600">
                  ${totalPaid.toFixed(2)}
                </p>
              </div>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Record Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Record New Payment</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="invoice">Invoice</Label>
                      <Select 
                        value={formData.invoice_id} 
                        onValueChange={(value) => setFormData({...formData, invoice_id: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select invoice" />
                        </SelectTrigger>
                        <SelectContent>
                          {invoices.map((invoice) => (
                            <SelectItem key={invoice.id} value={invoice.id}>
                              {invoice.number} - ${invoice.total?.toFixed(2)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="amount">Amount</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({...formData, amount: e.target.value})}
                        placeholder="0.00"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="method">Payment Method</Label>
                      <Select 
                        value={formData.method} 
                        onValueChange={(value) => setFormData({...formData, method: value})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit-card">Credit Card</SelectItem>
                          <SelectItem value="debit-card">Debit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="check">Check</SelectItem>
                          <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="reference">Reference</Label>
                      <Input
                        id="reference"
                        value={formData.reference}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                        placeholder="Transaction ID, check number, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        placeholder="Additional notes..."
                      />
                    </div>
                    
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreatePayment}
                        disabled={!formData.invoice_id || !formData.amount}
                      >
                        Record Payment
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="w-full h-20" />
              ))}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-lg font-medium">No payments recorded</p>
              <p className="text-sm">Record your first payment to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4 bg-white hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="flex items-center text-lg font-semibold text-green-600">
                          <DollarSign className="h-5 w-5 mr-1" />
                          {payment.amount.toFixed(2)}
                        </div>
                        <Badge className={getMethodColor(payment.method)}>
                          <div className="flex items-center gap-1">
                            {getMethodIcon(payment.method)}
                            {payment.method.replace('-', ' ')}
                          </div>
                        </Badge>
                        {payment.reference && (
                          <span className="text-sm text-muted-foreground">
                            Ref: {payment.reference}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Received {formatDistanceToNow(new Date(payment.date), { addSuffix: true })}
                      </p>
                      {payment.notes && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {payment.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-4 w-4" />
                        View
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-1"
                      >
                        <Edit className="h-4 w-4" />
                        Edit
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteClick(payment)}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ModernCardContent>
      </ModernCard>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this payment of ${selectedPayment?.amount?.toFixed(2)}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
