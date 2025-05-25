
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "lucide-react";
import { JobInfo } from "../context/types";

interface ScheduleInfoCardProps {
  job: JobInfo;
}

export const ScheduleInfoCard = ({ job }: ScheduleInfoCardProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Start Date & Time</p>
            <p className="font-medium">
              {job.schedule_start 
                ? new Date(job.schedule_start).toLocaleString() 
                : "Not scheduled"}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">End Date & Time</p>
            <p className="font-medium">
              {job.schedule_end 
                ? new Date(job.schedule_end).toLocaleString() 
                : "Not scheduled"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
