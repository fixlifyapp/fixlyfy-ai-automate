
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { JobInfo } from "../context/types";

interface JobSummaryCardProps {
  job: JobInfo;
  leadSource: string;
}

export const JobSummaryCard = ({ job, leadSource }: JobSummaryCardProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Job Type</p>
            <p className="font-medium">{job.service || "General Service"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lead Source</p>
            <p className="font-medium">{leadSource}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Status</p>
            <Badge variant="outline" className="bg-blue-50 border-blue-200 text-blue-600">
              {job.status}
            </Badge>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Revenue</p>
            <p className="font-medium">${job.total?.toFixed(2) || "0.00"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Technician</p>
            <p className="font-medium">
              {job.technician_id ? "Assigned" : "Unassigned"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
