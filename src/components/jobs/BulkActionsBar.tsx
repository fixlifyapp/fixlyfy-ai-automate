
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, UserPlus, Trash, SendHorizonal, Tag, DollarSign } from 'lucide-react';

export interface BulkActionsBarProps {
  selectedJobs: string[];
  onClearSelection: () => void;
  onUpdateStatus: (jobIds: string[], newStatus: string) => void;
  onAssignTechnician: (jobIds: string[], technicianId: string, technicianName: string) => void;
  onDeleteJobs: (jobIds: string[]) => void;
  onSendReminders: (jobIds: string[], reminderType: string) => void;
  onTagJobs: (jobIds: string[], tags: string[]) => void;
  onMarkAsPaid?: (jobIds: string[], paymentMethod: string) => void;
}

export const BulkActionsBar: React.FC<BulkActionsBarProps> = ({
  selectedJobs,
  onClearSelection,
  onUpdateStatus,
  onAssignTechnician,
  onDeleteJobs,
  onSendReminders,
  onTagJobs,
  onMarkAsPaid
}) => {
  if (selectedJobs.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg z-50 py-3 px-4 flex items-center">
      <div className="container mx-auto flex flex-wrap items-center gap-3">
        <div className="bg-fixlyfy text-white px-3 py-1 rounded-full text-sm font-medium">
          {selectedJobs.length} jobs selected
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-1"
          onClick={onClearSelection}
        >
          <X size={14} />
          Clear
        </Button>
        
        <div className="ml-auto flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => onUpdateStatus(selectedJobs, 'completed')}
          >
            <CheckCircle size={14} />
            Mark Complete
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => onAssignTechnician(selectedJobs, '', '')}
          >
            <UserPlus size={14} />
            Assign
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => onSendReminders(selectedJobs, 'sms')}
          >
            <SendHorizonal size={14} />
            Send Reminder
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-1"
            onClick={() => onTagJobs(selectedJobs, [])}
          >
            <Tag size={14} />
            Tag
          </Button>
          
          {onMarkAsPaid && (
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={() => onMarkAsPaid(selectedJobs, 'card')}
            >
              <DollarSign size={14} />
              Mark Paid
            </Button>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="gap-1"
            onClick={() => onDeleteJobs(selectedJobs)}
          >
            <Trash size={14} />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BulkActionsBar;
