
import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const EstimatesPage = () => {
  return (
    <PageLayout>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Estimates</h1>
          <p className="text-fixlyfy-text-secondary">
            Manage and track all your project estimates
          </p>
        </div>
        <Button className="bg-fixlyfy hover:bg-fixlyfy/90">
          <Plus size={18} className="mr-2" /> 
          New Estimate
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Estimates Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>Estimates functionality coming soon...</p>
          </div>
        </CardContent>
      </Card>
    </PageLayout>
  );
};

export default EstimatesPage;
