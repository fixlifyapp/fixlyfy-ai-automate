
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { LineItem, Product } from "@/components/jobs/builder/types";

interface UseEstimateBuilderProps {
  estimateId: string | null;
  open: boolean;
  jobId: string;
  onSyncToInvoice?: (estimate: any) => void;
}

export const useEstimateBuilder = ({
  estimateId,
  open,
  jobId,
  onSyncToInvoice
}: UseEstimateBuilderProps) => {
  const [estimateNumber, setEstimateNumber] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [notes, setNotes] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedLineItemId, setSelectedLineItemId] = useState<string | null>(null);
  const [recommendedWarranty, setRecommendedWarranty] = useState<Product | null>(null);
  const [techniciansNote, setTechniciansNote] = useState("");
  const [taxRate, setTaxRate] = useState(10); // Default tax rate of 10%
  const [showUpsellOptions, setShowUpsellOptions] = useState(false);
  const [showSyncOptions, setShowSyncOptions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load estimate data when editing an existing estimate
  useEffect(() => {
    const fetchEstimateData = async () => {
      if (!estimateId || !open) return;
      
      setIsLoading(true);
      console.log("Fetching estimate data for ID:", estimateId);
      
      try {
        // Fetch estimate details
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', estimateId)
          .single();
          
        if (estimateError) {
          console.error("Error fetching estimate:", estimateError);
          toast.error("Failed to load estimate data");
          return;
        }
        
        if (estimateData) {
          console.log("Loaded estimate data:", estimateData);
          setEstimateNumber(estimateData.number);
          
          // Fetch estimate items
          const { data: itemsData, error: itemsError } = await supabase
            .from('estimate_items')
            .select('*')
            .eq('estimate_id', estimateId);
            
          if (itemsError) {
            console.error("Error fetching estimate items:", itemsError);
            toast.error("Failed to load estimate items");
            return;
          }
          
          if (itemsData && itemsData.length > 0) {
            // Map the items to LineItem format
            const mappedItems: LineItem[] = itemsData.map(item => ({
              id: item.id,
              description: item.name,
              quantity: item.quantity || 1,
              unitPrice: Number(item.price) || 0,
              discount: 0, // Default discount if not in DB
              tax: item.taxable ? taxRate : 0,
              total: Number(item.price) * (item.quantity || 1),
              ourPrice: 0, // Set default
              taxable: item.taxable
            }));
            
            console.log("Loaded estimate items:", mappedItems);
            setLineItems(mappedItems);
          } else {
            setLineItems([]);
          }
        }
      } catch (error) {
        console.error("Error in fetchEstimateData:", error);
        toast.error("An error occurred while loading the estimate");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEstimateData();
  }, [estimateId, open, taxRate]);

  const handleAddProduct = (product: Product) => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: product.name,
      quantity: 1,
      unitPrice: product.price,
      discount: 0,
      tax: product.taxable ? taxRate : 0, // Default tax rate or 0 if not taxable
      total: product.price,
      ourPrice: product.ourPrice,
      taxable: product.taxable
    };
    
    setLineItems([...lineItems, newLineItem]);
    toast.success(`${product.name} added to estimate`);
  };

  const handleRemoveLineItem = (lineItemId: string) => {
    setLineItems(lineItems.filter(item => item.id !== lineItemId));
  };

  const handleUpdateLineItem = (lineItemId: string | null, field: string, value: any) => {
    if (field === "notes") {
      setNotes(value);
      return;
    }

    if (field === "taxRate") {
      setTaxRate(parseFloat(value) || 0);
      return;
    }

    setLineItems(lineItems.map(item => {
      if (item.id === lineItemId) {
        const updatedItem = { ...item, [field]: value };
        // Recalculate total
        updatedItem.total = calculateLineTotal(updatedItem);
        return updatedItem;
      }
      return item;
    }));
  };

  const handleAddEmptyLineItem = () => {
    // This is used to open the product search dialog
    return;
  };

  const handleAddCustomLine = () => {
    const newLineItem: LineItem = {
      id: `line-${Date.now()}`,
      description: "",
      quantity: 1,
      unitPrice: 0,
      discount: 0,
      tax: taxRate,
      total: 0,
      ourPrice: 0,
      taxable: true
    };
    
    setLineItems([...lineItems, newLineItem]);
  };

  const calculateLineTotal = (item: LineItem): number => {
    const subtotal = item.quantity * item.unitPrice;
    const discountAmount = subtotal * (item.discount / 100);
    const afterDiscount = subtotal - discountAmount;
    return afterDiscount;
  };

  const calculateSubtotal = (): number => {
    return lineItems.reduce((total, item) => {
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      return total + (subtotal - discountAmount);
    }, 0);
  };

  const calculateTotalTax = (): number => {
    return lineItems.reduce((total, item) => {
      if (!item.taxable) return total;
      
      const subtotal = item.quantity * item.unitPrice;
      const discountAmount = subtotal * (item.discount / 100);
      const afterDiscount = subtotal - discountAmount;
      const taxAmount = afterDiscount * (taxRate / 100);
      return total + taxAmount;
    }, 0);
  };

  const calculateGrandTotal = (): number => {
    return calculateSubtotal() + calculateTotalTax();
  };

  const calculateTotalMargin = (): number => {
    return lineItems.reduce((margin, item) => {
      const revenue = item.quantity * item.unitPrice * (1 - item.discount / 100);
      const cost = item.quantity * (item.ourPrice || 0);
      return margin + (revenue - cost);
    }, 0);
  };

  const calculateMarginPercentage = (): number => {
    const totalRevenue = calculateSubtotal();
    const margin = calculateTotalMargin();
    return totalRevenue > 0 ? (margin / totalRevenue) * 100 : 0;
  };

  const handleEditLineItem = (lineItemId: string) => {
    const lineItem = lineItems.find(item => item.id === lineItemId);
    if (lineItem) {
      // Create a temporary product from the line item for editing
      setSelectedProduct({
        id: lineItem.id,
        name: lineItem.description,
        description: lineItem.description,
        category: "Custom",
        price: lineItem.unitPrice,
        ourPrice: lineItem.ourPrice || 0,
        taxable: lineItem.taxable !== undefined ? lineItem.taxable : true,
        tags: []
      });
      setSelectedLineItemId(lineItemId);
      return true;
    }
    return false;
  };

  const handleProductSaved = (product: Product) => {
    if (selectedLineItemId) {
      // Update the line item with the edited product details
      setLineItems(lineItems.map(item => {
        if (item.id === selectedLineItemId) {
          return {
            ...item,
            description: product.name,
            unitPrice: product.price,
            ourPrice: product.ourPrice,
            taxable: product.taxable,
            total: calculateLineTotal({
              ...item,
              unitPrice: product.price,
              taxable: product.taxable,
            })
          };
        }
        return item;
      }));
    }
    setSelectedProduct(null);
    setSelectedLineItemId(null);
  };

  const handleProductSelected = (product: Product) => {
    handleAddProduct(product);
  };

  const handleSyncToInvoice = () => {
    if (onSyncToInvoice) {
      const estimate = {
        id: estimateId || `est-${Date.now()}`,
        number: estimateNumber,
        items: lineItems,
        total: calculateGrandTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTotalTax(),
        notes,
        date: new Date().toISOString()
      };
      
      onSyncToInvoice(estimate);
      toast.success("Estimate synced to invoice");
    }
  };

  return {
    estimateNumber,
    lineItems,
    notes,
    selectedProduct,
    selectedLineItemId,
    recommendedWarranty,
    techniciansNote,
    taxRate,
    showUpsellOptions,
    showSyncOptions,
    isLoading,
    setEstimateNumber,
    setLineItems,
    setNotes,
    setSelectedProduct,
    setSelectedLineItemId,
    setRecommendedWarranty,
    setTechniciansNote,
    setTaxRate,
    setShowUpsellOptions,
    setShowSyncOptions,
    setIsLoading,
    handleAddProduct,
    handleRemoveLineItem,
    handleUpdateLineItem,
    handleAddEmptyLineItem,
    handleAddCustomLine,
    calculateLineTotal,
    calculateSubtotal,
    calculateTotalTax,
    calculateGrandTotal,
    calculateTotalMargin,
    calculateMarginPercentage,
    handleEditLineItem,
    handleProductSaved,
    handleProductSelected,
    handleSyncToInvoice,
  };
};
