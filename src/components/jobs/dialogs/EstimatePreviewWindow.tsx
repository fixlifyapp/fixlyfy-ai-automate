
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface EstimatePreviewWindowProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  estimate: any;
  onConvertToInvoice?: (estimate: any) => void;
}

export const EstimatePreviewWindow = ({ open, onOpenChange }: EstimatePreviewWindowProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Estimate Preview</DialogTitle>
        </DialogHeader>
        <div className="text-center py-8 text-muted-foreground">
          Estimate preview will be rebuilt in the next phase
        </div>
      </DialogContent>
    </Dialog>
  );
};
