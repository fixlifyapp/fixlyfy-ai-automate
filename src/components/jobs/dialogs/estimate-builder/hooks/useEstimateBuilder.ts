
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

// Define the EstimateData type to match our database structure
interface EstimateData {
  id: string;
  job_id: string;
  number: string;
  date: string;
  amount: number;
  status: string;
  viewed: boolean;
  technicians_note: string;
  created_at: string;
  updated_at: string;
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
      console.log("Fetching estimate data for id:", estimateId);
      
      // First, get the basic estimate data
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
        console.log("Fetched estimate data:", estimateData);
        setEstimateNumber(estimateData.number);
        setNotes(estimateData.technicians_note || '');
        
        // Fetch the line items from estimate_items table
        const { data: itemsData, error: itemsError } = await supabase
          .from('estimate_items')
          .select('*')
          .eq('estimate_id', estimateId);
          
        if (itemsError) {
          console.error("Error fetching estimate items:", itemsError);
          toast.error("Failed to load estimate items");
        } else if (itemsData) {
          console.log("Fetched estimate items:", itemsData);
          // Transform the items data into LineItem format
          const transformedItems: LineItem[] = itemsData.map(item => ({
            id: item.id,
            description: item.description || item.name,
            quantity: item.quantity,
            unitPrice: Number(item.price),
            discount: 0,
            tax: item.taxable ? taxRate : 0,
            total: Number(item.price) * item.quantity,
            ourPrice: 0, // Default value
            taxable: item.taxable
          }));
          
          setLineItems(transformedItems);
        }
        
        // Default tax rate to 0 if not found
        setTaxRate(0);
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
      console.log("Saving estimate changes for id:", estimateId);
      console.log("Line items to save:", lineItems);
      
      // First update the estimate basic info
      const { error } = await supabase
        .from('estimates')
        .update({
          technicians_note: notes
        })
        .eq('id', estimateId);

      if (error) {
        console.error("Error updating estimate:", error);
        toast.error("Failed to update estimate");
        return false;
      }
      
      // Handle the line items using upsert and delete operations
      // Get existing items for this estimate
      const { data: existingItems, error: fetchError } = await supabase
        .from('estimate_items')
        .select('id')
        .eq('estimate_id', estimateId);
        
      if (fetchError) {
        console.error("Error fetching existing items:", fetchError);
        toast.error("Failed to update estimate items");
        return false;
      }
      
      const existingItemIds = existingItems?.map(item => item.id) || [];
      const currentItemIds = lineItems.map(item => item.id);
      
      // Find items to delete (in existing but not in current)
      const itemsToDelete = existingItemIds.filter(id => !currentItemIds.includes(id));
      
      // Delete items not in our current list
      if (itemsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from('estimate_items')
          .delete()
          .in('id', itemsToDelete);
          
        if (deleteError) {
          console.error("Error deleting removed items:", deleteError);
          toast.error("Failed to remove some items from the estimate");
          return false;
        }
      }
      
      // Now handle updates and inserts for each item
      for (const item of lineItems) {
        const isExisting = existingItemIds.includes(item.id);
        
        // Prepare item data for upsert
        const itemData = {
          id: item.id,
          estimate_id: estimateId,
          name: item.description,
          description: item.description,
          price: item.unitPrice,
          quantity: item.quantity,
          taxable: item.taxable
        };
        
        if (isExisting) {
          // Update existing item
          const { error: updateError } = await supabase
            .from('estimate_items')
            .update(itemData)
            .eq('id', item.id)
            .eq('estimate_id', estimateId);
            
          if (updateError) {
            console.error("Error updating item:", updateError, item);
            toast.error("Failed to update some items");
            return false;
          }
        } else {
          // Insert new item
          const { error: insertError } = await supabase
            .from('estimate_items')
            .insert(itemData);
            
          if (insertError) {
            console.error("Error inserting new item:", insertError, item);
            toast.error("Failed to add some new items");
            return false;
          }
        }
      }
      
      // Update the estimate total amount
      const total = calculateGrandTotal();
      const { error: updateAmountError } = await supabase
        .from('estimates')
        .update({
          amount: total
        })
        .eq('id', estimateId);
        
      if (updateAmountError) {
        console.error("Error updating estimate amount:", updateAmountError);
        toast.error("Failed to update estimate total");
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
    if (id === null) {
      // This is for global properties like notes or taxRate
      if (field === "notes") {
        setNotes(value);
      } else if (field === "taxRate") {
        setTaxRate(value);
      }
      return;
    }
    
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
    // Open edit modal or perform other actions
    console.log(`Editing line item with ID: ${id}`);
  };

  // Handle adding an empty line item
  const handleAddEmptyLineItem = () => {
    // Open product search
    console.log("Opening product search");
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
    // Add the edited product to line items
    handleAddProduct(product);
  };

  // Handle product selected
  const handleProductSelected = (product: Product) => {
    setSelectedProduct(product);
    handleAddProduct(product);
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
