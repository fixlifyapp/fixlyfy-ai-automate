
export const cacheConfig = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes  
    refetchOnWindowFocus: false,
    retry: 2,
  },
  
  // Specific configurations for different data types
  jobs: {
    staleTime: 2 * 60 * 1000, // 2 minutes for jobs (more dynamic)
    cacheTime: 5 * 60 * 1000,
  },
  
  clients: {
    staleTime: 10 * 60 * 1000, // 10 minutes for clients (less dynamic)
    cacheTime: 30 * 60 * 1000,
  },
  
  documents: {
    staleTime: 5 * 60 * 1000, // 5 minutes for documents
    cacheTime: 15 * 60 * 1000,
  }
};

// Add missing exports that other files are looking for
export const localStorageCache = {
  get: (key: string) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Handle storage errors silently
    }
  },
  remove: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
};

export const registerServiceWorker = () => {
  // Service worker registration placeholder
  if ('serviceWorker' in navigator) {
    // Can be implemented later if needed
    console.log('Service worker registration placeholder');
  }
};
