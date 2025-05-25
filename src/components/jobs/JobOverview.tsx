
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Mail, User, AlertCircle, Settings, Calendar, FileText } from "lucide-react";
import { useJobDetails } from "./context/JobDetailsContext";
import { useJobOverview } from "@/hooks/useJobOverview";

interface JobOverviewProps {
  jobId: string;
}

export const JobOverview = ({ jobId }: JobOverviewProps) => {
  const { job, isLoading: jobLoading } = useJobDetails();
  const { overview, isLoading: overviewLoading } = useJobOverview(jobId);

  if (jobLoading || overviewLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4 w-48"></div>
          <div className="h-5 bg-gray-200 rounded w-72"></div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="space-y-6">
        <div className="text-red-500">Error loading job details</div>
      </div>
    );
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      high: "bg-red-50 border-red-200 text-red-600",
      medium: "bg-yellow-50 border-yellow-200 text-yellow-600",
      low: "bg-green-50 border-green-200 text-green-600"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  return (
    <div className="space-y-6">
      {/* Job Summary */}
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
              <p className="text-sm text-muted-foreground">Priority</p>
              <Badge variant="outline" className={getPriorityColor(overview?.priority || "medium")}>
                {(overview?.priority || "medium").charAt(0).toUpperCase() + (overview?.priority || "medium").slice(1)}
              </Badge>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lead Source</p>
              <p className="font-medium">{overview?.lead_source || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Duration</p>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <p className="font-medium">
                  {overview?.estimated_duration ? `${overview.estimated_duration} minutes` : "Not specified"}
                </p>
              </div>
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
          </div>
        </CardContent>
      </Card>

      {/* Client Information */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Client Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Client Name</p>
              <p className="font-medium">{job.client}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Phone</p>
              <div className="flex items-center gap-1">
                <Phone className="h-4 w-4 text-fixlyfy" />
                <p>{job.phone || "Not provided"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <div className="flex items-center gap-1">
                <Mail className="h-4 w-4 text-fixlyfy" />
                <p>{job.email || "Not provided"}</p>
              </div>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <p>{job.address}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Property Information */}
      {overview && (
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Property Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {overview.property_type && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Type</p>
                  <p className="font-medium">{overview.property_type}</p>
                </div>
              )}
              {overview.property_age && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Age</p>
                  <p className="font-medium">{overview.property_age}</p>
                </div>
              )}
              {overview.property_size && (
                <div>
                  <p className="text-sm text-muted-foreground">Property Size</p>
                  <p className="font-medium">{overview.property_size}</p>
                </div>
              )}
              {overview.previous_service_date && (
                <div>
                  <p className="text-sm text-muted-foreground">Previous Service</p>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">
                      {new Date(overview.previous_service_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Job Instructions */}
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5" />
            Instructions & Notes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {job.description && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Job Description</p>
              <p className="mt-1">{job.description}</p>
            </div>
          )}
          
          {overview?.special_instructions && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Special Instructions</p>
              <p className="mt-1">{overview.special_instructions}</p>
            </div>
          )}
          
          {overview?.client_requirements && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Client Requirements</p>
              <p className="mt-1">{overview.client_requirements}</p>
            </div>
          )}
          
          {overview?.access_instructions && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Access Instructions</p>
              <p className="mt-1">{overview.access_instructions}</p>
            </div>
          )}
          
          {overview?.safety_notes && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Safety Notes</p>
              <p className="mt-1 text-red-600">{overview.safety_notes}</p>
            </div>
          )}
          
          {overview?.equipment_needed && overview.equipment_needed.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground font-medium">Equipment Needed</p>
              <div className="flex flex-wrap gap-2 mt-1">
                {overview.equipment_needed.map((equipment, index) => (
                  <Badge key={index} variant="outline" className="bg-blue-50 border-blue-200 text-blue-600">
                    {equipment}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tags */}
      {job.tags && job.tags.length > 0 && (
        <Card className="border-fixlyfy-border shadow-sm">
          <CardHeader>
            <CardTitle>Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="bg-purple-50 border-purple-200 text-purple-600">
                  {tag}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
