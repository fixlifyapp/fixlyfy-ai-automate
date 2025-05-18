
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle, Pencil, Search, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Product } from "./builder/types";
import { ProductEditDialog } from "./dialogs/ProductEditDialog";

interface JobProductsProps {
  jobId: string;
}

export const JobProducts = ({ jobId }: JobProductsProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  // Mock products for the demo
  // In a real app, this would be fetched from an API
  const [products, setProducts] = useState<Product[]>([
    {
      id: "prod-1",
      name: "Repair Service",
      description: "Standard HVAC repair service",
      category: "Services",
      price: 220,
      ourPrice: 150,
      taxable: true,
      tags: ["repair", "service"]
    },
    {
      id: "prod-2",
      name: "Defrost System",
      description: "Defrost System Replacement",
      category: "Parts",
      price: 149,
      ourPrice: 85,
      taxable: true,
      tags: ["part", "defrost"]
    },
    {
      id: "prod-3",
      name: "6-Month Warranty",
      description: "Extended warranty covering parts and labor",
      category: "Warranties",
      price: 49,
      ourPrice: 10,
      taxable: false,
      tags: ["warranty", "protection"]
    },
    {
      id: "prod-4",
      name: "1-Year Warranty",
      description: "1-year extended warranty and priority service",
      category: "Warranties",
      price: 89,
      ourPrice: 20,
      taxable: false,
      tags: ["warranty", "protection"]
    },
    {
      id: "prod-5",
      name: "2-Year Warranty",
      description: "2-year comprehensive warranty package",
      category: "Warranties",
      price: 149,
      ourPrice: 30,
      taxable: false,
      tags: ["warranty", "protection"]
    },
    {
      id: "prod-6",
      name: "5-Year Warranty",
      description: "Premium 5-year warranty with full coverage",
      category: "Warranties",
      price: 299,
      ourPrice: 70,
      taxable: false,
      tags: ["warranty", "protection", "premium"]
    },
    {
      id: "prod-7",
      name: "Filter Replacement",
      description: "HVAC filter replacement",
      category: "Parts",
      price: 35,
      ourPrice: 15,
      taxable: true,
      tags: ["filter", "part"]
    },
    {
      id: "prod-8",
      name: "Diagnostic Service",
      description: "Complete system diagnostic",
      category: "Services",
      price: 89,
      ourPrice: 45,
      taxable: true,
      tags: ["diagnostic", "service"]
    }
  ]);
  
  const categories = Array.from(new Set(products.map(product => product.category)));
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = !searchQuery || 
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleEditProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditDialogOpen(true);
  };

  const handleCreateProduct = () => {
    setSelectedProduct(null);
    setIsCreateDialogOpen(true);
  };

  const handleSaveProduct = (product: Product) => {
    if (selectedProduct) {
      // Editing existing product
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === product.id ? product : p)
      );
      toast.success("Product updated successfully");
    } else {
      // Creating new product
      const newProduct = {
        ...product,
        id: `prod-${Date.now()}`
      };
      setProducts([...products, newProduct]);
      toast.success("Product created successfully");
    }
    setIsEditDialogOpen(false);
    setIsCreateDialogOpen(false);
  };

  const getMarginPercentage = (product: Product) => {
    const margin = product.price - product.ourPrice;
    return margin > 0 ? ((margin / product.price) * 100).toFixed(0) : "0";
  };

  const getMarginColor = (percentage: number) => {
    if (percentage < 20) return "text-red-500";
    if (percentage < 40) return "text-orange-500";
    return "text-green-500";
  };

  return (
    <Card className="border-fixlyfy-border shadow-sm">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium">Product Catalog</h3>
          <Button onClick={handleCreateProduct} className="gap-2">
            <PlusCircle size={16} />
            New Product
          </Button>
        </div>

        <div className="space-y-4 mb-6">
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

        {filteredProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Our Price</TableHead>
                <TableHead className="text-right">Margin</TableHead>
                <TableHead>Taxable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
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
                    </div>
                  </TableCell>
                  <TableCell>{product.category}</TableCell>
                  <TableCell className="text-right">${product.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">${product.ourPrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <span className={getMarginColor(parseInt(getMarginPercentage(product)))}>
                      {getMarginPercentage(product)}%
                    </span>
                  </TableCell>
                  <TableCell>
                    {product.taxable ? "Yes" : "No"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Pencil size={16} />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <p>No products found. Try adjusting your search or filters.</p>
          </div>
        )}
        
        <ProductEditDialog
          open={isEditDialogOpen || isCreateDialogOpen}
          onOpenChange={(open) => {
            setIsEditDialogOpen(open);
            setIsCreateDialogOpen(open);
          }}
          product={selectedProduct}
          onSave={handleSaveProduct}
          categories={categories}
        />
      </CardContent>
    </Card>
  );
};
