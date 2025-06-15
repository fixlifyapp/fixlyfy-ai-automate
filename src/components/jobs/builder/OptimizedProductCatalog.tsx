
import { useState, useCallback, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Loader2 } from "lucide-react";
import { useOptimizedProducts, Product } from "@/hooks/useOptimizedProducts";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";

interface OptimizedProductCatalogProps {
  onAddProduct: (product: Product) => void;
}

export const OptimizedProductCatalog = ({ onAddProduct }: OptimizedProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const { 
    products, 
    categories, 
    isLoading, 
    isLoadingMore,
    hasMore,
    fetchProducts,
    loadMore
  } = useOptimizedProducts({
    searchQuery,
    category: selectedCategory || undefined,
    pageSize: 20,
    autoLoad: showProducts
  });

  const handleSearchClick = useCallback(() => {
    if (!showProducts) {
      setShowProducts(true);
    }
  }, [showProducts]);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (!showProducts) {
      setShowProducts(true);
    }
  }, [showProducts]);

  const handleProductAdd = useCallback((product: Product) => {
    onAddProduct(product);
    setShowProducts(false);
    setSearchQuery("");
    setSelectedCategory(null);
  }, [onAddProduct]);

  const handleCategoryChange = useCallback((category: string | null) => {
    setSelectedCategory(category);
  }, []);

  // Infinite scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;
    
    if (isNearBottom && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  return (
    <div className="border rounded-md overflow-hidden">
      <div className="p-4 border-b bg-muted/30">
        <h4 className="font-medium mb-4">Product Catalog</h4>
        <div className="space-y-4">
          <div>
            <Label htmlFor="search-products" className="sr-only">Search Products</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-products"
                placeholder="Click to search and add products..."
                className="pl-8 cursor-pointer"
                value={searchQuery}
                onChange={handleSearchChange}
                onClick={handleSearchClick}
                onFocus={handleSearchClick}
              />
            </div>
          </div>

          {showProducts && (
            <div className="flex flex-wrap gap-2">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => handleCategoryChange(null)}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategoryChange(category)}
                  className="text-xs h-7 px-2"
                >
                  {category}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showProducts && (
        <ScrollArea 
          className="max-h-[300px]" 
          ref={scrollAreaRef}
          onScrollCapture={handleScroll}
        >
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="flex items-center space-x-3 p-3">
                  <Skeleton className="h-4 w-4" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[200px]" />
                    <Skeleton className="h-3 w-[150px]" />
                  </div>
                  <Skeleton className="h-8 w-16" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <>
              <ul className="divide-y">
                {products.map(product => (
                  <li 
                    key={product.id} 
                    className="p-3 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => handleProductAdd(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h5 className="font-medium text-sm">{product.name}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                        <p className="text-xs mt-1 font-medium">${product.price.toFixed(2)}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProductAdd(product);
                        }}
                      >
                        <Plus size={14} />
                      </Button>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {product.tags.slice(0, 3).map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-[10px] py-0 h-5 bg-muted/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                        {product.tags.length > 3 && (
                          <Badge variant="outline" className="text-[10px] py-0 h-5 bg-muted/50">
                            +{product.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Loading more indicator */}
              {isLoadingMore && (
                <div className="p-4 flex justify-center">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading more products...
                  </div>
                </div>
              )}
              
              {/* Load more button (fallback for infinite scroll) */}
              {hasMore && !isLoadingMore && products.length >= 20 && (
                <div className="p-4 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={loadMore}
                    className="w-full"
                  >
                    Load More Products
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {searchQuery || selectedCategory ? 
                "No products found matching your criteria" : 
                "No products found"
              }
            </div>
          )}
        </ScrollArea>
      )}
    </div>
  );
};
