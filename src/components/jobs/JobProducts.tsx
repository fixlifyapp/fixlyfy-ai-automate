
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Search, Edit, Trash2, Package } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { ProductEditDialog } from "./dialogs/ProductEditDialog";
import { Product } from "./builder/types";
import { toast } from "sonner";

interface JobProductsProps {
  jobId: string;
}

export const JobProducts = ({ jobId }: JobProductsProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Mock products data - in a real app, this would come from your products database
  const mockProducts: Product[] = [
    {
      id: "hvac-service",
      name: "HVAC Service Call",
      price: 150,
      description: "Standard HVAC diagnostic and service",
      ourprice: 75,
      category: "HVAC",
      unit: "each",
      taxable: true
    },
    {
      id: "air-filter",
      name: "High-Efficiency Air Filter",
      price: 25,
      description: "HEPA air filter replacement",
      ourprice: 12,
      category: "HVAC",
      unit: "each",
      taxable: true
    },
    {
      id: "plumbing-service",
      name: "Plumbing Service Call",
      price: 125,
      description: "Standard plumbing diagnostic and service",
      ourprice: 65,
      category: "Plumbing",
      unit: "each",
      taxable: true
    },
    {
      id: "drain-cleaning",
      name: "Drain Cleaning Service",
      price: 95,
      description: "Professional drain cleaning and unclogging",
      ourprice: 45,
      category: "Plumbing",
      unit: "each",
      taxable: true
    },
    {
      id: "electrical-service",
      name: "Electrical Service Call",
      price: 175,
      description: "Standard electrical diagnostic and service",
      ourprice: 85,
      category: "Electrical",
      unit: "each",
      taxable: true
    },
    {
      id: "outlet-installation",
      name: "Outlet Installation",
      price: 120,
      description: "Standard electrical outlet installation",
      ourprice: 60,
      category: "Electrical",
      unit: "each",
      taxable: true
    }
  ];

  useEffect(() => {
    // In a real app, you would fetch products from your database
    // For now, we'll use mock data
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 500));
        setProducts(mockProducts);
        setFilteredProducts(mockProducts);
      } catch (error) {
        console.error("Error loading products:", error);
        toast.error("Failed to load products");
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  useEffect(() => {
    let filtered = products;

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    setFilteredProducts(filtered);
  }, [products, searchTerm, selectedCategory]);

  const categories = ["all", ...Array.from(new Set(products.map(p => p.category).filter(Boolean)))];

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setIsEditDialogOpen(true);
  };

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleSaveProduct = async (productData: Product) => {
    try {
      if (selectedProduct) {
        // Update existing product
        setProducts(prev => prev.map(p => p.id === selectedProduct.id ? productData : p));
        toast.success("Product updated successfully");
      } else {
        // Add new product
        const newProduct = {
          ...productData,
          id: `custom-${Date.now()}`
        };
        setProducts(prev => [...prev, newProduct]);
        toast.success("Product added successfully");
      }
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error("Failed to save product");
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    try {
      setProducts(prev => prev.filter(p => p.id !== productId));
      toast.success("Product deleted successfully");
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Failed to delete product");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin h-8 w-8 border-4 border-fixlyfy border-t-transparent rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-fixlyfy-border shadow-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Products & Services
            </CardTitle>
            <Button onClick={handleAddProduct} className="gap-2">
              <PlusCircle size={16} />
              Add Product
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                >
                  {category === "all" ? "All" : category}
                </Button>
              ))}
            </div>
          </div>

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p>
                {searchTerm || selectedCategory !== "all"
                  ? "Try adjusting your search or filter criteria."
                  : "Add your first product to get started."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{product.name}</h4>
                        {product.category && (
                          <Badge variant="secondary" className="mt-1">
                            {product.category}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1 ml-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditProduct(product)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProduct(product.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {product.description}
                    </p>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Sell Price:</span>
                        <span className="font-semibold">{formatCurrency(product.price)}</span>
                      </div>
                      {product.ourprice && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Our Cost:</span>
                          <span className="text-sm">{formatCurrency(product.ourprice)}</span>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Unit:</span>
                        <span className="text-sm">{product.unit || "each"}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Taxable:</span>
                        <Badge variant={product.taxable ? "default" : "secondary"}>
                          {product.taxable ? "Yes" : "No"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Edit Dialog */}
      <ProductEditDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        product={selectedProduct}
        onSave={handleSaveProduct}
      />
    </>
  );
};
