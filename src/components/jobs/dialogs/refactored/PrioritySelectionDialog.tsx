
import { useModal } from "@/components/ui/modal-provider";
import { SelectionModal, SelectionOption } from "@/components/shared/modals/SelectionModal";

// This component is a wrapper for the SelectionModal with priority-specific options
export function PrioritySelectionDialog() {
  const { modalProps, closeModal } = useModal();
  const { initialPriority, onSave } = modalProps;
  
  const priorityOptions: SelectionOption[] = [
    { 
      value: "High", 
      label: "High", 
      color: "text-red-500", 
      bgColor: "bg-red-50 border-red-200 px-3 py-1 rounded-full" 
    },
    { 
      value: "Medium", 
      label: "Medium", 
      color: "text-orange-500", 
      bgColor: "bg-orange-50 border-orange-200 px-3 py-1 rounded-full" 
    },
    { 
      value: "Low", 
      label: "Low", 
      color: "text-green-500", 
      bgColor: "bg-green-50 border-green-200 px-3 py-1 rounded-full" 
    }
  ];
  
  const handleSave = (priority: string) => {
    onSave(priority);
    closeModal();
  };
  
  return (
    <SelectionModal
      open={true}
      onOpenChange={(open) => !open && closeModal()}
      title="Select Priority Level"
      options={priorityOptions}
      initialSelection={initialPriority}
      onSave={handleSave}
      successMessage="Job priority updated"
    />
  );
}
