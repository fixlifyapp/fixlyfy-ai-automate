
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Info, Clock, AlertTriangle, Wrench } from "lucide-react";
import { JobInfo } from "../context/types";

interface AdditionalInfoCardProps {
  job: JobInfo;
}

export const AdditionalInfoCard = ({ job }: AdditionalInfoCardProps) => {
  const hasAdditionalInfo = job.special_instructions || job.client_requirements || 
    job.access_instructions || job.preferred_time || 
    (job.equipment_needed && job.equipment_needed.length > 0) || job.safety_notes;

  if (!hasAdditionalInfo) return null;

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Info className="h-5 w-5" />
          Additional Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {job.special_instructions && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4" />
              Special Instructions
            </p>
            <p className="font-medium">{job.special_instructions}</p>
          </div>
        )}
        
        {job.client_requirements && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4" />
              Client Requirements
            </p>
            <p className="font-medium">{job.client_requirements}</p>
          </div>
        )}
        
        {job.access_instructions && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Info className="h-4 w-4" />
              Access Instructions
            </p>
            <p className="font-medium">{job.access_instructions}</p>
          </div>
        )}
        
        {job.preferred_time && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Preferred Time
            </p>
            <p className="font-medium">{job.preferred_time}</p>
          </div>
        )}
        
        {job.equipment_needed && job.equipment_needed.length > 0 && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Wrench className="h-4 w-4" />
              Equipment Needed
            </p>
            <div className="flex flex-wrap gap-2 mt-1">
              {job.equipment_needed.map((equipment, index) => (
                <span key={index} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                  {equipment}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {job.safety_notes && (
          <div>
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="h-4 w-4 text-orange-500" />
              Safety Notes
            </p>
            <p className="font-medium text-orange-800">{job.safety_notes}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
