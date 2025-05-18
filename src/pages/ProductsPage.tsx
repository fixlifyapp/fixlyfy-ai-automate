
import { PageLayout } from "@/components/layout/PageLayout";
import { Card } from "@/components/ui/card";
import { JobProducts } from "@/components/jobs/JobProducts";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const ProductsPage = () => {
  return (
    <PageLayout>
      <div className="container mx-auto px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Products</h1>
          <Button className="gap-2">
            <Plus size={18} />
            New Product
          </Button>
        </div>
        <Card className="border-fixlyfy-border shadow-sm">
          <JobProducts jobId="" />
        </Card>
      </div>
    </PageLayout>
  );
};

export default ProductsPage;
