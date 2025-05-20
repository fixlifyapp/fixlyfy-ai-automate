
import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Product, LineItem } from "@/components/jobs/builder/types";
import { useEstimateInfo } from "@/components/jobs/estimates/hooks/useEstimateInfo";

// Define the function interface
export interface UseEstimateBuilderProps {
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
      const cost = (item.ourPrice || 0) * item.quantity;
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
        setEstimateNumber(estimateData.estimate_number);
        setNotes(estimateData.notes || '');
        
        // Fetch the line items from line_items table
        const { data: itemsData, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_type', 'estimate')
          .eq('parent_id', estimateId);
          
        if (itemsError) {
          console.error("Error fetching estimate items:", itemsError);
          toast.error("Failed to load estimate items");
        } else if (itemsData) {
          console.log("Fetched estimate items:", itemsData);
          // Transform the items data into LineItem format
          const transformedItems: LineItem[] = itemsData.map(item => ({
            id: item.id,
            name: item.description || "", // Add name property
            description: item.description || "",
            quantity: item.quantity,
            unitPrice: Number(item.unit_price),
            price: Number(item.unit_price),
            discount: 0,
            tax: item.taxable ? taxRate : 0,
            total: Number(item.unit_price) * item.quantity,
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
    setIsLoading(true);
    try {
      console.log("Saving estimate changes");
      console.log("Line items to save:", lineItems);
      
      // If no estimate ID, create a new one
      if (!estimateId) {
        // Generate a new estimate number
        const newEstimateNumber = estimateNumber || generateUniqueNumber('EST');
        
        // Create the estimate
        const { data: newEstimate, error: createError } = await supabase
          .from('estimates')
          .insert({
            job_id: jobId,
            estimate_number: newEstimateNumber,
            notes: notes,
            total: calculateGrandTotal(),
            status: 'draft'
          })
          .select()
          .single();
        
        if (createError) {
          console.error("Error creating estimate:", createError);
          toast.error("Failed to create estimate");
          return false;
        }
        
        console.log("Created new estimate:", newEstimate);
        
        // Now save all line items
        if (lineItems.length > 0) {
          const itemsToInsert = lineItems.map(item => ({
            parent_id: newEstimate.id,
            parent_type: 'estimate',
            description: item.description || item.name || "",
            unit_price: item.unitPrice,
            quantity: item.quantity,
            taxable: item.taxable
          }));
          
          const { error: lineItemsError } = await supabase
            .from('line_items')
            .insert(itemsToInsert);
            
          if (lineItemsError) {
            console.error("Error saving line items:", lineItemsError);
            toast.error("Some line items may not have been saved");
            return false;
          }
        }
        
        toast.success(`Estimate ${newEstimateNumber} created`);
        return true;
      }
      
      // For existing estimate, update it
      const { error } = await supabase
        .from('estimates')
        .update({
          notes: notes,
          total: calculateGrandTotal()
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
        .from('line_items')
        .select('id')
        .eq('parent_type', 'estimate')
        .eq('parent_id', estimateId);
        
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
          .from('line_items')
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
          parent_id: estimateId,
          parent_type: 'estimate',
          description: item.description || item.name || "",
          unit_price: item.unitPrice,
          quantity: item.quantity,
          taxable: item.taxable
        };
        
        if (isExisting) {
          // Update existing item
          const { error: updateError } = await supabase
            .from('line_items')
            .update(itemData)
            .eq('id', item.id)
            .eq('parent_id', estimateId);
            
          if (updateError) {
            console.error("Error updating item:", updateError, item);
            toast.error("Failed to update some items");
            return false;
          }
        } else {
          // For new items, generate a proper UUID
          if (item.id.startsWith('item-')) {
            delete (itemData as any).id;
          }
          
          // Insert new item
          const { error: insertError } = await supabase
            .from('line_items')
            .insert(itemData);
            
          if (insertError) {
            console.error("Error inserting new item:", insertError, item);
            toast.error("Failed to add some new items");
            return false;
          }
        }
      }

      toast.success(`Estimate ${estimateNumber} updated`);
      return true;
    } catch (error) {
      console.error("Error saving estimate:", error);
      toast.error("Failed to save estimate");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Handle adding a product to the line items
  const handleAddProduct = (product: Product) => {
    console.log("Adding product to estimate:", product);
    const newLineItem: LineItem = {
      id: `item-${Date.now()}`,
      name: product.name,
      description: product.description || product.name,
      quantity: 1,
      unitPrice: product.price,
      price: product.price,
      discount: 0,
      tax: 0,
      total: product.price,
      ourPrice: product.cost || 0,
      taxable: product.taxable || true
    };

    setLineItems(prev => [...prev, newLineItem]);
  };

  // Handle removing a line item
  const handleRemoveLineItem = (id: string) => {
    setLineItems(prev => prev.filter((item) => item.id !== id));
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
    
    setLineItems(prev =>
      prev.map((item) => {
        if (item.id === id) {
          const updatedItem = { ...item, [field]: value };
          
          // Recalculate item total when quantity or price changes
          if (field === "quantity" || field === "unitPrice") {
            updatedItem.total = updatedItem.quantity * updatedItem.unitPrice;
          }
          
          return updatedItem;
        }
        return item;
      })
    );
  };

  // Handle editing a line item
  const handleEditLineItem = (id: string) => {
    setSelectedLineItemId(id);
    // Open edit modal or perform other actions
    console.log(`Editing line item with ID: ${id}`);
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
        
        // Clear the line items for a new estimate
        setLineItems([]);
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
    setLineItems,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleEditLineItem,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleSyncToInvoice,
    saveEstimateChanges,
    setNotes,
    setTaxRate
  };
};
