
interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  exponentialBackoff: boolean;
}

class CircuitBreaker {
  private failures = 0;
  private lastFailureTime = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  
  constructor(
    private failureThreshold = 5,
    private recoveryTimeout = 30000 // 30 seconds
  ) {}

  async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailureTime > this.recoveryTimeout) {
        this.state = 'HALF_OPEN';
      } else {
        throw new Error('Circuit breaker is OPEN');
      }
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failures = 0;
    this.state = 'CLOSED';
  }

  private onFailure() {
    this.failures++;
    this.lastFailureTime = Date.now();
    
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
  }
}

// Global circuit breaker for job operations
const jobsCircuitBreaker = new CircuitBreaker();

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    exponentialBackoff = true
  } = options;

  return jobsCircuitBreaker.execute(async () => {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxRetries) {
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        let delay = exponentialBackoff ? baseDelay * Math.pow(2, attempt) : baseDelay;
        delay = Math.min(delay, maxDelay);
        
        console.log(`Retrying operation (attempt ${attempt + 1}/${maxRetries}) in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  });
};

export const handleJobsError = (error: any, context: string) => {
  console.error(`${context} error:`, error);
  
  // Import toast dynamically to avoid circular dependencies
  import('@/components/ui/sonner').then(({ toast }) => {
    const errorMessage = error?.message || 'Unknown error occurred';
    
    if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
      toast.error('Network connection issue. Please check your internet connection.', {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      });
    } else if (errorMessage.includes('permission') || errorMessage.includes('unauthorized')) {
      toast.error('Access denied. Please check your permissions.', {
        action: {
          label: 'Contact Support',
          onClick: () => console.log('Contact support clicked')
        }
      });
    } else {
      toast.error(`Failed to load jobs. Please try again.`, {
        action: {
          label: 'Retry',
          onClick: () => window.location.reload()
        }
      });
    }
  });
};
