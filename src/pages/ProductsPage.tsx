
import { useState } from "react";
import { PageLayout } from "@/components/layout/PageLayout";
import { PageHeader } from "@/components/ui/page-header";
import { Card } from "@/components/ui/card";
import { JobProducts } from "@/components/jobs/JobProducts";
import { Button } from "@/components/ui/button";
import { Plus, Download, Package, BarChart3, Target, Zap } from "lucide-react";
import { applianceRepairProducts } from "@/data/appliance-repair-products";
import { useProducts } from "@/hooks/useProducts";
import { toast } from "sonner";
import { Dialog } from "@/components/ui/dialog";
import { DeleteConfirmDialog } from "@/components/jobs/dialogs/DeleteConfirmDialog";

const ProductsPage = () => {
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const { createProduct, refreshProducts, deleteProduct, isDeleting } = useProducts();

  const handleImportApplianceProducts = async () => {
    if (isImporting) return;
    
    try {
      setIsImporting(true);
      toast.info("Importing appliance repair products. This may take a moment...");
      
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of applianceRepairProducts) {
        try {
          await createProduct(product);
          successCount++;
        } catch (error) {
          console.error(`Failed to import product ${product.name}:`, error);
          errorCount++;
        }
      }
      
      refreshProducts();
      
      if (errorCount === 0) {
        toast.success(`Successfully imported ${successCount} appliance repair products!`);
      } else {
        toast.info(`Imported ${successCount} products with ${errorCount} errors. Check console for details.`);
      }
    } catch (error) {
      console.error("Import failed:", error);
      toast.error("Failed to import appliance repair products");
    } finally {
      setIsImporting(false);
    }
  };

  const handleDeleteProduct = (productId: string) => {
    setProductToDelete(productId);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteProduct = async () => {
    if (productToDelete) {
      const success = await deleteProduct(productToDelete);
      if (success) {
        setIsDeleteConfirmOpen(false);
        setProductToDelete(null);
      }
    }
  };

  return (
    <PageLayout>
      <PageHeader
        title="Products"
        subtitle="Manage your product catalog and inventory"
        icon={Package}
        badges={[
          { text: "Inventory Tracking", icon: BarChart3, variant: "fixlyfy" },
          { text: "Smart Pricing", icon: Target, variant: "success" },
          { text: "Quick Import", icon: Zap, variant: "info" }
        ]}
        actionButton={{
          text: "New Product",
          icon: Plus,
          onClick: () => {}
        }}
      />

      <div className="flex justify-end mb-6">
        <Button 
          variant="outline" 
          onClick={handleImportApplianceProducts}
          disabled={isImporting}
          className="gap-2"
        >
          <Download size={18} />
          {isImporting ? "Importing..." : "Import Appliance Products"}
        </Button>
      </div>

      <Card className="border-fixlyfy-border shadow-sm">
        <JobProducts 
          jobId="" 
          onDeleteProduct={handleDeleteProduct}
        />
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DeleteConfirmDialog 
          title="Delete Product"
          description="Are you sure you want to delete this product? This action cannot be undone."
          onOpenChange={setIsDeleteConfirmOpen}
          onConfirm={confirmDeleteProduct}
          isDeleting={isDeleting}
        />
      </Dialog>
    </PageLayout>
  );
};

export default ProductsPage;
