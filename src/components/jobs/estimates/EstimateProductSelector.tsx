
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProducts } from "@/hooks/useProducts";
import { ProductSearch } from "@/components/jobs/builder/ProductSearch";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Trash, Plus, Package } from "lucide-react";

interface EstimateProductSelectorProps {
  selectedProducts: any[];
  onAddProduct: (product: any) => void;
  onRemoveProduct: (productId: string) => void;
}

export function EstimateProductSelector({
  selectedProducts,
  onAddProduct,
  onRemoveProduct
}: EstimateProductSelectorProps) {
  const { products, isLoading } = useProducts();
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);

  // Calculate total estimate amount
  const estimateTotal = selectedProducts.reduce((sum, product) => 
    sum + product.price, 0
  );
  
  const handleOpenProductSearch = () => {
    setIsProductSearchOpen(true);
  };

  const handleProductSelect = (product: any) => {
    onAddProduct(product);
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base">Products & Services</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-1"
              onClick={handleOpenProductSearch}
            >
              <Plus size={16} />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {selectedProducts.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead className="text-right">Price</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedProducts.map(product => (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground line-clamp-1">
                          {product.description}
                        </div>
                        {product.tags && product.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {product.tags.map((tag: string, i: number) => (
                              <Badge 
                                key={i}
                                variant="outline" 
                                className="text-[10px] py-0 h-4"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{product.category}</TableCell>
                      <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onRemoveProduct(product.id)}
                          className="h-8 w-8"
                        >
                          <Trash size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="flex justify-between items-center mt-4 pt-4 border-t">
                <span className="text-sm font-medium">Total</span>
                <span className="text-lg font-bold">
                  ${estimateTotal.toFixed(2)}
                </span>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Package className="mx-auto h-12 w-12 text-muted-foreground/50 mb-2" />
              <p>No products added yet</p>
              <p className="text-sm">Click "Add Product" to add products to this estimate</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Product search dialog */}
      <ProductSearch
        open={isProductSearchOpen}
        onOpenChange={setIsProductSearchOpen}
        onProductSelect={handleProductSelect}
      />
    </div>
  );
}
