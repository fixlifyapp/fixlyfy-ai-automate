
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LineItemsTable } from "../dialogs/estimate-builder/LineItemsTable";
import { Badge } from "@/components/ui/badge";
import { ClientWarrantyViewDialog } from "../dialogs/ClientWarrantyViewDialog";
import { supabase } from "@/integrations/supabase/client";
import { LineItem } from "../builder/types";
import { CheckCircle, MessageSquare, FileText } from "lucide-react";

interface ClientEstimateViewProps {
  estimateId: string;
  clientId?: string;
}

export const ClientEstimateView = ({ estimateId, clientId }: ClientEstimateViewProps) => {
  const [estimate, setEstimate] = useState<any>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [warrantyItem, setWarrantyItem] = useState<LineItem | null>(null);
  const [isWarrantyDialogOpen, setIsWarrantyDialogOpen] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  
  // Fetch estimate and line items
  useEffect(() => {
    const fetchEstimate = async () => {
      setIsLoading(true);
      try {
        console.log("Fetching estimate for client view:", estimateId);
        
        // Fetch the estimate
        const { data: estimateData, error: estimateError } = await supabase
          .from('estimates')
          .select('*')
          .eq('id', estimateId)
          .single();
          
        if (estimateError) {
          console.error("Error fetching estimate:", estimateError);
          throw estimateError;
        }
        
        console.log("Estimate data loaded:", estimateData);
        
        // Fetch line items
        const { data: itemsData, error: itemsError } = await supabase
          .from('line_items')
          .select('*')
          .eq('parent_id', estimateId)
          .eq('parent_type', 'estimate');
          
        if (itemsError) {
          console.error("Error fetching line items:", itemsError);
          throw itemsError;
        }
        
        console.log("Line items loaded:", itemsData);
        
        // Update estimate status to viewed if it's still draft
        if (estimateData.status === 'draft') {
          await supabase
            .from('estimates')
            .update({ status: 'viewed' })
            .eq('id', estimateId);
          estimateData.status = 'viewed';
        }
        
        // Set the data
        setEstimate(estimateData);
        
        // Transform line items
        const transformedItems: LineItem[] = itemsData.map(item => ({
          id: item.id,
          name: item.description,
          description: item.description,
          quantity: item.quantity,
          unitPrice: Number(item.unit_price),
          price: Number(item.unit_price),
          discount: 0,
          tax: item.taxable ? 13 : 0, // Assuming 13% tax rate
          total: Number(item.unit_price) * item.quantity,
          ourPrice: 0,
          taxable: item.taxable
        }));
        
        setLineItems(transformedItems);
        
        // Find warranty item if any (items with "warranty" category or in description)
        const warranty = itemsData.find(item => 
          item.description.toLowerCase().includes('warranty')
        );
        
        if (warranty) {
          setWarrantyItem({
            id: warranty.id,
            name: warranty.description,
            description: warranty.description,
            quantity: warranty.quantity,
            unitPrice: Number(warranty.unit_price),
            price: Number(warranty.unit_price),
            discount: 0,
            tax: warranty.taxable ? 13 : 0,
            total: Number(warranty.unit_price) * warranty.quantity,
            ourPrice: 0,
            taxable: warranty.taxable
          });
          
          // Auto open warranty dialog when estimate is first viewed
          setIsWarrantyDialogOpen(true);
        }
      } catch (error) {
        console.error("Error fetching estimate:", error);
        toast.error("Failed to load estimate");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (estimateId) {
      fetchEstimate();
    }
  }, [estimateId]);
  
  // Calculate subtotal
  const calculateSubtotal = () => {
    return lineItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
  };
  
  // Calculate tax
  const calculateTax = () => {
    return lineItems.reduce((sum, item) => {
      return sum + (item.taxable ? item.unitPrice * item.quantity * 0.13 : 0);
    }, 0);
  };
  
  // Calculate total
  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };
  
  // Handle estimate acceptance
  const handleAcceptEstimate = async () => {
    setIsAccepting(true);
    try {
      // Update estimate status to accepted
      const { error } = await supabase
        .from('estimates')
        .update({ 
          status: 'accepted',
          updated_at: new Date().toISOString()
        })
        .eq('id', estimateId);
        
      if (error) throw error;
      
      // Update local state
      setEstimate(prev => ({ ...prev, status: 'accepted' }));
      
      toast.success("Estimate accepted successfully! We'll be in touch soon.");
    } catch (error) {
      console.error("Error accepting estimate:", error);
      toast.error("Failed to accept estimate. Please try again.");
    } finally {
      setIsAccepting(false);
    }
  };
  
  // Handle warranty acceptance
  const handleAcceptWarranty = async () => {
    toast.success("Warranty has been added to your order");
    setIsWarrantyDialogOpen(false);
  };
  
  // Handle warranty decline
  const handleDeclineWarranty = async () => {
    if (!warrantyItem) return;
    
    try {
      // Remove the warranty item from the database
      const { error } = await supabase
        .from('line_items')
        .delete()
        .eq('id', warrantyItem.id);
        
      if (error) throw error;
      
      // Remove from local state
      setLineItems(lineItems.filter(item => item.id !== warrantyItem.id));
      setWarrantyItem(null);
      
      // Update estimate total
      const newTotal = calculateTotal() - (warrantyItem.unitPrice * warrantyItem.quantity);
      
      await supabase
        .from('estimates')
        .update({ total: newTotal })
        .eq('id', estimateId);
        
      toast.success("Warranty has been removed from your estimate");
      setIsWarrantyDialogOpen(false);
    } catch (error) {
      console.error("Error declining warranty:", error);
      toast.error("Failed to decline warranty");
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!estimate) {
    return (
      <div className="text-center py-8">
        <p>Estimate not found or you do not have permission to view it.</p>
      </div>
    );
  }
  
  const isAccepted = estimate.status === 'accepted';
  
  return (
    <div className="container max-w-4xl mx-auto p-4">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">Estimate #{estimate.estimate_number}</h1>
            <p className="text-muted-foreground">
              Created: {new Date(estimate.created_at).toLocaleDateString()}
            </p>
          </div>
          <div className="mt-4 md:mt-0 text-right">
            <Badge className={`mb-2 ${isAccepted ? 'bg-green-100 text-green-800' : ''}`}>
              {estimate.status.charAt(0).toUpperCase() + estimate.status.slice(1)}
              {isAccepted && <CheckCircle className="ml-1 h-3 w-3" />}
            </Badge>
            <p className="text-xl font-semibold">${calculateTotal().toFixed(2)}</p>
          </div>
        </div>
        
        <div className="mb-6">
          <LineItemsTable
            lineItems={lineItems}
            onRemoveLineItem={() => {}}
            onUpdateLineItem={() => {}}
            onEditLineItem={() => false}
            showMargin={false}
            showOurPrice={false}
          />
        </div>
        
        <div className="bg-muted/30 rounded-md p-4 space-y-2 mb-6">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal:</span>
            <span>${calculateSubtotal().toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Tax (13%):</span>
            <span>${calculateTax().toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-medium pt-2 border-t">
            <span>Total:</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
        
        {estimate.notes && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-2">Notes</h3>
            <div className="bg-muted/20 p-4 rounded-md">
              <p className="text-sm whitespace-pre-wrap">{estimate.notes}</p>
            </div>
          </div>
        )}
        
        {isAccepted && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              <span className="text-green-800 font-medium">Estimate Accepted</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Thank you for accepting this estimate! We'll be in touch soon to schedule the work.
            </p>
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          {warrantyItem && (
            <Button 
              variant="outline" 
              onClick={() => setIsWarrantyDialogOpen(true)}
              className="sm:mr-auto"
            >
              <FileText className="mr-2 h-4 w-4" />
              View Recommended Warranty
            </Button>
          )}
          
          {!isAccepted && (
            <>
              <Button 
                onClick={handleAcceptEstimate}
                disabled={isAccepting}
                className="bg-green-600 hover:bg-green-700"
              >
                {isAccepting ? "Accepting..." : "Accept Estimate"}
                <CheckCircle className="ml-2 h-4 w-4" />
              </Button>
              <Button variant="outline">
                <MessageSquare className="mr-2 h-4 w-4" />
                Request Changes
              </Button>
            </>
          )}
        </div>
      </Card>
      
      {/* Warranty Dialog */}
      {warrantyItem && (
        <ClientWarrantyViewDialog
          open={isWarrantyDialogOpen}
          onOpenChange={setIsWarrantyDialogOpen}
          warranty={{
            id: warrantyItem.id,
            name: warrantyItem.name,
            description: warrantyItem.description,
            price: warrantyItem.unitPrice
          }}
          techniciansNote={estimate.notes}
          onAccept={handleAcceptWarranty}
          onDecline={handleDeclineWarranty}
        />
      )}
    </div>
  );
};
