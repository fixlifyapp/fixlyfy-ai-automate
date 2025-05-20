
import * as z from "zod";

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  items: z.array(
    z.object({
      description: z.string().min(1, "Description is required"),
      quantity: z.number().min(1, "Quantity must be at least 1"),
      unitPrice: z.number().min(0.01, "Price must be greater than 0"),
      ourPrice: z.number().min(0, "Our price must be 0 or greater"),
      taxable: z.boolean().default(true),
    })
  ).min(1, "At least one item is required"),
  notes: z.string().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export interface InvoiceFormProps {
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
  showWarrantyUpsell?: boolean;
  previousItems?: any[];
}
