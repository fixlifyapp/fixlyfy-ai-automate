
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const InvoiceStatusBreakdown = () => {
  const navigate = useNavigate();

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">Document Status</CardTitle>
        <Button variant="outline" size="sm" onClick={() => navigate('/jobs')}>
          Go to Jobs
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-16 text-muted-foreground">
          <p>Document management system is being rebuilt</p>
          <p className="mt-2">Coming soon - Phase 4</p>
        </div>
      </CardContent>
    </Card>
  );
};
