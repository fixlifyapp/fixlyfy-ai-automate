
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, DollarSign, MapPin } from "lucide-react";

interface JobInfoSectionProps {
  job: {
    id: string;
    title?: string;
    description?: string;
    status: string;
    priority?: string;
    value?: number;
    location?: string;
    schedule_start?: string;
  };
}

export const JobInfoSection = ({ job }: JobInfoSectionProps) => {
  // Mock financials data since the hook was deleted
  const financials = {
    totalEstimates: 0,
    totalInvoices: 0,
    totalPaid: 0,
    totalOutstanding: 0
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium">Total Value</span>
          </div>
          <p className="text-2xl font-bold text-green-600">
            ${(job.value || 0).toLocaleString()}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium">Scheduled</span>
          </div>
          <p className="text-sm text-gray-600">
            {job.schedule_start ? new Date(job.schedule_start).toLocaleDateString() : "Not scheduled"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span className="text-sm font-medium">Location</span>
          </div>
          <p className="text-sm text-gray-600 truncate">
            {job.location || "No location set"}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status</span>
          </div>
          <Badge variant="outline" className="capitalize">
            {job.status}
          </Badge>
        </CardContent>
      </Card>
    </div>
  );
};
