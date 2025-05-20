import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WarrantySelectionDialog } from "../dialogs/WarrantySelectionDialog";
import { Product } from "../builder/types";
import { invoiceFormSchema, InvoiceFormValues, InvoiceFormProps } from "./invoice/schema";
import { InvoiceFormHeader } from "./invoice/InvoiceFormHeader";
import { InvoicePreview } from "./invoice/InvoicePreview";
import { InvoiceFormDetails } from "./invoice/InvoiceFormDetails";

export const InvoiceForm = ({
  type,
  onSubmit,
  onCancel,
  defaultInvoiceNumber,
  companyInfo,
  clientInfo,
  showWarrantyUpsell = false,
  previousItems = []
}: InvoiceFormProps) => {
  const [previewMode, setPreviewMode] = useState(false);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: defaultInvoiceNumber,
      issueDate: new Date().toISOString().slice(0, 10),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      items: previousItems.length > 0 
        ? previousItems 
        : [{ description: "", quantity: 1, unitPrice: 0, ourPrice: 0, taxable: true }],
      notes: "",
    },
  });

  const calculateTotal = () => {
    return form.watch("items").reduce(
      (total, item) => {
        if (item.taxable) {
          // Add 5% tax for taxable items - this could be configurable in a real app
          return total + (item.quantity || 0) * (item.unitPrice || 0) * 1.05;
        }
        return total + (item.quantity || 0) * (item.unitPrice || 0);
      },
      0
    );
  };

  const handleSubmit = (data: InvoiceFormValues) => {
    onSubmit(data);
  };

  const handleAddWarranty = () => {
    setIsWarrantyDialogOpen(true);
  };
  
  const handleWarrantySelection = (selectedWarranty: Product | null, customNote: string) => {
    if (selectedWarranty) {
      // Add warranty to the items
      form.setValue("items", [
        ...form.getValues("items"),
        {
          description: `${selectedWarranty.name}: ${selectedWarranty.description}`,
          quantity: 1,
          unitPrice: selectedWarranty.price,
          ourPrice: selectedWarranty.ourPrice || 0,
          taxable: false
        }
      ]);
    }
    setIsWarrantyDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      <InvoiceFormHeader
        type={type}
        previewMode={previewMode}
        setPreviewMode={setPreviewMode}
        showWarrantyUpsell={showWarrantyUpsell}
        onAddWarranty={handleAddWarranty}
      />

      {previewMode ? (
        <InvoicePreview
          data={form.getValues()}
          type={type}
          onCancel={onCancel}
          onSubmit={form.handleSubmit(handleSubmit)}
          companyInfo={companyInfo}
          clientInfo={clientInfo}
          calculateTotal={calculateTotal}
        />
      ) : (
        <InvoiceFormDetails
          form={form}
          type={type}
          onCancel={onCancel}
          previousItems={previousItems}
          calculateTotal={calculateTotal}
        />
      )}
      
      {/* Warranty Selection Dialog */}
      <WarrantySelectionDialog
        open={isWarrantyDialogOpen}
        onOpenChange={setIsWarrantyDialogOpen}
        onConfirm={handleWarrantySelection}
      />
    </div>
  );
};
