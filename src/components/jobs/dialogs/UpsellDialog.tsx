
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, CheckCheck, X } from "lucide-react";

interface UpsellDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobId: string;
}

export const UpsellDialog = ({ open, onOpenChange, jobId }: UpsellDialogProps) => {
  const [isAccepted, setIsAccepted] = useState(false);

  // Mock data for upsell offer
  // In a real app, this would come from an API or AI recommendation
  const upsellOffer = {
    title: "Add 6-Month Extended Warranty",
    price: 49,
    description: "Protect your appliance from unexpected repair costs.",
    conversionRate: "94% of customers opt in",
    benefits: [
      "Priority service for 6 months",
      "No additional service fees",
      "Parts and labor included"
    ]
  };

  const handleAccept = () => {
    setIsAccepted(true);
    // In a real app, you would add the upsell item to the estimate/invoice
    // and track the conversion
    setTimeout(() => {
      onOpenChange(false);
    }, 1500);
  };

  const handleDecline = () => {
    // In a real app, you would track the declined offer
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {!isAccepted ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl flex items-center gap-2 text-fixlyfy-primary">
                <CheckCircle className="text-fixlyfy-success" size={20} />
                Recommended Add-on
              </DialogTitle>
              <DialogDescription className="text-lg font-medium">
                {upsellOffer.title} for ${upsellOffer.price}
              </DialogDescription>
            </DialogHeader>
            
            <div className="py-4">
              <p className="mb-4">{upsellOffer.description}</p>
              <div className="bg-muted/40 p-3 rounded-md mb-4">
                <p className="text-sm font-medium text-fixlyfy-info">
                  {upsellOffer.conversionRate}
                </p>
              </div>
              
              <ul className="space-y-2">
                {upsellOffer.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <CheckCheck size={16} className="text-fixlyfy-success" />
                    <span>{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <DialogFooter className="flex-col sm:flex-row sm:justify-between gap-3">
              <Button variant="outline" onClick={handleDecline}>
                <X size={16} className="mr-2" />
                No Thanks
              </Button>
              <Button onClick={handleAccept} className="gap-2">
                <CheckCircle size={16} />
                Add to Order
              </Button>
            </DialogFooter>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-fixlyfy-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="text-fixlyfy-success" size={32} />
            </div>
            <h3 className="text-xl font-medium mb-2">Added Successfully!</h3>
            <p className="text-muted-foreground">
              The warranty has been added to your order.
            </p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
