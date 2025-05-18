
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Product } from "../builder/types";

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
  recommendedProduct?: Product | null;
  techniciansNote?: string;
  onAccept?: (product: Product) => void;
}

export const UpsellDialog = ({ 
  open, 
  onOpenChange, 
  jobId,
  recommendedProduct,
  techniciansNote,
  onAccept
}: UpsellDialogProps) => {
  // Default offer in case no recommended product is provided
  const [offer, setOffer] = useState<Product | null>(null);
  
  useEffect(() => {
    if (open) {
      // Use the recommended product if provided, otherwise use default
      if (recommendedProduct) {
        setOffer(recommendedProduct);
      } else {
        // Default offer if nothing is recommended
        setOffer({
          id: "offer-1",
          name: "6-Month Extended Warranty",
          description: "Protect your appliance from unexpected repair costs. 94% of customers opt in for peace of mind.",
          price: 49,
          category: "Warranties",
          tags: ["recommended", "bestseller"],
        } as Product);
      }
    }
  }, [open, recommendedProduct]);
  
  const handleAccept = () => {
    if (offer && onAccept) {
      onAccept(offer);
    } else {
      toast.success(`${offer?.name || "Warranty"} added to your document`);
    }
    onOpenChange(false);
  };
  
  const handleDecline = () => {
    onOpenChange(false);
  };
  
  if (!offer) return null;
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recommended Add-on</DialogTitle>
        </DialogHeader>
        
        <div className="py-4">
          <div className="bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg p-4 relative">
            <div className="absolute -top-3 right-4 bg-fixlyfy text-white text-xs px-2 py-0.5 rounded-full">
              94% of customers choose this
            </div>
            
            <h3 className="text-lg font-semibold text-fixlyfy mb-1">
              {offer.name} - ${offer.price}
            </h3>
            
            <p className="text-fixlyfy-text-secondary mb-4">
              {offer.description}
            </p>
            
            {techniciansNote && (
              <div className="bg-amber-50 border border-amber-200 rounded p-3 mb-4 text-sm">
                <div className="font-medium text-amber-800 mb-1">Your technician's recommendation:</div>
                <p className="text-amber-700">{techniciansNote}</p>
              </div>
            )}
            
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">Coverage for parts and labor</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">Priority service appointments</span>
              </div>
              <div className="flex items-center gap-2">
                <Check size={16} className="text-green-500" />
                <span className="text-sm">No additional costs for the warranty period</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button onClick={handleAccept} className="flex-1">
                Add to Document (${offer.price})
              </Button>
              <Button onClick={handleDecline} variant="outline" className="flex-1">
                No Thanks
              </Button>
            </div>
          </div>
        </div>
        
        <DialogFooter className="flex justify-end sm:justify-start">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Don't show again for this document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
