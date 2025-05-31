
// Cache configuration for React Query
export const cacheConfig = {
  queries: {
    // Default cache time for all queries (5 minutes)
    staleTime: 1000 * 60 * 5,
    // Keep data in cache for 10 minutes after component unmounts
    cacheTime: 1000 * 60 * 10,
    // Refetch on window focus
    refetchOnWindowFocus: false,
    // Retry failed requests
    retry: 1,
    // Refetch interval for real-time data
    refetchInterval: 1000 * 60 * 2, // 2 minutes
  },
  
  // Specific cache settings for different data types
  jobs: {
    staleTime: 1000 * 60 * 2, // 2 minutes (jobs change frequently)
    cacheTime: 1000 * 60 * 5,
  },
  
  clients: {
    staleTime: 1000 * 60 * 10, // 10 minutes (clients change less frequently)
    cacheTime: 1000 * 60 * 20,
  },
  
  products: {
    staleTime: 1000 * 60 * 30, // 30 minutes (products rarely change)
    cacheTime: 1000 * 60 * 60,
  },
  
  configItems: {
    staleTime: 1000 * 60 * 60, // 1 hour (config rarely changes)
    cacheTime: 1000 * 60 * 120,
  }
};

// Service Worker registration for offline caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    });
  }
};

// Enhanced local storage cache utilities with better memory management
export const localStorageCache = {
  set: (key: string, data: any, expirationMinutes = 60) => {
    try {
      const expiration = new Date().getTime() + (expirationMinutes * 60 * 1000);
      const cacheData = {
        data,
        expiration,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Clean up old cache entries periodically
      this.cleanup();
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },
  
  get: (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const { data, expiration } = JSON.parse(cached);
      if (new Date().getTime() > expiration) {
        localStorage.removeItem(key);
        return null;
      }
      return data;
    } catch (error) {
      console.warn('Failed to retrieve cached data:', error);
      localStorage.removeItem(key);
      return null;
    }
  },
  
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  },
  
  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
  
  // Clean up expired cache entries
  cleanup: () => {
    try {
      const now = new Date().getTime();
      const keys = Object.keys(localStorage);
      
      keys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (parsed.expiration && now > parsed.expiration) {
              localStorage.removeItem(key);
            }
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
};

// Run cleanup on initialization
if (typeof window !== 'undefined') {
  localStorageCache.cleanup();
}
