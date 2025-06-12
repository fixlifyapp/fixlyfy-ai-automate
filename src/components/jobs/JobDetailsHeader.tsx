
import React from "react";
import { Job } from "@/hooks/useJobs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, User, Phone, Mail } from "lucide-react";

interface JobDetailsHeaderProps {
  job: Job;
}

export const JobDetailsHeader = ({ job }: JobDetailsHeaderProps) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="space-y-4">
            <div>
              <h1 className="text-2xl font-bold">{job.title || `Job ${job.id}`}</h1>
              <p className="text-muted-foreground">{job.description}</p>
            </div>
            
            <div className="flex items-center gap-6 text-sm">
              {job.date && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(job.date).toLocaleDateString()}</span>
                </div>
              )}
              
              {job.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>{job.address}</span>
                </div>
              )}
              
              {job.client_id && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Client: {job.client_id}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Badge variant={job.status === 'completed' ? 'default' : 'secondary'}>
              {job.status}
            </Badge>
            {job.job_type && (
              <Badge variant="outline">{job.job_type}</Badge>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
