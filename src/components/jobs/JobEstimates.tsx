
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface JobEstimatesProps {
  jobId: string;
}

export const JobEstimates = ({ jobId }: JobEstimatesProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Estimates</span>
          <Button className="gap-2" disabled>
            <PlusCircle size={16} />
            New Estimate
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-muted-foreground">
          <p>System is being rebuilt with unified document management</p>
          <p className="mt-2">Coming soon - Phase 4</p>
        </div>
      </CardContent>
    </Card>
  );
};
