import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product } from "@/components/jobs/builder/types";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";

// Define the LineItem type
export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  tax: number;
  total: number;
  ourPrice: number;
  taxable: boolean;
}

interface UseEstimateBuilderProps {
  estimateId: string | null;
  open: boolean;
  onSyncToInvoice?: (estimate: any) => void;
  jobId: string;
}

export const useEstimateBuilder = ({
  estimateId,
  open,
  onSyncToInvoice,
  jobId
}: UseEstimateBuilderProps) => {
  const [estimateNumber, setEstimateNumber] = useState<string>("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState<string>("");
  const [taxRate, setTaxRate] = useState<number>(0);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [recommendedWarranty, setRecommendedWarranty] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { generateUniqueNumber } = useEstimateInfo();

  // Function to calculate subtotal
  const calculateSubtotal = useCallback(() => {
    return lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  }, [lineItems]);

  // Function to calculate total tax
  const calculateTotalTax = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const itemSubtotal = item.unitPrice * item.quantity;
      return sum + (item.taxable ? itemSubtotal * (taxRate / 100) : 0);
    }, 0);
  }, [lineItems, taxRate]);

  // Function to calculate grand total
  const calculateGrandTotal = useCallback(() => {
    return calculateSubtotal() + calculateTotalTax();
  }, [calculateSubtotal, calculateTotalTax]);

  // Function to calculate total margin
  const calculateTotalMargin = useCallback(() => {
    return lineItems.reduce((sum, item) => {
      const cost = item.ourPrice * item.quantity;
      const revenue = item.unitPrice * item.quantity;
      return sum + (revenue - cost);
    }, 0);
  }, [lineItems]);

  // Function to calculate margin percentage
  const calculateMarginPercentage = useCallback(() => {
    const totalMargin = calculateTotalMargin();
    const subtotal = calculateSubtotal();
    return subtotal > 0 ? (totalMargin / subtotal) * 100 : 0;
  }, [calculateTotalMargin, calculateSubtotal]);

  // Fetch estimate data from Supabase
  const fetchEstimateData = async () => {
    if (!estimateId) return;

    setIsLoading(true);
    try {
      const { data: estimateData, error } = await supabase
        .from('estimates')
        .select('*')
        .eq('id', estimateId)
        .single();

      if (error) {
        console.error("Error fetching estimate:", error);
        toast.error("Failed to load estimate");
        return;
      }

      if (estimateData) {
        setEstimateNumber(estimateData.number);
        setLineItems(estimateData.items || []);
        setNotes(estimateData.technicians_note || '');
        setTaxRate(estimateData.tax_rate || 0);
      }
    } catch (error) {
      console.error("Error fetching estimate:", error);
      toast.error("Failed to load estimate");
    } finally {
      setIsLoading(false);
    }
  };

  // Save estimate changes to Supabase
  const saveEstimateChanges = async () => {
    if (!estimateId) return false;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('estimates')
        .update({
          items: lineItems,
          technicians_note: notes,
          tax_rate: taxRate
        })
        .eq('id', estimateId);

      if (error) {
        console.error("Error updating estimate:", error);
        toast.error("Failed to update estimate");
        return false;
      }

      toast.success(`Estimate ${estimateNumber} updated`);
      return true;
    } catch (error) {
      console.error("Error updating estimate:", error);
      toast.error("Failed to update estimate");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a product to the line items
  const handleAddProduct = async (product: Product) => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: product.description || product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      tax: 0,
      total: product.price,
      ourPrice: product.cost || 0,
      taxable: true
    };

    setLineItems([...lineItems, newLineItem]);
  };

  // Handle removing a line item
  const handleRemoveLineItem = (id: string) => {
    setLineItems(lineItems.filter((item) => item.id !== id));
  };

  // Handle updating a line item
  const handleUpdateLineItem = (id: string | null, field: string, value: any) => {
    setLineItems(
      lineItems.map((item) =>
        item.id === id
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  // Handle editing a line item
  const handleEditLineItem = (id: string) => {
    setSelectedLineItemId(id);
    // Logic to open a modal or form to edit the line item
  };

  // Handle adding an empty line item
  const handleAddEmptyLineItem = () => {
    // Logic to open product search
  };

  // Handle adding a custom line
  const handleAddCustomLine = () => {
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      description: "Custom Item",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: 0,
      total: 0,
      ourPrice: 0,
      taxable: true
    };
    setLineItems([...lineItems, newLineItem]);
  };

  // Handle product saved
  const handleProductSaved = (product: Product) => {
    setSelectedProduct(product);
    // Logic to save the product
  };

  // Handle product selected
  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
    // Logic to handle product selection
  };

  // Handle sync to invoice
  const handleSyncToInvoice = () => {
    if (onSyncToInvoice) {
      onSyncToInvoice(lineItems);
      toast.success("Estimate synced to invoice");
    }
  };

  useEffect(() => {
    if (open) {
      if (estimateId) {
        fetchEstimateData();
      } else {
        // Generate a new estimate number
        const newEstimateNumber = generateUniqueNumber('EST');
        setEstimateNumber(newEstimateNumber);
      }
    }
  }, [open, estimateId, generateUniqueNumber]);

  return {
    estimateNumber,
    lineItems,
    notes,
    selectedProduct,
    selectedLineItemId,
    recommendedWarranty,
    techniciansNote,
    taxRate,
    isLoading,
    setTechniciansNote,
    setRecommendedWarranty,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleEditLineItem,
    handleAddEmptyLineItem,
    handleAddCustomLine,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleProductSaved,
    handleProductSelected,
    handleSyncToInvoice,
    saveEstimateChanges,
    setNotes,
    setTaxRate
  };
};
