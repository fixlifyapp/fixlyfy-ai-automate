
import { Product } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductsListProps {
  products: Product[];
  onProductSelect: (product: Product) => void;
  isLoading?: boolean;
}

export const ProductsList = ({ products, onProductSelect, isLoading }: ProductsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-2">
        <h3 className="font-semibold">Products</h3>
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Products ({products.length})</h3>
      
      {products.length === 0 ? (
        <p className="text-muted-foreground text-sm">No products available</p>
      ) : (
        <div className="max-h-60 overflow-y-auto space-y-2">
          {products.map((product) => (
            <Card key={product.id} className="cursor-pointer hover:bg-muted/50">
              <CardContent className="p-3">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{product.name}</h4>
                    {product.description && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {product.description}
                      </p>
                    )}
                    <p className="text-sm font-medium mt-1">${product.price.toFixed(2)}</p>
                  </div>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onProductSelect(product)}
                  >
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
