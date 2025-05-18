
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Users, Tag, Bell, CheckCircle, Trash, ArrowDownToLine, FileCheck } from "lucide-react";
import { toast } from "sonner";
import { teamMembers } from "@/data/team";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { ChangeStatusDialog } from "./dialogs/ChangeStatusDialog";
import { AssignTechnicianDialog } from "./dialogs/AssignTechnicianDialog";
import { DeleteJobsDialog } from "./dialogs/DeleteJobsDialog";
import { SendReminderDialog } from "./dialogs/SendReminderDialog";
import { TagJobsDialog } from "./dialogs/TagJobsDialog";
import { MarkAsPaidDialog } from "./dialogs/MarkAsPaidDialog";

interface BulkActionsBarProps {
  selectedJobs: string[];
  onClearSelection: () => void;
  onUpdateStatus: (jobIds: string[], newStatus: string) => void;
  onAssignTechnician: (jobIds: string[], technicianId: string, technicianName: string) => void;
  onDeleteJobs: (jobIds: string[]) => void;
  onSendReminders: (jobIds: string[], reminderType: string) => void;
  onTagJobs: (jobIds: string[], tags: string[]) => void;
  onMarkAsPaid: (jobIds: string[], paymentMethod: string) => void;
}

export function BulkActionsBar({ 
  selectedJobs, 
  onClearSelection,
  onUpdateStatus,
  onAssignTechnician,
  onDeleteJobs,
  onSendReminders,
  onTagJobs,
  onMarkAsPaid
}: BulkActionsBarProps) {
  const [isChangeStatusOpen, setIsChangeStatusOpen] = useState(false);
  const [isAssignTechOpen, setIsAssignTechOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
  const [isTagJobsOpen, setIsTagJobsOpen] = useState(false);
  const [isMarkPaidOpen, setIsMarkPaidOpen] = useState(false);

  const handleExport = () => {
    if (selectedJobs.length === 0) {
      toast.error("Please select at least one job to export");
      return;
    }

    // In a real app, this would hit an actual API endpoint
    // window.location.href = `/api/jobs/export?ids=${selectedJobs.join(',')}`;
    toast.success(`Exporting ${selectedJobs.length} jobs`);
    console.log(`Exporting jobs: ${selectedJobs.join(', ')}`);
  };

  const hasSelectedJobs = selectedJobs.length > 0;
  
  // Helper for conditional button rendering
  const renderActionButton = (
    label: string, 
    icon: React.ReactNode, 
    onClick: () => void, 
    disabled: boolean = !hasSelectedJobs
  ) => (
    <Button 
      variant="outline" 
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className="flex items-center gap-1 whitespace-nowrap"
    >
      {icon}
      {label}
    </Button>
  );

  return (
    <div className={`bg-fixlyfy-bg-interface/80 border rounded-lg p-3 mb-4 transition-opacity ${hasSelectedJobs ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-sm font-medium mr-2">
          {selectedJobs.length} {selectedJobs.length === 1 ? 'job' : 'jobs'} selected
        </span>
        
        <Dialog open={isChangeStatusOpen} onOpenChange={setIsChangeStatusOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Change Status", <FileCheck size={16} />, () => {})}
          </DialogTrigger>
          <ChangeStatusDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsChangeStatusOpen}
            onSuccess={(status) => onUpdateStatus(selectedJobs, status)}
          />
        </Dialog>

        <Dialog open={isAssignTechOpen} onOpenChange={setIsAssignTechOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Assign Tech", <Users size={16} />, () => {})}
          </DialogTrigger>
          <AssignTechnicianDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsAssignTechOpen} 
            onSuccess={(techId, techName) => onAssignTechnician(selectedJobs, techId, techName)}
            technicians={teamMembers.filter(member => member.role === "technician")}
          />
        </Dialog>

        {renderActionButton("Export", <ArrowDownToLine size={16} />, handleExport)}

        <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Delete", <Trash size={16} />, () => {})}
          </DialogTrigger>
          <DeleteJobsDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsDeleteOpen} 
            onSuccess={() => onDeleteJobs(selectedJobs)}
          />
        </Dialog>

        {/* Optional power features */}
        <Dialog open={isTagJobsOpen} onOpenChange={setIsTagJobsOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Tag Jobs", <Tag size={16} />, () => {})}
          </DialogTrigger>
          <TagJobsDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsTagJobsOpen} 
            onSuccess={(tags) => onTagJobs(selectedJobs, tags)}
          />
        </Dialog>

        <Dialog open={isSendReminderOpen} onOpenChange={setIsSendReminderOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Send Reminder", <Bell size={16} />, () => {})}
          </DialogTrigger>
          <SendReminderDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsSendReminderOpen} 
            onSuccess={(reminderType) => onSendReminders(selectedJobs, reminderType)}
          />
        </Dialog>

        <Dialog open={isMarkPaidOpen} onOpenChange={setIsMarkPaidOpen}>
          <DialogTrigger asChild>
            {renderActionButton("Mark as Paid", <CheckCircle size={16} />, () => {})}
          </DialogTrigger>
          <MarkAsPaidDialog 
            selectedJobs={selectedJobs} 
            onOpenChange={setIsMarkPaidOpen} 
            onSuccess={(paymentMethod) => onMarkAsPaid(selectedJobs, paymentMethod)}
          />
        </Dialog>
      </div>
    </div>
  );
}
