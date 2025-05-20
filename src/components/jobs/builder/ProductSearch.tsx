import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (product: Product) => void;
}

export const ProductSearch = ({ open, onOpenChange, onProductSelect }: ProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { products, categories, isLoading } = useProducts();

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false) ||
      (product.tags && product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));
    
    const matchesCategory = selectedCategory === null || 
      (selectedCategory === "frequently-used" ? 
        ["prod-1", "prod-4", "prod-5"].includes(product.id) : 
        product.category === selectedCategory);
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddProduct = () => {
    if (selectedProduct) {
      onProductSelect(selectedProduct);
      onOpenChange(false);
      setSelectedProduct(null);
      setSearchQuery("");
    }
  };

  // Get frequently used products - in a real app this would come from analytics
  const frequentlyUsed = products.slice(0, 3); // Just take first 3 for now

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Select a Product</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <Label htmlFor="product-search" className="sr-only">Search Products</Label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="product-search"
                  placeholder="Search by name, description or tag..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 pb-4 border-b">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All
            </Button>
            <Button
              variant={selectedCategory === "frequently-used" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("frequently-used")}
              className="rounded-full"
            >
              Frequently Used
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="rounded-full"
              >
                {category}
              </Button>
            ))}
          </div>
          
          <div className="border rounded-md overflow-hidden bg-white">
            {isLoading ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="w-full h-16" />
                ))}
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[60%]">Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.length > 0 ? (
                    (selectedCategory === "frequently-used" ? frequentlyUsed : filteredProducts).map((product) => (
                      <TableRow 
                        key={product.id} 
                        className={cn(
                          "cursor-pointer hover:bg-muted/50 transition-colors",
                          selectedProduct?.id === product.id ? "bg-muted/80" : ""
                        )}
                        onClick={() => handleSelectProduct(product)}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {selectedProduct?.id === product.id && (
                              <Check size={16} className="text-primary" />
                            )}
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {product.tags && product.tags.map(tag => (
                                  <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{product.category}</Badge>
                        </TableCell>
                        <TableCell>${product.price.toFixed(2)}</TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                        No products found matching your search.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </div>
        
        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleAddProduct}
            disabled={!selectedProduct}
            className="gap-2"
          >
            <Plus size={16} />
            Add Selected Product
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
