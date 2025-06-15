
import { useState, useCallback } from "react";
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

interface UseProductsLazyOptions {
  searchQuery?: string;
  category?: string;
  pageSize?: number;
}

export const useProductsLazy = (options: UseProductsLazyOptions = {}) => {
  const { searchQuery = "", category, pageSize = 20 } = options;
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  // Debounce search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchProducts = useCallback(async (
    searchTerm: string = "",
    categoryFilter?: string,
    pageNumber: number = 0,
    reset: boolean = false
  ) => {
    setIsLoading(true);
    
    try {
      const startRange = pageNumber * pageSize;
      const endRange = startRange + pageSize - 1;

      let query = supabase
        .from('products')
        .select('*')
        .range(startRange, endRange)
        .order('name');

      // Apply search filter
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`);
      }

      // Apply category filter
      if (categoryFilter) {
        query = query.eq('category', categoryFilter);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedProducts = data?.map(item => ({
        ...item,
        ourPrice: item.ourprice || item.cost || 0
      })) || [];

      if (reset) {
        setProducts(formattedProducts);
      } else {
        setProducts(prev => [...prev, ...formattedProducts]);
      }

      // Check if there are more products to load
      setHasMore(formattedProducts.length === pageSize);
      setPage(pageNumber);

    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  }, [pageSize]);

  const searchProducts = useCallback((searchTerm: string, categoryFilter?: string) => {
    setProducts([]);
    setPage(0);
    setHasMore(true);
    fetchProducts(searchTerm, categoryFilter, 0, true);
  }, [fetchProducts]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) {
      fetchProducts(debouncedSearchQuery, category, page + 1, false);
    }
  }, [fetchProducts, debouncedSearchQuery, category, page, isLoading, hasMore]);

  return {
    products,
    isLoading,
    hasMore,
    searchProducts,
    loadMore,
    fetchProducts
  };
};
