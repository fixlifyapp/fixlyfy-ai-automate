
import { z } from "zod";

export const invoiceLineItemSchema = z.object({
  id: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  quantity: z.number().min(0.01, "Quantity must be greater than 0").default(1),
  unitPrice: z.number().min(0, "Unit price must be at least 0").default(0),
  ourPrice: z.number().min(0, "Our price must be at least 0").default(0),
  taxable: z.boolean().default(true),
  total: z.number().default(0),
  name: z.string().optional(),
  price: z.number().optional(),
  discount: z.number().default(0)
});

export const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().optional(),
  items: z.array(invoiceLineItemSchema).min(1, "At least one item is required"),
  notes: z.string().optional()
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceLineItemValues = z.infer<typeof invoiceLineItemSchema>;

export interface InvoiceFormProps {
  type: "invoice" | "estimate";
  onSubmit: (data: InvoiceFormValues) => void;
  onCancel: () => void;
  defaultInvoiceNumber?: string;
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
