
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CreditCard, DollarSign, Ban, FileText } from "lucide-react";
import { useState } from "react";

const paymentFormSchema = z.object({
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  method: z.enum(["cash", "credit-card", "e-transfer", "cheque"]),
  reference: z.string().optional(),
  // Removed notes field
  // New fields for credit card
  cardNumber: z.string().optional(),
  cardholderName: z.string().optional(),
  expiryDate: z.string().optional(),
  paymentDate: z.string().optional()
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
      // Removed notes field from defaultValues
      cardNumber: "",
      cardholderName: "",
      expiryDate: "",
      paymentDate: new Date().toISOString().split('T')[0]
    },
  });
  
  // Show credit card fields conditional state
  const [showCardFields, setShowCardFields] = useState(form.getValues("method") === "credit-card");

  // Update card fields visibility when method changes
  const handleMethodChange = (method: string) => {
    form.setValue("method", method as "cash" | "credit-card" | "e-transfer" | "cheque");
    setShowCardFields(method === "credit-card");
  };

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
                name="paymentDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Date</FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                      />
                    </FormControl>
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
                        onClick={() => handleMethodChange("cash")}
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
                        onClick={() => handleMethodChange("credit-card")}
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
                        onClick={() => handleMethodChange("e-transfer")}
                      >
                        <Ban size={16} />
                        <span>E-Transfer</span>
                      </Button>
                      
                      <Button
                        type="button"
                        variant={field.value === "cheque" ? "default" : "outline"}
                        className={cn(
                          "flex items-center gap-2 justify-start px-3",
                          field.value === "cheque" && "border-fixlyfy text-white"
                        )}
                        onClick={() => handleMethodChange("cheque")}
                      >
                        <FileText size={16} />
                        <span>Cheque</span>
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {/* Credit Card Details (conditional) */}
              {showCardFields && (
                <div className="space-y-4 border rounded-md p-3 bg-gray-50">
                  <FormField
                    control={form.control}
                    name="cardNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Card Number</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="**** **** **** ****" 
                            {...field}
                            maxLength={19}
                            onChange={(e) => {
                              // Format with spaces every 4 digits
                              const value = e.target.value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="cardholderName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cardholder Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Name on card" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="expiryDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expiry Date</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="MM/YY" 
                            maxLength={5}
                            {...field} 
                            onChange={(e) => {
                              // Format as MM/YY
                              let value = e.target.value.replace(/\D/g, '');
                              if (value.length > 2) {
                                value = `${value.slice(0, 2)}/${value.slice(2, 4)}`;
                              }
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
              
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
              
              {/* Removed the Notes FormField */}
              
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
