
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EstimatesListProps {
  jobId: string;
  onEstimateConverted?: () => void;
  onViewEstimate?: (estimate: any) => void;
}

export const EstimatesList = ({ jobId }: EstimatesListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Estimates</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Estimate system will be rebuilt in the next phase
        </div>
      </CardContent>
    </Card>
  );
};
