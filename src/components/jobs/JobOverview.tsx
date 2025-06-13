
import React from 'react';
import { ModernCard, ModernCardContent, ModernCardHeader } from '@/components/ui/modern-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  User, 
  MapPin, 
  Calendar, 
  Clock,
  Phone,
  Mail,
  DollarSign,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Edit,
  ExternalLink
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface JobOverviewProps {
  job: any;
  onEdit?: () => void;
  onViewClient?: () => void;
}

export const JobOverview = ({ job, onEdit, onViewClient }: JobOverviewProps) => {
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600';
      case 'medium':
        return 'text-yellow-600';
      case 'low':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <ModernCard>
        <ModernCardHeader className="flex flex-row items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">{job.title || `Job ${job.id}`}</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Job ID: {job.id}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(job.status)}>
              {job.status?.replace('_', ' ').toUpperCase()}
            </Badge>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </ModernCardHeader>
        <ModernCardContent className="space-y-4">
          {job.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{job.description}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Scheduled Date:</span>
                  <p className="text-sm text-muted-foreground">
                    {job.date ? new Date(job.date).toLocaleDateString() : 'Not scheduled'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Time:</span>
                  <p className="text-sm text-muted-foreground">
                    {job.schedule_start && job.schedule_end 
                      ? `${new Date(job.schedule_start).toLocaleTimeString()} - ${new Date(job.schedule_end).toLocaleTimeString()}`
                      : 'Not specified'
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Location:</span>
                  <p className="text-sm text-muted-foreground">
                    {job.address || 'No address provided'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Technician:</span>
                  <p className="text-sm text-muted-foreground">
                    {job.technician_name || 'Unassigned'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <div>
                  <span className="text-sm font-medium">Revenue:</span>
                  <p className="text-sm font-medium text-green-600">
                    {job.revenue ? formatCurrency(job.revenue) : 'Not set'}
                  </p>
                </div>
              </div>

              {job.priority && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className={`h-4 w-4 ${getPriorityColor(job.priority)}`} />
                  <div>
                    <span className="text-sm font-medium">Priority:</span>
                    <p className={`text-sm font-medium ${getPriorityColor(job.priority)}`}>
                      {job.priority.toUpperCase()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </ModernCardContent>
      </ModernCard>

      {/* Client Information */}
      {job.client && (
        <ModernCard>
          <ModernCardHeader className="flex flex-row items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Client Information
            </h3>
            <Button variant="outline" size="sm" onClick={onViewClient}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Profile
            </Button>
          </ModernCardHeader>
          <ModernCardContent className="space-y-3">
            <div>
              <span className="text-sm font-medium">Name:</span>
              <p className="text-sm text-muted-foreground">
                {typeof job.client === 'string' ? job.client : job.client.name}
              </p>
            </div>
            
            {typeof job.client === 'object' && (
              <>
                {job.client.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Email:</span>
                      <p className="text-sm text-muted-foreground">{job.client.email}</p>
                    </div>
                  </div>
                )}
                
                {job.client.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <span className="text-sm font-medium">Phone:</span>
                      <p className="text-sm text-muted-foreground">{job.client.phone}</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <ModernCard>
          <ModernCardHeader>
            <h3 className="text-lg font-semibold">Tags</h3>
          </ModernCardHeader>
          <ModernCardContent>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag: string, index: number) => (
                <Badge key={index} variant="outline">
                  {tag}
                </Badge>
              ))}
            </div>
          </ModernCardContent>
        </ModernCard>
      )}

      {/* Notes */}
      {job.notes && (
        <ModernCard>
          <ModernCardHeader>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Notes
            </h3>
          </ModernCardHeader>
          <ModernCardContent>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {job.notes}
            </p>
          </ModernCardContent>
        </ModernCard>
      )}
    </div>
  );
};
