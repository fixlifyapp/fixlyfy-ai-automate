
import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Product {
  id: string;
  name: string;
  description?: string;
  category: string;
  price: number;
  cost: number;
  ourPrice?: number;
  taxable: boolean;
  tags?: string[];
  sku?: string;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = (category?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        let query = supabase
          .from('products')
          .select('*');
          
        if (category) {
          query = query.eq('category', category);
        }
        
        const { data, error } = await query.order('name');
        
        if (error) throw error;
        
        const formattedProducts = data?.map(item => ({
          ...item,
          ourPrice: item.ourprice || item.cost || 0
        })) || [];
        
        setProducts(formattedProducts);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast.error('Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProducts();
  }, [category, refreshTrigger]);

  // Get unique categories from products
  const categories = useMemo(() => {
    const uniqueCategories = new Set<string>();
    products.forEach(product => {
      if (product.category) {
        uniqueCategories.add(product.category);
      }
    });
    return Array.from(uniqueCategories);
  }, [products]);

  const addProduct = async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      // Transform ourPrice to ourprice for the database
      const dbProduct = {
        ...product,
        ourprice: product.ourPrice,
      };
      
      // Remove ourPrice as it's not a column in the database
      delete (dbProduct as any).ourPrice;
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform the returned data to include ourPrice
      const formattedProduct = {
        ...data,
        ourPrice: data.ourprice || data.cost || 0
      };
      
      setProducts(prev => [formattedProduct, ...prev]);
      toast.success('Product added successfully');
      return formattedProduct;
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      // Transform ourPrice to ourprice for the database
      const dbUpdates: any = { ...updates };
      
      if ('ourPrice' in updates) {
        dbUpdates.ourprice = updates.ourPrice;
        delete dbUpdates.ourPrice;
      }
      
      const { data, error } = await supabase
        .from('products')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      
      // Transform the returned data to include ourPrice
      const formattedProduct = {
        ...data,
        ourPrice: data.ourprice || data.cost || 0
      };
      
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, ...formattedProduct } : product
      ));
      
      toast.success('Product updated successfully');
      return formattedProduct;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
      return null;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setProducts(prev => prev.filter(product => product.id !== id));
      toast.success('Product deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
      return false;
    }
  };

  // Alias addProduct to createProduct for backward compatibility
  const createProduct = addProduct;

  return {
    products,
    isLoading,
    categories,
    addProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: () => setRefreshTrigger(prev => prev + 1)
  };
};
