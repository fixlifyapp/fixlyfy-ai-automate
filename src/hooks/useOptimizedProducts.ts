
import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useDebounce } from "./useDebounce";

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

interface UseOptimizedProductsOptions {
  searchQuery?: string;
  category?: string;
  pageSize?: number;
  autoLoad?: boolean;
}

export const useOptimizedProducts = (options: UseOptimizedProductsOptions = {}) => {
  const { 
    searchQuery = "", 
    category, 
    pageSize = 20, 
    autoLoad = false 
  } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Memoize categories fetch
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .not('category', 'is', null);
        
      if (error) throw error;
      
      const uniqueCategories = [...new Set(data?.map(item => item.category) || [])];
      setCategories(uniqueCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  }, []);

  // Optimized product fetch with server-side filtering and pagination
  const fetchProducts = useCallback(async (pageNum: number = 0, append: boolean = false) => {
    if (pageNum === 0) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      let query = supabase
        .from('products')
        .select('*')
        .range(pageNum * pageSize, (pageNum + 1) * pageSize - 1)
        .order('name');

      // Server-side filtering by category
      if (category) {
        query = query.eq('category', category);
      }

      // Server-side search filtering
      if (debouncedSearchQuery) {
        query = query.or(`name.ilike.%${debouncedSearchQuery}%,description.ilike.%${debouncedSearchQuery}%`);
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const formattedProducts = data?.map(item => ({
        ...item,
        ourPrice: item.ourprice || item.cost || 0
      })) || [];

      if (append) {
        setProducts(prev => [...prev, ...formattedProducts]);
      } else {
        setProducts(formattedProducts);
      }

      // Check if there are more products to load
      setHasMore(formattedProducts.length === pageSize);
      setPage(pageNum);
      
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [category, debouncedSearchQuery, pageSize]);

  // Load more products (pagination)
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      fetchProducts(page + 1, true);
    }
  }, [fetchProducts, page, isLoadingMore, hasMore]);

  // Reset and search
  const searchProducts = useCallback(() => {
    setPage(0);
    setHasMore(true);
    fetchProducts(0, false);
  }, [fetchProducts]);

  // Auto-load products when search query or category changes
  useEffect(() => {
    if (autoLoad) {
      searchProducts();
    }
  }, [debouncedSearchQuery, category, autoLoad, searchProducts]);

  // Load categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addProduct = useCallback(async (product: Omit<Product, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      console.log("Adding product:", product);
      
      const dbProduct: any = {
        ...product,
        ourprice: product.ourPrice,
      };
      
      delete dbProduct.ourPrice;
      
      const { data, error } = await supabase
        .from('products')
        .insert(dbProduct)
        .select()
        .single();
        
      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
      
      const formattedProduct = {
        ...data,
        ourPrice: data.ourprice || data.cost || 0
      };
      
      setProducts(prev => [formattedProduct, ...prev]);
      toast.success('Product added successfully');
      return formattedProduct;
    } catch (error: any) {
      console.error('Error adding product:', error);
      toast.error(`Failed to add product: ${error.message || 'Unknown error'}`);
      return null;
    }
  }, []);

  return {
    products,
    categories,
    isLoading,
    isLoadingMore,
    hasMore,
    fetchProducts: searchProducts,
    loadMore,
    addProduct,
    // Legacy support
    createProduct: addProduct
  };
};
