
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Trash2 } from "lucide-react";

interface DeleteConfirmDialogProps {
  title: string;
  description: string;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting?: boolean;
  confirmText?: string;
}

export function DeleteConfirmDialog({ 
  title, 
  description, 
  onOpenChange, 
  onConfirm, 
  isDeleting = false,
  confirmText = "Delete"
}: DeleteConfirmDialogProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>{title}</DialogTitle>
        <DialogDescription>
          {description}
        </DialogDescription>
      </DialogHeader>
      
      <DialogFooter className="gap-2 sm:gap-0">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => onOpenChange(false)}
          disabled={isDeleting}
        >
          Cancel
        </Button>
        <Button 
          type="button" 
          variant="destructive" 
          onClick={onConfirm}
          disabled={isDeleting}
          className="gap-2"
        >
          <Trash2 size={16} />
          {isDeleting ? "Deleting..." : confirmText}
        </Button>
      </DialogFooter>
    </DialogContent>
  );
}
