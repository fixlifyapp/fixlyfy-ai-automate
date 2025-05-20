
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Product } from "@/components/jobs/builder/types";

export interface ProductWithDbFields extends Product {
  id: string;
  created_at?: string;
  updated_at?: string;
}

export const useProducts = () => {
  const [products, setProducts] = useState<ProductWithDbFields[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      setProducts(data || []);
      
      // Extract unique categories
      if (data) {
        const uniqueCategories = Array.from(new Set(data.map(product => product.category)));
        setCategories(uniqueCategories);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert(product)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prevProducts => [...prevProducts, data]);
      toast.success(`Product "${product.name}" created successfully`);
      
      // Update categories if new category
      if (product.category && !categories.includes(product.category)) {
        setCategories(prev => [...prev, product.category]);
      }
      
      return data;
    } catch (error) {
      console.error('Error creating product:', error);
      toast.error(`Failed to create product "${product.name}"`);
      return null;
    }
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    try {
      const { data, error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === id ? { ...p, ...data } : p)
      );
      
      toast.success(`Product "${updates.name || 'product'}" updated successfully`);
      
      // Update categories if category changed
      if (updates.category && !categories.includes(updates.category)) {
        setCategories(prev => [...prev, updates.category]);
      }
      
      return data;
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error(`Failed to update product "${updates.name || 'product'}"`);
      return null;
    }
  };

  const deleteProduct = async (id: string, productName: string) => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProducts(prevProducts => prevProducts.filter(p => p.id !== id));
      toast.success(`Product "${productName}" deleted successfully`);
      
      // Re-calculate categories in case the last product of a category was deleted
      const remainingCategories = Array.from(
        new Set(products.filter(p => p.id !== id).map(p => p.category))
      );
      setCategories(remainingCategories);
      
      return true;
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product "${productName}"`);
      return false;
    }
  };

  // Load products on initial render
  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    categories,
    isLoading,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct
  };
};
