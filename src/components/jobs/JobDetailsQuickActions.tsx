
import React, { useState } from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  User, 
  MapPin, 
  Calendar,
  FileText,
  DollarSign,
  Phone,
  Mail,
  MessageSquare,
  AlertTriangle,
  CheckCircle,
  XCircle,
  PlayCircle,
  Edit,
  Archive
} from 'lucide-react';

interface JobDetailsQuickActionsProps {
  job: any;
  onUpdateStatus?: (status: string) => void;
  onAssignTechnician?: () => void;
  onSchedule?: () => void;
  onCreateEstimate?: () => void;
  onCreateInvoice?: () => void;
  onContactClient?: (method: 'phone' | 'email' | 'sms') => void;
}

export const JobDetailsQuickActions = ({ 
  job, 
  onUpdateStatus,
  onAssignTechnician,
  onSchedule,
  onCreateEstimate,
  onCreateInvoice,
  onContactClient
}: JobDetailsQuickActionsProps) => {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getNextStatusAction = (currentStatus: string) => {
    switch (currentStatus) {
      case 'scheduled':
        return { label: 'Start Job', status: 'in_progress', icon: PlayCircle };
      case 'in_progress':
        return { label: 'Complete', status: 'completed', icon: CheckCircle };
      default:
        return null;
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    setIsUpdatingStatus(true);
    try {
      await onUpdateStatus?.(newStatus);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const nextAction = getNextStatusAction(job.status);

  return (
    <div className="space-y-6">
      {/* Job Status & Quick Actions */}
      <ModernCard>
        <ModernCardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Job Status & Actions
          </h3>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Current Status:</span>
              <Badge className={getStatusColor(job.status)}>
                {job.status.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            {nextAction && (
              <Button
                size="sm"
                onClick={() => handleStatusUpdate(nextAction.status)}
                disabled={isUpdatingStatus}
                className="gap-2"
              >
                <nextAction.icon className="h-4 w-4" />
                {nextAction.label}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleStatusUpdate('cancelled')}
              disabled={isUpdatingStatus || job.status === 'completed'}
              className="gap-2 text-red-600 hover:text-red-700"
            >
              <XCircle className="h-4 w-4" />
              Cancel
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onSchedule}
              className="gap-2"
            >
              <Calendar className="h-4 w-4" />
              Reschedule
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Contact Client */}
      <ModernCard>
        <ModernCardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Contact Client
          </h3>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="grid grid-cols-3 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactClient?.('phone')}
              className="gap-2"
            >
              <Phone className="h-4 w-4" />
              Call
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactClient?.('email')}
              className="gap-2"
            >
              <Mail className="h-4 w-4" />
              Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onContactClient?.('sms')}
              className="gap-2"
            >
              <MessageSquare className="h-4 w-4" />
              SMS
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Documents & Billing */}
      <ModernCard>
        <ModernCardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents & Billing
          </h3>
        </ModernCardHeader>
        <ModernCardContent className="space-y-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateEstimate}
            className="w-full gap-2"
          >
            <FileText className="h-4 w-4" />
            Create Estimate
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateInvoice}
            className="w-full gap-2"
          >
            <DollarSign className="h-4 w-4" />
            Create Invoice
          </Button>
        </ModernCardContent>
      </ModernCard>

      {/* Assignment */}
      <ModernCard>
        <ModernCardHeader className="pb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <User className="h-5 w-5" />
            Assignment
          </h3>
        </ModernCardHeader>
        <ModernCardContent>
          <div className="space-y-2">
            <div className="text-sm text-muted-foreground">
              Assigned to: {job.technician_name || 'Unassigned'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAssignTechnician}
              className="w-full gap-2"
            >
              <User className="h-4 w-4" />
              {job.technician_name ? 'Reassign' : 'Assign'} Technician
            </Button>
          </div>
        </ModernCardContent>
      </ModernCard>
    </div>
  );
};
