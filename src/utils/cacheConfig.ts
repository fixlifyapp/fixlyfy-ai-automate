
export const cacheConfig = {
  queries: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes  
    refetchOnWindowFocus: false,
    retry: 2,
    // Remove refetchInterval from here since it should be set per query
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
