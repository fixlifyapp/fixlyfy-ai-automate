
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DeleteJobsDialog } from "./dialogs/DeleteJobsDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from "lucide-react";

interface BulkActionsBarProps {
  selectedJobs: string[];
  onDeselectAll: () => void;
  onSelectionComplete: () => void;
}

export function BulkActionsBar({ selectedJobs, onDeselectAll, onSelectionComplete }: BulkActionsBarProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleDeleteJobs = () => {
    setIsDeleteDialogOpen(true);
  };

  return (
    <div className="flex items-center justify-end space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open dropdown menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={handleDeleteJobs}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      {isDeleteDialogOpen && (
        <DeleteJobsDialog
          selectedJobs={selectedJobs}
          onOpenChange={setIsDeleteDialogOpen}
          onSuccess={() => {
            onSelectionComplete();
            onDeselectAll();
          }}
          open={isDeleteDialogOpen}
        />
      )}
    </div>
  );
}
