
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
import { FileText, Plus, Trash } from "lucide-react";
import { cn } from "@/lib/utils";

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0.01, "Price must be greater than 0"),
    })
  ).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  type: "invoice" | "estimate";
  onSubmit: (data: InvoiceFormValues) => void;
  onCancel: () => void;
  defaultInvoiceNumber: string;
  companyInfo: {
    name: string;
    logo: string;
    address: string;
    phone: string;
    email: string;
    legalText: string;
  };
  clientInfo: {
    name: string;
    address: string;
    phone: string;
    email: string;
  };
}

export const InvoiceForm = ({
  type,
  onSubmit,
  onCancel,
  defaultInvoiceNumber,
  companyInfo,
  clientInfo
}: InvoiceFormProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: defaultInvoiceNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      items: [{ description: "", quantity: 1, unitPrice: 0 }],
      notes: "",
    },
  });

  const { fields, append, remove } = form.watch("items");

  const calculateTotal = () => {
    return form.watch("items").reduce(
      (total, item) => total + (item.quantity || 0) * (item.unitPrice || 0),
      0
    );
  };

  const handleSubmit = (data: InvoiceFormValues) => {
    onSubmit(data);
  };

  const addItem = () => {
    const items = form.getValues("items");
    append({ description: "", quantity: 1, unitPrice: 0 });
  };

  const removeItem = (index: number) => {
    remove(index);
  };

  const renderPreview = () => {
    const data = form.getValues();
    const total = calculateTotal();
    
    return (
      <div className="w-full bg-white p-8 rounded-lg border shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-2xl font-bold">{type === "invoice" ? "INVOICE" : "ESTIMATE"}</h2>
            <p className="text-fixlyfy-text-secondary">#{data.invoiceNumber}</p>
          </div>
          <div className="text-right">
            <img src={companyInfo.logo} alt={companyInfo.name} className="h-12 mb-2" />
            <h3 className="font-bold">{companyInfo.name}</h3>
            <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
              {companyInfo.address}<br />
              {companyInfo.phone}<br />
              {companyInfo.email}
            </p>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-8 mb-8">
          <div>
            <h4 className="font-semibold mb-2 text-fixlyfy-text-secondary">Bill To:</h4>
            <p className="font-medium">{clientInfo.name}</p>
            <p className="text-sm text-fixlyfy-text-secondary whitespace-pre-line">
              {clientInfo.address}<br />
              {clientInfo.phone}<br />
              {clientInfo.email}
            </p>
          </div>
          <div className="text-right">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">Date Issued:</span>
                <span>{data.issueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">Due Date:</span>
                <span>{data.dueDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-fixlyfy-text-secondary">{type === "invoice" ? "Invoice" : "Estimate"} #:</span>
                <span>{data.invoiceNumber}</span>
              </div>
            </div>
          </div>
        </div>
        
        <table className="w-full mb-8">
          <thead>
            <tr className="border-b border-fixlyfy-border">
              <th className="py-3 text-left">Description</th>
              <th className="py-3 text-right">Qty</th>
              <th className="py-3 text-right">Unit Price</th>
              <th className="py-3 text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((item, index) => (
              <tr key={index} className="border-b border-fixlyfy-border">
                <td className="py-3">{item.description}</td>
                <td className="py-3 text-right">{item.quantity}</td>
                <td className="py-3 text-right">${item.unitPrice.toFixed(2)}</td>
                <td className="py-3 text-right">${(item.quantity * item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
            <tr>
              <td colSpan={3} className="py-4 text-right font-semibold">Total:</td>
              <td className="py-4 text-right font-bold">${total.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
        
        {data.notes && (
          <div className="mb-8">
            <h4 className="font-semibold mb-2">Notes</h4>
            <p className="text-sm text-fixlyfy-text-secondary">{data.notes}</p>
          </div>
        )}
        
        <div className="mt-12 pt-8 border-t border-fixlyfy-border text-sm text-fixlyfy-text-secondary">
          <p>{companyInfo.legalText}</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{type === "invoice" ? "Create Invoice" : "Create Estimate"}</h2>
        <div>
          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
          >
            {previewMode ? "Edit Details" : "Preview"}
          </Button>
        </div>
      </div>

      {previewMode ? (
        <div className="p-4 bg-gray-50 rounded-lg">
          {renderPreview()}
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button variant="outline" onClick={() => {
              window.open(
                `/preview/${type}/${form.getValues().invoiceNumber}`, 
                '_blank'
              );
            }}>
              Check {type === "invoice" ? "Invoice" : "Estimate"}
            </Button>
            <Button onClick={form.handleSubmit(handleSubmit)}>
              Send {type === "invoice" ? "Invoice" : "Estimate"}
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="invoiceNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{type === "invoice" ? "Invoice" : "Estimate"} #</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="issueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div>
              <h3 className="font-medium text-lg mb-4">Items</h3>
              {form.watch("items").map((item, index) => (
                <div key={index} className="grid grid-cols-12 gap-3 mb-3">
                  <div className="col-span-6">
                    <FormField
                      control={form.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Description</FormLabel>}
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-2">
                    <FormField
                      control={form.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Quantity</FormLabel>}
                          <FormControl>
                            <Input 
                              type="number" 
                              min="1" 
                              step="1" 
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="col-span-3">
                    <FormField
                      control={form.control}
                      name={`items.${index}.unitPrice`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Unit Price ($)</FormLabel>}
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
                  </div>
                  <div className="col-span-1 flex items-end">
                    {index === 0 && <div className="h-6 mb-2"></div>}
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(index)}
                      className="text-fixlyfy-text-secondary"
                      disabled={form.watch("items").length <= 1}
                    >
                      <Trash size={18} />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="mt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex items-center gap-1"
                  onClick={addItem}
                >
                  <Plus size={16} />
                  <span>Add Item</span>
                </Button>
              </div>
            </div>

            <div className="text-right text-xl font-semibold">
              <span>Total: ${calculateTotal().toFixed(2)}</span>
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={3}
                      placeholder="Payment terms, delivery information, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-3">
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
              <Button type="submit">
                Send {type === "invoice" ? "Invoice" : "Estimate"}
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};
