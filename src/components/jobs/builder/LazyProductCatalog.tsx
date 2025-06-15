
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Loader2 } from "lucide-react";
import { useProductsLazy, Product } from "@/hooks/useProductsLazy";
import { useProducts } from "@/hooks/useProducts";

interface LazyProductCatalogProps {
  onAddProduct: (product: Product) => void;
}

export const LazyProductCatalog = ({ onAddProduct }: LazyProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  
  // Get categories from the original hook (lightweight call)
  const { categories } = useProducts();
  
  // Use lazy loading hook for products
  const { products, isLoading, hasMore, searchProducts, loadMore } = useProductsLazy({
    searchQuery,
    category: selectedCategory || undefined,
    pageSize: 20
  });

  // Trigger search when search query or category changes
  useEffect(() => {
    if (showProducts && (searchQuery.trim() || selectedCategory)) {
      searchProducts(searchQuery, selectedCategory || undefined);
    }
  }, [searchQuery, selectedCategory, showProducts, searchProducts]);

  const handleSearchClick = () => {
    setShowProducts(true);
    if (!searchQuery.trim() && !selectedCategory) {
      // Load initial products when first opening
      searchProducts("", undefined);
    }
  };

  const handleProductAdd = (product: Product) => {
    onAddProduct(product);
    setShowProducts(false);
    setSearchQuery("");
    setSelectedCategory(null);
  };

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category);
    if (showProducts) {
      searchProducts(searchQuery, category || undefined);
    }
  };

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
                onChange={(e) => setSearchQuery(e.target.value)}
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
                onClick={() => handleCategorySelect(null)}
                className="text-xs h-7 px-2"
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleCategorySelect(category)}
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
        <div className="max-h-[300px] overflow-y-auto">
          {products.length > 0 ? (
            <>
              <ul className="divide-y">
                {products.map(product => (
                  <li 
                    key={product.id} 
                    className="p-3 hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => handleProductAdd(product)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h5 className="font-medium text-sm">{product.name}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-1">{product.description}</p>
                        <p className="text-xs mt-1 font-medium">${product.price.toFixed(2)}</p>
                      </div>
                      <div className="flex space-x-1 ml-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 text-blue-600 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProductAdd(product);
                          }}
                        >
                          <Plus size={14} />
                        </Button>
                      </div>
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {product.tags.map((tag, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-[10px] py-0 h-5 bg-muted/50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
              
              {/* Load More Button */}
              {hasMore && (
                <div className="p-3 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadMore}
                    disabled={isLoading}
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "Load More Products"
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="p-4 text-center text-sm text-muted-foreground">
              {isLoading ? (
                <div className="space-y-2">
                  <Loader2 className="h-6 w-6 mx-auto animate-spin" />
                  <div>Loading products...</div>
                </div>
              ) : (
                "No products found"
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
