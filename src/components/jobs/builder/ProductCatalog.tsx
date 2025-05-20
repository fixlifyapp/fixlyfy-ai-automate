import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Pencil, Plus, Search } from "lucide-react";
import { useProducts, Product } from "@/hooks/useProducts";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductCatalogProps {
  onAddProduct: (product: Product) => void;
}

export const ProductCatalog = ({ onAddProduct }: ProductCatalogProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { products, categories, isLoading } = useProducts();
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery === "" || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (product.description?.toLowerCase().includes(searchQuery.toLowerCase()) || false);
    
    const matchesCategory = selectedCategory === null || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

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
                placeholder="Search products..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-xs h-7 px-2"
            >
              All
            </Button>
            {categories.map(category => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="text-xs h-7 px-2"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="max-h-[300px] overflow-y-auto">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="w-full h-12" />
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <ul className="divide-y">
            {filteredProducts.map(product => (
              <li key={product.id} className="p-3 hover:bg-muted/40">
                <div className="flex justify-between items-start">
                  <div>
                    <h5 className="font-medium text-sm">{product.name}</h5>
                    <p className="text-xs text-muted-foreground">{product.description}</p>
                    <p className="text-xs mt-1">${product.price.toFixed(2)}</p>
                  </div>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => {
                        // In a real app, this would open a product editor dialog
                        console.log("Edit product", product);
                      }}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={() => onAddProduct(product)}
                    >
                      <Plus size={14} />
                    </Button>
                  </div>
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {product.tags && product.tags.map((tag, index) => (
                    <Badge 
                      key={index} 
                      variant="outline" 
                      className="text-[10px] py-0 h-5 bg-muted/50"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No products found
          </div>
        )}
      </div>
      
      <div className="p-3 border-t">
        <Button variant="outline" size="sm" className="w-full gap-1">
          <Plus size={14} />
          Add New Product
        </Button>
      </div>
    </div>
  );
};
