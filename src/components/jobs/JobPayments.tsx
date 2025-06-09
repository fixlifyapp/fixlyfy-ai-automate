
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface JobPaymentsProps {
  jobId: string;
}

export const JobPayments = ({ jobId }: JobPaymentsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Payments</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-8 text-muted-foreground">
          Payment system will be rebuilt in the next phase
        </div>
      </CardContent>
    </Card>
  );
};
