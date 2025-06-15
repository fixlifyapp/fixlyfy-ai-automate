
import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Plus, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useOptimizedProducts, Product } from "@/hooks/useOptimizedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OptimizedProductSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onProductSelect: (product: Product) => void;
}

export const OptimizedProductSearch = ({ open, onOpenChange, onProductSelect }: OptimizedProductSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { 
    products, 
    categories, 
    isLoading, 
    isLoadingMore,
    hasMore,
    loadMore
  } = useOptimizedProducts({
    searchQuery,
    category: selectedCategory || undefined,
    pageSize: 25,
    autoLoad: open
  });

  const handleRowClick = useCallback((product: Product) => {
    onProductSelect(product);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedCategory(null);
  }, [onProductSelect, onOpenChange]);

  const handleQuickAddProduct = useCallback((product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    onProductSelect(product);
    onOpenChange(false);
    setSearchQuery("");
    setSelectedCategory(null);
  }, [onProductSelect, onOpenChange]);

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Reset search when dialog closes
  const handleOpenChange = useCallback((newOpen: boolean) => {
    onOpenChange(newOpen);
    if (!newOpen) {
      setSearchQuery("");
      setSelectedCategory(null);
    }
  }, [onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden p-0">
        <DialogHeader className="p-6 border-b">
          <DialogTitle className="text-xl font-semibold">Select a Product</DialogTitle>
        </DialogHeader>
        
        <div className="p-6 space-y-4 flex-1 overflow-hidden">
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
          
          <div className="border rounded-md overflow-hidden bg-white flex-1">
            <ScrollArea className="h-[400px]" onScrollCapture={handleScroll}>
              {isLoading ? (
                <div className="p-4 space-y-3">
                  {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} className="flex items-center space-x-4 p-4">
                      <Skeleton className="h-4 w-[200px]" />
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[80px]" />
                      <Skeleton className="h-8 w-8" />
                    </div>
                  ))}
                </div>
              ) : (
                <Table>
                  <TableHeader className="sticky top-0 bg-white z-10">
                    <TableRow>
                      <TableHead className="w-[60%]">Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <TableRow 
                          key={product.id} 
                          className="cursor-pointer hover:bg-muted/50 transition-colors"
                          onClick={() => handleRowClick(product)}
                        >
                          <TableCell>
                            <div className="flex items-center gap-3">
                              <div>
                                <p className="font-medium">{product.name}</p>
                                <p className="text-sm text-muted-foreground line-clamp-1">{product.description}</p>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {product.tags && product.tags.slice(0, 3).map(tag => (
                                    <Badge key={tag} variant="outline" className="text-xs py-0 px-1">
                                      {tag}
                                    </Badge>
                                  ))}
                                  {product.tags && product.tags.length > 3 && (
                                    <Badge variant="outline" className="text-xs py-0 px-1">
                                      +{product.tags.length - 3}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{product.category}</Badge>
                          </TableCell>
                          <TableCell>${product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                              onClick={(e) => handleQuickAddProduct(product, e)}
                              title="Quick add"
                            >
                              <Plus size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                          {searchQuery || selectedCategory ? 
                            "No products found matching your search." :
                            "No products available."
                          }
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="p-4 flex justify-center border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more products...
                  </div>
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
        
        <DialogFooter className="border-t p-4">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
