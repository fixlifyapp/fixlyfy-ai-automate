
import { useState } from "react";
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

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
}

export const UpsellDialog = ({ open, onOpenChange, jobId }: UpsellDialogProps) => {
  // In a real app, these offers would be fetched from an API based on jobId and customer history
  const [offers] = useState([
    {
      id: "offer-1",
      title: "6-Month Extended Warranty",
      price: 49,
      description: "Protect your appliance from unexpected repair costs. 94% of customers opt in for peace of mind.",
      tags: ["recommended", "bestseller"],
      acceptance: 94
    }
  ]);
  
  const handleAccept = () => {
    // In a real app, this would add the warranty to the invoice/estimate and save to API
    toast.success("Extended warranty added to your document");
    onOpenChange(false);
  };
  
  const handleDecline = () => {
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Recommended Add-on</DialogTitle>
        </DialogHeader>
        
        {offers.length > 0 && (
          <div className="py-4">
            <div className="bg-fixlyfy/5 border border-fixlyfy/20 rounded-lg p-4 relative">
              <div className="absolute -top-3 right-4 bg-fixlyfy text-white text-xs px-2 py-0.5 rounded-full">
                {offers[0].acceptance}% of customers choose this
              </div>
              
              <h3 className="text-lg font-semibold text-fixlyfy mb-1">
                {offers[0].title} - ${offers[0].price}
              </h3>
              
              <p className="text-fixlyfy-text-secondary mb-4">
                {offers[0].description}
              </p>
              
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
                  <span className="text-sm">No additional costs for 6 months</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={handleAccept} className="flex-1">
                  Add to Document (${offers[0].price})
                </Button>
                <Button onClick={handleDecline} variant="outline" className="flex-1">
                  No Thanks
                </Button>
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex justify-end sm:justify-start">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Don't show again for this document
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
