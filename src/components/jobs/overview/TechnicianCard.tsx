
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { JobInfo } from "../context/types";

interface TechnicianCardProps {
  job: JobInfo;
}

export const TechnicianCard = ({ job }: TechnicianCardProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Technician Assignment
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div>
          <p className="text-sm text-muted-foreground">Assigned Technician</p>
          {job.technician_id ? (
            <Badge variant="outline" className="bg-green-50 border-green-200 text-green-600">
              Assigned
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-gray-50 border-gray-200 text-gray-600">
              Unassigned
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
