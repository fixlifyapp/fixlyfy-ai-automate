
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CreditCard, DollarSign, Bank, FileText } from "lucide-react";

const paymentFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "credit-card", "e-transfer", "cheque"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
  onPaymentProcessed?: (amount: number) => void;
}

export const PaymentDialog = ({ 
  open, 
  onOpenChange, 
  balance = 0,
  onPaymentProcessed 
}: PaymentDialogProps) => {
  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      amount: balance,
      method: "credit-card",
      reference: "",
      notes: "",
    },
  });

  const handleSubmit = (data: PaymentFormValues) => {
    console.log("Payment data:", data);
    toast.success(`Payment of $${data.amount.toFixed(2)} processed via ${data.method}`);
    
    if (onPaymentProcessed) {
      onPaymentProcessed(data.amount);
    }
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Payment</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                      Balance due: ${balance.toFixed(2)}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
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
                        onClick={() => form.setValue("method", "cash")}
                      >
                        <DollarSign size={16} />
                        <span>Cash</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={field.value === "credit-card" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 justify-start px-3",
                          field.value === "credit-card" && "border-fixlyfy text-white"
                        )}
                        onClick={() => form.setValue("method", "credit-card")}
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
                        onClick={() => form.setValue("method", "e-transfer")}
                      >
                        <Bank size={16} />
                        <span>E-Transfer</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={field.value === "cheque" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 justify-start px-3",
                          field.value === "cheque" && "border-fixlyfy text-white"
                        )}
                        onClick={() => form.setValue("method", "cheque")}
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
                control={form.control}
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
                control={form.control}
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
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit">Process Payment</Button>
              </DialogFooter>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
};
