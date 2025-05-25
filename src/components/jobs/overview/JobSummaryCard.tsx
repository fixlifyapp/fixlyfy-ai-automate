
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { JobInfo } from "../context/types";

interface JobSummaryCardProps {
  job: JobInfo;
}

export const JobSummaryCard = ({ job }: JobSummaryCardProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Job Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Job Type</p>
            <p className="font-medium">{job.service || job.job_type || "General Service"}</p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Lead Source</p>
            <p className="font-medium">{job.lead_source || "Not specified"}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
