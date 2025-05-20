
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Shield } from "lucide-react";
import { Product } from "../builder/types";

interface WarrantySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (selectedWarranty: Product | null, customNote: string) => void;
}

export const WarrantySelectionDialog = ({
  open,
  onOpenChange,
  onConfirm
}: WarrantySelectionDialogProps) => {
  const [selectedWarrantyId, setSelectedWarrantyId] = useState<string | null>(null);
  const [customNote, setCustomNote] = useState("");
  
  // Warranty options with customer pain points addressed
  const warranties = [
    {
      id: "prod-3",
      name: "6-Month Warranty",
      description: "Extended warranty covering parts and labor. Eliminates worry about sudden repair costs after service.",
      category: "Warranty",
      price: 49,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Basic coverage for common issues"
    },
    {
      id: "prod-4",
      name: "1-Year Warranty",
      description: "1-year extended warranty with priority service. Peace of mind knowing your appliance is fully protected for a full year.",
      category: "Warranty",
      price: 89,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Full year of coverage with priority service"
    },
    {
      id: "prod-5",
      name: "2-Year Warranty",
      description: "2-year comprehensive warranty package. Save money on future repairs and maintenance with complete coverage.",
      category: "Warranty",
      price: 149,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection"],
      benefit: "Extended coverage with annual maintenance"
    },
    {
      id: "prod-6",
      name: "5-Year Warranty",
      description: "Premium 5-year warranty with full coverage. Ultimate protection and priority emergency service for your valuable appliance.",
      category: "Warranty",
      price: 299,
      ourPrice: 0,
      cost: 0,
      taxable: false,
      tags: ["warranty", "protection", "premium"],
      benefit: "Maximum protection and priority emergency service"
    }
  ];

  useEffect(() => {
    if (open) {
      // Default to the first warranty option when opening
      setSelectedWarrantyId(warranties[0].id);
      setCustomNote("");
    }
  }, [open]);

  const handleConfirm = () => {
    const selectedWarranty = warranties.find(warranty => warranty.id === selectedWarrantyId) || null;
    onConfirm(selectedWarranty, customNote);
  };
  
  const handleSkip = () => {
    onConfirm(null, "");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="text-green-600" size={20} />
            Recommend a Warranty
          </DialogTitle>
          <DialogDescription>
            Select a warranty to recommend to your customer. Warranties address customer concerns and provide peace of mind.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <RadioGroup value={selectedWarrantyId || ""} onValueChange={setSelectedWarrantyId}>
            {warranties.map((warranty) => (
              <div 
                key={warranty.id}
                className={`flex items-start space-x-3 border rounded-md p-3 hover:bg-muted/50 cursor-pointer ${
                  selectedWarrantyId === warranty.id ? "border-primary bg-primary/5" : "border-input"
                }`}
                onClick={() => setSelectedWarrantyId(warranty.id)}
              >
                <RadioGroupItem value={warranty.id} id={warranty.id} className="mt-1" />
                <div className="flex-1">
                  <div className="flex justify-between">
                    <Label htmlFor={warranty.id} className="font-medium text-base cursor-pointer">
                      {warranty.name}
                    </Label>
                    <span className="font-medium">${warranty.price}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{warranty.description}</p>
                  <div className="mt-1 flex items-center text-sm text-green-600">
                    <Check size={14} className="mr-1" /> {warranty.benefit}
                  </div>
                </div>
              </div>
            ))}
          </RadioGroup>
          
          <div className="space-y-2 pt-2">
            <Label htmlFor="custom-note">
              Custom note for customer (optional)
            </Label>
            <Input
              id="custom-note"
              placeholder="E.g., Based on the age of your unit, I'd recommend this warranty to prevent future repair costs..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button variant="outline" onClick={handleSkip} className="sm:mr-auto">
            Skip Recommendation
          </Button>
          <Button onClick={handleConfirm}>
            Add Recommendation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
