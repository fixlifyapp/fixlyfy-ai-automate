
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, MapPin, User, Phone, Mail, Building } from "lucide-react";

interface JobBasicInfoCardProps {
  job: any;
}

export const JobBasicInfoCard = ({ job }: JobBasicInfoCardProps) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
        return 'info';
      case 'in_progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <ModernCard variant="elevated">
      <ModernCardHeader>
        <ModernCardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building className="h-5 w-5" />
            Job Information
          </span>
          <Badge variant={getStatusColor(job.status)}>
            {job.status?.replace('_', ' ').toUpperCase()}
          </Badge>
        </ModernCardTitle>
      </ModernCardHeader>
      <ModernCardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Scheduled Date</p>
                <p className="text-sm text-muted-foreground">
                  {job.scheduled_date ? new Date(job.scheduled_date).toLocaleDateString() : 'Not scheduled'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Service Address</p>
                <p className="text-sm text-muted-foreground">
                  {job.service_address || job.address || 'No address provided'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Client</p>
                <p className="text-sm text-muted-foreground">
                  {job.client_name || job.client || 'No client assigned'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Phone</p>
                <p className="text-sm text-muted-foreground">
                  {job.client_phone || 'Not provided'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </ModernCardContent>
    </ModernCard>
  );
};
