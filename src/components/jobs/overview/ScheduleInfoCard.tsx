
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User } from "lucide-react";

interface ScheduleInfoCardProps {
  job: any;
}

export const ScheduleInfoCard = ({ job }: ScheduleInfoCardProps) => {
  const formatTime = (timeString: string) => {
    if (!timeString) return 'Not set';
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeSlotDisplay = () => {
    if (job.start_time && job.end_time) {
      return `${formatTime(job.start_time)} - ${formatTime(job.end_time)}`;
    }
    return 'Time not specified';
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule Information
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Time Slot</p>
                <p className="text-sm text-muted-foreground">
                  {getTimeSlotDisplay()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Assigned Technician</p>
                <p className="text-sm text-muted-foreground">
                  {job.technician_name || 'Not assigned'}
                </p>
              </div>
            </div>
            
            {job.priority && (
              <div>
                <p className="text-sm font-medium mb-1">Priority</p>
                <Badge variant={job.priority === 'urgent' ? 'destructive' : job.priority === 'high' ? 'warning' : 'secondary'}>
                  {job.priority.toUpperCase()}
                </Badge>
              </div>
            )}
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
