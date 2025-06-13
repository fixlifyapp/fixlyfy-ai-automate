
import React from "react";
import { ModernCard, ModernCardHeader, ModernCardTitle, ModernCardContent } from "@/components/ui/modern-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail, MapPin, Clock, Edit3 } from "lucide-react";

interface TechnicianCardProps {
  technician?: any;
  jobId?: string;
  editable?: boolean;
  onAssign?: () => void;
}

export const TechnicianCard = ({ technician, jobId, editable = false, onAssign }: TechnicianCardProps) => {
  return (
    <ModernCard variant="elevated">
      <ModernCardHeader className="flex flex-row items-center justify-between space-y-0">
        <ModernCardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Assigned Technician
        </ModernCardTitle>
        {editable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onAssign}
            className="gap-2"
          >
            <Edit3 className="h-4 w-4" />
            {technician ? 'Reassign' : 'Assign'}
          </Button>
        )}
      </ModernCardHeader>
      <ModernCardContent>
        {technician ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={technician.avatar_url} />
                <AvatarFallback>
                  {technician.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase() || 'T'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{technician.name}</h3>
                <p className="text-sm text-muted-foreground">{technician.role || 'Technician'}</p>
                {technician.status && (
                  <Badge variant={technician.status === 'available' ? 'success' : 'warning'} className="mt-1">
                    {technician.status}
                  </Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              {technician.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{technician.phone}</span>
                </div>
              )}
              {technician.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{technician.email}</span>
                </div>
              )}
              {technician.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{technician.location}</span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <User className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No technician assigned</p>
            {editable && (
              <Button onClick={onAssign} size="sm" className="gap-2">
                <User className="h-4 w-4" />
                Assign Technician
              </Button>
            )}
          </div>
        )}
      </ModernCardContent>
    </ModernCard>
  );
};
