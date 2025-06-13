
// Enhanced cache configuration with improved performance
export const cacheConfig = {
  queries: {
    // Longer cache times for better performance
    staleTime: 1000 * 60 * 15, // 15 minutes
    cacheTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    refetchInterval: false, // Disable automatic refetching
  },
  
  // Specific cache settings for different data types
  jobs: {
    staleTime: 1000 * 60 * 10, // 10 minutes for jobs
    cacheTime: 1000 * 60 * 20,
  },
  
  clients: {
    staleTime: 1000 * 60 * 30, // 30 minutes for clients
    cacheTime: 1000 * 60 * 60,
  },
  
  products: {
    staleTime: 1000 * 60 * 60, // 1 hour for products
    cacheTime: 1000 * 60 * 120,
  },
  
  configItems: {
    staleTime: 1000 * 60 * 120, // 2 hours for config
    cacheTime: 1000 * 60 * 240,
  }
};

// Service Worker registration for offline caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Removed console.log
        })
        .catch((registrationError) => {
          console.error('SW registration failed: ', registrationError);
        });
    });
  }
};

// Enhanced local storage cache utilities with smarter cleanup
export const localStorageCache = {
  set: function(key: string, data: any, expirationMinutes = 120) { // Longer default expiration
    try {
      const expiration = new Date().getTime() + (expirationMinutes * 60 * 1000);
      const cacheData = {
        data,
        expiration,
        timestamp: new Date().getTime()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
      
      // Less frequent cleanup
      if (Math.random() < 0.1) { // Only 10% chance of cleanup
        localStorageCache.cleanup();
      }
    } catch (error) {
      console.warn('Failed to cache data:', error);
    }
  },
  
  get: function(key: string) {
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
  
  remove: function(key: string) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.warn('Failed to remove cached data:', error);
    }
  },
  
  clear: function() {
    try {
      localStorage.clear();
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  },
  
  // Smart cleanup with better performance
  cleanup: function() {
    try {
      const now = new Date().getTime();
      const keys = Object.keys(localStorage);
      let cleaned = 0;
      
      keys.forEach(key => {
        try {
          const cached = localStorage.getItem(key);
          if (cached && key.startsWith('jobs_') || key.startsWith('clients_')) {
            const parsed = JSON.parse(cached);
            if (parsed.expiration && now > parsed.expiration) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch {
          // Invalid JSON, remove it
          localStorage.removeItem(key);
          cleaned++;
        }
      });
      
      if (cleaned > 0) {
        // Removed console.log
      }
    } catch (error) {
      console.warn('Failed to cleanup cache:', error);
    }
  }
};

// Smart cleanup on initialization
if (typeof window !== 'undefined') {
  // Delayed cleanup to not block initial load
  setTimeout(() => {
    localStorageCache.cleanup();
  }, 5000);
}
