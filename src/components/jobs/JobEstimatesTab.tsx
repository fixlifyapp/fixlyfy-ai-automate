
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";

interface JobEstimatesTabProps {
  jobId: string;
  onEstimateConverted?: () => void;
}

export const JobEstimatesTab = ({ jobId, onEstimateConverted }: JobEstimatesTabProps) => {
  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Estimates</h3>
          <Button className="gap-2">
            <PlusCircle size={16} />
            New Estimate
          </Button>
        </div>

        <div className="text-center py-16 text-muted-foreground">
          <p>Estimate functionality is being rebuilt.</p>
          <p className="mt-2">Please check back later.</p>
        </div>
      </CardContent>
    </Card>
  );
};
