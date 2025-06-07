
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Package } from "lucide-react";

const ProductsPage = () => {
  return (
    <PageLayout>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        icon={Package}
      />
      
      <div className="space-y-6">
        <div className="text-center py-12">
          <Package className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Products & Inventory</h3>
          <p className="text-muted-foreground">
            Product management functionality will be available soon.
          </p>
        </div>
      </div>
    </PageLayout>
  );
};

export default ProductsPage;
